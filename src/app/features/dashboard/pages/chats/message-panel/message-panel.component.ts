import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Message } from '../models/message';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Observable, of, Subscription } from 'rxjs';
import { ChatService } from '../services/chat.service';
import { environment } from '../../../../../../environments/environment';
import { AuthService } from '../../../../../../core/services/auth.service';



interface MediaMessage {
  type: 'image' | 'video' | 'audio';
  url: string;
}




@Component({
  selector: 'app-message-panel',
  standalone: true,
  imports: [
    DatePipe,
    CommonModule,
    FormsModule
  ],
  templateUrl: './message-panel.component.html',
  styleUrl: './message-panel.component.css'
})
export class MessagePanelComponent implements OnInit, OnDestroy {
  @Input() messages: Message[] = [];
  @Input() conversationTitle: string = 'Brian Cox';
  @Input() conversationId: string = '';
  @Input() loading: boolean = false;
  @Input() error: string | null = null;
  @Output() sendMessage = new EventEmitter<string>();
  @Output() sendMediaMessage = new EventEmitter<MediaMessage>();

  newMessage: string = '';
  selectedMedia: File | null = null;
  selectedMediaType: 'image' | 'video' | 'audio' | null = null;
  selectedMediaPreview: string | null = null;
  userId: string = '';

  // Contact information
  contactStatus: string = 'Active';
  contactIsOnline: boolean = true;
  imageURI: string = environment.apiUrl;

  // Polling
  private refreshInterval = 30000; 
  private refreshSubscription: Subscription | null = null;
  private lastMessageId: string | null = null;

  // Stores creator names mapped by user ID
  creatorNames: {[userId: string]: string} = {};

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  @ViewChild('mediaUpload') mediaUpload!: ElementRef;

  constructor(private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.startMessagePolling();
      const currentUser = this.authService.getCurrentUser();
      const userId = currentUser?.user?._id;
      this.userId = userId ;
  }

  ngOnDestroy() {
    this.stopMessagePolling();
  }

  
  isAdmin(user_type: string | any): boolean {
    return user_type === 'admin';
  }

  // Auto-resize textarea
  autoResize(event: any): void {
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  // Get user initials
  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  triggerMediaUpload(mediaType: 'image' | 'video' | 'audio'): void {
    this.selectedMediaType = mediaType;
    
    // Configurer les types de fichiers acceptés
    const acceptTypes = {
      'image': 'image/*',
      'video': 'video/*',
      'audio': 'audio/*'
    };
    
    this.mediaUpload.nativeElement.accept = acceptTypes[mediaType];
    this.mediaUpload.nativeElement.click();
  }

  handleMediaSelect(event: any): void {
    const files = event.target.files;
    if (files.length > 0 && this.selectedMediaType) {
      this.selectedMedia = files[0];
      
      // Créer une prévisualisation pour les images
      if (this.selectedMediaType === 'image') {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.selectedMediaPreview = e.target.result;
        };
        if (this.selectedMedia) {
          reader.readAsDataURL(this.selectedMedia);
        }
      } else {
        // Pour les vidéos et audios, on affiche juste le nom du fichier
        if (this.selectedMedia) {
          this.selectedMediaPreview = this.selectedMedia.name;
        }
       // this.selectedMediaPreview = this.selectedMedia.name;
      }
    }
  }

  removeSelectedMedia(): void {
    this.selectedMedia = null;
    this.selectedMediaPreview = null;
    this.selectedMediaType = null;
  }


    send(): void {
      // Si on a un média sélectionné
      if (this.selectedMedia && this.selectedMediaType) {
        // Créer un message temporaire pour l'affichage immédiat
        const tempMessage: Message = {
          id: 'temp_' + Date.now(),
          [this.selectedMediaType + 'Url']: URL.createObjectURL(this.selectedMedia),
          mediaType: this.selectedMediaType,
          timestamp: new Date(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sender: {
            user_type: 'admin',
            userId: this.userId,
            name: 'Vous'
          }
        };
        
        // Ajouter le message temporaire
        this.messages = [...this.messages, tempMessage];

        console.log('conversation id', this.conversationId);
        
        // Utiliser la nouvelle méthode combinée
        this.chatService
          .sendMessageWithMedia(this.conversationId, null, this.selectedMedia, this.selectedMediaType)
          .subscribe({
            next: (newMessage) => {
              // Remplacer le message temporaire par le vrai message
              this.messages = this.messages.filter(m => m.id !== tempMessage.id);
              this.messages = [...this.messages, {
                ...newMessage,
                timestamp: new Date(newMessage.created_at)
              }];
              
              // Émettre le nouveau message pour mettre à jour la liste des conversations
              // dans le composant parent
              const mediaType = this.selectedMediaType;
              if (mediaType) {
                this.sendMediaMessage.emit({
                  type: mediaType,
                  url: newMessage[mediaType + 'Url'] || ''
                });
              }
              
              // Réinitialiser l'état
              this.removeSelectedMedia();
            },
            error: (error) => {
              console.error(`Error sending ${this.selectedMediaType}:`, error);
              // Supprimer le message temporaire en cas d'erreur
              this.messages = this.messages.filter(m => m.id !== tempMessage.id);
            }
          });
        
        return;
      }
      
      // Envoi de message texte
      if (this.newMessage?.trim()) {
        const textarea = document.querySelector('.composer-input') as HTMLTextAreaElement;
        if (textarea) {
          textarea.style.height = 'auto';
        }
        const tempMessage: Message = {
          id: 'temp_' + Date.now(),
          content: this.newMessage,
          timestamp: new Date(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sender: {
            user_type: 'admin',
            userId: this.userId,
            name: 'Vous'
          }
        };
        
        // Ajouter le message temporaire immédiatement
        this.messages = [...this.messages, tempMessage];
        
        // Envoi du message
        this.chatService.sendMessage(this.conversationId, this.newMessage).subscribe({
          next: (newMessage) => {
            // Remplacer le message temporaire par le vrai message
            this.messages = this.messages.filter(m => m.id !== tempMessage.id);
            this.messages = [...this.messages, {
              ...newMessage,
              timestamp: new Date(newMessage.created_at)
            }];
            
            // Émettre le nouveau message texte
           // this.sendMessage.emit(this.newMessage);
            
            this.newMessage = '';
            
           
          },
          error: (err) => {
            console.error('Erreur lors de l\'envoi du message', err);
            // Supprimer le message temporaire en cas d'erreur
            this.messages = this.messages.filter(m => m.id !== tempMessage.id);
          }
        });
      }
    }

  private checkForNewMessages() {
    if (!this.conversationId) return;

    this.chatService.getMessagesByConversationId(this.conversationId).subscribe({
      next: (messages) => {
        console.log('Fetched messages:', messages);
        if (messages.length > 0) {
          const latestMessageId = messages[messages.length - 1].id;
          
          if (this.lastMessageId === null || this.lastMessageId !== latestMessageId) {
            this.lastMessageId = latestMessageId ?? null;
            this.messages = messages;
          }
        }
      },
      error: (err) => {
        console.error('Error fetching new messages:', err);
      }
    });
  }

  // Start message polling
  private startMessagePolling() {
    if (this.conversationId) {
      this.refreshSubscription = interval(this.refreshInterval).subscribe(() => {
        this.checkForNewMessages();
      });
    }
  }

  // Stop message polling
  private stopMessagePolling() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
      this.refreshSubscription = null;
    }
  }

  // Get message date group
  getMessageDate(message: Message): string {
    const today = new Date();
    const messageDate = new Date(message.timestamp);

    if (
      messageDate.getDate() === today.getDate() &&
      messageDate.getMonth() === today.getMonth() &&
      messageDate.getFullYear() === today.getFullYear()
    ) {
      return 'Aujourd\'hui';
    } else if (
      messageDate.getDate() === today.getDate() - 1 &&
      messageDate.getMonth() === today.getMonth() &&
      messageDate.getFullYear() === today.getFullYear()
    ) {
      return 'Hier';
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  }

  // Check if it's the first message of a date group
  isFirstMessageOfDate(index: number): boolean {
    if (index === 0) return true;

    const currentMessage = this.messages[index];
    const previousMessage = this.messages[index - 1];

    return this.getMessageDate(currentMessage) !== this.getMessageDate(previousMessage);
  }

  isImageUrl(content: string): boolean {
    if (!content) return false;
    
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg'];
    
    const isImageExtension = imageExtensions.some(ext => content.toLowerCase().endsWith(ext));
    const isValidUrl = content.startsWith('uploads/') || content.startsWith('http');
    
    return isValidUrl && isImageExtension;
  }
  
  isVideoUrl(content: string): boolean {
    if (!content) return false;
    
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    
    const isVideoExtension = videoExtensions.some(ext => content.toLowerCase().endsWith(ext));
    const isValidUrl = content.startsWith('uploads/') || content.startsWith('http');
    
    return isValidUrl && isVideoExtension;
  }
  
  isAudioUrl(content: string): boolean {
    if (!content) return false;
    
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a'];
    
    const isAudioExtension = audioExtensions.some(ext => content.toLowerCase().endsWith(ext));
    const isValidUrl = content.startsWith('uploads/') || content.startsWith('http');
    
    return isValidUrl && isAudioExtension;
  }

  getMediaUrl(message: Message): string {
    if (!message || !message.mediaType) return '';
    
    // Pour la compatibilité avec les deux versions (mediaUrl ou typeUrl spécifique)
    if (message.mediaUrl) {
      return message.mediaUrl.startsWith('/') ? this.imageURI +message.mediaUrl : this.imageURI + "/"+message.mediaUrl;
    }
    
    // Utiliser les propriétés spécifiques si disponibles
    if (message.mediaType === 'image' && message.imageUrl) {
      return message.imageUrl.startsWith('/') ?this.imageURI + message.imageUrl : this.imageURI + "/"+message.imageUrl;
    }
    
    if (message.mediaType === 'video' && message.videoUrl) {
      return message.videoUrl.startsWith('/') ? this.imageURI +message.videoUrl : this.imageURI +"/"+ message.videoUrl;
    }
    
    if (message.mediaType === 'audio' && message.audioUrl) {
      return message.audioUrl.startsWith('/') ?this.imageURI + message.audioUrl : this.imageURI +"/"+ message.audioUrl;
    }
    
    return '';
  }
  
}