import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Client } from '../../domain/entities/client.entity';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionRepository } from './transaction.repository.interface';

@Injectable()
export class TransactionTypeOrmRepository implements TransactionRepository {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Executes a given operation within a database transaction.
   *
   * @remarks
   * This method manages the lifecycle of a QueryRunner:
   * 1. Creates and connects a new QueryRunner.
   * 2. Starts a transaction.
   * 3. Executes the callback operation.
   * 4. Commits if successful, or rolls back if an error occurs.
   * 5. Always releases the QueryRunner back to the pool.
   *
   * @param operation - A callback function that receives the transactional EntityManager.
   * @returns The result of the operation.
   */
  async executeInTransaction<T>(operation: (manager: EntityManager) => Promise<T>): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await operation(queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Finds a client by ID and locks the row for update (Pessimistic Write).
   *
   * @remarks
   * - In PostgreSQL (Production), this uses `FOR UPDATE` to prevent concurrent modifications.
   * - In SQLite (Test), locking is skipped as it is not supported/needed for in-memory tests.
   *
   * @param manager - The transactional entity manager.
   * @param clientId - The ID of the client to find.
   * @returns The client entity or null if not found.
   */
  async findClientForUpdate(manager: EntityManager, clientId: string): Promise<Client | null> {
    const isSqlite =
      manager.connection.options.type === 'sqlite' ||
      manager.connection.options.type === 'better-sqlite3';

    const findOptions: any = {
      where: { id: clientId },
    };

    if (!isSqlite) {
      findOptions.lock = { mode: 'pessimistic_write' };
    }

    const client = await manager.findOne(Client, findOptions);

    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found.`);
    }

    return client;
  }

  async getTransactionsByClientId(clientId: string): Promise<Transaction[]> {
    return this.dataSource.getRepository(Transaction).find({
      where: { client: { id: clientId } },
      order: { createdAt: 'DESC' },
    });
  }
}
