import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClientsService } from '../../../application/service/clients.service';
import { TransactionsService } from '../../../application/service/transactions.service';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { TransactionDto } from '../dto/transaction.dto';
import { TransferDto } from '../dto/transfer.dto';
import { ClientResponseDto } from '../dto/client-response.dto';

@ApiTags('clients')
@Controller('clients')
export class ClientsController {
  constructor(
    private readonly clientsService: ClientsService,
    private readonly transactionsService: TransactionsService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({
    status: 201,
    description: 'The client has been successfully created.',
    type: ClientResponseDto,
  })
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all clients' })
  @ApiResponse({ status: 200, description: 'Return all clients.', type: [ClientResponseDto] })
  findAll() {
    return this.clientsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a client by id' })
  @ApiResponse({ status: 200, description: 'Return the client.', type: ClientResponseDto })
  @ApiResponse({ status: 404, description: 'Client not found.' })
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a client' })
  @ApiResponse({ status: 200, description: 'The client has been successfully updated.' })
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.update(id, updateClientDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a client' })
  @ApiResponse({ status: 204, description: 'The client has been successfully deleted.' })
  remove(@Param('id') id: string) {
    return this.clientsService.remove(id);
  }

  @Post(':id/deposit')
  @ApiOperation({ summary: 'Deposit money' })
  @ApiResponse({ status: 201, description: 'Deposit successful.' })
  deposit(@Param('id') id: string, @Body() transactionDto: TransactionDto) {
    return this.transactionsService.deposit(id, transactionDto.amount);
  }

  @Post(':id/withdraw')
  @ApiOperation({ summary: 'Withdraw money' })
  @ApiResponse({ status: 201, description: 'Withdraw successful.' })
  @ApiResponse({ status: 400, description: 'Insufficient funds.' })
  withdraw(@Param('id') id: string, @Body() transactionDto: TransactionDto) {
    return this.transactionsService.withdraw(id, transactionDto.amount);
  }

  @Post(':id/transfer')
  @ApiOperation({ summary: 'Transfer money' })
  @ApiResponse({ status: 201, description: 'Transfer successful.' })
  @ApiResponse({ status: 400, description: 'Insufficient funds.' })
  transfer(@Param('id') id: string, @Body() transferDto: TransferDto) {
    return this.transactionsService.transfer(id, transferDto.receiverId, transferDto.amount);
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: 'Get client transactions' })
  @ApiResponse({ status: 200, description: 'Return all transactions for the client.' })
  getTransactions(@Param('id') id: string) {
    return this.transactionsService.getTransactions(id);
  }
}
