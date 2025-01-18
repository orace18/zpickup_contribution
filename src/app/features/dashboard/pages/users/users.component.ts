import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
  Pipe,
  PipeTransform,
  ViewChild
} from '@angular/core';
import {User, ZemValidationRequest,} from './models/users.model';
import {UsersService} from './services/users.services';
import {
  CurrencyPipe,
  DatePipe,
  DecimalPipe,
  formatDate,
  JsonPipe,
  NgClass,
  NgForOf,
  NgIf,
  NgOptimizedImage, NgSwitch, NgSwitchCase
} from '@angular/common';
import {FormsModule, NgForm} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {Dropdown, Modal} from 'bootstrap';
import {WalletBalance, WalletHistory} from './models/wallet.model';
import {WalletService} from './services/wallet.service';
import {Race, Zem, ZemUser} from './models/race.model';
import {RaceService} from './services/race.service';
import {CardType, CardTypeLabels, Role} from './models/role.model';
import {RoleService} from './services/role.service';
import {ToastrService} from 'ngx-toastr';
import {CounterData} from './models/counter.model';
import {CounterService} from './services/counter.service';
import {tap} from 'rxjs';
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
    NgClass,
    JsonPipe,
    NgSwitch,
    NgSwitchCase,
  ],
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, AfterViewInit {

  constructor(
    private usersService: UsersService,
    private walletService: WalletService,
    private raceService: RaceService,
    private roleService: RoleService,
    private counterService: CounterService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  counterData: CounterData | null = null;
  loading: boolean = false;
  error: string | null = null;
  users: User[] = [];
  zem: Zem | null = null;
  filteredUsers: User[] = [];
  currentUser: User[] = [];
  userRaces: Race[] = [];
  roles: Role[] = [];
  selectedUser: User | null = null;
  walletBalance?: WalletBalance;
  walletHistory?: WalletHistory;
  filters = {
    typeUtilisateur: '',
    pays:'',
  };
  startDate: string = '';
  endDate: string = '';
  originalUserRaces: Race[] = [];

  newUser = {
    phone_number: '',
    password: '',
    email_address: '',
    firstname: '',
    lastname: '',
    birthday: '',
    address: '',
    user_type: 'admin',
    role: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  addModal: any;
  @ViewChild('addUserForm') addUserForm!: NgForm;
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

    const addUserModal = document.getElementById('kt_modal_add_user');
    if (addUserModal) {
      addUserModal.addEventListener('hidden.bs.modal', () => {
        this.hideOverlay();
      });
    }

    this.userRaces.forEach(race => {
      const modalElement = document.getElementById(`detailsModal_${race.reference}`);
      if (modalElement) {
        new Modal(modalElement);
      }
    });

    this.cdr.detectChanges();
  }

  private preventMultipleBackdrops(): void {
    const backdrops = document.querySelectorAll('.modal-backdrop');
    if (backdrops.length > 1) {
      backdrops.forEach((backdrop, index) => {
        if (index > 0) backdrop.remove();
      });
    }
  }


  showUserDetails(user: User): void {
    this.selectedUser = user;
    this.detailsModal.show();
  }

  showDetails(race: any) {
    const modalElement = document.getElementById(`detailsModal_${race.reference}`);
    if (modalElement) {
      const modal = Modal.getInstance(modalElement) || new Modal(modalElement);
      modal.show();
    }
  }

  showAddUserModal(): void {
    this.resetNewUser();
    this.cdr.detectChanges();
    this.addModal.show();
  }

  resetNewUser(): void {
    this.newUser = {
      phone_number: '',
      password: '',
      email_address: '',
      firstname: '',
      lastname: '',
      birthday: '',
      address: '',
      user_type: 'admin',
      role: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  createUser(): void {

    if (!this.addUserForm?.valid) {
      this.toastr.error('Les données sont invalides');
      return;
    }

    //console.log("Valeurs du formulaire avant envoi:", this.newUser);

    const userData = {
      phone_number: this.newUser.phone_number,
      password: this.newUser.password,
      email_address: this.newUser.email_address || undefined,
      firstname: this.newUser.firstname || undefined,
      lastname: this.newUser.lastname || undefined,
      birthday: this.newUser.birthday ? new Date(this.newUser.birthday).toISOString() : undefined,
      address: this.newUser.address || undefined,
      user_type: 'admin',
      role: this.newUser.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log("Données formatées à envoyer :", userData);

    this.usersService.createUser(userData).subscribe({
      next: (createdUser) => {
        //console.log('Utilisateur créé avec succès:', createdUser);
        this.users.unshift(createdUser);
        this.addModal.hide();
        this.hideOverlay();
        this.preventMultipleBackdrops();
        this.applyFilters();
        this.toastr.success('Utilisateur créé avec succès');
      },
      error: (error) => {
        this.toastr.error(`Erreur: ${error.error.message}`);
      }
    });
  }

  private hideOverlay(): void {
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());
    document.body.classList.remove('modal-open');
  }

  viewCourseDetails(race: any) {

    const modalId = `detailsModal_${race.reference}`;
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();

    setTimeout(() => {
      this.initMap(race);
    }, 500);
  }
  findZemUser(zemId: string): any {
    return this.users.find(user => user._id === zemId);
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

  activeSection: 'informations' | 'portefeuille' | 'courses' | 'compteur' | 'infoszem' |null = null;

  showUserSection(section: 'informations' | 'portefeuille' | 'courses' | 'compteur' | 'infoszem'): void {
    console.log("Section changée vers:", section);
    this.activeSection = section;
    if (section === 'portefeuille' && this.selectedUser) {
      this.loadWalletData(this.selectedUser._id);
    }
    if (section === 'courses' && this.selectedUser) {
      if (this.selectedUser.user_type === 'zem'){
        console.log("Le zem",this.selectedUser)
        const z = this.selectedUser.zem;
        if (typeof z === "string") {
          this.loadUserRaces(z);
        }
      }else {
        this.loadUserRaces(this.selectedUser._id);
      }
    }
    if (section === 'informations' && this.selectedUser) {
      this.loadUserInformations(this.selectedUser._id);
    }
    if (section === 'compteur' && this.selectedUser?.user_type === 'zem') {
      const z = this.selectedUser.zem;
      if (typeof z === "string") {
        this.loadCounterData(z);
      }
    }
    if (section === 'infoszem' /*&& this.selectedUser?.user_type === 'zem'*/) {
      const z = this.selectedUser?.zem;
      if (typeof z === "string") {
        this.loadZemDetails(z);
      }
    }

  }

  loadZemDetails(zemId: string): void {
    this.loading = true;
    this.usersService.getZemInfoById(zemId).subscribe({
      next: (details) => {
        this.zem = details;
        this.loading = false;

        const locationModal = document.getElementById('locationModal');
        if (locationModal) {
          locationModal.addEventListener('shown.bs.modal', () => {
          //  this.initServiceMap();
          });
        }
      },
      error: (error) => {
        this.loading = false;
        this.toastr.error(error.message);
      }
    });
  }

  loadUserRaces(userId: string): void {
    if (this.selectedUser?.user_type === 'zem') {

      this.raceService.getZemRaces(userId).subscribe({
        next: (races) => {
          /*this.userRaces = races.map(race => {
            return {
              ...race
            };
          });*/
          this.originalUserRaces = races;
          this.userRaces = [...races];
          this.applyDateFilters();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des courses du zem:', error);
        }
      });
    } else {
      this.raceService.getUserRaces(userId).subscribe({
        next: (races) => {
          //this.userRaces = races;
          this.originalUserRaces = races;
          this.userRaces = [...races];
          this.applyDateFilters();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des courses:', error);
        }
      });
    }
  }

  getZemFullName(zemId: string): string {
    if (this.selectedUser?.user_type === 'zem') {
      // Si c'est un zem qui regarde ses courses, on affiche le nom du client
      const race = this.userRaces.find(r => r.zem?._id === zemId);
      if (race) {
        return `${race.user.firstname} ${race.user.lastname}`;
      }
    } else {
      // Garder le comportement existant pour les clients
      const zemUser = this.users.find(user => user.zem === zemId);
      if (zemUser) {
        return `${zemUser.firstname} ${zemUser.lastname}`;
      }
    }
    return 'Non trouvé';
  }

  getTransactionClass(type: string): string {
    switch (type.toLowerCase()) {
      case 'credit':
        return 'success';
      case 'bonus':
        return 'info';
      case 'withdrawal':
      case 'debit':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getTransactionLabel(type: string): string {
    switch (type.toLowerCase()) {
      case 'credit':
        return 'Crédit';
      case 'bonus':
        return 'Bonus';
      case 'withdrawal':
      case 'debit':
        return 'Retrait';
      default:
        return 'Inconnu';
    }
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

  getCardTypeLabel(cardType: string): string {
    const cardTypes: CardTypeLabels = {
      'identity_card': 'Carte d\'identité',
      'cip_card': 'Carte CIP',
      'passport_card': 'Passeport'
    };

    return cardTypes[cardType as CardType] || cardType;
  }

  getStatusLabel(status: string): string {
    switch (status.toLowerCase()) {
      case 'start':
        return 'Démarré';
      case 'end':
        return 'Terminée';
      case 'accepted':
        return 'En cours';
      case 'pending':
        return 'En attente';
      case 'stopped':
        return 'Arrêtée';
      default:
        return status;
    }
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
      case 'start':
        return 'primary';
      default:
        return 'secondary';
    }
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();

    this.editModal = new Modal(document.getElementById('kt_modal_edit_user')!);
    this.detailsModal = new Modal(document.getElementById('kt_modal_user_details')!);
    this.addModal = new Modal(document.getElementById('kt_modal_add_user')!);

  }

  private loadRoles(): void {
    //console.log("Début du chargement des rôles");
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        //console.log("Réponse reçue du service:", roles);
        this.roles = roles;
        //console.log("Rôles stockés dans le composant:", this.roles);
      },
      error: (error) => {
        this.toastr.error(error.error.message, "Erreur")
        //console.error("Erreur lors du chargement des rôles:", error);
      }
    });
  }

  closeModal() {
    this.selectedUser = null;
  }

  loadUsers(): void {
    this.usersService.getUsers().subscribe(users => {
      this.users = users;
      this.applyFilters();
    });
  }

  getInitials(user: User): string {
    const firstname = user.firstname || '';
    const lastname = user.lastname || '';
    return `${firstname[0] || ''}${lastname[0] || ''}`;
  }


  editUser(user: User): void {
    this.selectedUser = { ...user };

    // Extraire l'ID du rôle
    const roleId = (this.selectedUser.role as any)?._id;
    const hbd = (this.selectedUser.birthday);

    if (hbd) {
      const date = new Date(hbd);
      this.selectedUser.birthday = date.toISOString().split('T')[0];
    }
    const validRole = this.roles.find(role => role._id === roleId);

    // Assignez l'ID du rôle si valide, sinon mettez une chaîne vide
    this.selectedUser.role = validRole ? validRole._id : '';

    this.editModal.show();
  }

  updateUser(): void {
    if (this.selectedUser && this.selectedUser._id) {
      const updateData = {
        firstname: this.selectedUser.firstname,
        lastname: this.selectedUser.lastname,
        email_address: this.selectedUser.email_address,
        phone_number: this.selectedUser.phone_number,
        birthday: this.selectedUser.birthday,
        address: this.selectedUser.address,
        role: this.selectedUser.role
      };

      this.usersService.updateUser(this.selectedUser._id, updateData).subscribe({
        next: (updatedUser) => {
          const index = this.users.findIndex(u => u._id === updatedUser._id);
          if (index !== -1) {
            this.users[index] = updatedUser;
            this.applyFilters();
          }
          this.editModal.hide();
          this.selectedUser = null;
          this.toastr.success('Utilisateur mis à jour avec succès');
        },
        error: (error) => {
          /*console.error('Erreur détaillée :', {
            status: error.status,
            message: error.error?.message,
            fullError: error
          });*/

          this.toastr.error(error.error.message, "Erreur");

          if (error.status === 403) {
            this.toastr.error('Session expirée. Veuillez vous reconnecter.');
           /* this.authService.logout().subscribe(() => {
              this.router.navigate(['/login']);
            });*/
          } else {
            this.toastr.error(error.error?.message || 'Erreur lors de la mise à jour de l\'utilisateur');
          }
        }
      });
    }
  }

  viewUserDetails(user: User): void {
    this.selectedUser = user;
  }

  activeTab: 'admin' | 'mobile' = 'admin';
  searchQuery: any;

  applyFilters(): void {
    let filtered = [...this.users];

    // Appliquer la recherche si `searchQuery` existe
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
      } else if (this.activeTab === 'mobile') {
        return user.user_type !== 'admin'; // Exclut les administrateurs
      }
      return true;
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
  deleteUser(userId: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.usersService.deleteUser(userId).subscribe({
        next: () => {

          this.users = this.users.filter(user => user._id !== userId);
          this.applyFilters();
        },
        error: (error) => {
          this.toastr.error('Erreur:', error.error.message);

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

  validZem(zemId: string) {
  const validationData: ZemValidationRequest = {
    profile_validation_status: 'validated',
    type_action: 'validated_zem'
  };

  this.usersService.validateZemProfile(zemId, validationData)
    .subscribe({
      next: (response) => {
        console.log('Validation réussie', response);
        this.toastr.success('Compte validé!');
        this.loadUsers();
      },
      error: (error) => {
        this.toastr.error("Echec de validation de compte");
      }
    });
}

  @HostListener('document:click', ['$event'])
  handleCloseClick(event: MouseEvent) {
    const closeButton = document.querySelector('[data-kt-users-modal-action="close"]');
    const cancelButton = document.querySelector('[data-kt-users-modal-action="cancel"]');
    const modal = document.querySelector('.modal');

    if (event.target === closeButton || event.target === cancelButton || event.target === modal) {
      this.hideOverlay();
      this.addModal.hide();
      document.body.classList.remove('modal-open');
    }
  }

  ngOnDestroy() {
    this.hideOverlay();
  }

  loadCounterData(zemId: string): void {
    console.log('1. Début loadCounterData avec zemId:', zemId);
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();

    this.counterService.getZemCounter(zemId).pipe(
      tap(data => console.log('2. Données brutes reçues du service:', data))
    ).subscribe({
      next: (data) => {
        console.log('3. Dans le next, avant affectation:', {
          activeSection: this.activeSection,
          loading: this.loading,
          counterData: this.counterData
        });

        this.counterData = data;
        this.loading = false;

        console.log('4. Après affectation:', {
          activeSection: this.activeSection,
          loading: this.loading,
          counterData: this.counterData
        });

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur détaillée:', error);
        this.error = 'Erreur lors du chargement des données';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get statusClass() {
    if (this.selectedUser?.user_type === 'zem') {
      return this.selectedUser?.validated_at ? 'badge-light-success' : 'badge-light-danger';
    } else if (this.selectedUser?.user_type === 'customer') {
      return this.selectedUser?.validated_at ? 'badge-light-success' : 'badge-light-warning';
    }
    return 'badge-light-primary';
  }

  get statusText() {
    if (this.selectedUser?.user_type === 'zem' || this.selectedUser?.user_type === 'customer') {
      if (this.selectedUser?.validated_at) {
        // Formater la date validated_at
        return `Validé le ${formatDate(this.selectedUser.validated_at, 'dd/MM/yyyy HH:mm',"en-US")}`;
      } else {
        return 'Non validé';
      }
    }
    return '';
  }


  async getZemDetails(zemId: string) {
    try {
      const response = await this.usersService.getZemById(zemId).toPromise();
      /*this.selectedUser = {
        ...this.selectedUser,
        validated_at: response.validated_at
      };*/
      console.log('La réponse de zem!', response);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du zem:', error);
    }
  }

  applyDateFilters(): void {
    let filtered = [...this.originalUserRaces];

    if (this.startDate || this.endDate) {
      filtered = filtered.filter(race => {
        const raceDate = new Date(race.initial_datetime);
        raceDate.setHours(0, 0, 0, 0); // Normaliser l'heure à minuit

        if (this.startDate && this.endDate) {
          const start = new Date(this.startDate);
          const end = new Date(this.endDate);
          end.setHours(23, 59, 59, 999); // Inclure toute la journée de fin
          return raceDate >= start && raceDate <= end;
        } else if (this.startDate) {
          const start = new Date(this.startDate);
          return raceDate >= start;
        } else if (this.endDate) {
          const end = new Date(this.endDate);
          end.setHours(23, 59, 59, 999);
          return raceDate <= end;
        }
        return true;
      });
    }

    this.userRaces = filtered;
    this.cdr.detectChanges();
  }

  resetDateFilters(): void {
    this.startDate = '';
    this.endDate = '';
    this.userRaces = [...this.originalUserRaces];
    this.cdr.detectChanges();
  }

  onStartDateChange(): void {
    if (this.endDate && new Date(this.startDate) > new Date(this.endDate)) {
      this.toastr.warning('La date de début ne peut pas être postérieure à la date de fin');
      this.startDate = '';
      return;
    }
    this.applyDateFilters();
  }

  onEndDateChange(): void {
    if (this.startDate && new Date(this.endDate) < new Date(this.startDate)) {
      this.toastr.warning('La date de fin ne peut pas être antérieure à la date de début');
      this.endDate = '';
      return;
    }
    this.applyDateFilters();
  }

  getTypeClass(type: string): string {
    switch (type.toLowerCase()) {
      case 'input':
        return 'badge-light-success';
      case 'output':
        return 'badge-light-warning';
      default:
        return 'badge-light-primary';
    }
  }

  getTypeLabel(type: string): string {
    switch (type.toLowerCase()) {
      case 'input':
        return 'Recharge';
      case 'output':
        return 'Utilisation';
      default:
        return type;
    }
  }


  getTransactionTextClass(type: "credit" | "withdrawal" | "bonus") {
    switch (type.toLowerCase()) {
      case 'credit':
        return 'badge-light-success';
      case 'bonus':
        return 'badge-light-warning';
      case 'withdrawal':
        return 'badge-light-danger';
      default:
        return 'badge-light-primary';
    }
  }
}
