import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { LoginCredentials, LoginResponse } from '../models/datatype.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<any>(null);
  private tokenExpirationTimer: any;
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkAndLoadStoredUser();
  }

  private checkAndLoadStoredUser() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // Vérifier si le token n'est pas expiré
      if (this.isTokenValid(user.access_token)) {
        this.currentUserSubject.next(user);
        this.autoRenewToken();
      } else {
        this.logout();
      }
    }
  }

  isAuthenticated(): boolean {
    const hasToken = !!this.currentUserSubject.value?.access_token;
    return hasToken;
  }


  private isTokenValid(token: string): boolean {
    if (!token) return false;
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    return tokenData.exp * 1000 > Date.now();
  }

  private autoRenewToken() {
    const token = this.getToken();
    if (token) {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = tokenData.exp * 1000;
      const timeUntilExpiration = expirationTime - Date.now();
      
      // Renouveler 5 minutes avant l'expiration
      const renewalTime = timeUntilExpiration - (5 * 60 * 1000);
      
      if (this.tokenExpirationTimer) {
        clearTimeout(this.tokenExpirationTimer);
      }

      this.tokenExpirationTimer = setTimeout(() => {
        this.refreshToken().subscribe();
      }, renewalTime);
    }
  }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/admin/auth/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('currentUser', JSON.stringify(response));
          this.currentUserSubject.next(response);
          this.autoRenewToken();
        }),
        catchError(this.handleError)
      );
  }

  logout(userId?: string): Observable<any> {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    const logoutRequest = userId ? 
      this.http.delete(`${this.apiUrl}/users/logout/${userId}`) :
      new Observable(subscriber => subscriber.next());

    return logoutRequest.pipe(
      tap(() => {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
      }),
      catchError(this.handleError)
    );
  }

  hasPermission(permission: string): boolean {
    const currentUser = this.currentUserSubject.value;
    return currentUser?.user?.role?.permissions?.includes(permission) || false;
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
    return this.currentUserSubject.value?.access_token || null;
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

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

}
