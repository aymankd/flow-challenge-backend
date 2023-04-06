import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsDateString,
  IsNumber,
  IsEnum,
  IsNumberString,
} from 'class-validator';
import { Stock } from '../entities/stock.schema';
import { StockType } from '../types/stock.type';

export class GetStocksDto {
  @ApiProperty({
    type: Date,
    required: true,
  })
  @IsDateString()
  @IsDefined()
  date: string;
}

export class GetBestStockTradeDto {
  @ApiProperty({
    type: Number,
    required: true,
  })
  @IsNumberString()
  @IsDefined()
  budget: string;

  @ApiProperty({
    type: String,
    required: true,
    enum: StockType,
  })
  @IsEnum(StockType)
  @IsDefined()
  stockType: StockType;
}
