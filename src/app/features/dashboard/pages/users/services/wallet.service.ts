import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {WalletBalance, WalletHistory} from '../models/wallet.model';
import {environment} from '../../../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getWalletBalance(userId: string): Observable<WalletBalance> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`);
    return this.http.get<WalletBalance>(`${this.apiUrl}/wallet/balance/${userId}`, { headers });
  }

  getWalletHistory(userId: string): Observable<WalletHistory> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`);
    return this.http.get<WalletHistory>(`${this.apiUrl}/wallet-history/${userId}`, { headers });
  }
}
