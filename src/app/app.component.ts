import { RouterModule } from '@angular/router';
import { AutoLogoutService } from '../core/services/inspector.service';
import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { MessagingService } from '../core/services/message.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
  imports: [RouterModule, CommonModule],
  providers: [AutoLogoutService]
})
export class AppComponent implements OnInit {
  title = 'ZpickUp ';
  message: string = "";
  messageTitle: string = "";
  
  private platformId = inject(PLATFORM_ID);
  
  constructor(
    private autoLogoutService: AutoLogoutService,
    private messagingService: MessagingService
  ) {}

  ngOnInit() {
    // Initialiser le service de messagerie (permission + écoute)
    this.messagingService.initializeMessaging();
    
    // Écouter les messages
    /* this.messagingService.currentMessage.subscribe(
      (message) => {
        if(message != null) {
          const title = message?.notification?.title || '';
          const body = message?.notification?.body || '';
          
          // Afficher le message dans le snackbar
          this.message = body;
          this.messageTitle = title;
          
         
          setTimeout(() => {
            if (this.message === body) {
              this.message = "";
            }
          }, 9000);
          
          // Afficher une notification du navigateur si l'application est en arrière-plan
          if (isPlatformBrowser(this.platformId) && document.visibilityState === 'hidden') {
            this.showBrowserNotification(title, body);
          }
        }
      }
    ); */
  
    this.autoLogoutService.initializeAutoLogout();
  }
  
  // Afficher une notification du navigateur
  private showBrowserNotification(title: string, body: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: body,
        icon: '/assets/icons/icon-128x128.png'
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      
      setTimeout(() => {
        notification.close();
      }, 9000);
    }
  }
}