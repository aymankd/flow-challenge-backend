import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Stock {
  @Prop({
    type: Number,
    required: true,
  })
  v: number;

  @Prop({
    type: Number,
    required: true,
  })
  vw: number;

  @Prop({
    type: Number,
    required: true,
  })
  o: number;

  @Prop({
    type: Number,
    required: true,
  })
  c: number;

  @Prop({
    type: Number,
    required: true,
  })
  highestPriceOfTheDay: number;

  @Prop({
    type: Number,
    required: true,
  })
  lowestPriceOfTheDay: number;

  @Prop({
    type: Date,
    required: true,
  })
  timestamp: Date;

  @Prop({
    type: Number,
    required: true,
  })
  n: number;

  @Prop({
    type: String,
    required: true,
    enum: ['google', 'amazon'],
  })
  stockType: 'google' | 'amazon';
}

export type StockDocument = Stock & Document;

export const StockSchema = SchemaFactory.createForClass(Stock);
