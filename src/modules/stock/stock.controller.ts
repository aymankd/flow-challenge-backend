import { Controller, Get, Query, Param } from '@nestjs/common';
import { StocksService } from './stock.service';
import { ApiTags } from '@nestjs/swagger';
import {
  GetBestStockTradeDto,
  GetBestStockTradesDto,
  GetStocksDto,
} from './dto/get-stocks.dto';

@ApiTags('Stocks')
@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Get()
  getStocksByMonth(@Query() getStocksDto: GetStocksDto) {
    const date = new Date(getStocksDto.date);
    return this.stocksService.getStocksByMonth(date);
  }

  @Get('bestTrade')
  getBestTradeOfStockType(@Query() bestStockTradeDto: GetBestStockTradeDto) {
    return this.stocksService.getStockBestTrade(
      bestStockTradeDto.stockType,
      +bestStockTradeDto.budget,
    );
  }

  @Get('StocksBestTrades')
  async getStockBestTrades(
    @Query() getBestStockTradesDto: GetBestStockTradesDto,
  ) {
    const start = performance.now();
    const trades = await this.stocksService.getStockBestTrades(
      +getBestStockTradesDto.budget,
    );
    const end = performance.now() - start;
    return { trades, time: end };
  }
}
