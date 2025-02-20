import {AfterViewChecked, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {Message} from '../models/message';
import {CommonModule, DatePipe, NgForOf} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';


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
export class MessagePanelComponent implements AfterViewChecked {

  chatMessages: Message[] | undefined;
  @Input() messages: Message[] = [];
  @Input() conversationTitle: string = '';
  @Input() loading: boolean = false;
  @Input() error: string | null = null;
  @Output() sendMessage = new EventEmitter<string>();

  newMessage: string = '';
  
  currentUserId: string = 'ID_UTILISATEUR_ACTUEL'; 

  isCurrentUser(userId: string): boolean {
    return userId === this.currentUserId;
  }

  /* send(): void {
    if (this.newMessage.trim() && !this.loading) {
      this.sendMessage.emit(this.newMessage);
      this.newMessage = '';
    }
  } */

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

 send(): void {
    if (this.newMessage?.trim()) {
      this.sendMessage.emit(this.newMessage);
      this.newMessage = '';

      // Réinitialiser la hauteur du textarea après l'envoi
      const textarea = document.querySelector('.custom-textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.style.height = 'auto';
      }
    }
  }
}
