import { IsString, IsEmail, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateClientDto {
  @ApiPropertyOptional({ example: 'John Doe', description: 'The name of the client' })
  @IsString()
  @IsOptional()
  readonly nome?: string;

  @ApiPropertyOptional({ example: 'john@example.com', description: 'The email of the client' })
  @IsEmail()
  @IsOptional()
  readonly email?: string;

  @ApiPropertyOptional({ example: 100.0, description: 'The balance of the client' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  readonly saldo?: number;
}
