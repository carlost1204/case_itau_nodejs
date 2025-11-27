import { Client } from '../../domain/entities/client.entity';

export interface ClientRepository {
  findAll(): Promise<Client[]>;
  findOne(id: string): Promise<Client | null>;
  create(data: Partial<Client>): Promise<Client>;
  save(client: Client): Promise<Client>;
  delete(id: string): Promise<void>;
}

export const CLIENT_REPOSITORY = 'CLIENT_REPOSITORY';
