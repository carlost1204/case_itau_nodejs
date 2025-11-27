import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../../domain/entities/client.entity';
import { ClientRepository } from './client.repository.interface';

@Injectable()
export class ClientTypeOrmRepository implements ClientRepository {
  constructor(
    @InjectRepository(Client)
    private readonly repo: Repository<Client>
  ) {}

  findAll(): Promise<Client[]> {
    return this.repo.find();
  }

  findOne(id: string): Promise<Client | null> {
    return this.repo.findOneBy({ id });
  }

  /**
   * Creates a new client record in the database.
   *
   * @remarks
   * This method uses TypeORM's `create` to instantiate the entity and `save` to persist it.
   * It handles the initial persistence of a client, including generating the UUID.
   *
   * @param data - The partial client data to create the entity.
   * @returns The persisted client entity.
   */
  async create(data: Partial<Client>): Promise<Client> {
    const entity = this.repo.create(data as any);
    const saved = await this.repo.save(entity as any);
    return saved as Client;
  }

  /**
   * Persists changes to an existing client entity.
   *
   * @remarks
   * This method is used for updates. It assumes the entity already exists and has an ID.
   * TypeORM's `save` method performs an UPSERT (Update or Insert), but in our context,
   * it is primarily used after fetching and modifying an entity.
   *
   * @param client - The client entity with updated fields.
   * @returns The updated and persisted client entity.
   */
  save(client: Client): Promise<Client> {
    return this.repo.save(client);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
