import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from '../src/clients/application/service/clients.service';
import { CLIENT_REPOSITORY } from '../src/clients/adapters/infraestructure/client.repository.interface';
import { NotFoundException } from '@nestjs/common';

const mockClientRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

describe('ClientsService', () => {
  let service: ClientsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: CLIENT_REPOSITORY,
          useValue: mockClientRepository,
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a client', async () => {
      const dto = { nome: 'Test', email: 'test@test.com', telefone: '123' };
      const entity = { id: '1', ...dto, saldo: 0, createdAt: new Date() };
      mockClientRepository.create.mockResolvedValue(entity);

      const result = await service.create(dto);
      expect(result).toEqual({
        id: '1',
        nome: 'Test',
        email: 'test@test.com',
        saldo: 0,
        createdAt: expect.any(Date),
        updatedAt: undefined,
      });
      expect(mockClientRepository.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return an array of clients', async () => {
      const entity = { id: '1', nome: 'Test', email: 'test@test.com', telefone: '123', saldo: 0, createdAt: new Date() };
      mockClientRepository.findAll.mockResolvedValue([entity]);

      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });

  describe('findOne', () => {
    it('should return a client', async () => {
      const entity = { id: '1', nome: 'Test', email: 'test@test.com', telefone: '123', saldo: 0, createdAt: new Date() };
      mockClientRepository.findOne.mockResolvedValue(entity);

      const result = await service.findOne('1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException if client not found', async () => {
      mockClientRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a client', async () => {
      const dto = { nome: 'Updated' };
      const entity = { id: '1', nome: 'Test', email: 'test@test.com', telefone: '123', saldo: 0, createdAt: new Date() };
      const updatedEntity = { ...entity, ...dto };
      
      mockClientRepository.findOne.mockResolvedValue(entity);
      mockClientRepository.save.mockResolvedValue(updatedEntity);

      const result = await service.update('1', dto);
      expect(result.nome).toBe('Updated');
    });

    it('should throw NotFoundException if client to update not found', async () => {
      mockClientRepository.findOne.mockResolvedValue(null);
      await expect(service.update('1', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a client', async () => {
      const entity = { id: '1', nome: 'Test', email: 'test@test.com', telefone: '123', saldo: 0, createdAt: new Date() };
      mockClientRepository.findOne.mockResolvedValue(entity);
      mockClientRepository.delete.mockResolvedValue(undefined);

      await service.remove('1');
      expect(mockClientRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if client to remove not found', async () => {
      mockClientRepository.findOne.mockResolvedValue(null);
      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
