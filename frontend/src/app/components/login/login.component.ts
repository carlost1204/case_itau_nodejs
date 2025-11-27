import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h2>Configuração de Acesso</h2>
      <div class="form-group">
        <label>API Gateway URL:</label>
        <input [(ngModel)]="apiUrl" placeholder="http://localhost:4566/restapis/..." />
        <small>Verifique o ID da API no terminal do LocalStack</small>
      </div>
      <div class="form-group">
        <label>JWT Token:</label>
        <textarea [(ngModel)]="token" placeholder="Cole o token gerado aqui" rows="4"></textarea>
      </div>
      <button (click)="save()">Acessar Sistema</button>
    </div>
  `,
  styles: [`
    .container { max-width: 400px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px; }
    .form-group { margin-bottom: 15px; }
    label { display: block; margin-bottom: 5px; font-weight: bold; }
    input, textarea { width: 100%; padding: 8px; box-sizing: border-box; }
    button { width: 100%; padding: 10px; background: #ec7000; color: white; border: none; cursor: pointer; }
    button:hover { background: #d66500; }
  `]
})
export class LoginComponent {
  apiUrl = 'http://localhost:4566/restapis/XXX/dev/_user_request_';
  token = '';

  constructor(private api: ApiService, private router: Router) {}

  save() {
    if (this.apiUrl && this.token) {
      this.api.setCredentials(this.apiUrl, this.token);
      this.router.navigate(['/dashboard']);
    }
  }
}
