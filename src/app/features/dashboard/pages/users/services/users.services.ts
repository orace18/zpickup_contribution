import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import { User } from '../models/users.model';
import {environment} from '../../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
   apiUrl = environment.apiUrl + "/users";

  constructor(private http: HttpClient) {}

  /*getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      tap(response => {
        console.log('Réponse API getUsers:', response);
      }));
  }*/


  validateAccount(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/validate`, {});
  }

  rejectAccount(userId: string, motif: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/reject`, { motif });
  }

  resetPassword(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/reset-password`, {});
  }

  deactivateAccount(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/deactivate`, {});
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`);
  }
  updateUser(userId: string, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}`, userData);
  }
}
