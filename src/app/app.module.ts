import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/database/database.module';
import { StocksModule } from 'src/modules/stock/stock.module';
import { StocksSeedModule } from 'src/seeds/stock/stock.module';

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
