import { Injectable } from '@nestjs/common';
import { CreateStockDto } from './dto/create-stock.dto';
import { StockDocument } from './entities/stock.schema';
import { StocksRepository } from './repositories/stock.repository';
import {
  ActionType,
  StockByMonth,
  StockType,
  Trade,
  Trades,
} from './types/stock.type';

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
    const profitableTrades = this.getProfitableTrades(stocks);
    return this.getBestTrade(profitableTrades, budget);
  }

  getProfitableTrades(stocks: StockDocument[]) {
    const profitableTrades: Trades = {
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

  private getBestTrade(profitableTrades: Trades, budget: number) {
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

  async getStockBestTrades(budget: number) {
    const AmazonStocks = await this.stocksRepository.findAll(
      {
        stockType: StockType.AMAZON,
      },
      { timestamp: 1 },
    );
    const GoogleStocks = await this.stocksRepository.findAll(
      {
        stockType: StockType.GOOGLE,
      },
      { timestamp: 1 },
    );
    const mergedTrades = this.filterProfitableTrades(
      AmazonStocks,
      GoogleStocks,
    );
    return this.ToRangeTrades(mergedTrades, budget);
  }

  private filterProfitableTrades(...profitableTrades: StockDocument[][]) {
    if (profitableTrades.length === 0) return [];
    if (profitableTrades.length === 1) return profitableTrades[0];
    const filtredProfitableTrades: StockDocument[] = [];
    for (let i = 0; i < profitableTrades[0].length; i++) {
      const trade = this.getProfitableTradFromTrades(profitableTrades, i);
      if (trade) filtredProfitableTrades.push(trade);
    }
    return filtredProfitableTrades;
  }

  private getProfitableTradFromTrades(
    profitableTrades: StockDocument[][],
    index: number,
  ) {
    let profit =
        profitableTrades[0][index].highestPriceOfTheDay -
        profitableTrades[0][index].lowestPriceOfTheDay,
      profitableTrade = profitableTrades[0][index];
    for (let i = 1; i < profitableTrades.length; i++) {
      const currentProfitableTrade = profitableTrades[i][index];
      const currentProfit =
        currentProfitableTrade.highestPriceOfTheDay -
        currentProfitableTrade.lowestPriceOfTheDay;
      if (currentProfit > profit) {
        profit = currentProfit;
        profitableTrade = currentProfitableTrade;
      }
    }
    if (profit > 0) return profitableTrade;
    return null;
  }

  private ToRangeTrades(trades: StockDocument[], startBudget: number) {
    const tradesList: Trade[] = [];
    let wallet = startBudget;
    let currentTrade: StockDocument = trades[0];
    for (let i = 1; i < trades.length; i++) {
      const nextTrade = trades[i - 1];
      const afterNextTrade = trades[i];
      if (currentTrade.stockType !== afterNextTrade.stockType) {
        const quantity = Math.floor(wallet / currentTrade.lowestPriceOfTheDay);
        const buyTrade: Trade = {
          actionType: ActionType.BUY,
          price: currentTrade.lowestPriceOfTheDay,
          date: currentTrade.timestamp,
          stockType: currentTrade.stockType,
          wallet,
          quantity,
        };
        wallet +=
          quantity * nextTrade.highestPriceOfTheDay -
          quantity * currentTrade.lowestPriceOfTheDay;
        const sellTrade: Trade = {
          actionType: ActionType.SELL,
          price: nextTrade.highestPriceOfTheDay,
          date: nextTrade.timestamp,
          stockType: nextTrade.stockType,
          wallet,
          quantity,
        };
        tradesList.push(buyTrade, sellTrade);
        currentTrade = afterNextTrade;
      } else if (i === trades.length - 1) {
        // last trade
        if (
          currentTrade.lowestPriceOfTheDay >=
          afterNextTrade.highestPriceOfTheDay
        )
          break;
        currentTrade = nextTrade;
        const quantity = Math.floor(wallet / currentTrade.lowestPriceOfTheDay);
        const buyTrade: Trade = {
          actionType: ActionType.BUY,
          price: currentTrade.lowestPriceOfTheDay,
          date: currentTrade.timestamp,
          stockType: currentTrade.stockType,
          wallet,
          quantity,
        };
        wallet +=
          quantity * afterNextTrade.highestPriceOfTheDay -
          quantity * currentTrade.lowestPriceOfTheDay;
        const sellTrade: Trade = {
          actionType: ActionType.SELL,
          price: afterNextTrade.highestPriceOfTheDay,
          date: afterNextTrade.timestamp,
          stockType: afterNextTrade.stockType,
          wallet,
          quantity,
        };
        tradesList.push(buyTrade, sellTrade);
      } else {
        // skip if day after day is not profitable
        if (currentTrade.lowestPriceOfTheDay >= nextTrade.highestPriceOfTheDay)
          currentTrade = nextTrade;
      }
    }
    return tradesList;
  }
}
