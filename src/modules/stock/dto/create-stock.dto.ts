import { ApiProperty } from '@nestjs/swagger';
import { StockType } from '../types/stock.type';

export class CreateStockDto {
  @ApiProperty({
    type: Number,
    required: true,
  })
  v: number;

  @ApiProperty({
    type: Number,
    required: true,
  })
  vw: number;

  @ApiProperty({
    type: Number,
    required: true,
  })
  o: number;

  @ApiProperty({
    type: Number,
    required: true,
  })
  c: number;

  @ApiProperty({
    type: Number,
    required: true,
  })
  highestPriceOfTheDay: number;

  @ApiProperty({
    type: Number,
    required: true,
  })
  lowestPriceOfTheDay: number;

  @ApiProperty({
    type: Date,
    required: true,
  })
  timestamp: Date;

  @ApiProperty({
    type: Number,
    required: true,
  })
  n: number;

  @ApiProperty({
    type: String,
    required: true,
    enum: Object.values(StockType),
  })
  stockType: StockType;
}
