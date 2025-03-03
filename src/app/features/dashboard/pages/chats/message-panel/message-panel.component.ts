import {AfterViewChecked, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Message} from '../models/message';
import {CommonModule, DatePipe, NgForOf} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-message-panel',
  imports: [
    DatePipe,
    CommonModule,
    FormsModule
  ],
  templateUrl: './message-panel.component.html',
  styleUrl: './message-panel.component.css'
})
export class MessagePanelComponent implements AfterViewChecked, OnInit, OnDestroy {
  chatMessages: Message[] | undefined;
  @Input() messages: Message[] = [];
  @Input() conversationTitle: string = 'Brian Cox';
  @Input() conversationId: string = '';
  @Input() loading: boolean = false;
  @Input() error: string | null = null;
  @Output() sendMessage = new EventEmitter<string>();
  creatorNames: {[userId: string]: string} = {};

  newMessage: string = '';

  // Informations sur le contact
  contactStatus: string = 'Active';
  contactIsOnline: boolean = true;
  contactAvatar: string = '/assets/avatar-placeholder.png';

  // Pour le polling
  private refreshInterval = 5000; // 5 secondes
  private refreshSubscription: Subscription | null = null;
  private lastMessageId: string | null = null;

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    // Démarrer le polling des nouveaux messages
    this.startMessagePolling();
  }

  ngOnDestroy() {
    // Arrêter le polling lorsque le composant est détruit
    this.stopMessagePolling();
  }

  private startMessagePolling() {
    if (this.conversationId) {
      this.refreshSubscription = interval(this.refreshInterval).subscribe(() => {
        this.checkForNewMessages();
      });
    }
  }

  private stopMessagePolling() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
      this.refreshSubscription = null;
    }
  }

  private checkForNewMessages() {
    if (!this.conversationId) return;

    this.chatService.getMessagesByConversationId(this.conversationId).subscribe({
      next: (messages) => {
        // Vérifier s'il y a de nouveaux messages
        if (messages.length > 0) {
          const latestMessageId = messages[messages.length - 1].id;
          
          // Si c'est le premier chargement ou s'il y a un nouveau message
          if (this.lastMessageId === null || this.lastMessageId !== latestMessageId) {
            this.lastMessageId = latestMessageId ?? null;
            
            // Mettre à jour les messages (vous pourriez vouloir émettre un événement au lieu de les définir directement)
            this.messages = messages;
          }
        }
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des nouveaux messages:', err);
      }
    });
  }

  isAdmin(role: string): boolean {
    return role === 'admin';
  }

  @ViewChild('scrollContainer')
  private scrollContainer!: ElementRef;

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  autoResize(event: any): void {
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  send(): void {
    if (this.newMessage?.trim()) {
      this.sendMessage.emit(this.newMessage);
      this.newMessage = '';

      // Réinitialiser la hauteur du textarea après l'envoi
      const textarea = document.querySelector('.composer-input') as HTMLTextAreaElement;
      if (textarea) {
        textarea.style.height = 'auto';
      }
      
      // Vérifier les nouveaux messages immédiatement après l'envoi
      setTimeout(() => this.checkForNewMessages(), 500);
    }
  }

  // Méthode pour obtenir le groupe de messages par date
  getMessageDate(message: Message): string {
    const today = new Date();
    const messageDate = new Date(message.timestamp);

    if (
      messageDate.getDate() === today.getDate() &&
      messageDate.getMonth() === today.getMonth() &&
      messageDate.getFullYear() === today.getFullYear()
    ) {
      return 'Today';
    } else if (
      messageDate.getDate() === today.getDate() - 1 &&
      messageDate.getMonth() === today.getMonth() &&
      messageDate.getFullYear() === today.getFullYear()
    ) {
      return 'Yesterday';
    } else {
      // Format: Jan 12, 2023
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  }

  // Vérifie si un message est le premier du groupe de date
  isFirstMessageOfDate(index: number): boolean {
    if (index === 0) return true;

    const currentMessage = this.messages[index];
    const previousMessage = this.messages[index - 1];

    return this.getMessageDate(currentMessage) !== this.getMessageDate(previousMessage);
  }
}