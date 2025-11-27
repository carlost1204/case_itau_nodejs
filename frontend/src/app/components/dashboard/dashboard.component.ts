import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ClientModalComponent } from '../client-modal/client-modal.component';
import { TransactionModalComponent } from '../transaction-modal/transaction-modal.component';
import { TransferModalComponent } from '../transfer-modal/transfer-modal.component';
import { StatementModalComponent } from '../statement-modal/statement-modal.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ClientModalComponent, TransactionModalComponent, TransferModalComponent, StatementModalComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  clients: any[] = [];
  error = '';
  tempUrl = 'http://localhost:3000';
  hasApiUrl = false;

  // Modal State
  isClientModalVisible = false;
  isTransactionModalVisible = false;
  isTransferModalVisible = false;
  isStatementModalVisible = false;
  selectedClient: any = null;
  transactionType: 'deposit' | 'withdraw' = 'deposit';

  constructor(private api: ApiService) {}

  ngOnInit() {
    const storedUrl = localStorage.getItem('apiUrl');
    // Check if stored URL is the deprecated API Gateway format or empty
    if (storedUrl && !storedUrl.includes('_user_request_')) {
      this.hasApiUrl = true;
      this.loadClients();
    } else {
      // If deprecated or not found, use the default ALB URL
      this.setUrl(); 
    }
  }

  setUrl() {
    if (this.tempUrl) {
      this.api.setCredentials(this.tempUrl, '');
      this.hasApiUrl = true;
      this.loadClients();
    }
  }

  loadClients() {
    this.api.getClients().subscribe({
      next: (data) => {
        this.clients = data;
        this.error = '';
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error loading clients. Check API URL.';
      }
    });
  }

  // Client Modal Logic
  openCreateClientModal() {
    this.selectedClient = null;
    this.isClientModalVisible = true;
  }

  openEditClientModal(client: any) {
    this.selectedClient = { ...client }; // Clone to avoid direct mutation
    this.isClientModalVisible = true;
  }

  closeClientModal() {
    this.isClientModalVisible = false;
    this.selectedClient = null;
  }

  onSaveClient(clientData: any) {
    if (this.selectedClient && this.selectedClient.id) {
      // Update
      this.api.updateClient(this.selectedClient.id, clientData).subscribe({
        next: () => {
          this.loadClients();
          this.closeClientModal();
        },
        error: (err) => this.error = 'Error updating client.'
      });
    } else {
      // Create
      this.api.createClient(clientData).subscribe({
        next: () => {
          this.loadClients();
          this.closeClientModal();
        },
        error: (err) => this.error = 'Error creating client.'
      });
    }
  }

  deleteClient(client: any) {
    if (confirm(`Are you sure you want to delete ${client.nome}?`)) {
      this.api.deleteClient(client.id).subscribe({
        next: () => this.loadClients(),
        error: (err) => this.error = 'Error deleting client.'
      });
    }
  }

  // Transaction Modal Logic
  openTransactionModal(client: any, type: 'deposit' | 'withdraw') {
    this.selectedClient = client;
    this.transactionType = type;
    this.isTransactionModalVisible = true;
  }

  closeTransactionModal() {
    this.isTransactionModalVisible = false;
    this.selectedClient = null;
  }

  onTransactionConfirm(amount: number) {
    if (!this.selectedClient) return;

    const action = this.transactionType === 'deposit' 
      ? this.api.deposit(this.selectedClient.id, amount)
      : this.api.withdraw(this.selectedClient.id, amount);

    action.subscribe({
      next: () => {
        this.loadClients();
        this.closeTransactionModal();
      },
      error: (err) => this.error = `Error processing ${this.transactionType}.`
    });
  }

  // Transfer Modal Logic
  openTransferModal(client: any) {
    this.selectedClient = client;
    this.isTransferModalVisible = true;
  }

  closeTransferModal() {
    this.isTransferModalVisible = false;
    this.selectedClient = null;
  }

  onTransferConfirm(data: { receiverId: string, amount: number }) {
    if (!this.selectedClient) return;

    this.api.transfer(this.selectedClient.id, data.receiverId, data.amount).subscribe({
      next: () => {
        this.loadClients();
        this.closeTransferModal();
      },
      error: (err) => this.error = 'Error processing transfer.'
    });
  }

  // Statement Modal Logic
  openStatementModal(client: any) {
    this.selectedClient = client;
    this.isStatementModalVisible = true;
  }

  closeStatementModal() {
    this.isStatementModalVisible = false;
    this.selectedClient = null;
  }
}
