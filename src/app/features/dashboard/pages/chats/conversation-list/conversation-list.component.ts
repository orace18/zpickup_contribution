import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Conversation } from '../models/conversation';
import { AsyncPipe, DatePipe, NgForOf, NgIf } from '@angular/common';
import { map, Observable, tap, forkJoin, of } from 'rxjs';
import { UsersService } from '../../users/services/users.service';
import { FormControl } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-conversation-list',
  imports: [
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    CommonModule
  ],

  templateUrl: './conversation-list.component.html',
  styleUrl: './conversation-list.component.css'
})
export class ConversationListComponent implements OnInit, OnChanges {
  @Input() conversations: Conversation[] = [];
  @Input() selectedId: string | null = null;
  @Output() selectConversation = new EventEmitter<string>();
  
  // Dictionnaire pour stocker les noms des créateurs
  creatorNames: {[userId: string]: string} = {};
  
  // Indique si les noms sont en cours de chargement
  loading = true;

  // Control pour la recherche
  searchControl = new FormControl('');
  
  // Conversations filtrées à afficher
  filteredConversations: Conversation[] = [];

  constructor(private userService: UsersService) {}
  
  ngOnInit() {
    this.loadCreatorNames();
    
    // Observer les changements de la barre de recherche
    this.searchControl.valueChanges.subscribe(searchTerm => {
      this.filterConversations(searchTerm || '');
    });
    
    // Initialiser les conversations filtrées et les trier
    this.filteredConversations = this.sortConversationsByDate([...this.conversations]);
  }
  
  ngOnChanges(changes: SimpleChanges) {
    // Recharger les noms si la liste des conversations change
    if (changes['conversations']) {
      this.filteredConversations = this.sortConversationsByDate([...this.conversations]);
      this.filterConversations(this.searchControl.value || '');
      
      if (!changes['conversations'].firstChange) {
        this.loadCreatorNames();
      }
    }
  }
  
  // Méthode pour trier les conversations par date du dernier message (la plus récente en premier)
  sortConversationsByDate(conversations: Conversation[]): Conversation[] {
    return conversations.sort((a, b) => {
      // Si une des dates est undefined, la placer à la fin
      if (!a.lastMessageDate) return 1;
      if (!b.lastMessageDate) return -1;
      
      // Trier par ordre décroissant (du plus récent au plus ancien)
      return new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime();
    });
  }
  
  filterConversations(searchTerm: string) {
    if (!searchTerm.trim()) {
      // Si la recherche est vide, afficher toutes les conversations triées par date
      this.filteredConversations = this.sortConversationsByDate([...this.conversations]);
      return;
    }
    
    const term = searchTerm.toLowerCase().trim();
    
    // Filtrer puis trier les résultats
    this.filteredConversations = this.sortConversationsByDate(
      this.conversations.filter(conversation => {
        // Rechercher dans le titre de la conversation
        if (conversation.title.toLowerCase().includes(term)) {
          return true;
        }
        
        // Rechercher dans le nom du créateur
        const creatorName = this.creatorNames[conversation.creator];
        if (creatorName && creatorName.toLowerCase().includes(term)) {
          return true;
        }
        
        // Rechercher dans l'email
        if (conversation.email && conversation.email.toLowerCase().includes(term)) {
          return true;
        }
        
        // Rechercher dans le dernier message
        if (conversation.lastMessage && conversation.lastMessage.toLowerCase().includes(term)) {
          return true;
        }
        
        return false;
      })
    );
  }
  
  loadCreatorNames() {
    if (!this.conversations || this.conversations.length === 0) {
      this.loading = false;
      return;
    }
    
    // Collecter tous les IDs de créateurs uniques
    const creatorIds = [...new Set(this.conversations.map(conv => conv.creator))];
    
    // Préparer les observables pour chaque créateur
    const observables = creatorIds.map(id => 
      this.userService.getUserById(id).pipe(
        map(user => ({ id, name: `${user.firstname} ${user.lastname}` }))
      )
    );
    
    // Exécuter en parallèle et remplir le dictionnaire
    this.loading = true;
    forkJoin(observables).subscribe({
      next: (results) => {
        // Réinitialiser le dictionnaire
        this.creatorNames = {};
        
        // Remplir avec les résultats
        results.forEach(result => {
          this.creatorNames[result.id] = result.name;
        });
        
        console.log('Creators loaded:', this.creatorNames);
        this.loading = false;
        
        // Réappliquer le filtre après avoir chargé les noms
        this.filterConversations(this.searchControl.value || '');
      },
      error: (err) => {
        console.error('Error loading creator names:', err);
        this.loading = false;
      }
    });
  }

  // Effacer la recherche
  clearSearch() {
    this.searchControl.setValue('');
  }

  onSelect(id: string): void {
    this.selectConversation.emit(id);
  }
  
  isRecent(date: Date | undefined): boolean {
    if (!date) return false;
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    return new Date(date) > twentyFourHoursAgo;
  }

  isRead(conversation: Conversation): boolean {
    return !conversation.unreadCount;
  }

  getBadgeClass(count: number): string {
    if (count > 5) return 'urgent';
    if (count > 3) return 'medium';
    return 'low';
  }
  
  getAvatarColor(name: string): string {
    // Générer une couleur basée sur le nom
    const stringToColor = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      
      const colors = [
        '#f87171', // rouge clair
        '#fb7185', // rose
        '#c084fc', // violet
        '#818cf8', // indigo
        '#60a5fa', // bleu
        '#38bdf8', // bleu clair
        '#4ade80', // vert
        '#facc15', // jaune
      ];
      
      return colors[Math.abs(hash) % colors.length];
    };
    
    return stringToColor(name);
  }

  // Méthode pour obtenir les initiales
  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  // Méthode pour formater la date
  formatDate(date: Date): string {
    if (!date) return '';
    
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    
    if (diff < oneDay) {
      // Aujourd'hui, afficher les heures
      return `${Math.round(diff / (60 * 60 * 1000))} hrs`;
    } else if (diff < oneWeek) {
      // Cette semaine, afficher les jours
      return `${Math.round(diff / oneDay)} day${Math.round(diff / oneDay) > 1 ? 's' : ''}`;
    } else if (diff < 2 * oneWeek) {
      // Plus d'une semaine
      return '1 week';
    } else {
      // Plus de deux semaines
      return `${Math.round(diff / oneWeek)} weeks`;
    }
  }
}