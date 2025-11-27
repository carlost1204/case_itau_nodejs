import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionTypeOrmRepository } from '../src/clients/adapters/infraestructure/transaction.typeorm.repository';
import { Client } from '../src/clients/domain/entities/client.entity';
import { Transaction } from '../src/clients/domain/entities/transaction.entity';
import { NotFoundException } from '@nestjs/common';

const mockQueryRunner = {
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
  manager: {},
};

const mockDataSource = {
  createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  getRepository: jest.fn(),
};

describe('TransactionTypeOrmRepository', () => {
  let repository: TransactionTypeOrmRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionTypeOrmRepository,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    repository = module.get<TransactionTypeOrmRepository>(TransactionTypeOrmRepository);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('executeInTransaction', () => {
    it('should execute operation in transaction', async () => {
      const operation = jest.fn().mockResolvedValue('result');
      const result = await repository.executeInTransaction(operation);
      
      expect(result).toBe('result');
      expect(mockDataSource.createQueryRunner).toHaveBeenCalled();
      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(operation).toHaveBeenCalledWith(mockQueryRunner.manager);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('error'));
      
      await expect(repository.executeInTransaction(operation)).rejects.toThrow('error');
      
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('findClientForUpdate', () => {
    it('should find client for update', async () => {
      const manager = {
        findOne: jest.fn().mockResolvedValue({ id: '1' }),
        connection: { options: { type: 'postgres' } },
      } as unknown as EntityManager;

      const result = await repository.findClientForUpdate(manager, '1');
      expect(result).toEqual({ id: '1' });
      expect(manager.findOne).toHaveBeenCalledWith(Client, {
        where: { id: '1' },
        lock: { mode: 'pessimistic_write' },
      });
    });

    it('should throw NotFoundException if client not found', async () => {
      const manager = {
        findOne: jest.fn().mockResolvedValue(null),
        connection: { options: { type: 'postgres' } },
      } as unknown as EntityManager;

      await expect(repository.findClientForUpdate(manager, '1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTransactionsByClientId', () => {
    it('should return transactions', async () => {
      const transactions = [new Transaction()];
      const mockRepo = { find: jest.fn().mockResolvedValue(transactions) };
      mockDataSource.getRepository.mockReturnValue(mockRepo);

      const result = await repository.getTransactionsByClientId('1');
      expect(result).toEqual(transactions);
      expect(mockDataSource.getRepository).toHaveBeenCalledWith(Transaction);
      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { client: { id: '1' } },
        order: { createdAt: 'DESC' },
      });
    });
  });
});
