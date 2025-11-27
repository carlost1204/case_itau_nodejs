import { IsNumber, IsPositive, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferDto {
  @ApiProperty({ example: 'uuid-of-receiver', description: 'The ID of the receiver client' })
  @IsNotEmpty()
  @IsUUID()
  readonly receiverId!: string;

  @ApiProperty({ example: 50.0, description: 'The amount to transfer' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  readonly amount!: number;
}
