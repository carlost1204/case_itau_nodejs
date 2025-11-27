import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsController } from './adapters/presentation/controller/clients.controller';
import { ClientsService } from './application/service/clients.service';
import { TransactionsService } from './application/service/transactions.service';
import { Client } from './domain/entities/client.entity';
import { Transaction } from './domain/entities/transaction.entity';
import { CLIENT_REPOSITORY } from './adapters/infraestructure/client.repository.interface';
import { ClientTypeOrmRepository } from './adapters/infraestructure/client.typeorm.repository';
import { TRANSACTION_REPOSITORY } from './adapters/infraestructure/transaction.repository.interface';
import { TransactionTypeOrmRepository } from './adapters/infraestructure/transaction.typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Client, Transaction])],
  controllers: [ClientsController],
  providers: [
    ClientsService,
    TransactionsService,
    {
      provide: CLIENT_REPOSITORY,
      useClass: ClientTypeOrmRepository,
    },
    {
      provide: TRANSACTION_REPOSITORY,
      useClass: TransactionTypeOrmRepository,
    },
  ],
  exports: [ClientsService, TransactionsService],
})
export class ClientsModule {}
