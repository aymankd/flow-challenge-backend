import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Stock, StockSchema } from './entities/stock.schema';
import { StocksRepository } from './repositories/stock.repository';
import { StocksController } from './stock.controller';
import { StocksService } from './stock.service';

@Module({
  controllers: [StocksController],
  imports: [
    MongooseModule.forFeature(
      [{ name: Stock.name, schema: StockSchema }],
      'default',
    ),
  ],
  providers: [StocksService, StocksRepository],
  exports: [StocksService, StocksRepository],
})
export class StocksModule {}
