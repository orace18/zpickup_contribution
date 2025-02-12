import { Condition } from './../models/terms_condition.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ConditionService {
  private apiUrl = environment.apiUrl +"/terms-conditions"; 

  constructor(private http: HttpClient) {}

  private stripHtml(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  
  fetchtermsCondition(): Observable<Condition[]> {
    return this.http.get<Condition[]>(this.apiUrl).pipe(
      map(conditions => conditions.map(condition => ({
        ...condition,
        title: this.stripHtml(condition.title)
      })))
    );
  }

  
  createtermsCondition(condition: Partial<Condition>): Observable<Condition> {
    return this.http.post<Condition>(this.apiUrl, condition);
  }

}