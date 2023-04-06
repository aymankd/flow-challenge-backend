import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';
import { calculateStocksPrice } from '../../helpers/stock.helper';
import { StockDTOStub } from '../../test/stubs/stock.dto.stub';
import { CreateStockDto } from './dto/create-stock.dto';
import { Stock, StockSchema } from './entities/stock.schema';
import { StocksRepository } from './repositories/stock.repository';
import { StocksService } from './stock.service';
import { StockByMonth, StockType } from './types/stock.type';

describe('StockService', () => {
  let stocksService: StocksService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let stockModel: Model<Stock>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    stockModel = mongoConnection.model(Stock.name, StockSchema);
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        StocksService,
        StocksRepository,
        { provide: getModelToken(Stock.name, 'default'), useValue: stockModel },
        { provide: getConnectionToken('default'), useValue: mongoConnection },
      ],
    }).compile();
    stocksService = app.get<StocksService>(StocksService);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  afterEach(async () => {
    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  it('should be defined', () => {
    expect(stocksService).toBeDefined();
  });

  describe('create', () => {
    it('should create a stock', async () => {
      const createStockDto = StockDTOStub();
      const createdStockDoc = await stocksService.create(createStockDto);
      expect(createdStockDoc._id).toBeDefined();
      expect(createdStockDoc.timestamp).toBe(createStockDto.timestamp);
      expect(createdStockDoc.highestPriceOfTheDay).toBe(
        createStockDto.highestPriceOfTheDay,
      );
      expect(createdStockDoc.lowestPriceOfTheDay).toBe(
        createStockDto.lowestPriceOfTheDay,
      );
    });

    it('should throw stock exist already', async () => {
      const createStockDto = StockDTOStub();
      await stocksService.create(createStockDto);
      await expect(stocksService.create(createStockDto)).rejects.toThrow(
        'E11000 duplicate key error',
      );
    });
  });

  describe('getStocksByMonth', () => {
    it('should get stocks by month', async () => {
      const stocksDto: CreateStockDto[] = [];
      // create 2 google stocks in January 2022
      const GoogleStock_January_1 = StockDTOStub();
      GoogleStock_January_1.timestamp = new Date('01/15/2022');
      GoogleStock_January_1.stockType = StockType.GOOGLE;
      GoogleStock_January_1.highestPriceOfTheDay = 140;
      GoogleStock_January_1.lowestPriceOfTheDay = 120;
      stocksDto.push(GoogleStock_January_1);
      const GoogleStock_January_2 = StockDTOStub();
      GoogleStock_January_2.timestamp = new Date('01/20/2022');
      GoogleStock_January_2.stockType = StockType.GOOGLE;
      GoogleStock_January_2.highestPriceOfTheDay = 180;
      GoogleStock_January_2.lowestPriceOfTheDay = 130;
      stocksDto.push(GoogleStock_January_2);
      // create 1 google stock in May 2022
      const GoogleStock_May_1 = StockDTOStub();
      GoogleStock_May_1.timestamp = new Date('05/15/2022');
      GoogleStock_May_1.stockType = StockType.GOOGLE;
      GoogleStock_May_1.highestPriceOfTheDay = 200;
      GoogleStock_May_1.lowestPriceOfTheDay = 150;
      stocksDto.push(GoogleStock_May_1);
      // create 2 amazon stocks in February 2022
      const AmazonStock_February_1 = StockDTOStub();
      AmazonStock_February_1.timestamp = new Date('02/15/2022');
      AmazonStock_February_1.stockType = StockType.AMAZON;
      stocksDto.push(AmazonStock_February_1);
      const AmazonStock_February_2 = StockDTOStub();
      AmazonStock_February_2.timestamp = new Date('02/20/2022');
      AmazonStock_February_2.stockType = StockType.AMAZON;
      stocksDto.push(AmazonStock_February_2);
      // create 1 google stocks in March 2023
      const GoogleStock_January_3 = StockDTOStub();
      GoogleStock_January_3.timestamp = new Date('03/15/2023');
      GoogleStock_January_3.stockType = StockType.GOOGLE;
      await Promise.all(stocksDto.map((stock) => stocksService.create(stock)));
      // get stocks by month
      const result = await stocksService.getStocksByMonth(
        new Date('01/01/2022'),
      );
      // check result Stock Types
      expect(result).toHaveProperty(StockType.GOOGLE);
      expect(result).toHaveProperty(StockType.AMAZON);
      // check result length for Google Stock
      expect(result[StockType.GOOGLE].length).toBe(2);
      const GoogleStockForJunary: StockByMonth = {
        _id: {
          stockType: StockType.GOOGLE,
          year: 2022,
          month: 1,
        },
        month_price: calculateStocksPrice(
          GoogleStock_January_1,
          GoogleStock_January_2,
        ),
      };
      const GoogleStockForMay: StockByMonth = {
        _id: {
          stockType: StockType.GOOGLE,
          year: 2022,
          month: 5,
        },
        month_price: calculateStocksPrice(GoogleStock_May_1),
      };
      expect(result[StockType.GOOGLE]).toContainEqual<StockByMonth>(
        GoogleStockForJunary,
      );
      expect(result[StockType.GOOGLE]).toContainEqual<StockByMonth>(
        GoogleStockForMay,
      );
      // check result length for Amazon Stock
      expect(result[StockType.AMAZON].length).toBe(1);
      const AmazonStockForFebruary: StockByMonth = {
        _id: {
          stockType: StockType.AMAZON,
          year: 2022,
          month: 2,
        },
        month_price: calculateStocksPrice(
          AmazonStock_February_1,
          AmazonStock_February_2,
        ),
      };
      expect(result[StockType.AMAZON][0]).toEqual<StockByMonth>(
        AmazonStockForFebruary,
      );
    });
    it('should get no stocks', async () => {
      // create 1 google stocks in March 2023
      const GoogleStock_January_3 = StockDTOStub();
      GoogleStock_January_3.timestamp = new Date('03/15/2023');
      GoogleStock_January_3.stockType = StockType.GOOGLE;
      await stocksService.create(GoogleStock_January_3);
      const result = await stocksService.getStocksByMonth(
        new Date('01/01/2022'),
      );
      expect(result).toEqual({});
    });
  });

  describe('getStockBestTrade', () => {
    it('should return best trade for specific Stock Type', async () => {
      const stocksDto: CreateStockDto[] = [];
      const GoogleStock_1 = StockDTOStub();
      GoogleStock_1.timestamp = new Date('01/10/2022');
      GoogleStock_1.stockType = StockType.GOOGLE;
      GoogleStock_1.highestPriceOfTheDay = 180;
      GoogleStock_1.lowestPriceOfTheDay = 170;
      stocksDto.push(GoogleStock_1);
      const GoogleStock_2 = StockDTOStub();
      GoogleStock_2.timestamp = new Date('01/20/2022');
      GoogleStock_2.stockType = StockType.GOOGLE;
      GoogleStock_2.highestPriceOfTheDay = 170;
      GoogleStock_2.lowestPriceOfTheDay = 160;
      stocksDto.push(GoogleStock_2);
      const GoogleStock_3 = StockDTOStub();
      GoogleStock_3.timestamp = new Date('02/05/2022');
      GoogleStock_3.stockType = StockType.GOOGLE;
      GoogleStock_3.highestPriceOfTheDay = 160;
      GoogleStock_3.lowestPriceOfTheDay = 120;
      stocksDto.push(GoogleStock_3);
      const GoogleStock_4 = StockDTOStub();
      GoogleStock_4.timestamp = new Date('02/15/2022');
      GoogleStock_4.stockType = StockType.GOOGLE;
      GoogleStock_4.highestPriceOfTheDay = 140;
      GoogleStock_4.lowestPriceOfTheDay = 130;
      stocksDto.push(GoogleStock_4);
      const GoogleStock_5 = StockDTOStub();
      GoogleStock_5.timestamp = new Date('02/20/2022');
      GoogleStock_5.stockType = StockType.GOOGLE;
      GoogleStock_5.highestPriceOfTheDay = 165;
      GoogleStock_5.lowestPriceOfTheDay = 140;
      stocksDto.push(GoogleStock_5);
      const GoogleStock_6 = StockDTOStub();
      GoogleStock_6.timestamp = new Date('03/05/2022');
      GoogleStock_6.stockType = StockType.GOOGLE;
      GoogleStock_6.highestPriceOfTheDay = 100;
      GoogleStock_6.lowestPriceOfTheDay = 80;
      stocksDto.push(GoogleStock_6);
      await Promise.all(stocksDto.map((stock) => stocksService.create(stock)));
      const result = await stocksService.getStockBestTrade(
        StockType.GOOGLE,
        100000,
      );
      const shares = 100000 / GoogleStock_3.lowestPriceOfTheDay;
      expect(result).toEqual({
        buyPrice: GoogleStock_3.lowestPriceOfTheDay,
        sellPrice: GoogleStock_5.highestPriceOfTheDay,
        profit:
          GoogleStock_5.highestPriceOfTheDay * shares -
          GoogleStock_3.lowestPriceOfTheDay * shares,
        buyDate: new Date('02/05/2022'),
        sellDate: new Date('02/20/2022'),
      });
    });

    it('should return no best trade for specific Stock Type', async () => {
      const stocksDto: CreateStockDto[] = [];
      const GoogleStock_1 = StockDTOStub();
      GoogleStock_1.timestamp = new Date('01/10/2022');
      GoogleStock_1.stockType = StockType.GOOGLE;
      GoogleStock_1.highestPriceOfTheDay = 180;
      GoogleStock_1.lowestPriceOfTheDay = 170;
      stocksDto.push(GoogleStock_1);
      const GoogleStock_2 = StockDTOStub();
      GoogleStock_2.timestamp = new Date('01/20/2022');
      GoogleStock_2.stockType = StockType.GOOGLE;
      GoogleStock_2.highestPriceOfTheDay = 170;
      GoogleStock_2.lowestPriceOfTheDay = 160;
      stocksDto.push(GoogleStock_2);

      await Promise.all(stocksDto.map((stock) => stocksService.create(stock)));
      const result = await stocksService.getStockBestTrade(
        StockType.GOOGLE,
        100000,
      );
      expect(result).toEqual({});
    });
  });
});
