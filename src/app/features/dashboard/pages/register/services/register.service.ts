import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SignupPayload} from '../models/register.model';
import {environment} from '../../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private readonly API_URL = environment.apiUrl + '/admin/create-admin';
  constructor(private http: HttpClient) {}

  register(payload: SignupPayload): Observable<any> {
    return this.http.post(`${this.API_URL}`, payload);
  }

}
