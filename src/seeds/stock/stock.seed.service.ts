import { Command, CommandRunner } from 'nest-commander';
import { Injectable } from '@nestjs/common';
import { StocksRepository } from '../../modules/stock/repositories/stock.repository';
import { amazonStock } from './data/AMZN-stock-price';
import { googleStock } from './data/GOOG-stock-price';
import { Stock } from 'src/modules/stock/entities/stock.schema';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

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
            stockType: 'amazon',
          } as Stock),
        ),
      ),
      Promise.all(
        googleStock.map((stock) =>
          this.stocksRepository.create({
            ...stock,
            timestamp: new Date(stock.timestamp),
            stockType: 'google',
          } as Stock),
        ),
      ),
    ]);
    console.log('______DONE______');
  }
}
