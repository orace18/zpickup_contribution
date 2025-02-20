import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../../../../environments/environment';
import { Conversation } from '../models/conversation';
import { Message } from '../models/message';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getConversations(): Observable<Conversation[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`);
    
    return this.http.get<Conversation[]>(`${this.apiUrl}/discussions`, {headers}).pipe(
      switchMap(conversations => {
        if (conversations.length === 0) {
          return of([]);
        }
        
        // Pour chaque conversation, récupérer le dernier message s'il y en a
        const conversationsWithLastMessage = conversations.map(conversation => {
          if (conversation.messages.length === 0) {
            return of({
              ...conversation,
              lastMessage: 'Pas de messages',
              lastMessageDate: new Date(conversation.updated_at)
            });
          }
          
          // Récupérer tous les messages de la conversation pour trouver le dernier
          return this.getMessagesByConversationId(conversation.id).pipe(
            map(messages => {
              if (messages.length === 0) {
                return {
                  ...conversation,
                  lastMessage: 'Pas de messages',
                  lastMessageDate: new Date(conversation.updated_at)
                };
              }
              
              // Trouver le message le plus récent
              const sortedMessages = [...messages].sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              );
              const lastMessage = sortedMessages[0];
              
              return {
                ...conversation,
                lastMessage: lastMessage.content,
                lastMessageDate: new Date(lastMessage.created_at)
              };
            })
          );
        });
        
        return forkJoin(conversationsWithLastMessage);
      })
    );
  }

  getConversationById(id: string): Observable<Conversation> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`);
    return this.http.get<Conversation>(`${this.apiUrl}/discussions/${id}`, {headers});
  }

  getMessagesByConversationId(conversationId: string): Observable<Message[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`);

    return this.http.get<Message[]>(`${this.apiUrl}/discussions/messages/${conversationId}`, {headers}).pipe(
      map(messages => messages.map(message => ({
        ...message,
        timestamp: new Date(message.created_at)
      })))
    );
  }

  sendMessage(conversationId: string, text: string): Observable<Message> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`);
    
    const messageData = {
      content: text,
      discussionId: conversationId
    };
    
    return this.http.post<Message>(`${this.apiUrl}/discussions/message`, messageData, {headers});
  }

  createConversation(title: string): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.apiUrl}/discussions`, { title });
  }
}