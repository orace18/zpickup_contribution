// services/privacy-policy.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { PrivacyPolicy } from '../models/private_polity.model';

@Injectable({
  providedIn: 'root'
})
export class PrivacyPolicyService {
  private apiUrl = environment.apiUrl +"/privacy-policy"; 

  constructor(private http: HttpClient) {}

  private stripHtml(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  
  fetchPrivacyPolicy(): Observable<PrivacyPolicy[]> {
    return this.http.get<PrivacyPolicy[]>(this.apiUrl).pipe(
      map(policies => policies.map(policy => ({
        ...policy,
        title: this.stripHtml(policy.title)
      })))
    );
  }

  
  createPrivacyPolicy(policy: Partial<PrivacyPolicy>): Observable<PrivacyPolicy> {
    return this.http.post<PrivacyPolicy>(this.apiUrl, policy);
  }

}