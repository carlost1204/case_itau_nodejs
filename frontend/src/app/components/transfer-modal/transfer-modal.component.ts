import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-transfer-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transfer-modal.component.html',
  styleUrls: ['./transfer-modal.component.css']
})
export class TransferModalComponent {
  @Input() sender: any = null;
  @Input() clients: any[] = [];
  @Input() isVisible = false;
  @Output() confirm = new EventEmitter<{ receiverId: string, amount: number }>();
  @Output() cancel = new EventEmitter<void>();

  receiverId: string = '';
  amount: number = 0;

  onSubmit() {
    if (this.amount > 0 && this.receiverId) {
      this.confirm.emit({ receiverId: this.receiverId, amount: this.amount });
      this.reset();
    }
  }

  onCancel() {
    this.cancel.emit();
    this.reset();
  }

  reset() {
    this.amount = 0;
    this.receiverId = '';
  }
}
