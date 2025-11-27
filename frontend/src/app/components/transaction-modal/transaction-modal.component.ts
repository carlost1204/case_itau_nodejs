import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-transaction-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-modal.component.html',
  styleUrls: ['./transaction-modal.component.css']
})
export class TransactionModalComponent {
  @Input() client: any = null;
  @Input() type: 'deposit' | 'withdraw' = 'deposit';
  @Input() isVisible = false;
  @Output() confirm = new EventEmitter<number>();
  @Output() cancel = new EventEmitter<void>();

  amount: number = 0;

  onSubmit() {
    if (this.amount > 0) {
      this.confirm.emit(this.amount);
      this.amount = 0;
    }
  }

  onCancel() {
    this.cancel.emit();
    this.amount = 0;
  }
}
