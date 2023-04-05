export enum StockType {
  GOOGLE = 'google',
  AMAZON = 'amazon',
}

export type StockByMonth = {
  _id: {
    stockType: StockType;
    year: number;
    month: number;
  };
  month_price: number;
};
