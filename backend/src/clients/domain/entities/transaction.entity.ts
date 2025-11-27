import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Client } from './client.entity';

@Entity({ name: 'transacoes' })
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Client, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cliente_id' })
  client!: Client;

  @Column({ type: 'varchar', length: 20 })
  type!: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER_SENT' | 'TRANSFER_RECEIVED';

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount!: number;

  @CreateDateColumn({ name: 'data_transacao' })
  createdAt!: Date;
}
