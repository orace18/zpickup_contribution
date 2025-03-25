import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, switchMap, tap, mergeMap } from 'rxjs/operators';
import { environment } from '../../../../../../environments/environment';
import { Conversation } from '../models/conversation';
import { Message } from '../models/message';
import { User } from '../../home/models/users.model';


@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = environment.apiUrl;
  private usersApiUrl = environment.apiUrl + '/users'; // Ajustez selon votre API

  constructor(private http: HttpClient) {
    console.log('ChatService initialized with API URL:', this.apiUrl);
  }

  getUsers(): Observable<User[]> {
   // console.log('Getting all users');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`);
    return this.http.get<User[]>(this.usersApiUrl, {headers}).pipe(
     // tap(users => console.log(`Retrieved ${users.length} users`))
    );
  }

  getUserById(userId: string): Observable<User> {
   // console.log(`Getting user with ID: ${userId}`);
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`);
    return this.http.get<User>(`${this.usersApiUrl}/${userId}`, {headers}).pipe(
    //  tap(user => console.log('Retrieved user:', user))
    );
  }

  // Nouvelle méthode pour récupérer les détails des créateurs de conversations
  getConversationCreatorsDetails(): Observable<{[creatorId: string]: {firstName: string, lastName: string}}> {
    //console.log('Getting details of all conversation creators');

    return this.getConversations().pipe(
      // Extraire tous les IDs de créateurs uniques
      map(conversations => {
        const creatorIds = new Set(conversations.map(conv => conv.creator));
        //console.log(`Found ${creatorIds.size} unique creator IDs`);
        return Array.from(creatorIds);
      }),
      // Récupérer les utilisateurs
      switchMap(creatorIds => {
        return this.getUsers().pipe(
          map(users => {
            // Créer un dictionnaire des créateurs avec leurs noms et prénoms
            const creatorsMap: {[creatorId: string]: {firstName: string, lastName: string}} = {};

            users.forEach(user => {
              if (creatorIds.includes(user._id)) {
                creatorsMap[user._id] = {
                  firstName: user.firstname!,
                  lastName: user.lastname!
                };
                //console.log(`Mapped creator ${user._id}: ${user.firstname} ${user.lastname}`);
              }
            });

            return creatorsMap;
          })
        );
      })
    );
  }

  // Méthode pour obtenir les conversations avec les noms des créateurs
  getConversationsWithCreatorNames(): Observable<(Conversation & {creatorName: string})[]> {
  //  console.log('Getting conversations with creator names');

    return forkJoin([
      this.getConversations(),
      this.getUsers()
    ]).pipe(
      map(([conversations, users]) => {
        // Créer un dictionnaire pour un accès rapide aux utilisateurs
        const userMap = new Map<string, User>();
        users.forEach(user => userMap.set(user._id, user));

        return conversations.map(conversation => {
          const creator = userMap.get(conversation.creator);
          const creatorName = creator
            ? `${creator.firstname} ${creator.lastname}`
            : 'Utilisateur inconnu';

          console.log(`Conversation ${conversation.id} created by: ${creatorName}`);

          return {
            ...conversation,
            creatorName
          };
        });
      })
    );
  }

  getConversations(): Observable<Conversation[]> {
    //console.log('Getting all conversations');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`);

    return this.http.get<Conversation[]>(`${this.apiUrl}/discussions`, {headers}).pipe(
     // tap(conversations => console.log(`Retrieved ${conversations.length} conversations`)),
      switchMap(conversations => {
        if (conversations.length === 0) {
          console.log('No conversations found');
          return of([]);
        }

        // Pour chaque conversation, récupérer le dernier message s'il y en a
        const conversationsWithLastMessage = conversations.map(conversation => {
         // console.log(`Processing conversation: ${conversation.id}`);
          if (conversation.messages.length === 0) {
           // console.log(`No messages in conversation: ${conversation.id}`);
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
              //  console.log(`No messages found for conversation: ${conversation.id}`);
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
             // console.log(`Last message for conversation ${conversation.id}:`, lastMessage.content);

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

  getConversationsWithUserDetails(): Observable<Conversation[]> {
   // console.log('Getting conversations with user details');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`);

    // Récupérer d'abord toutes les conversations
    return this.http.get<Conversation[]>(`${this.apiUrl}/discussions`, {headers}).pipe(
     // tap(conversations => console.log(`Retrieved ${conversations.length} conversations`)),
      // Récupérer tous les utilisateurs une seule fois
      switchMap(conversations => {
        return this.getUsers().pipe(
          map(users => {
            console.log(`Mapping ${users.length} users for conversation details`);
            // Mapper pour créer un dictionnaire d'utilisateurs par ID pour un accès rapide
            const userMap = new Map<string, User>();
            users.forEach(user => userMap.set(user._id, user));

            return { conversations, userMap };
          })
        );
      }),
      switchMap(({ conversations, userMap }) => {
        if (conversations.length === 0) {
          console.log('No conversations found');
          return of([]);
        }

        // Pour chaque conversation, enrichir avec les détails d'utilisateur et le dernier message
        const conversationsWithDetails = conversations.map(conversation => {
         // console.log(`Processing conversation details: ${conversation.id}`);
          // Récupérer les détails du créateur
          const creator = userMap.get(conversation.creator);
        //  console.log(`Creator for conversation ${conversation.id}:`, creator?._id || 'Unknown');

          if (creator) {
            console.log(`Creator name: ${creator.firstname} ${creator.lastname}`);
          }

          if (conversation.messages.length === 0) {
          //  console.log(`No messages in conversation: ${conversation.id}`);
            return of({
              ...conversation,
              creatorDetails: creator || { firstName: 'Inconnu', lastName: 'Inconnu' },
              lastMessage: 'Pas de messages',
              lastMessageDate: new Date(conversation.updated_at)
            });
          }

          // Récupérer tous les messages de la conversation pour trouver le dernier
          return this.getMessagesByConversationId(conversation.id).pipe(
            //tap(messages => console.log(`Retrieved ${messages.length} messages for conversation: ${conversation.id}`)),
            map(messages => {
              if (messages.length === 0) {
              //  console.log(`No messages found for conversation: ${conversation.id}`);
                return {
                  ...conversation,
                  creatorDetails: creator || { firstName: 'Inconnu', lastName: 'Inconnu' },
                  lastMessage: 'Pas de messages',
                  lastMessageDate: new Date(conversation.updated_at)
                };
              }

              // Trouver le message le plus récent
              const sortedMessages = [...messages].sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              );
              const lastMessage = sortedMessages[0];
             // console.log(`Last message for conversation ${conversation.id}:`, lastMessage.content);

              // Enrichir chaque message avec les détails de l'expéditeur
              const enrichedMessages = messages.map(message => {
                const senderDetails = userMap.get(message.sender.name);
              //  console.log(`Sender for message ${message.id}:`, senderDetails?._id || 'Unknown');
                if (senderDetails) {
                  console.log(`Sender name: ${senderDetails.firstname} ${senderDetails.lastname}`);
                }
                return {
                  ...message,
                  senderDetails: senderDetails || { firstName: 'Inconnu', lastName: 'Inconnu' }
                };
              });

              return {
                ...conversation,
                creatorDetails: creator || { firstName: 'Inconnu', lastName: 'Inconnu' },
                lastMessage: lastMessage.content,
                lastMessageDate: new Date(lastMessage.created_at),
                enrichedMessages
              };
            })
          );
        });

        return forkJoin(conversationsWithDetails);
      })
    );
  }

  getConversationById(id: string): Observable<Conversation> {
   // console.log(`Getting conversation with ID: ${id}`);
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`);
    return this.http.get<Conversation>(`${this.apiUrl}/discussions/${id}`, {headers}).pipe(
    //  tap(conversation => console.log('Retrieved conversation:', conversation.id))
    );
  }

  getMessagesByConversationId(conversationId: string): Observable<Message[]> {
   // console.log(`Getting messages for conversation: ${conversationId}`);
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`);

    return this.http.get<Message[]>(`${this.apiUrl}/discussions/messages/${conversationId}`, {headers}).pipe(
     // tap(messages => console.log(`Retrieved ${messages.length} messages for conversation: ${conversationId}`)),
      map(messages => messages.map(message => ({
        ...message,
        timestamp: new Date(message.created_at)
      })))
    );
  }

  getMessagesByConversationIdWithUserDetails(conversationId: string): Observable<Message[]> {
   // console.log(`Getting messages with user details for conversation: ${conversationId}`);
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`);

    return forkJoin([
      this.http.get<Message[]>(`${this.apiUrl}/discussions/messages/${conversationId}`, {headers}),
      this.getUsers()
    ]).pipe(
     // tap(([messages, users]) => console.log(`Retrieved ${messages.length} messages and ${users.length} users`)),
      map(([messages, users]) => {
        // Créer un Map pour un accès rapide aux utilisateurs
        const userMap = new Map<string, User>();
        users.forEach(user => userMap.set(user._id, user));

        // Enrichir chaque message avec les détails de l'expéditeur
        return messages.map(message => {
          const senderDetails = userMap.get(message.sender.name);
          console.log(`Sender for message ${message.id}:`, senderDetails?._id || 'Unknown');
          if (senderDetails) {
           // console.log(`Sender name: ${senderDetails.firstname} ${senderDetails.lastname}`);
          }
          return {
            ...message,
            timestamp: new Date(message.created_at),
            senderDetails: senderDetails || { firstName: 'Inconnu', lastName: 'Inconnu' }
          };
        });
      })
    );
  }

  sendMessage(conversationId: string, text: string): Observable<Message> {
   // console.log(`Sending message to conversation: ${conversationId}`, text);
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`);

    const messageData = {
      content: text,
      discussionId: conversationId
    };

    return this.http.post<Message>(`${this.apiUrl}/discussions/message`, messageData, {headers}).pipe(
      tap(message => console.log('Message sent successfully:', message.id))
    );
  }

  
  uploadImage(image: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', image);
  
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`);
  
    return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/discussions/upload`, formData, { headers }).pipe(
      tap(response => console.log('Image uploaded successfully:', response.imageUrl
      ))
    );
  }
  
  createConversation(title: string): Observable<Conversation> {
    console.log(`Creating new conversation with title: ${title}`);
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`);
    return this.http.post<Conversation>(`${this.apiUrl}/discussions`, { title }, {headers}).pipe(
      tap(conversation => console.log('Conversation created successfully:', conversation.id))
    );
  }
}
