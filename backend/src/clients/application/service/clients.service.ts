import { Inject, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { CreateClientDto } from '../../adapters/presentation/dto/create-client.dto';
import { UpdateClientDto } from '../../adapters/presentation/dto/update-client.dto';
import { toClientResponseDto } from '../../adapters/presentation/dto/client.mapper';
import { ClientResponseDto } from '../../adapters/presentation/dto/client-response.dto';
import {
  ClientRepository,
  CLIENT_REPOSITORY,
} from '../../adapters/infraestructure/client.repository.interface';

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);

  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: ClientRepository
  ) {}

  /**
   * Creates a new client in the system.
   *
   * @remarks
   * This method handles the creation of a client entity and maps it to a response DTO.
   * It includes error logging to capture any persistence failures (e.g., duplicate email).
   *
   * @param createClientDto - The data transfer object containing new client details.
   * @returns The created client response DTO.
   * @throws {Error} If the persistence layer fails (e.g., unique constraint violation).
   */
  async create(createClientDto: CreateClientDto): Promise<ClientResponseDto> {
    this.logger.log(`Creating new client with email: ${createClientDto.email}`);
    try {
      const client = await this.clientRepository.create(createClientDto);
      this.logger.log(`Client created successfully. ID: ${client.id}`);
      return toClientResponseDto(client);
    } catch (error: any) {
      this.logger.error(`Failed to create client: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(): Promise<ClientResponseDto[]> {
    this.logger.log('Fetching all clients');
    const clients = await this.clientRepository.findAll();
    return clients.map((client) => toClientResponseDto(client));
  }

  async findOne(id: string): Promise<ClientResponseDto> {
    const client = await this.clientRepository.findOne(id);
    if (!client) {
      this.logger.warn(`Client not found. ID: ${id}`);
      throw new NotFoundException(`Client with ID "${id}" not found`);
    }
    return toClientResponseDto(client);
  }

  /**
   * Updates an existing client's information.
   *
   * @remarks
   * This method performs a partial update. It first checks if the client exists,
   * then merges the provided DTO fields into the entity before saving.
   *
   * @param id - The unique identifier of the client to update.
   * @param updateClientDto - The DTO containing fields to update.
   * @returns The updated client response DTO.
   * @throws {NotFoundException} If the client with the given ID does not exist.
   */
  async update(id: string, updateClientDto: UpdateClientDto): Promise<ClientResponseDto> {
    this.logger.log(`Updating client. ID: ${id}`);
    const clientToUpdate = await this.clientRepository.findOne(id);

    if (!clientToUpdate) {
      this.logger.warn(`Update failed: Client not found. ID: ${id}`);
      throw new NotFoundException(`Client with ID "${id}" not found`);
    }

    // Assign properties from DTO to the entity
    Object.assign(clientToUpdate, updateClientDto);

    const updatedClient = await this.clientRepository.save(clientToUpdate);
    this.logger.log(`Client updated successfully. ID: ${id}`);
    return toClientResponseDto(updatedClient);
  }

  /**
   * Removes a client from the system.
   *
   * @remarks
   * This operation is idempotent in the sense that it first verifies existence.
   * If the client exists, it is deleted. If not, a NotFoundException is thrown by `findOne`.
   *
   * @param id - The unique identifier of the client to remove.
   * @throws {NotFoundException} If the client does not exist.
   */
  async remove(id: string): Promise<void> {
    this.logger.log(`Removing client. ID: ${id}`);
    await this.findOne(id); // Check if client exists
    await this.clientRepository.delete(id);
    this.logger.log(`Client removed successfully. ID: ${id}`);
  }
}
