import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { DatabaseModule } from 'src/database/database.module';
import { StocksModule } from '../../modules/stock/stock.module';
import { StockSeed } from './stock.seed.service';

@Module({
  imports: [StocksModule, CommandModule],
  providers: [StockSeed],
  exports: [StockSeed],
})
export class StocksSeedModule {}
