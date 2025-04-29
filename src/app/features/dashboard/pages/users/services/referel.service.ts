import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../../../../environments/environment";
import { catchError, Observable, throwError } from "rxjs";
import { AmbassadorTransaction } from "../models/referel.model";

@Injectable({
    providedIn: 'root'
})
export class ReferelService {
    constructor(private http: HttpClient) { }

    private apiUrl = environment.apiUrl + '/reference-history';
    private ambassadorApiUrl = environment.apiUrl + '/wallet/ambassador/balance/';
    private ambassadorHistoryApiUrl = environment.apiUrl + '/wallet-history/ambassador/';
    private getHeaders(): HttpHeaders {
        return new HttpHeaders().set(
          'Authorization',
          `Bearer ${localStorage.getItem('access_token')}`
        );
      }

      getUserReferral(userId: string) {
        return this.http.get(`${this.apiUrl}/referrer/${userId}`, { headers: this.getHeaders() })
          .pipe(
            catchError(error => {
              console.error('Error fetching referrals:', error);
              return throwError(() => error);
            })
          );
      }

      getMoneyReferral(userId: string) {
        return this.http.get(`${this.apiUrl}/referral-stats/${userId}`, { headers: this.getHeaders() })
          .pipe(
            catchError(error => {
              console.error('Error fetching money referrals:', error);
              return throwError(() => error);
            })
          );
      }

      getAmbassadorMoneyReferral(userId: string) {
        return this.http.get(`${this.ambassadorApiUrl}${userId}`, { headers: this.getHeaders() })
          .pipe(
            catchError(error => {
              console.error('Error fetching ambassador money referrals:', error);
              return throwError(() => error);
            })
          );
      }


      getAmbassadorHistory(userId: string): Observable<AmbassadorTransaction[]> {
        return this.http.get<AmbassadorTransaction[]>(`${this.ambassadorHistoryApiUrl}${userId}`, { headers: this.getHeaders() });
      }
}