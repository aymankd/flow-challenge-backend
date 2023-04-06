import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { StocksModule } from '../modules/stock/stock.module';
import { StocksSeedModule } from '../seeds/stock/stock.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    StocksModule,
    StocksSeedModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
