import { Inject, Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { Client } from '../../domain/entities/client.entity';
import { Transaction } from '../../domain/entities/transaction.entity';
import {
  TRANSACTION_REPOSITORY,
  TransactionRepository,
} from '../../adapters/infraestructure/transaction.repository.interface';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepository
  ) {}

  /**
   * Performs a deposit operation for a client.
   *
   * @remarks
   * This method uses a pessimistic write lock on the client record to ensure
   * that the balance is updated atomically and to prevent race conditions.
   *
   * @param clientId - The unique identifier of the client.
   * @param amount - The amount to deposit (must be positive).
   * @returns The updated client entity with the new balance.
   *
   * @throws {BadRequestException} If the amount is not positive.
   * @throws {NotFoundException} If the client is not found.
   */
  async deposit(clientId: string, amount: number): Promise<Client> {
    this.logger.log(`Initiating deposit. ClientID: ${clientId}, Amount: ${amount}`);
    if (amount <= 0) {
      this.logger.warn(`Deposit failed: Invalid amount. ClientID: ${clientId}, Amount: ${amount}`);
      throw new BadRequestException('Amount must be a positive number.');
    }

    try {
      const result = await this.transactionRepository.executeInTransaction(async (manager) => {
        const client = await this.transactionRepository.findClientForUpdate(manager, clientId);

        if (!client) {
          this.logger.warn(`Deposit failed: Client not found. ClientID: ${clientId}`);
          throw new NotFoundException(`Client with ID ${clientId} not found.`);
        }

        client.saldo = Number(client.saldo) + amount;

        const transaction = manager.create(Transaction, {
          client: client,
          type: 'DEPOSIT',
          amount: amount,
        });

        await manager.save(client);
        await manager.save(transaction);

        return client;
      });
      this.logger.log(`Deposit successful. ClientID: ${clientId}, New Balance: ${result.saldo}`);
      return result;
    } catch (error: any) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Critical error during deposit. ClientID: ${clientId}`, error.stack);
      throw error;
    }
  }

  /**
   * Performs a withdrawal operation for a client.
   *
   * @remarks
   * This method uses a pessimistic write lock on the client record to ensure
   * that the balance check and update are atomic. This prevents overdrafts
   * in concurrent scenarios.
   *
   * @param clientId - The unique identifier of the client.
   * @param amount - The amount to withdraw (must be positive).
   * @returns The updated client entity with the new balance.
   *
   * @throws {BadRequestException} If the amount is not positive or if funds are insufficient.
   * @throws {NotFoundException} If the client is not found.
   */
  async withdraw(clientId: string, amount: number): Promise<Client> {
    this.logger.log(`Initiating withdraw. ClientID: ${clientId}, Amount: ${amount}`);
    if (amount <= 0) {
      this.logger.warn(`Withdraw failed: Invalid amount. ClientID: ${clientId}, Amount: ${amount}`);
      throw new BadRequestException('Amount must be a positive number.');
    }

    try {
      const result = await this.transactionRepository.executeInTransaction(async (manager) => {
        const client = await this.transactionRepository.findClientForUpdate(manager, clientId);

        if (!client) {
          this.logger.warn(`Withdraw failed: Client not found. ClientID: ${clientId}`);
          throw new NotFoundException(`Client with ID ${clientId} not found.`);
        }

        if (Number(client.saldo) < amount) {
          this.logger.warn(
            `Withdraw failed: Insufficient funds. ClientID: ${clientId}, Balance: ${client.saldo}, Amount: ${amount}`
          );
          throw new BadRequestException('Insufficient funds.');
        }

        client.saldo = Number(client.saldo) - amount;

        const transaction = manager.create(Transaction, {
          client: client,
          type: 'WITHDRAW',
          amount: amount,
        });

        await manager.save(client);
        await manager.save(transaction);

        return client;
      });
      this.logger.log(`Withdraw successful. ClientID: ${clientId}, New Balance: ${result.saldo}`);
      return result;
    } catch (error: any) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Critical error during withdraw. ClientID: ${clientId}`, error.stack);
      throw error;
    }
  }

  /**
   * Transfers funds between two clients.
   *
   * @remarks
   * This method implements a robust transaction strategy:
   * 1. Acquires pessimistic write locks on both sender and receiver records.
   * 2. Orders the locks by ID to prevent deadlocks (always locks the smaller ID first).
   * 3. Executes the debit and credit operations atomically within a database transaction.
   *
   * @param senderId - The unique identifier of the sender.
   * @param receiverId - The unique identifier of the receiver.
   * @param amount - The amount to transfer (must be positive).
   *
   * @throws {BadRequestException} If amount is invalid, sender equals receiver, or insufficient funds.
   * @throws {NotFoundException} If either sender or receiver is not found.
   */
  async transfer(senderId: string, receiverId: string, amount: number): Promise<void> {
    this.logger.log(
      `Initiating transfer. Sender: ${senderId}, Receiver: ${receiverId}, Amount: ${amount}`
    );
    if (amount <= 0) {
      this.logger.warn(`Transfer failed: Invalid amount.`);
      throw new BadRequestException('Amount must be a positive number.');
    }
    if (senderId === receiverId) {
      this.logger.warn(`Transfer failed: Same account.`);
      throw new BadRequestException('Cannot transfer to the same account.');
    }

    try {
      await this.transactionRepository.executeInTransaction(async (manager) => {
        // Lock both clients to prevent race conditions
        // To avoid deadlocks, always lock in a consistent order (e.g., by ID)
        const firstId = senderId < receiverId ? senderId : receiverId;
        const secondId = senderId < receiverId ? receiverId : senderId;

        const firstClient = await this.transactionRepository.findClientForUpdate(manager, firstId);
        const secondClient = await this.transactionRepository.findClientForUpdate(
          manager,
          secondId
        );

        if (!firstClient || !secondClient) {
          this.logger.warn(
            `Transfer failed: One or both clients not found. Sender: ${senderId}, Receiver: ${receiverId}`
          );
          throw new NotFoundException('One or both clients not found.');
        }

        const sender = senderId === firstId ? firstClient : secondClient;
        const receiver = senderId === firstId ? secondClient : firstClient;

        if (Number(sender.saldo) < amount) {
          this.logger.warn(
            `Transfer failed: Insufficient funds. Sender: ${senderId}, Balance: ${sender.saldo}, Amount: ${amount}`
          );
          throw new BadRequestException('Insufficient funds.');
        }

        // Perform transfer
        sender.saldo = Number(sender.saldo) - amount;
        receiver.saldo = Number(receiver.saldo) + amount;

        // Create transactions
        const transactionSender = manager.create(Transaction, {
          client: sender,
          type: 'TRANSFER_SENT',
          amount: amount,
        });

        const transactionReceiver = manager.create(Transaction, {
          client: receiver,
          type: 'TRANSFER_RECEIVED',
          amount: amount,
        });

        await manager.save(sender);
        await manager.save(receiver);
        await manager.save(transactionSender);
        await manager.save(transactionReceiver);
      });
      this.logger.log(
        `Transfer successful. Sender: ${senderId}, Receiver: ${receiverId}, Amount: ${amount}`
      );
    } catch (error: any) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(
        `Critical error during transfer. Sender: ${senderId}, Receiver: ${receiverId}`,
        error.stack
      );
      throw error;
    }
  }

  async getTransactions(clientId: string): Promise<Transaction[]> {
    return this.transactionRepository.getTransactionsByClientId(clientId);
  }
}
