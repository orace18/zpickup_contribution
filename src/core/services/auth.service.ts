import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import {environment} from '../../environments/environment';

interface LoginResponse {
  access_token: string;  // Changé de 'token' à 'access_token'
  user: {
    email_address: string;
    phone_number: string;
    user_type: string;
    role: {
      _id: string;
      key: string;
      description: string;
      permissions: string[];
      name: string;
    };
    _id: string;
  };
}

interface LoginCredentials {
  email_address: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    console.log('Constructor - stored user:', storedUser);
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/admin/auth/login`, credentials)
      .pipe(
        tap(response => {
          console.log('Login response:', response); // Voir la réponse complète
          localStorage.setItem('currentUser', JSON.stringify(response));
          console.log('Stored in localStorage:', localStorage.getItem('currentUser')); // Vérifier le stockage
          this.currentUserSubject.next(response);
          console.log('Current user subject value:', this.currentUserSubject.value); // Vérifier le BehaviorSubject
        }),
        catchError(this.handleError)
      );
  }

  isAuthenticated(): boolean {
    const hasToken = !!this.currentUserSubject.value?.access_token;
    console.log('isAuthenticated check:', {
      currentUserValue: this.currentUserSubject.value,
      hasToken: hasToken
    });
    return hasToken;
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {}).pipe(
      tap(() => {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
      }),
      catchError(this.handleError)
    );
  }


  refreshToken(): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/refresh-token`, {}).pipe(
      tap(response => {
        const currentUser = this.getCurrentUser();
        const updatedUser = { ...currentUser, token: response.access_token };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        this.currentUserSubject.next(updatedUser);
      }),
      catchError(this.handleError)
    );
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.currentUserSubject.value?.token || null;
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = error.error.message;
    } else {
      // Erreur côté serveur
      switch (error.status) {
        case 401:
          errorMessage = 'Invalid credentials';
          break;
        case 403:
          errorMessage = 'Access denied';
          break;
        case 404:
          errorMessage = 'Resource not found';
          break;
        case 500:
          errorMessage = 'Server error';
          break;
        default:
          errorMessage = 'An unexpected error occurred';
      }
    }

    return throwError(() => new Error(errorMessage));
  }



}
