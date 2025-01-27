import {Injectable} from '@angular/core';
import {environment} from '../../../../../../environments/environment';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import {FAQ} from '../models/faqs.model';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  private apiUrl = `${environment.apiUrl}/faq`;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastrService,
  ) {
   
  }

  getFaqs(): Observable<FAQ[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`);

    return this.http.get<FAQ[]>(`${this.apiUrl}/all-faq`, {headers});
  }

  createFaq(faq: Partial<FAQ>): Observable<FAQ> {
    return this.http.post<FAQ>(`${this.apiUrl}/create-faq`, faq);
  }


  updateFaq(id: string, faq: Partial<FAQ>): Observable<FAQ> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`);

    return this.http.patch<FAQ>(`${this.apiUrl}/update-faq/${id}`, faq, { headers });
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('access_token')}`
    );
  }

  deleteFaq(id: string): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/delete-faq/${id}`, {
        headers: this.getHeaders()
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 400) {
            // Erreur de validation ou FAQ système
           // return throwError(() => new Error(error.error.message || "Impossible de supprimer cette FAQ"));
            this.toast.error("Impossible de supprimer cette FAQ");
          }
          if (error.status === 401) {
            // Erreur d'authentification
           // return throwError(() => new Error("Session expirée, veuillez vous reconnecter"));
           this.router.navigate(['/login']);
          }
          // Autres erreurs
          this.toast.error("Une erreur est survenue lors de la suppression");
          return throwError(() => new Error("Une erreur est survenue lors de la suppression"));
        })
      );
  }
}
