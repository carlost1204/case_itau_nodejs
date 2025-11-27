import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = '';
  private token = '';

  constructor(private http: HttpClient) {
    const savedUrl = localStorage.getItem('apiUrl');
    const savedToken = localStorage.getItem('token');
    if (savedUrl) this.apiUrl = savedUrl;
    if (savedToken) this.token = savedToken;
  }

  setCredentials(url: string, token: string) {
    this.apiUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    this.token = token;
    localStorage.setItem('apiUrl', this.apiUrl);
    localStorage.setItem('token', this.token);
  }

  getHeaders(): HttpHeaders {
    return new HttpHeaders({
      // 'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
  }

  getClients(): Observable<any> {
    return this.http.get(`${this.apiUrl}/clients`, { headers: this.getHeaders() });
  }

  getClientById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/clients/${id}`, { headers: this.getHeaders() });
  }

  createClient(client: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/clients`, client, { headers: this.getHeaders() });
  }

  updateClient(id: string, client: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/clients/${id}`, client, { headers: this.getHeaders() });
  }

  deleteClient(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clients/${id}`, { headers: this.getHeaders() });
  }

  deposit(id: string, amount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/clients/${id}/deposit`, { amount }, { headers: this.getHeaders() });
  }

  withdraw(id: string, amount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/clients/${id}/withdraw`, { amount }, { headers: this.getHeaders() });
  }

  transfer(senderId: string, receiverId: string, amount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/clients/${senderId}/transfer`, { receiverId, amount }, { headers: this.getHeaders() });
  }

  getTransactions(clientId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/clients/${clientId}/transactions`, { headers: this.getHeaders() });
  }
}
