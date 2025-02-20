import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Conversation} from '../models/conversation';
import {DatePipe, NgForOf} from '@angular/common';


@Component({
  selector: 'app-conversation-list',
  imports: [
    DatePipe,
    NgForOf
  ],
  templateUrl: './conversation-list.component.html',
  styleUrl: './conversation-list.component.css'
})
export class ConversationListComponent {
  @Input() conversations: Conversation[] = [];
  @Input() selectedId: string | null = null;
  @Output() selectConversation = new EventEmitter<string>();

  onSelect(id: string): void {
    this.selectConversation.emit(id);
  }


  isRecent(date: Date | undefined): boolean {
    if (!date) return false;
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    return new Date(date) > twentyFourHoursAgo;
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    const now = new Date();
    const messageDate = new Date(date);
    
    // Si c'est aujourd'hui, montrer l'heure
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Si c'est cette semaine, montrer le jour
    const daysAgo = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo < 7) {
      return messageDate.toLocaleDateString([], { weekday: 'long' });
    }
    
    // Sinon montrer la date complète
    return messageDate.toLocaleDateString();
  }

  isRead(conversation: Conversation): boolean {
    return !conversation.unreadCount;
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'active': 'bg-success',
      'archived': 'bg-secondary',
      'pending': 'bg-warning text-dark',
      'urgent': 'bg-danger'
    };
    return statusMap[status.toLowerCase()] || 'bg-secondary';
  }


}
