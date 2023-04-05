import { Injectable } from '@nestjs/common';
import { CreateStockDto } from './dto/create-stock.dto';
import { StocksRepository } from './repositories/stock.repository';

@Injectable()
export class StocksService {
  constructor(private readonly stocksRepository: StocksRepository) {}

  create(createStockDto: CreateStockDto) {
    return this.stocksRepository.create(createStockDto);
  }
}
