import { Client } from '../../../domain/entities/client.entity';
import { ClientResponseDto } from './client-response.dto';

export function toClientResponseDto(entity: Client): ClientResponseDto {
  return {
    id: entity.id,
    nome: entity.nome,
    email: entity.email,
    saldo: Number(entity.saldo),
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}
