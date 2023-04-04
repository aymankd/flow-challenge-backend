import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { BaseRepository } from '../../../base/module/base.repository';
import { Stock, StockDocument } from '../entities/stock.schema';

@Injectable()
export class StocksRepository extends BaseRepository<Stock, StockDocument> {
  constructor(
    @InjectModel(Stock.name, 'default')
    private stockModel: Model<StockDocument>,
    @InjectConnection('default') connection: Connection,
  ) {
    super(stockModel, connection);
  }
}
