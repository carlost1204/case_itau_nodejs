import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClientTypeOrmRepository } from '../src/clients/adapters/infraestructure/client.typeorm.repository';
import { Client } from '../src/clients/domain/entities/client.entity';

const mockRepository = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

describe('ClientTypeOrmRepository', () => {
  let repository: ClientTypeOrmRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientTypeOrmRepository,
        {
          provide: getRepositoryToken(Client),
          useValue: mockRepository,
        },
      ],
    }).compile();

    repository = module.get<ClientTypeOrmRepository>(ClientTypeOrmRepository);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all clients', async () => {
      mockRepository.find.mockResolvedValue([]);
      const result = await repository.findAll();
      expect(result).toEqual([]);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a client', async () => {
      const client = { id: '1' };
      mockRepository.findOneBy.mockResolvedValue(client);
      const result = await repository.findOne('1');
      expect(result).toEqual(client);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
    });
  });

  describe('create', () => {
    it('should create a client', async () => {
      const data = { nome: 'Test' };
      const client = { id: '1', ...data };
      mockRepository.create.mockReturnValue(client);
      mockRepository.save.mockResolvedValue(client);
      
      const result = await repository.create(data);
      expect(result).toEqual(client);
      expect(mockRepository.create).toHaveBeenCalledWith(data);
      expect(mockRepository.save).toHaveBeenCalledWith(client);
    });
  });

  describe('save', () => {
    it('should save a client', async () => {
      const client = new Client();
      mockRepository.save.mockResolvedValue(client);
      const result = await repository.save(client);
      expect(result).toEqual(client);
      expect(mockRepository.save).toHaveBeenCalledWith(client);
    });
  });

  describe('delete', () => {
    it('should delete a client', async () => {
      mockRepository.delete.mockResolvedValue(undefined);
      await repository.delete('1');
      expect(mockRepository.delete).toHaveBeenCalledWith('1');
    });
  });
});
