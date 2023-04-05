import { Stock } from '../modules/stock/entities/stock.schema';

export const calculateStocksPrice = (...stocks: Stock[]): number => {
  if (stocks.length === 0) return 0;
  return (
    stocks.reduce((acc, stock) => {
      return acc + (stock.lowestPriceOfTheDay + stock.highestPriceOfTheDay) / 2;
    }, 0) / stocks.length
  );
};
