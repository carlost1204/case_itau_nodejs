import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from '../src/clients/adapters/presentation/controller/clients.controller';
import { ClientsService } from '../src/clients/application/service/clients.service';
import { TransactionsService } from '../src/clients/application/service/transactions.service';

const mockClientsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockTransactionsService = {
  deposit: jest.fn(),
  withdraw: jest.fn(),
  transfer: jest.fn(),
  getTransactions: jest.fn(),
};

describe('ClientsController', () => {
  let controller: ClientsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        {
          provide: ClientsService,
          useValue: mockClientsService,
        },
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
      ],
    }).compile();

    controller = module.get<ClientsController>(ClientsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a client', async () => {
      const dto = { nome: 'Test', email: 'test@test.com', telefone: '123' };
      mockClientsService.create.mockResolvedValue(dto);
      
      const result = await controller.create(dto);
      expect(result).toEqual(dto);
      expect(mockClientsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all clients', async () => {
      mockClientsService.findAll.mockResolvedValue([]);
      const result = await controller.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a client', async () => {
      const dto = { id: '1', nome: 'Test' };
      mockClientsService.findOne.mockResolvedValue(dto);
      const result = await controller.findOne('1');
      expect(result).toEqual(dto);
    });
  });

  describe('update', () => {
    it('should update a client', async () => {
      const dto = { nome: 'Updated' };
      mockClientsService.update.mockResolvedValue(dto);
      const result = await controller.update('1', dto);
      expect(result).toEqual(dto);
    });
  });

  describe('remove', () => {
    it('should remove a client', async () => {
      mockClientsService.remove.mockResolvedValue(undefined);
      await controller.remove('1');
      expect(mockClientsService.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('deposit', () => {
    it('should deposit amount', async () => {
      const dto = { amount: 50 };
      mockTransactionsService.deposit.mockResolvedValue({});
      await controller.deposit('1', dto);
      expect(mockTransactionsService.deposit).toHaveBeenCalledWith('1', 50);
    });
  });

  describe('withdraw', () => {
    it('should withdraw amount', async () => {
      const dto = { amount: 50 };
      mockTransactionsService.withdraw.mockResolvedValue({});
      await controller.withdraw('1', dto);
      expect(mockTransactionsService.withdraw).toHaveBeenCalledWith('1', 50);
    });
  });

  describe('transfer', () => {
    it('should transfer amount', async () => {
      const dto = { receiverId: '2', amount: 50 };
      mockTransactionsService.transfer.mockResolvedValue(undefined);
      await controller.transfer('1', dto);
      expect(mockTransactionsService.transfer).toHaveBeenCalledWith('1', '2', 50);
    });
  });

  describe('getTransactions', () => {
    it('should return transactions', async () => {
      mockTransactionsService.getTransactions.mockResolvedValue([]);
      await controller.getTransactions('1');
      expect(mockTransactionsService.getTransactions).toHaveBeenCalledWith('1');
    });
  });
});
