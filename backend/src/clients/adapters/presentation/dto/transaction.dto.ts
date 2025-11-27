import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransactionDto {
  @ApiProperty({ example: 50.0, description: 'The amount for the transaction' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  readonly amount!: number;
}
