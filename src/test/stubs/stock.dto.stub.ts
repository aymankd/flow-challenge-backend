import { StockType } from '../../modules/stock/types/stock.type';
import { CreateStockDto } from '../../modules/stock/dto/create-stock.dto';

export const StockDTOStub = (): CreateStockDto => ({
  v: 2.52245e7,
  vw: 144.8282,
  o: 144.4755,
  c: 145.0745,
  highestPriceOfTheDay: 145.55,
  lowestPriceOfTheDay: 143.5025,
  timestamp: new Date(1641186000000),
  n: 78529,
  stockType: StockType.GOOGLE,
});
