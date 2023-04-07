import { StockType } from '../modules/stock/types/stock.type';
import { Stock } from '../modules/stock/entities/stock.schema';
import { calculateStocksPrice } from './stock.helper';

describe('stock helper', () => {
  describe('calculateStocksPrice', () => {
    it('should return 0 if no stocks are passed', () => {
      expect(calculateStocksPrice()).toBe(0);
    });
    it('should return the average price of the stocks', () => {
      const stock1: Stock = {
        lowestPriceOfTheDay: 10,
        highestPriceOfTheDay: 20,
        stockType: StockType.AMAZON,
        timestamp: new Date(),
        c: 10,
        n: 10,
        o: 10,
        v: 10,
        vw: 10,
      };
      const stock2: Stock = {
        lowestPriceOfTheDay: 25,
        highestPriceOfTheDay: 35,
        stockType: StockType.AMAZON,
        timestamp: new Date(),
        c: 10,
        n: 10,
        o: 10,
        v: 10,
        vw: 10,
      };
      expect(calculateStocksPrice(stock1, stock2)).toEqual(
        (10 + 20 + 25 + 35) / 4,
      );
    });
  });
});
