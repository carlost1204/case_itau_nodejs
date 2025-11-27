import { EntityManager } from 'typeorm';
import { Client } from '../../domain/entities/client.entity';
import { Transaction } from '../../domain/entities/transaction.entity';

export const TRANSACTION_REPOSITORY = 'TransactionRepository';

export interface TransactionRepository {
  executeInTransaction<T>(operation: (manager: EntityManager) => Promise<T>): Promise<T>;
  findClientForUpdate(manager: EntityManager, clientId: string): Promise<Client | null>;
  getTransactionsByClientId(clientId: string): Promise<Transaction[]>;
}
