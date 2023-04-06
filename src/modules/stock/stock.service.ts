import { Injectable } from '@nestjs/common';
import { CreateStockDto } from './dto/create-stock.dto';
import { StockDocument } from './entities/stock.schema';
import { StocksRepository } from './repositories/stock.repository';
import { StockByMonth, StockType } from './types/stock.type';

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
      {
        $sort: {
          '_id.stockType': 1,
          '_id.year': 1,
          '_id.month': 1,
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

  async getStockBestTrade(stockType: StockType, budget: number) {
    const stocks = await this.stocksRepository.findAll(
      {
        stockType,
      },
      {
        timestamp: 1,
      },
    );
    const profitableTrades = this.geetProfitableTrades(stocks);
    return this.getBestTrade(profitableTrades, budget);
  }

  private geetProfitableTrades(stocks: StockDocument[]) {
    const profitableTrades: Record<'buy' | 'sell', StockDocument[]> = {
      buy: [],
      sell: [],
    };
    for (let i = 0; i < stocks.length; i++) {
      const buyPrice = stocks[i].lowestPriceOfTheDay;
      for (let j = i + 1; j < stocks.length; j++) {
        const sellPrice = stocks[j].highestPriceOfTheDay;
        if (sellPrice > buyPrice) {
          profitableTrades.buy.push(stocks[i]);
          profitableTrades.sell.push(stocks[j]);
        }
      }
    }
    return profitableTrades;
  }

  private getBestTrade(
    profitableTrades: Record<'buy' | 'sell', StockDocument[]>,
    budget: number,
  ) {
    const bestTrade: {
      buyPrice?: number;
      sellPrice?: number;
      profit?: number;
      buyDate?: Date;
      sellDate?: Date;
    } = {};
    let maxProfit = 0;
    for (let i = 0; i < profitableTrades.buy.length; i++) {
      const buyPrice = profitableTrades.buy[i].lowestPriceOfTheDay;
      const sellPrice = profitableTrades.sell[i].highestPriceOfTheDay;
      const profit = sellPrice - buyPrice;
      if (profit > maxProfit) {
        maxProfit = profit;
        bestTrade.buyPrice = buyPrice;
        bestTrade.sellPrice = sellPrice;
        bestTrade.profit =
          (budget / buyPrice) * sellPrice - (budget / buyPrice) * buyPrice;
        bestTrade.buyDate = profitableTrades.buy[i].timestamp;
        bestTrade.sellDate = profitableTrades.sell[i].timestamp;
      }
    }
    return bestTrade;
  }
}
