import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-client-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-modal.component.html',
  styleUrls: ['./client-modal.component.css']
})
export class ClientModalComponent implements OnChanges {
  @Input() client: any = null;
  @Input() isVisible = false;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  formData = {
    nome: '',
    email: '',
    saldo: 0
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['client'] && this.client) {
      this.formData = { ...this.client };
    } else if (changes['isVisible'] && this.isVisible && !this.client) {
      this.formData = { nome: '', email: '', saldo: 0 };
    }
  }

  onSubmit() {
    this.save.emit(this.formData);
  }

  onCancel() {
    this.cancel.emit();
  }
}
