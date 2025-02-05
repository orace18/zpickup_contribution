import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, fromEvent, merge, Subject, timer } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import {AuthService} from './auth.service';
import {SidebarComponent} from '../components/sidebar/sidebar.component';

@Injectable({
  providedIn: 'root'
})
export class AutoLogoutService implements OnDestroy {
  private readonly INACTIVITY_TIMEOUT = 10 * 60 * 1000; 
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; 

  private destroy$ = new Subject<void>();
  private userActivity: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private sessionStartTime: number = Date.now();
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  initializeAutoLogout(): void {
    this.sessionStartTime = Date.now(); // Réinitialisation au démarrage
    this.setupActivityListeners();
    this.setupInactivityTimer();
    this.setupSessionTimer();
  }

  private setupActivityListeners(): void {
    const events = [
      'click',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart'
    ];

    merge(
      ...events.map(evt => fromEvent(document, evt))
    ).pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.userActivity.next(true);
      this.checkSessionDuration();
    });
  }

  private setupInactivityTimer(): void {
    this.userActivity.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      timer(this.INACTIVITY_TIMEOUT).pipe(
        takeUntil(merge(this.userActivity, this.destroy$))
      ).subscribe(() => {
        this.logout('Déconnexion due à l\'inactivité');
      });
    });
  }

  private setupSessionTimer(): void {
    timer(this.SESSION_TIMEOUT).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.logout('Session expirée (24h)');
    });
  }

  private checkSessionDuration(): void {
    if (Date.now() - this.sessionStartTime >= this.SESSION_TIMEOUT) {
      this.logout('Session expirée (24h)');
    }
  }
  
    private logout(reason: string): void {
      console.log(reason);
      
      // Récupérer l'ID de l'utilisateur depuis le service d'authentification
      const currentUser = this.authService.getCurrentUser();
      const userId = currentUser?.user?._id;
  
      // Nettoyage du localStorage
      localStorage.clear();
  
      // Nettoyage des cookies
      document.cookie.split(';').forEach(cookie => {
        document.cookie = cookie
          .replace(/^ +/, '')
          .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
      });
  
      if (userId) {
        this.authService.logout(userId).subscribe({
          next: () => {
            this.router.navigate(['/login']);
          },
          error: (error) => {
            console.error('Erreur lors de la déconnexion:', error);
            this.router.navigate(['/login']);
          }
        });
      } else {
        this.router.navigate(['/login']);
      }
    }
  
 

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
