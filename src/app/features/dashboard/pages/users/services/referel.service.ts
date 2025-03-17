import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../../../../environments/environment";
import { catchError, throwError } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ReferelService {
    constructor(private http: HttpClient) { }

    private apiUrl = environment.apiUrl + '/reference-history';
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

}