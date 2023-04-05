import { Command, CommandRunner } from 'nest-commander';
import { StocksRepository } from '../../modules/stock/repositories/stock.repository';
import { amazonStock } from './data/AMZN-stock-price';
import { googleStock } from './data/GOOG-stock-price';
import { Stock } from '../../modules/stock/entities/stock.schema';
import { StockType } from '../../modules/stock/types/stock.type';

@Command({
  name: 'seed:stock',
  description: 'create a google & amazon stock',
})
export class StockSeed extends CommandRunner {
  constructor(private readonly stocksRepository: StocksRepository) {
    super();
  }

  async run(): Promise<void> {
    console.log('create a google & amazon stock loading...');
    await Promise.all([
      Promise.all(
        amazonStock.map((stock) =>
          this.stocksRepository.create({
            ...stock,
            timestamp: new Date(stock.timestamp),
            stockType: StockType.AMAZON,
          } as Stock),
        ),
      ),
      Promise.all(
        googleStock.map((stock) =>
          this.stocksRepository.create({
            ...stock,
            timestamp: new Date(stock.timestamp),
            stockType: StockType.GOOGLE,
          } as Stock),
        ),
      ),
    ]);
    console.log('______DONE______');
  }
}
