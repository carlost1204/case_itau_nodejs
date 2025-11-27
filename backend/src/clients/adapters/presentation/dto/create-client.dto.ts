import { IsString, IsEmail, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ example: 'John Doe', description: 'The name of the client' })
  @IsString()
  @IsNotEmpty()
  readonly nome!: string;

  @ApiProperty({ example: 'john@example.com', description: 'The email of the client' })
  @IsEmail()
  @IsNotEmpty()
  readonly email!: string;

  @ApiProperty({
    example: 100.0,
    description: 'The initial balance of the client',
    required: false,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  readonly saldo?: number;
}
