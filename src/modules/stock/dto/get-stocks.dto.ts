import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsDateString } from 'class-validator';

export class GetStocksDto {
  @ApiProperty({
    type: Date,
    required: true,
  })
  @IsDateString()
  @IsDefined()
  date: string;
}
