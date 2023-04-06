import { Test, TestingModule } from '@nestjs/testing';
import { StockByMonthStub } from '../../test/stubs/stock.dto.stub';
import { StocksController } from './stock.controller';
import { StocksService } from './stock.service';
import { StockByMonth, StockType } from './types/stock.type';

describe('StockController', () => {
  let stocksController: StocksController;
  let app: TestingModule;
  const stocksService = {
    create: jest.fn(),
    getStocksByMonth: jest.fn(),
    getStockBestTrade: jest.fn(),
  };

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [StocksController],
      providers: [{ provide: StocksService, useValue: stocksService }],
    }).compile();
    stocksController = app.get<StocksController>(StocksController);
  });

  it('should be defined', () => {
    expect(stocksController).toBeDefined();
  });

  describe('getStocksByMonth', () => {
    it('should get stocks by month', async () => {
      stocksService.getStocksByMonth.mockResolvedValue({
        [StockType.GOOGLE]: [StockByMonthStub()] as StockByMonth[],
      });
      const result = await stocksController.getStocksByMonth({
        date: '01/01/2022',
      });
      expect(result).toHaveProperty(StockType.GOOGLE);
      expect(result[StockType.GOOGLE]).toHaveLength(1);
      expect(result[StockType.GOOGLE][0]).toEqual(StockByMonthStub());
    });
    it('should get no stocks', async () => {
      stocksService.getStocksByMonth.mockResolvedValue({});
      const result = await stocksController.getStocksByMonth({
        date: '01/01/2022',
      });
      expect(result).toEqual({});
    });
  });
});
