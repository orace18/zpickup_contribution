import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Message } from '../models/message';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { ChatService } from '../services/chat.service';
import { environment } from '../../../../../../environments/environment';
import { AuthService } from '../../../../../../core/services/auth.service';

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

  newMessage: string = '';
  selectedImage: File | null = null;
  selectedImagePreview: string | null = null;
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

  // Remove selected image
  removeSelectedImage(): void {
    this.selectedImage = null;
    this.selectedImagePreview = null;
  }

  // Trigger hidden file input
  triggerFileInput(): void {
    document.getElementById('imageUpload')?.click();
  }

  // Handle image selection
  handleImageSelect(event: any): void {
    const files = event.target.files;
    if (files.length > 0) {
      this.selectedImage = files[0];
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImagePreview = e.target.result;
      };
      if (this.selectedImage) {
        reader.readAsDataURL(this.selectedImage);
      }
    }
  }

  // Send message
 /*  send(): void {
    // Sending with image
    if (this.selectedImage) {
      this.chatService.uploadImage(this.selectedImage)
      .subscribe({
        next: (response) => {
          this.sendMessage.emit(response.imageUrl);
          this.newMessage = '';
          this.removeSelectedImage();
          setTimeout(() => this.checkForNewMessages(), 50);
        },
        error: (error) => console.error("Error sending image:", error)
      });
      return;
    }
  
    // Send text message
    if (this.newMessage?.trim()) {
      this.sendMessage.emit(this.newMessage);
      this.newMessage = '';
  
      const textarea = document.querySelector('.composer-input') as HTMLTextAreaElement;
      if (textarea) {
        textarea.style.height = 'auto';
      }
  
      setTimeout(() => this.checkForNewMessages(), 10);
    }
  } */

    send(): void {
      
      const tempMessage: Message = {
        id: 'temp_' + Date.now(), 
        content: this.newMessage,
        timestamp: new Date(),
        created_at: new Date().toDateString(),
        updated_at: new Date().toDateString(),
        sender: {
          user_type: 'admin', 
          userId: this.userId, 
          name: 'Vous'
        }
      };
    
      // Ajoutez le message temporaire immédiatement À DROITE
      this.messages = [...this.messages, tempMessage];
    
      // Envoi du message
      if (this.selectedImage) {
        this.chatService.uploadImage(this.selectedImage)
          .subscribe({
            next: (response) => {
              this.sendMessage.emit(response.imageUrl);
              this.newMessage = '';
              this.removeSelectedImage();
              
              // Remplacez le message temporaire par le message définitif
              const index = this.messages.findIndex(m => m.id === tempMessage.id);
              if (index !== -1) {
                this.messages[index] = { ...tempMessage, content: response.imageUrl };
              }
              
              setTimeout(() => this.checkForNewMessages(), 0.1);
            },
            error: (error) => {
              console.error("Error sending image:", error);
              // Supprimez le message temporaire en cas d'erreur
              this.messages = this.messages.filter(m => m.id !== tempMessage.id);
            }
          });
        return;
      }
    
      // Envoi de message texte
      if (this.newMessage?.trim()) {
        this.sendMessage.emit(this.newMessage);
        this.newMessage = '';
    
        const textarea = document.querySelector('.composer-input') as HTMLTextAreaElement;
        if (textarea) {
          textarea.style.height = 'auto';
        }
    
        setTimeout(() => this.checkForNewMessages(), 0.1);
      }
    }

  // Check for new messages
  private checkForNewMessages() {
    if (!this.conversationId) return;

    this.chatService.getMessagesByConversationId(this.conversationId).subscribe({
      next: (messages) => {
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

  // Check if content is an image URL
  isImageUrl(content: string): boolean {
    if (!content) return false;
    
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg'];
    
    const isImageExtension = imageExtensions.some(ext => content.toLowerCase().endsWith(ext));
    const isValidUrl = content.startsWith('/uploads/');
    
    return isValidUrl && isImageExtension;
  }
}