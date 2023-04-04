import { Injectable } from '@nestjs/common';
import { StocksRepository } from './repositories/stock.repository';

@Injectable()
export class StocksService {
  constructor(private readonly stocksRepository: StocksRepository) {}
}
