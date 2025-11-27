import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../src/health/health.controller';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';

const mockHealthCheckService = {
  check: jest.fn(),
};

const mockTypeOrmHealthIndicator = {
  pingCheck: jest.fn(),
};

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: mockHealthCheckService,
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: mockTypeOrmHealthIndicator,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should check health', async () => {
      const result = { status: 'ok', info: { database: { status: 'up' } } };
      
      mockHealthCheckService.check.mockImplementation(async (callbacks) => {
        for (const cb of callbacks) {
          await cb();
        }
        return result;
      });
      
      mockTypeOrmHealthIndicator.pingCheck.mockResolvedValue({ database: { status: 'up' } });
      
      expect(await controller.check()).toBe(result);
      expect(mockHealthCheckService.check).toHaveBeenCalled();
      expect(mockTypeOrmHealthIndicator.pingCheck).toHaveBeenCalledWith('database');
    });
  });
});
