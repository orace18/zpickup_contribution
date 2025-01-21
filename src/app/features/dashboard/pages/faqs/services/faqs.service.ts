import {Injectable} from '@angular/core';
import {environment} from '../../../../../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {FAQ} from '../models/faqs.model';

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  private apiUrl = `${environment.apiUrl}/faq`;

  constructor(private http: HttpClient) {}

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

  deleteFaq(id: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`);

    return this.http.delete(`${this.apiUrl}/delete-faq/${id}`, { headers });
  }
}
