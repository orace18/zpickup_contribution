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
  private readonly INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 heures

  private destroy$ = new Subject<void>();
  private userActivity: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private sessionStartTime: number = Date.now(); // Initialisation ici pour corriger l'erreur TS2564

  constructor(
    private router: Router,
    // Ajoutez ici vos services nécessaires, par exemple:
     private authService: AuthService,
    private sidService: SidebarComponent
    // private localStorageService: LocalStorageService
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

    // 1. Nettoyage du localStorage
    localStorage.clear();
    // OU si vous préférez supprimer des éléments spécifiques :
    // localStorage.removeItem('token');
    // localStorage.removeItem('user');

    // 2. Nettoyage des cookies si nécessaire
    document.cookie.split(';').forEach(cookie => {
      document.cookie = cookie
        .replace(/^ +/, '')
        .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
    });

    // 3. Si vous utilisez un service d'authentification
    this.authService.logout(this.sidService.userId).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Erreur lors de la déconnexion:', error);
        this.router.navigate(['/login']);
      }
    });

    // 4. Si vous n'utilisez pas de service d'authentification, redirection directe
    this.router.navigate(['/login']);

    // 5. Optionnel : Afficher un message à l'utilisateur
    // this.notificationService.show({
    //   type: 'info',
    //   message: `Vous avez été déconnecté. ${reason}`
    // });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
