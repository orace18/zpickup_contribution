import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, tap, throwError} from 'rxjs';
import { User } from '../models/users.model';
import {environment} from '../../../../../../environments/environment';
import {ZemUser} from '../models/race.model';
import {catchError} from 'rxjs/operators';
import {AuthService} from '../../../../../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
   apiUrl = environment.apiUrl + "/users";
   sndapiUrl = environment.apiUrl+ "/admin/users";

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}






  getUserById(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}`, {});
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

  updateUser(userId: string, userData: any): Observable<User> {
    const token = this.authService.getToken();
    console.log("Headers avant envoi:", {
      token,
      authorization: `Bearer ${token}`,
      userId,
      userData
    });

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');  // Ajoutez ceci aussi

    return this.http.patch<User>(`${this.sndapiUrl}/${userId}`, userData, {headers})
      .pipe(
        catchError(error => {
          console.log("Erreur détaillée:", {
            status: error.status,
            message: error.error?.message,
            token: token // Pour voir si le token était présent
          });
          return throwError(() => error);
        })
      );
  }

  createUser(userData: any): Observable<User> {
    console.log("Service - Données reçues pour création:", userData);
    return this.http.post<User>(`${environment.apiUrl}/admin/create-admin`, userData).pipe(
      tap(response => console.log("Service - Réponse reçue:", response)),
      catchError(error => {
        console.error("Service - Erreur lors de la création:", error);
        return throwError(() => error);
      })
    );
  }
}
