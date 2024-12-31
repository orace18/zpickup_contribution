import { Component, OnInit } from '@angular/core';
import { User,} from './models/users.model';
import {UsersService} from './services/users.services';
import {DatePipe, NgClass, NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  standalone: true,
  imports: [
    HttpClientModule,
    FormsModule,
  ],
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUser: User | null = null;
  filters = {
    typeUtilisateur: '',
    pays: '',
    profession: '',
    statutAssurance: ''
  };

  listePays: string[] = ['France', 'Belgique', 'Suisse', 'Canada'];
  listeProfessions: string[] = ['Médecin', 'Infirmier', 'Pharmacien'];

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  closeModal() {
    this.selectedUser = null;
  }

  loadUsers(): void {
    this.usersService.getUsers().subscribe(users => {
      this.users = users;
      console.log("Les utilisateurs sont: ",{users})
      this.applyFilters();
    });
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      return (!this.filters.typeUtilisateur || user.user_type === this.filters.typeUtilisateur) &&
        (!this.filters.pays);/* || user.pays === this.filters.pays) &&
        (!this.filters.profession || user.profession === this.filters.profession) &&
        (!this.filters.statutAssurance || user.assurance?.statut === this.filters.statutAssurance);*/
    });
  }

  editUser(user: User): void {
    // Je ne sais pas encore comment implémnter ça
    console.log('Édition de l\'utilisateur:', user);

  }

  viewUserDetails(user: User): void {
    this.selectedUser = user;
  }



  validateAccount(user: User): void {
    this.usersService.validateAccount(user._id).subscribe(() => {
      user.validated_at = 'Validé';
    });
  }

  // Dans users.component.ts
  rejectAccount(user: User): void {
    const motifRejet = prompt('Veuillez entrer le motif du rejet:');
    if (motifRejet) {
      this.usersService.rejectAccount(user._id, motifRejet).subscribe(() => {
        user.validated_at = 'Rejeté';
      });
    }
  }

  resetPassword(user: User): void {
    this.usersService.resetPassword(user._id).subscribe(() => {
      // Afficher confirmation
    });
  }

  deactivateAccount(user: User): void {
    if (confirm('Êtes-vous sûr de vouloir désactiver ce compte ?')) {
      this.usersService.deactivateAccount(user._id).subscribe(() => {
        // Mettre à jour l'interface
      });
    }
  }
}
