import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';
import { StockDTOStub } from '../../test/stubs/stock.dto.stub';
import { Stock, StockSchema } from './entities/stock.schema';
import { StocksRepository } from './repositories/stock.repository';
import { StocksService } from './stock.service';

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
});
