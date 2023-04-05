import { Controller, Get, Query } from '@nestjs/common';
import { StocksService } from './stock.service';
import { ApiTags } from '@nestjs/swagger';
import { GetStocksDto } from './dto/get-stocks.dto';

@ApiTags('Stocks')
@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Get()
  getStocksByMonth(@Query() getStocksDto: GetStocksDto) {
    const date = new Date(getStocksDto.date);
    return this.stocksService.getStocksByMonth(date);
  }
}
