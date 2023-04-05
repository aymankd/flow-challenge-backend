import { Injectable } from '@nestjs/common';
import { CreateStockDto } from './dto/create-stock.dto';
import { StocksRepository } from './repositories/stock.repository';
import { StockByMonth } from './types/stock.type';

@Injectable()
export class StocksService {
  constructor(private readonly stocksRepository: StocksRepository) {}

  create(createStockDto: CreateStockDto) {
    return this.stocksRepository.create(createStockDto);
  }

  async getStocksByMonth(date = new Date()) {
    // set start & end date to first day of the year
    const startDate = new Date(date.getFullYear(), 0, 2);
    const endDate = new Date(date.getFullYear() + 1, 0, 2);
    const result = await this.stocksRepository.aggregate<StockByMonth>([
      {
        $match: {
          timestamp: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            stockType: '$stockType',
            year: {
              $year: '$timestamp',
            },
            month: {
              $month: '$timestamp',
            },
          },
          month_price: {
            $avg: {
              $divide: [
                {
                  $add: ['$highestPriceOfTheDay', '$lowestPriceOfTheDay'],
                },
                2,
              ],
            },
          },
        },
      },
    ]);
    return result.reduce((acc, curr) => {
      if (!acc[curr._id.stockType]) {
        acc[curr._id.stockType] = [curr];
      } else {
        acc[curr._id.stockType] = acc[curr._id.stockType].concat(curr);
      }
      return acc;
    }, new Object() as Record<(typeof result)[number]['_id']['stockType'], (typeof result)[number][]>);
  }
}
