import {AfterViewInit, Component, OnInit, Pipe, PipeTransform, ViewChild} from '@angular/core';
import { User,} from './models/users.model';
import {UsersService} from './services/users.services';
import {CurrencyPipe, DatePipe, DecimalPipe, NgClass, NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {FormsModule, NgForm} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {Dropdown, Modal} from 'bootstrap';
import {WalletBalance, WalletHistory} from './models/wallet.model';
import {WalletService} from './services/wallet.service';
import {Race, ZemUser} from './models/race.model';
import {RaceService} from './services/race.service';
declare var bootstrap: any;

@Pipe({
  name: 'filterByType',
  standalone: true
})
export class FilterByTypePipe implements PipeTransform {
  transform(users: any[], type: string): any[] {
    if (!users) return [];
    return users.filter(user =>
      type === 'admin' ? user.user_type === 'admin' : user.user_type !== 'admin'
    );
  }
}

type SectionId = 'informations' | 'portefeuille' | 'courses';
interface Section {
  id: SectionId;
  icon: string;
  title: string;
  subtitle: string;
}

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
    DecimalPipe,
  ],
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, AfterViewInit {

  constructor(
    private usersService: UsersService,
    private walletService: WalletService,
    private raceService: RaceService
  ) {}

  users: User[] = [];
  filteredUsers: User[] = [];
  currentUser: User[] = [];
  userRaces: Race[] = [];
  selectedUser: User | null = null;
  walletBalance: WalletBalance | null = null;
  walletHistory: WalletHistory | null = null;
  filters = {
    typeUtilisateur: '',
    pays:'',
  };

  detailsModal: any;
  editModal: any;
  @ViewChild('editForm') editForm!: NgForm;

  ngAfterViewInit() {
    // Initialisation des dropdowns
    const dropdownTriggerList = document.querySelectorAll('.dropdown-toggle');
    dropdownTriggerList.forEach(dropdownTriggerEl => {
      new bootstrap.Dropdown(dropdownTriggerEl);
    });

    const triggerTabList = [].slice.call(document.querySelectorAll('a[data-bs-toggle="tab"]'));
    triggerTabList.forEach(function(triggerEl) {
      new bootstrap.Tab(triggerEl);
    });
  }

  showUserDetails(user: User): void {
    this.selectedUser = user;
    this.detailsModal.show();
  }

  viewCourseDetails(race: any) {
    // Ouvrir le modal
    const modalId = `mapModal_${race.reference}`;
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();

    // Initialiser la carte après l'ouverture du modal
    setTimeout(() => {
      this.initMap(race);
    }, 500);
  }


  /*initMap(race: Race) {
    const mapElement = document.getElementById(`map_${race.reference}`);
    if (!mapElement) return;

    // Vérification des coordonnées requises
    if (!race.latitude_start || !race.longitude_start || !race.latitude_end || !race.longitude_end) {
      console.error('Coordonnées manquantes', race);
      return;
    }

    const startLocation = {
      lat: parseFloat(String(race.latitude_start)),
      lng: parseFloat(String(race.longitude_start))
    };

    const endLocation = {
      lat: race.latitude_end,
      lng: race.longitude_end
    };

    console.log('Coordonnées de départ:', startLocation);
    console.log('Coordonnées d\'arrivée:', endLocation);

    // Créer les bounds pour centrer la carte sur les deux points
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(startLocation);
    bounds.extend(endLocation);

    const map = new google.maps.Map(mapElement, {
      zoom: 12
    });

    // Ajuster la vue pour montrer les deux points
    map.fitBounds(bounds);

    // Ajouter un petit padding aux bounds
    map.fitBounds(bounds);

    // Marqueur de départ
    new google.maps.Marker({
      position: startLocation,
      map: map,
      title: 'Point de départ',
      icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
    });

    // Marqueur d'arrivée
    new google.maps.Marker({
      position: endLocation,
      map: map,
      title: 'Point d\'arrivée',
      icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
    });

    // On essaie quand même de tracer l'itinéraire
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: true // Pour garder nos marqueurs personnalisés
    });

    directionsService.route({
      origin: startLocation,
      destination: endLocation,
      travelMode: google.maps.TravelMode.DRIVING
    }, (response: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
      if (status === google.maps.DirectionsStatus.OK && response) {
        directionsRenderer.setDirections(response);
      } else {
        // Si pas de route trouvée, on trace une ligne droite entre les points
        const lineSymbol = {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        };

        new google.maps.Polyline({
          path: [startLocation, endLocation],
          map: map,
          strokeColor: "#FF0000",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          icons: [{
            icon: lineSymbol,
            offset: '100%'
          }],
        });
      }
    });
  }*/
  findZemUser(zemId: string): any {
    return this.users.find(user => user._id === zemId);
  }
  getZemInitials(zemId: string): string {
    const zemUser = this.findZemUser(zemId);
    if (zemUser) {
      const firstInitial = zemUser.firstname ? zemUser.firstname.charAt(0).toUpperCase() : '';
      const lastInitial = zemUser.lastname ? zemUser.lastname.charAt(0).toUpperCase() : '';
      return `${firstInitial}${lastInitial}`;
    }
    return 'NA';
  }
  getZemFullName(zemId: string): string {
    const zemUser = this.findZemUser(zemId);
    if (zemUser) {
      return `${zemUser.firstname} ${zemUser.lastname}`;
    }
    return 'Non trouvé';
  }
     initMap(race: Race) {
       const mapElement = document.getElementById(`map_${race.reference}`);
       if (!mapElement) return;

       // Vérification des coordonnées requises
       if (!race.latitude_start || !race.longitude_start || !race.latitude_end || !race.longitude_end) {
         console.error('Coordonnées manquantes', race);
         return;
       }

       const startLocation = {
         lat: parseFloat(String(race.latitude_start)),
         lng: parseFloat(String(race.longitude_start))
       };

       const endLocation = {
         lat: race.latitude_end,
         lng: race.longitude_end
       };

       console.log('Coordonnées de départ:', startLocation);
       console.log('Coordonnées d\'arrivée:', endLocation);

       // Ajustons le zoom et le centre pour voir les deux points
       const bounds = new google.maps.LatLngBounds();
       bounds.extend(startLocation);
       bounds.extend(endLocation);

       const map = new google.maps.Map(mapElement, {
         zoom: 12, // Zoom plus large
         center: startLocation
       });

       map.fitBounds(bounds); // Ajuste la vue pour montrer les deux points

       // Marqueur de départ
       const startMarker = new google.maps.Marker({
         position: startLocation,
         map: map,
         title: 'Point de départ',
         icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
       });
       console.log('Marqueur de départ créé:', startMarker);

       // Marqueur d'arrivée
       const endMarker = new google.maps.Marker({
         position: endLocation,
         map: map,
         title: 'Point d\'arrivée',
         icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
       });
       console.log('Marqueur d\'arrivée créé:', endMarker);

       // Tracer l'itinéraire
       const directionsService = new google.maps.DirectionsService();
       const directionsRenderer = new google.maps.DirectionsRenderer({
         map: map,
         suppressMarkers: true // Pour garder nos marqueurs personnalisés
       });

       directionsService.route({
         origin: startLocation,
         destination: endLocation,
         travelMode: google.maps.TravelMode.DRIVING
       }, (response: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
         console.log('Statut de la direction:', status);
         console.log('Réponse de la direction:', response);

         if (status === google.maps.DirectionsStatus.OK && response) {
           directionsRenderer.setDirections(response);
         } else {
           console.error('Erreur de direction:', status);
         }
       });
     }

  activeSection: 'informations' | 'portefeuille' | 'courses' | null = null;

  get isUserAdmin(): boolean {
    return this.selectedUser?.user_type === 'admin';
  }

  get availableSections(): Section[] {
    const allSections: Section[] = [
      {
        id: 'informations',
        icon: 'bi bi-person',
        title: 'Mes informations',
        subtitle: 'Informations personnelles'
      },
      {
        id: 'portefeuille',
        icon: 'bi bi-wallet2',
        title: 'Mon portefeuille',
        subtitle: 'Gestion financière'
      },
      {
        id: 'courses',
        icon: 'bi bi-car-front',
        title: 'Courses',
        subtitle: 'Historique des courses'
      }
    ];

    // Ne retourner que les informations pour les administrateurs
    if (this.isUserAdmin) {
      return allSections.filter(section => section.id === 'informations');
    }

    return allSections;
  }

  showUserSection(section: 'informations' | 'portefeuille' | 'courses'): void {
    this.activeSection = section;
    if (section === 'portefeuille' && this.selectedUser) {
      this.loadWalletData(this.selectedUser._id);
    }
    if (section === 'courses' && this.selectedUser) {
      this.loadUserRaces(this.selectedUser._id);
    }
    if (section === 'informations' && this.selectedUser) {
      this.loadUserInformations(this.selectedUser._id);
    }

  }

  loadUserRaces(userId: string): void {
    this.raceService.getUserRaces(userId).subscribe({
      next: (races) => {
        this.userRaces = races;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des courses:', error);
      }
    });
  }

  loadWalletData(userId: string): void {
    // Charger le solde
    this.walletService.getWalletBalance(userId).subscribe({
      next: (balance) => {
        console.log("les valeur obtenues", balance);
        this.walletBalance = balance;

      },
      error: (error) => {
        console.error('Erreur lors du chargement du solde:', error);
      }
    });

    // Charger l'historique
    this.walletService.getWalletHistory(userId).subscribe({
      next: (history) => {
        this.walletHistory = history;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'historique:', error);
      }
    });
  }

  backToMenu(): void {
    this.activeSection = null;
  }

  getCourseStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'end':
        return 'success';
      case 'accepted':
        return 'warning';
      case 'pending':
        return 'info';
      case 'stopped':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status.toLowerCase()) {
      case 'end':
        return 'Terminée';
      case 'accepted':
        return 'En cours';
      case 'pending':
        return 'En attente';
      case 'stopped':
        return 'Suspendu';
      default:
        return status;
    }
  }

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
  activeTab: 'admin' | 'mobile' = 'admin';
  searchQuery: any;

  /*applyFilters(): void {
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
*/

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

    // Filtrer par type d'utilisateur selon l'onglet actif
    filtered = filtered.filter(user => {
      if (this.activeTab === 'admin') {
        return user.user_type === 'admin';
      } else {
        return user.user_type === 'customer' /*|| 'zem'*/;
      }
    });

    // Appliquer les autres filtres existants
    this.filteredUsers = filtered.filter(user => {
      return (!this.filters.typeUtilisateur || user.user_type === this.filters.typeUtilisateur) &&
        (!this.filters.pays);
    });
  }

  onTabChange(event: any): void {
    this.activeTab = event.target.id === 'admin-tab' ? 'admin' : 'mobile';
    this.applyFilters();
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

          this.users = this.users.filter(user => user._id !== userId);
          this.applyFilters();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression :', error);
          // Gérer l'erreur (par exemple avec un message à l'utilisateur)
        }
      });
    }
  }

  private loadUserInformations(_id: string) {
    this.usersService.getUserById(_id).subscribe({
      next: (user) => {
        this.currentUser = user;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
      }
    });
  }

  protected readonly Number = Number;
}
