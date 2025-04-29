import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../../../../../../environments/environment';
import {CounterData} from '../models/counter.model';


@Injectable({
  providedIn: 'root'
})
export class CounterService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}


  getZemCounter(zemId: string): Observable<CounterData> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`);
    return this.http.get<CounterData>(`${this.apiUrl}/counter-history/${zemId}`, {headers});
  }

}
