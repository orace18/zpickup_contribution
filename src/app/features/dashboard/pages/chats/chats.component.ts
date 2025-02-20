import { Component, OnInit } from '@angular/core';
import {Conversation} from './models/conversation';
import {Message} from './models/message';
import {MessagePanelComponent} from './message-panel/message-panel.component';
import {NgIf} from '@angular/common';
import {ConversationListComponent} from './conversation-list/conversation-list.component';
import { ChatService } from './services/chat.service';

@Component({
  selector: 'app-chats',
  imports: [
    MessagePanelComponent,
    NgIf,
    ConversationListComponent
  ],
  templateUrl: './chats.component.html',
  standalone: true,
  styleUrl: './chats.component.css'
})
export class ChatsComponent implements OnInit {
  conversations: Conversation[] = [];
  selectedConversationId: string | null = null;
  messages: Message[] = [];
  loading = false;
  error: string | null = null;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.loadConversations();
  }

  loadConversations(): void {
    this.loading = true;
    this.chatService.getConversations().subscribe(
      (data) => {
        this.conversations = data;
        this.loading = false;
      },
      (err) => {
        this.error = 'Erreur lors du chargement des conversations';
        this.loading = false;
        console.error(err);
      }
    );
  }

  selectConversation(conversationId: string): void {
    this.selectedConversationId = conversationId;
    this.loading = true;
    this.error = null;

    this.chatService.getMessagesByConversationId(conversationId).subscribe(
      (data) => {
        this.messages = data;
        this.loading = false;
      },
      (err) => {
        this.error = 'Erreur lors du chargement des messages';
        this.loading = false;
        console.error(err);
      }
    );
  }

  getConversationMessage(selectedConversationId: string): Message[] {
    const conversation = this.conversations.find(c => c.id === selectedConversationId);
    return conversation ? conversation.messages.map(
      messageId => this.messages.find(m => m.id === messageId)
    ).filter((message): message is Message => message !== undefined) : [];

  }

  getConversationTitle(): string {
    const conversation = this.conversations.find(c => c.id === this.selectedConversationId);
    return conversation ? conversation.title : '';
  }

  sendMessage(text: string): void {
    if (!this.selectedConversationId || !text.trim()) return;

    this.chatService.sendMessage(this.selectedConversationId, text).subscribe(
      (newMessage) => {
        // Ajouter le message à la liste locale
        this.messages = [...this.messages, {
          ...newMessage,
          timestamp: new Date(newMessage.created_at)
        }];

        // Mettre à jour la conversation dans la liste
        const conversationIndex = this.conversations.findIndex(
          c => c.id === this.selectedConversationId
        );

        if (conversationIndex > -1) {
          this.conversations[conversationIndex] = {
            ...this.conversations[conversationIndex],
            lastMessage: newMessage.content,
            lastMessageDate: new Date(newMessage.created_at),
            messages: [
              ...this.conversations[conversationIndex].messages,
              newMessage.id
            ]
          };
        }
      },
      (err) => {
        console.error('Erreur lors de l\'envoi du message', err);
      }
    );
  }

  
}
