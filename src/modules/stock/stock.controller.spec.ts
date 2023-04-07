import { Test, TestingModule } from '@nestjs/testing';
import { StockByMonthStub } from '../../test/stubs/stock.dto.stub';
import { StocksController } from './stock.controller';
import { StocksService } from './stock.service';
import { ActionType, StockByMonth, StockType, Trade } from './types/stock.type';

describe('StockController', () => {
  let stocksController: StocksController;
  let app: TestingModule;
  const stocksService = {
    create: jest.fn(),
    getStocksByMonth: jest.fn(),
    getStockBestTrade: jest.fn(),
    getStockBestTrades: jest.fn(),
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

  describe('getStockBestTrades', () => {
    it('should get stock best trades', async () => {
      const today = new Date();
      const tomorrow = new Date(today.getDate() + 1);
      stocksService.getStockBestTrades.mockResolvedValue([
        {
          actionType: ActionType.BUY,
          price: 100,
          stockType: StockType.GOOGLE,
          date: today,
          quantity: 10,
          wallet: 1000,
        } as Trade,
        {
          actionType: ActionType.SELL,
          price: 150,
          stockType: StockType.GOOGLE,
          date: tomorrow,
          quantity: 10,
          wallet: 1500,
        } as Trade,
      ]);
      const result = await stocksController.getStockBestTrades({
        budget: '1000',
      });
      expect(result.trades).toHaveLength(2);
      expect(result.trades).toEqual([
        {
          actionType: ActionType.BUY,
          price: 100,
          stockType: StockType.GOOGLE,
          date: today,
          quantity: 10,
          wallet: 1000,
        } as Trade,
        {
          actionType: ActionType.SELL,
          price: 150,
          stockType: StockType.GOOGLE,
          date: tomorrow,
          quantity: 10,
          wallet: 1500,
        } as Trade,
      ]);
    });
    it('should get no stocks', async () => {
      stocksService.getStockBestTrades.mockResolvedValue([]);
      const result = await stocksController.getStockBestTrades({
        budget: '1000',
      });
      expect(result.trades).toHaveLength(0);
    });
  });
});
