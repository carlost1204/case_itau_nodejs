import { ApiProperty } from '@nestjs/swagger';

export class ClientResponseDto {
  @ApiProperty({ example: 'uuid-v4', description: 'The unique identifier of the client' })
  id!: string;

  @ApiProperty({ example: 'John Doe', description: 'The name of the client' })
  nome!: string;

  @ApiProperty({ example: 'john@example.com', description: 'The email of the client' })
  email!: string;

  @ApiProperty({ example: 100.0, description: 'The current balance of the client' })
  saldo!: number;

  @ApiProperty({ description: 'The date when the client was created' })
  createdAt!: Date;

  @ApiProperty({ description: 'The date when the client was last updated' })
  updatedAt!: Date;
}
