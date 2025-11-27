import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule } from '../src/clients/clients.module';
import { Client } from '../src/clients/domain/entities/client.entity';
import { Transaction } from '../src/clients/domain/entities/transaction.entity';

describe('Clients Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Client, Transaction],
          synchronize: true,
        }),
        ClientsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /clients', () => {
    it('should create a new client', async () => {
      const createClientDto = {
        nome: 'Integration Test',
        email: 'integration@test.com',
        telefone: '123456789',
      };

      const response = await request(app.getHttpServer())
        .post('/clients')
        .send(createClientDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.nome).toBe(createClientDto.nome);
      expect(response.body.email).toBe(createClientDto.email);
      expect(response.body.saldo).toBe(0);
    });

    it('should fail with invalid data', async () => {
      const invalidDto = {
        nome: '',
        email: 'invalid-email',
      };

      await request(app.getHttpServer())
        .post('/clients')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /clients', () => {
    it('should return an array of clients', async () => {
      await request(app.getHttpServer())
        .get('/clients')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('Transactions Flow', () => {
    let clientId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/clients')
        .send({
          nome: 'Transaction Test',
          email: 'trans@test.com',
          telefone: '987654321',
        });
      clientId = res.body.id;
    });

    it('should deposit money', async () => {
      await request(app.getHttpServer())
        .post(`/clients/${clientId}/deposit`)
        .send({ amount: 100 })
        .expect(201);

      const clientRes = await request(app.getHttpServer()).get(`/clients/${clientId}`);
      expect(clientRes.body.saldo).toBe(100);
    });

    it('should withdraw money', async () => {
      await request(app.getHttpServer())
        .post(`/clients/${clientId}/withdraw`)
        .send({ amount: 50 })
        .expect(201);

      const clientRes = await request(app.getHttpServer()).get(`/clients/${clientId}`);
      expect(clientRes.body.saldo).toBe(50);
    });

    it('should fail withdraw with insufficient funds', async () => {
      await request(app.getHttpServer())
        .post(`/clients/${clientId}/withdraw`)
        .send({ amount: 1000 })
        .expect(400);
    });

    it('should transfer money', async () => {
      // Create receiver
      const receiverRes = await request(app.getHttpServer())
        .post('/clients')
        .send({
          nome: 'Receiver',
          email: 'receiver@test.com',
          telefone: '111222333',
        });
      const receiverId = receiverRes.body.id;

      // Transfer 20 from clientId (50) to receiverId (0)
      await request(app.getHttpServer())
        .post(`/clients/${clientId}/transfer`)
        .send({ receiverId, amount: 20 })
        .expect(201);

      // Check balances
      const senderCheck = await request(app.getHttpServer()).get(`/clients/${clientId}`);
      const receiverCheck = await request(app.getHttpServer()).get(`/clients/${receiverId}`);

      expect(senderCheck.body.saldo).toBe(30);
      expect(receiverCheck.body.saldo).toBe(20);
    });

    it('should get transactions statement', async () => {
      const res = await request(app.getHttpServer())
        .get(`/clients/${clientId}/transactions`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      // We did deposit, withdraw, transfer sent. Should be at least 3.
      expect(res.body.length).toBeGreaterThanOrEqual(3);
      expect(res.body[0]).toHaveProperty('type');
      expect(res.body[0]).toHaveProperty('amount');
    });
  });
});
