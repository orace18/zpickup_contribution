import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { WalletBalance, WalletHistory, WalletTransaction } from '../models/wallet.model';
import {environment} from '../../../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('access_token')}`
    );
  }

  getWalletBalance(userId: string): Observable<WalletBalance> {
    return this.http.get<WalletBalance>(
      `${this.apiUrl}/wallet/balance/${userId}`,
      { headers: this.getHeaders() }
    );
  }


  getWalletHistory(userId: string): Observable<WalletHistory> {
    return this.http.get<WalletTransaction[]>(
      `${this.apiUrl}/wallet-history/${userId}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(transactions => this.calculateWalletHistory(transactions))
    );
  }

  private calculateWalletHistory(transactions: WalletTransaction[]): WalletHistory {
    const totals = transactions.reduce((acc, transaction) => {
      acc.total_transactions++;

      if (transaction.type === 'withdrawal') {
        acc.total_withdrawals++;
        acc.total_withdrawal_amount += transaction.amount;
      } else if (transaction.type === 'credit' || transaction.type === 'bonus') {
        acc.total_credits++;
        acc.total_credit_amount += transaction.amount;
      }

      return acc;
    }, {
      total_transactions: 0,
      total_withdrawals: 0,
      total_credits: 0,
      total_withdrawal_amount: 0,
      total_credit_amount: 0
    });

    return {
      ...totals,
      transactions
    };
  }
}
