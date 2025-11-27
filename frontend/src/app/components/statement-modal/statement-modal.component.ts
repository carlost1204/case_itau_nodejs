import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-statement-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statement-modal.component.html',
  styleUrls: ['./statement-modal.component.css']
})
export class StatementModalComponent implements OnChanges {
  @Input() client: any = null;
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();

  transactions: any[] = [];
  loading = false;
  error = '';

  constructor(private api: ApiService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isVisible'] && this.isVisible && this.client) {
      this.loadTransactions();
    }
  }

  loadTransactions() {
    this.loading = true;
    this.error = '';
    this.api.getTransactions(this.client.id).subscribe({
      next: (data) => {
        this.transactions = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load transactions.';
        this.loading = false;
      }
    });
  }

  onClose() {
    this.close.emit();
  }
}
