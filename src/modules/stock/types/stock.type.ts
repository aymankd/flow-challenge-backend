import { StockDocument } from '../entities/stock.schema';

export enum StockType {
  GOOGLE = 'google',
  AMAZON = 'amazon',
}

export enum ActionType {
  BUY = 'buy',
  SELL = 'sell',
}

export type StockByMonth = {
  _id: {
    stockType: StockType;
    year: number;
    month: number;
  };
  month_price: number;
};

export type Trade = {
  date: Date;
  stockType: StockType;
  price: number;
  quantity: number;
  actionType: ActionType;
  wallet: number;
};

export type Trades = {
  buy: StockDocument[];
  sell: StockDocument[];
};
