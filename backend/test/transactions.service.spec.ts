import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from '../src/clients/application/service/transactions.service';
import { TRANSACTION_REPOSITORY } from '../src/clients/adapters/infraestructure/transaction.repository.interface';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Transaction } from '../src/clients/domain/entities/transaction.entity';

const mockManager = {
  create: jest.fn(),
  save: jest.fn(),
};

const mockTransactionRepository = {
  executeInTransaction: jest.fn((cb) => cb(mockManager)),
  findClientForUpdate: jest.fn(),
  getTransactionsByClientId: jest.fn(),
};

describe('TransactionsService', () => {
  let service: TransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deposit', () => {
    it('should deposit amount', async () => {
      const client = { id: '1', saldo: 100 };
      mockTransactionRepository.findClientForUpdate.mockResolvedValue(client);
      mockManager.create.mockReturnValue({});
      mockManager.save.mockResolvedValue({});

      const result = await service.deposit('1', 50);
      expect(result.saldo).toBe(150);
      expect(mockManager.save).toHaveBeenCalledTimes(2);
    });

    it('should throw BadRequestException if amount <= 0', async () => {
      await expect(service.deposit('1', 0)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if client not found', async () => {
      mockTransactionRepository.findClientForUpdate.mockResolvedValue(null);
      await expect(service.deposit('1', 50)).rejects.toThrow(NotFoundException);
    });
  });

  describe('withdraw', () => {
    it('should withdraw amount', async () => {
      const client = { id: '1', saldo: 100 };
      mockTransactionRepository.findClientForUpdate.mockResolvedValue(client);
      mockManager.create.mockReturnValue({});
      mockManager.save.mockResolvedValue({});

      const result = await service.withdraw('1', 50);
      expect(result.saldo).toBe(50);
    });

    it('should throw BadRequestException if amount <= 0', async () => {
      await expect(service.withdraw('1', 0)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if client not found', async () => {
      mockTransactionRepository.findClientForUpdate.mockResolvedValue(null);
      await expect(service.withdraw('1', 50)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if insufficient funds', async () => {
      const client = { id: '1', saldo: 10 };
      mockTransactionRepository.findClientForUpdate.mockResolvedValue(client);
      await expect(service.withdraw('1', 50)).rejects.toThrow(BadRequestException);
    });
  });

  describe('transfer', () => {
    it('should transfer amount', async () => {
      const sender = { id: '1', saldo: 100 };
      const receiver = { id: '2', saldo: 50 };
      
      // Mock findClientForUpdate to return sender then receiver based on ID order logic in service
      // The service sorts IDs. Let's assume '1' < '2'.
      // firstId = '1', secondId = '2'.
      // firstClient = sender, secondClient = receiver.
      
      mockTransactionRepository.findClientForUpdate
        .mockResolvedValueOnce(sender)
        .mockResolvedValueOnce(receiver);
      
      mockManager.create.mockReturnValue({});
      mockManager.save.mockResolvedValue({});

      await service.transfer('1', '2', 50);
      
      expect(sender.saldo).toBe(50);
      expect(receiver.saldo).toBe(100);
      expect(mockManager.save).toHaveBeenCalledTimes(4); // sender, receiver, txSender, txReceiver
    });

    it('should transfer amount when senderId > receiverId', async () => {
      const sender = { id: '2', saldo: 100 };
      const receiver = { id: '1', saldo: 50 };
      
      // senderId > receiverId ('2' > '1')
      // firstId = '1' (receiver), secondId = '2' (sender)
      // findClientForUpdate called with '1' then '2'
      
      mockTransactionRepository.findClientForUpdate
        .mockResolvedValueOnce(receiver)
        .mockResolvedValueOnce(sender);
      
      mockManager.create.mockReturnValue({});
      mockManager.save.mockResolvedValue({});

      await service.transfer('2', '1', 50);
      
      expect(sender.saldo).toBe(50);
      expect(receiver.saldo).toBe(100);
    });

    it('should throw BadRequestException if amount <= 0', async () => {
      await expect(service.transfer('1', '2', 0)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if senderId === receiverId', async () => {
      await expect(service.transfer('1', '1', 50)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if sender not found', async () => {
      mockTransactionRepository.findClientForUpdate
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({});
      await expect(service.transfer('1', '2', 50)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if receiver not found', async () => {
      mockTransactionRepository.findClientForUpdate
        .mockResolvedValueOnce({ id: '1' })
        .mockResolvedValueOnce(null);
      await expect(service.transfer('1', '2', 50)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if insufficient funds', async () => {
      const sender = { id: '1', saldo: 10 };
      const receiver = { id: '2', saldo: 50 };
      mockTransactionRepository.findClientForUpdate
        .mockResolvedValueOnce(sender)
        .mockResolvedValueOnce(receiver);
      
      await expect(service.transfer('1', '2', 50)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getTransactions', () => {
    it('should return transactions', async () => {
      const transactions = [new Transaction()];
      mockTransactionRepository.getTransactionsByClientId.mockResolvedValue(transactions);
      
      const result = await service.getTransactions('1');
      expect(result).toEqual(transactions);
    });
  });
});
