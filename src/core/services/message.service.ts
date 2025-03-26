import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { BehaviorSubject } from 'rxjs';
import { MessagePayload } from 'firebase/messaging';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { ToastrService } from 'ngx-toastr'; // Vous devrez installer cette bibliothèque

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  currentMessage = new BehaviorSubject<MessagePayload | null>(null);
  private apiUrl = environment.apiUrl + '/admin/users';
  messages: MessagePayload[] = []; // Pour stocker l'historique des notifications

  constructor(
    private angularFireMessaging: AngularFireMessaging,
    private http: HttpClient,
    private authService: AuthService,
    private toastr: ToastrService // Pour les notifications toast
  ) {}

  initializeMessaging() {
    this.requestPermission();
    this.receiveMessage();
    this.setupForegroundNotification();
  }

  requestPermission() {
    this.angularFireMessaging.requestToken.subscribe(
      (token) => {
        //console.log('Token reçu :', token);
        
        if (token) {
          this.saveTokenToServer(token);
        }
      },
      (err) => {
        //console.error('Impossible d\'obtenir la permission', err);
      }
    );
  }

  receiveMessage() {
    this.angularFireMessaging.messages.subscribe(
      (payload) => {
       // console.log('Nouveau message reçu:', payload);
        const enhancedPayload = {
          ...payload,
          messageId: payload.from || Date.now().toString(),
          timestamp: new Date().toISOString()
        } as MessagePayload;
        
        // Ajouter au début de notre tableau de messages
        this.messages.unshift(enhancedPayload);
        // Limiter la taille de l'historique si nécessaire
        if (this.messages.length > 20) {
          this.messages.pop();
        }
        
        this.currentMessage.next(enhancedPayload);
      }
    );
  }

  // Afficher les notifications même quand l'application est au premier plan
  setupForegroundNotification() {
    this.angularFireMessaging.onMessage(payload => {
     // console.log('Message reçu au premier plan:', payload);
      
      // Afficher une notification toast
      const title = payload.notification?.title || 'Nouvelle notification';
      const body = payload.notification?.body || 'Vous avez reçu une notification.';
      
      // Utiliser toastr pour afficher une notification
      this.toastr.info(body, title, {
        timeOut: 5000,
        positionClass: 'toast-top-right',
        closeButton: true
      });
      
      // Également mettre à jour le flux BehaviorSubject
      this.currentMessage.next(payload);
    });
  }

  // Obtenir les 5 dernières notifications
  getRecentNotifications() {
    return this.messages.slice(0, 5);
  }

  // Effacer toutes les notifications
  clearNotifications() {
    this.messages = [];
  }

  private saveTokenToServer(token: string) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`);
    const currentUser = this.authService.getCurrentUser();
    const userId = currentUser?.user?._id;
    
    if (userId) {
      this.http.patch(`${this.apiUrl}/${userId}`, { fcm_token: token }, { headers });
        /* .subscribe(
          response => console.log('Token FCM enregistré avec succès', response),
          error => console.error('Erreur lors de l\'enregistrement du token FCM', error)
        ); */
    }
  }
}