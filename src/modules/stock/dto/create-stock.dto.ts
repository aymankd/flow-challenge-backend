import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsDefined, IsNumber, IsDate } from 'class-validator';
import { StockType } from '../types/stock.type';

export class CreateStockDto {
  @ApiProperty({
    type: Number,
    required: true,
  })
  @IsDefined()
  @IsNumber()
  v: number;

  @ApiProperty({
    type: Number,
    required: true,
  })
  @IsDefined()
  @IsNumber()
  vw: number;

  @ApiProperty({
    type: Number,
    required: true,
  })
  @IsDefined()
  @IsNumber()
  o: number;

  @ApiProperty({
    type: Number,
    required: true,
  })
  @IsDefined()
  @IsNumber()
  c: number;

  @ApiProperty({
    type: Number,
    required: true,
  })
  @IsDefined()
  @IsNumber()
  highestPriceOfTheDay: number;

  @ApiProperty({
    type: Number,
    required: true,
  })
  @IsDefined()
  @IsNumber()
  lowestPriceOfTheDay: number;

  @ApiProperty({
    type: Date,
    required: true,
  })
  @IsDefined()
  @IsDate()
  timestamp: Date;

  @ApiProperty({
    type: Number,
    required: true,
  })
  @IsDefined()
  @IsNumber()
  n: number;

  @ApiProperty({
    type: String,
    required: true,
    enum: Object.values(StockType),
  })
  @IsEnum(StockType)
  @IsDefined()
  stockType: StockType;
}
