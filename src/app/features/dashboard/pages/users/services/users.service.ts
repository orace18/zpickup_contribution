import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, tap, throwError} from 'rxjs';
import {User, ZemValidationRequest} from '../models/users.model';
import {environment} from '../../../../../../environments/environment';
import {Zem, ZemUser} from '../models/race.model';
import {catchError} from 'rxjs/operators';
import {AuthService} from '../../../../../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
   apiUrl = environment.apiUrl + "/users";
   sndapiUrl = environment.apiUrl+ "/admin/users";
   zemUrl = environment.apiUrl + "/zems"

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  validateZemProfile(zemId: string, validationData: ZemValidationRequest): Observable<any> {
    const url = `${this.zemUrl}/${zemId}`;
    const token = this.authService.getToken();
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.patch(url, validationData, { headers });
  }

  getUserById(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}`, {});
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getZemById(zemId: string): Observable<ZemUser> {
    return this.http.get<ZemUser>(`${this.zemUrl}/${zemId}`);
  }

  getZemInfoById(zemId: string): Observable<Zem> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`);

    return this.http.get<Zem>(`${this.zemUrl}/${zemId}`, {headers});
  }

  deleteUser(userId: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`);

    return this.http.delete(`${this.sndapiUrl}/${userId}`, {headers});
  }

  updateUser(userId: string, userData: any): Observable<User> {
    const token = this.authService.getToken();


    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.patch<User>(`${this.sndapiUrl}/${userId}`, userData, {headers})
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  createUser(userData: any): Observable<User> {
    //console.log("Service - Données reçues pour création:", userData);
    return this.http.post<User>(`${environment.apiUrl}/admin/create-admin`, userData).pipe(
      tap(response => console.log("Service - Réponse reçue:", response)),
      catchError(error => {
        //console.error("Service - Erreur lors de la création:", error);
        return throwError(() => error);
      })
    );
  }

  updateAmbassadorStatus(userId: string, status: string): Observable<Zem> {
    const token = this.authService.getToken();

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.patch<Zem>(`${this.zemUrl}/unambassador/${userId}`, {status}, {headers})
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  // Dans votre service
makeAmbassador(userId: string, formData: FormData): Observable<Zem> {
  const token = this.authService.getToken();

  const headers = new HttpHeaders()
    .set('Authorization', `Bearer ${token}`);
  

  return this.http.patch<Zem>(`${this.zemUrl}/make_ambassador/${userId}`, formData, {headers})
    .pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
}

creditKmAccount(userId: string) {
  const token = this.authService.getToken();

  const headers = new HttpHeaders()
    .set('Authorization', `Bearer ${token}`);
  
  return this.http.post<any>(`${this.zemUrl}/add-manual-km/${userId}`,  {headers})
    .pipe(
      catchError(error => {
        return throwError(() => error); 
      })
    );
  }

  creditAllAmbassador(){
    const token = this.authService.getToken();

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);
    
    return this.http.post<any>(`${this.zemUrl}/add-km-to-all`,  {headers})
      .pipe(
        catchError(error => {
          return throwError(() => error); 
        })
      );
  }

  
}
