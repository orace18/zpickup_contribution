import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import { User,} from './models/users.model';
import {UsersService} from './services/users.services';
import {CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {FormsModule, NgForm} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {Dropdown, Modal} from 'bootstrap';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  standalone: true,
  imports: [
    HttpClientModule,
    FormsModule,
    NgForOf,
    NgIf,
    DatePipe,
    CurrencyPipe,
  ],
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, AfterViewInit {

  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUser: User | null = null;
  filters = {
    typeUtilisateur: '',
    pays: '',
    profession: '',
    statutAssurance: ''
  };

  detailsModal: any;
  editModal: any;
  @ViewChild('editForm') editForm!: NgForm;

  showUserDetails(user: User): void {
    this.selectedUser = user;
    this.detailsModal.show();
  }

  activeSection: 'informations' | 'portefeuille' | 'courses' | null = null;

  showUserSection(section: 'informations' | 'portefeuille' | 'courses'): void {
    this.activeSection = section;
  }

  backToMenu(): void {
    this.activeSection = null;
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'danger';
      default:
        return 'info';
    }
  }

  getCourseStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in progress':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'info';
    }
  }

  viewCourseDetails(course: any): void {
    // Implémentez la logique pour afficher les détails de la course
    console.log('Détails de la course:', course);
  }

  ngAfterViewInit() {
    // Initialiser tous les dropdowns
    const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
    dropdownElementList.forEach(dropdownToggle => {
      new Dropdown(dropdownToggle);
    });
  }

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.editModal = new Modal(document.getElementById('kt_modal_edit_user')!);
    this.detailsModal = new Modal(document.getElementById('kt_modal_user_details')!);
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

  getInitials(user: User): string {
    const firstname = user.firstname || '';
    const lastname = user.lastname || '';
    return `${firstname[0] || ''}${lastname[0] || ''}`;
  }


  editUser(user: User): void {
    this.selectedUser = { ...user }; // Créer une copie de l'utilisateur
    this.editModal.show();
  }

  updateUser(): void {
    if (this.selectedUser && this.selectedUser._id) {
      this.usersService.updateUser(this.selectedUser._id, this.selectedUser).subscribe({
        next: (updatedUser) => {
          // Mettre à jour l'utilisateur dans la liste
          const index = this.users.findIndex(u => u._id === updatedUser._id);
          if (index !== -1) {
            this.users[index] = updatedUser;
            this.applyFilters(); // Rafraîchir la liste filtrée
          }
          this.editModal.hide(); // Fermer le modal
          this.selectedUser = null;
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour :', error);
          // Gérer l'erreur (par exemple avec un message à l'utilisateur)
        }
      });
    }
  }


  viewUserDetails(user: User): void {
    this.selectedUser = user;
  }



  validateAccount(user: User): void {
    this.usersService.validateAccount(user._id).subscribe(() => {
      user.validated_at = 'Validé';
    });
  }

  searchQuery: any;

  applyFilters(): void {
    let filtered = [...this.users];

    // Appliquer la recherche si searchQuery existe
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(user =>
        user.firstname?.toLowerCase().includes(query) ||
        user.lastname?.toLowerCase().includes(query) ||
        user.email_address?.toLowerCase().includes(query) ||
        user.user_type?.toLowerCase().includes(query)
      );
    }

    // Appliquer les autres filtres existants
    this.filteredUsers = filtered.filter(user => {
      return (!this.filters.typeUtilisateur || user.user_type === this.filters.typeUtilisateur) &&
        (!this.filters.pays);
    });
  }

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

  deleteUser(userId: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.usersService.deleteUser(userId).subscribe({
        next: () => {
          // Mettre à jour la liste des utilisateurs après la suppression
          this.users = this.users.filter(user => user._id !== userId);
          this.applyFilters(); // Rafraîchir la liste filtrée
        },
        error: (error) => {
          console.error('Erreur lors de la suppression :', error);
          // Gérer l'erreur (par exemple avec un message à l'utilisateur)
        }
      });
    }
  }
}
