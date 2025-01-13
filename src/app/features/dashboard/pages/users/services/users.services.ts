import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import { User } from '../models/users.model';
import {environment} from '../../../../../../environments/environment';
import {ZemUser} from '../models/race.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
   apiUrl = environment.apiUrl + "/users";
   sndapiUrl = environment.apiUrl+ "/admin/users";

  constructor(private http: HttpClient) {}

  validateAccount(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/validate`, {});
  }

  rejectAccount(userId: string, motif: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/reject`, { motif });
  }

  resetPassword(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/reset-password`, {});
  }

  getUserById(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}`, {});
  }

  deactivateAccount(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/deactivate`, {});
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getZemById(zemId: string): Observable<ZemUser> {
    return this.http.get<ZemUser>(`/api/users/zem/${zemId}`);
  }

  deleteUser(userId: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`);

    return this.http.delete(`${this.sndapiUrl}/${userId}`, {headers});
  }
  updateUser(userId: string, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}`, userData);
  }
}
