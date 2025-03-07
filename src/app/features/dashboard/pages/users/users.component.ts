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
import { NgbCollapseModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {User, ZemValidationRequest} from './models/users.model';
import {UsersService} from './services/users.service';
import {
  CommonModule,
  DatePipe,
  DecimalPipe,
  formatDate,
  NgClass,
  NgForOf,
  NgIf
} from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
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
import { BehaviorSubject, Observable, shareReplay, take, tap, throwError } from 'rxjs';
import {Router} from '@angular/router';
import {map} from 'rxjs/operators';
import { ConfirmationDialogComponent } from "../../../../../shared/layouts/confirmation-dialog/confirmation-dialog.component";
import { state } from '@angular/animations';
import { LoadingComponent } from "../../../../../core/components/loading/loading.component";
import { FormBuilder, FormGroup } from '@angular/forms';
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
    ReactiveFormsModule,
    FormsModule,
    NgForOf,
    NgIf,
    DatePipe,
    DecimalPipe,
    NgbModule,
    NgbCollapseModule,
    NgClass,
    ConfirmationDialogComponent,
    CommonModule,
    LoadingComponent
],
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, AfterViewInit {

  today: string = new Date().toISOString().split('T')[0];
  newStatus: boolean = false;
  selectedContractFile: File | null = null;
  ambassadorForm!: FormGroup;
  isCollapsed = true;
  collapsedSections: { [key: string]: boolean } = {};
  canValidate: boolean = false;
  activeSection: 'informations' | 'portefeuille' | 'courses' | 'compteur' | 'infoszem' | null = null;
  counterData: CounterData | null = null;
  userStatus: { [key: string]: string } = {};
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
    status: '',
    startDate: '',
    endDate: '',
  };
  startDate: string = '';
  endDate: string = '';
  originalUserRaces: Race[] = [];
  showDeleteDialog = false;
  private userToDelete: string | null = null;
  showValidationDialog = false;
  showRejetDialog = false;
  private zemToValidate: string | null = null;
  private zemToInvalidate: string | null = null;
  referenceFilter: string = '';
  isModalOpen: boolean = this.loading;
  isLoading: boolean = false;
  loadingMessage: string = 'Chargement des données...';
  
  /* birthday: '',
    address: '', */
  newUser = {
    phone_number: '',
    password: '',
    email_address: '',
    firstname: '',
    lastname: '',
    
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


  shouldShowLocation(race: any): boolean {
    return ['started', 'stopped', 'end', 'pending'].includes(race.status) && 
      (race.country_start || race.country_end || race.country_stop);
  }


  constructor(
    private router: Router,
    private usersService: UsersService,
    private walletService: WalletService,
    private raceService: RaceService,
    private roleService: RoleService,
    private counterService: CounterService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
  ) {
    this.userRaces.forEach(race => {
      this.collapsedSections[race._id] = true;
    });

    this.ambassadorForm = this.fb.group({
      contratDocument: [null]
    });
  }


  toggleSection(raceId: string): void {
    this.collapsedSections[raceId] = !this.collapsedSections[raceId];
  }

  ngAfterViewInit() {
    // Initialisation des dropdowns
    const dropdownTriggerList = document.querySelectorAll('.dropdown-toggle');
    dropdownTriggerList.forEach(dropdownTriggerEl => {
      new bootstrap.Dropdown(dropdownTriggerEl);
    });

    const triggerTabList = [].slice.call(document.querySelectorAll('a[data-bs-toggle="tab"]'));
    triggerTabList.forEach(function (triggerEl) {
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


  async showUserDetails(user: User): Promise<void> {
    this.loadUsers();
    this.selectedUser = user;
    this.detailsModal.show();
    this.canValidate = await this.canValidateZem();
    this.getZemStatusText();
    if (this.selectedUser?.zem) {
      const zemDetails = await this.getZemDetails(this.selectedUser?.zem!);
      this.zem = zemDetails || null;
      if(this.zem) {
        this.newStatus  = this.zem?.is_ambassador;
      }
    }

  }

  showDetails(race: any) {
    const modalElement = document.getElementById(`detailsModal_${race.reference}`);
    if (modalElement) {
      const modal = Modal.getInstance(modalElement) || new Modal(modalElement);
      modal.show();
    }
  }

  openValidationDialog(): void {
    if (this.selectedUser?.zem) {
      this.zemToValidate = this.selectedUser.zem;
      this.showValidationDialog = true;
    }
  }

  openRejetDialog(): void {
    if (this.selectedUser?.zem) {
      this.zemToInvalidate = this.selectedUser.zem;
      this.showRejetDialog = true;
    }
  }

  closeValidationDialog(): void {
    this.showValidationDialog = false;
    this.zemToValidate = null;
  }

  closeRejetDialog(): void {
    this.showRejetDialog = false;
    this.zemToInvalidate = null;
  }

  confirmValidation(): void {
    if (this.zemToValidate) {
      this.validZem(this.zemToValidate);
      this.closeValidationDialog();
    }
  }
  confirmRejet(): void {
    if (this.zemToInvalidate) {
      this.validZem(this.zemToInvalidate);
      this.closeRejetDialog();
    }
  }

  showAddUserModal(): void {
    this.resetNewUser();
    this.cdr.detectChanges();
    this.addModal.show();
  }

  /* birthday: '',
      address: '', */
  resetNewUser(): void {
    this.newUser = {
      phone_number: '',
      password: '',
      email_address: '',
      firstname: '',
      lastname: '',
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
     // birthday: this.newUser.birthday ? new Date(this.newUser.birthday).toISOString() : undefined,
     // address: this.newUser.address || undefined,
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


onReferenceChange(userID: string) {
  this.filterRaces(userID);
}



filterRaces(userID: string): void {
  // On garde en mémoire le filtre actuel
  const currentFilter = this.referenceFilter;
  
  this.loadUserRaces(userID);
  
  // On réapplique le filtre si il existe toujours
  if (currentFilter) {
    this.userRaces = this.userRaces.filter(race => 
      race.reference.toString().includes(currentFilter)
    );
  }
}

  toggleStoppedDetails(race: any) {
    race.showStoppedDetails = !race.showStoppedDetails;
  }



  showUserSection(section: 'informations' | 'portefeuille' | 'courses' | 'compteur' | 'infoszem'): void {
    console.log("Section changée vers:", section);
    this.activeSection = section;
    if (section === 'portefeuille' && this.selectedUser) {
      this.loadWalletData(this.selectedUser._id);
    }
    if (section === 'courses' && this.selectedUser) {
      if (this.selectedUser.user_type === 'zem') {
        console.log("Le zem", this.selectedUser)
        const z = this.selectedUser.zem;
        if (typeof z === "string") {
          this.loadUserRaces(z);
        }
      } else {
        this.loadUserRaces(this.selectedUser._id);
      }
    }
    if (section === 'informations' && this.selectedUser) {
      this.loadUserInformations(this.selectedUser._id);
    }
    if (section === 'compteur' && this.selectedUser?.user_type === 'zem') {
      const z = this.selectedUser.zem;
      console.log("Le zem", z);
      if (typeof z === "string") {
        this.loadCounterData(z);
      }
    }
    if (section === 'infoszem' && this.selectedUser?.user_type === 'zem') {
      const z = this.selectedUser?.zem;
      console.log("Le zem", z);
      if (typeof z === "string") {
        console.log("C'est dans le if ", z);
        this.loadZemDetails(z);
        console.log("C'est après le if ", z);
      }
    }

  }


  loadZemDetails(zemId: string): void {
    this.loading = true;
    this.usersService.getZemInfoById(zemId).subscribe({
      next: (details) => {
        this.zem = details;
        console.log("Les détails du zem", details);
        this.loading = false;
        this.cdr.detectChanges();

        /* const locationModal = document.getElementById('locationModal');
        if (locationModal) {
          locationModal.addEventListener('shown.bs.modal', () => {
             this.initServiceMap();
          });
        } */
      },
      error: (error) => {
        this.loading = false;
        this.toastr.error(error.message);
      }
    });
  }

   /* loadRaces(userId: string): void {
    if (this.selectedUser?.user_type === 'zem') {

      this.raceService.getZemRaces(userId).subscribe({
        next: (races) => {
          this.userRaces = races.map(race => {
            return {
              ...race
            };
          });
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


  loadUserRaces(userId: string): void {
    // Obtenir le premier et le dernier jour du mois courant
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const service = this.selectedUser?.user_type === 'zem' 
      ? this.raceService.getZemRaces(userId)
      : this.raceService.getUserRaces(userId);

    service.pipe(
      map(races => races.filter(race => {
        const raceDate = new Date(race.created_at); // ou race.date selon votre structure
        return raceDate >= firstDayOfMonth && raceDate <= lastDayOfMonth;
      })),
      map(races => races.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }))
    ).subscribe({
      next: (races) => {
        this.originalUserRaces = races;
        this.userRaces = [...races];
        this.applyDateFilters();
        this.setInitialCollapseState(this.userRaces);
      },
      error: (error) => {
        //console.error('Erreur lors du chargement des courses:', error);
        // Vous pourriez ajouter ici une notification d'erreur pour l'utilisateur
      }
    });
  } */

    /* loadUserRaces(userId: string): void {
      // Obtenir le premier et le dernier jour du mois courant
      this.isLoading = true;
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
      if (this.selectedUser?.user_type === 'zem') {
        this.raceService.getZemRaces(userId).pipe(
          map(races => races.filter(race => {
            const raceDate = new Date(race.created_at);
            return raceDate >= firstDayOfMonth && raceDate <= lastDayOfMonth;
          })),
          map(races => races.sort((a, b) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }))
        ).subscribe({
          next: (races) => {
            this.userRaces = races.map(race => {
              return {
                ...race
              };
            });
            this.originalUserRaces = races;
            this.userRaces = [...races];
            this.isLoading = false;
            if (this.referenceFilter) {
              this.userRaces = this.originalUserRaces.filter(race => 
                race.reference.toString().includes(this.referenceFilter)
              );
            } else {
              this.userRaces = [...this.originalUserRaces];
            }
            this.applyDateFilters();
            this.setInitialCollapseState(this.userRaces);
            //this.isLoading = false;
          
          },
          error: (error) => {
            console.error('Erreur lors du chargement des courses du zem:', error);
          }
        });
      } else {
        this.raceService.getUserRaces(userId).pipe(
          map(races => races.filter(race => {
            const raceDate = new Date(race.created_at);
            return raceDate >= firstDayOfMonth && raceDate <= lastDayOfMonth;
          })),
          map(races => races.sort((a, b) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }))
        ).subscribe({
          next: (races) => {
            this.originalUserRaces = races;
            this.userRaces = [...races];
            this.isLoading = false;
            if (this.referenceFilter) {
              this.userRaces = this.originalUserRaces.filter(race => 
                race.reference.toString().includes(this.referenceFilter)
              );
            } else {
              this.userRaces = [...this.originalUserRaces];
            }
            this.applyDateFilters();
            this.setInitialCollapseState(this.userRaces);
          
          },
          error: (error) => {
            console.error('Erreur lors du chargement des courses:', error);
          }
        });
      }
    } */

  showAllRaces = false; 

loadUserRaces(userId: string): void {
  this.isLoading = true;
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const service = this.selectedUser?.user_type === 'zem' 
    ? this.raceService.getZemRaces(userId)
    : this.raceService.getUserRaces(userId);

  service.pipe(
    map(races => {
      this.userRaces = [...races]; // Stocker toutes les courses
      if(this.startDate || this.endDate) {
        this.showAllRaces = true;
      } 

      // Si showAllRaces est false, on filtre les courses du mois en cours
      if (!this.showAllRaces) {
        return races.filter(race => {
          const raceDate = new Date(race.created_at);
          return raceDate >= firstDayOfMonth && raceDate <= lastDayOfMonth;
        });
      }
      return races;
    }),
    map(races => races.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
  ).subscribe({
    next: (races) => {
      this.originalUserRaces = races;
      this.userRaces = [...races];
      this.isLoading = false;

      // Appliquer un filtre sur la référence si nécessaire
      if (this.referenceFilter) {
        this.userRaces = this.originalUserRaces.filter(race => 
          race.reference.toString().includes(this.referenceFilter)
        );
      } else {
        this.userRaces = [...this.originalUserRaces];
      }

      this.applyDateFilters();
      this.setInitialCollapseState(this.userRaces);
    },
    error: (error) => {
      console.error('Erreur lors du chargement des courses:', error);
    }
  });
}


  getZemFullName(zemId: string): string {
    if (this.selectedUser?.user_type === 'zem') {
      // Si c'est un zem qui regarde ses courses, on affiche le nom du client
      const race = this.userRaces.find(r => r.zem?._id === zemId);
      if (race) {
        return `${race.user.firstname} ${race.user.lastname}`;
      }
    } else {
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
        return 'Recharge';
      case 'bonus':
        return 'Gain';
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

  async ngOnInit(): Promise<void> {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading  = false;
      this.loadUsers();
      this.loadRoles();
     

      this.userRaces.forEach(race => {
        this.collapsedSections[race._id] = true;
      });


    

    this.editModal = new Modal(document.getElementById('kt_modal_edit_user')!);
    this.detailsModal = new Modal(document.getElementById('kt_modal_user_details')!);
    this.addModal = new Modal(document.getElementById('kt_modal_add_user')!);
  }, 2000);
  await this.loadUserStatuses();
  }

  setInitialCollapseState(userRaces: Race[]): void {
    this.userRaces.forEach(race => {
      this.collapsedSections[race._id] = true;
    });
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
    this.selectedUser = {...user};

    // Extraire l'ID du rôle
    const roleId = (this.selectedUser.role as any)?._id;
   // const hbd = (this.selectedUser.birthday);

   /*  if (hbd) {
      const date = new Date(hbd);
      this.selectedUser.birthday = date.toISOString().split('T')[0];
    } */
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
       /*  birthday: this.selectedUser.birthday,
        address: this.selectedUser.address, */
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

 async viewUserDetails(user: User): Promise<void> {
    this.selectedUser = user;
    //this.canValidate = await this.canValidateZem();
  }

  activeTab: 'admin' | 'mobile' | 'tsd' |'ta' = 'admin';
  searchQuery: any;

/*   applyFilters(): void {
    let filtered = [...this.users];

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(user =>
        user.firstname?.toLowerCase().includes(query) ||
        user.lastname?.toLowerCase().includes(query) ||
        user.email_address?.toLowerCase().includes(query) ||
        user.user_type?.toLowerCase().includes(query) ||
        user.validated_at?.toLowerCase().includes(query)
      );
    }


    filtered = filtered.filter(user => {
      if (this.activeTab === 'admin') {
        return user.user_type === 'admin';
      } else if (this.activeTab === 'mobile') {
        return user.user_type !== 'admin';
      } else if (this.activeTab === 'tsd') {

        return user.user_type !== 'admin' && user.user_type !== 'customer' && user?.zem != null;
      } else if (this.activeTab === 'ta') {
        return user.user_type === 'zem' && user?.zem != null && this.newStatus === true;
      }
      return true;
    });


    this.filteredUsers = filtered.filter(user => {
      return (!this.filters.typeUtilisateur || user.user_type === this.filters.typeUtilisateur);
    });


    this.filteredUsers = filtered.filter(user => {
      let matchesStatus = true;
      let matchesDate = true;
  
      // Filtrage par statut
      if (this.filters.status) {
       const state = user.validated_at;
        if(state !== null) {
          user.validated_at = 'validated';
          matchesStatus = user.validated_at === this.filters.status;
        }
        if(state === null) {
          user.validated_at = 'pending';
          matchesStatus = user.validated_at === this.filters.status;
        }
      }
  
      // Filtrage par date
      if (this.filters.startDate || this.filters.endDate) {
        const userDate = new Date(user.created_at);
        const startDate = this.filters.startDate ? new Date(this.filters.startDate) : null;
        const endDate = this.filters.endDate ? new Date(this.filters.endDate) : null;
  
        if (startDate && userDate < startDate) matchesDate = false;
        if (endDate && userDate > endDate) matchesDate = false;
      }
  
      return matchesStatus && matchesDate;
    });
  } */


    async applyFilters(): Promise<void> {
      let filtered = [...this.users];
    
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(user =>
          user.firstname?.toLowerCase().includes(query) ||
          user.lastname?.toLowerCase().includes(query) ||
          user.email_address?.toLowerCase().includes(query) ||
          user.user_type?.toLowerCase().includes(query) ||
          user.validated_at?.toLowerCase().includes(query)
        );
      }
    
      // Créer un tableau pour stocker les utilisateurs filtrés après traitement asynchrone
      let tempFiltered: User[] = [];
    
      // Filtrage par onglet avec gestion asynchrone pour les types zem
      for (const user of filtered) {
        if (this.activeTab === 'admin') {
          if (user.user_type === 'admin') {
            tempFiltered.push(user);
          }
        } 
        else if (this.activeTab === 'mobile') {
          if (user.user_type !== 'admin') {
            tempFiltered.push(user);
          }
        } 
        else if (this.activeTab === 'tsd') {
          if (user.user_type === 'zem' && user?.zem != null) {
            const zemDetails = await this.getZemDetails(user.zem);
            if (zemDetails && zemDetails.is_temporal === true) {
              tempFiltered.push(user);
            }
          }
        } 
        else if (this.activeTab === 'ta') {
          if (user.user_type === 'zem' && user?.zem != null) {
            const zemDetails = await this.getZemDetails(user.zem);
            if (zemDetails && zemDetails.is_ambassador === true) {
              tempFiltered.push(user);
            }
          }
        }
        else {
          tempFiltered.push(user);
        }
      }
    
      filtered = tempFiltered;
    
      // Filtrage par type d'utilisateur
      this.filteredUsers = filtered.filter(user => {
        return (!this.filters.typeUtilisateur || user.user_type === this.filters.typeUtilisateur);
      });
    
      // Filtrage par statut et date
      this.filteredUsers = this.filteredUsers.filter(user => {
        let matchesStatus = true;
        let matchesDate = true;
    
        // Filtrage par statut
        if (this.filters.status) {
          const state = user.validated_at;
          if (state !== null) {
            user.validated_at = 'validated';
            matchesStatus = user.validated_at === this.filters.status;
          }
          if (state === null) {
            user.validated_at = 'pending';
            matchesStatus = user.validated_at === this.filters.status;
          }
        }
    
        // Filtrage par date
        if (this.filters.startDate || this.filters.endDate) {
          const userDate = new Date(user.created_at);
          const startDate = this.filters.startDate ? new Date(this.filters.startDate) : null;
          const endDate = this.filters.endDate ? new Date(this.filters.endDate) : null;
    
          if (startDate && userDate < startDate) matchesDate = false;
          if (endDate && userDate > endDate) matchesDate = false;
        }
    
        return matchesStatus && matchesDate;
      });
    }


  onTabChange(event: any): void {
    //this.activeTab = event.target.id === 'admin-tab' ? 'admin' : 'mobile' ;

    switch (event.target.id) {
      case 'admin-tab':
          this.activeTab = 'admin';
          break;
      case 'mobile-tab':
          this.activeTab = 'mobile';
          break;
      case 'tsd-tab':
          this.activeTab = 'tsd';
          break;
      case 'ta-tab':
          this.activeTab = 'ta';
          break;
  }
    this.applyFilters();
  }

  deleteUser(userId: string) {
    this.userToDelete = userId;
    this.showDeleteDialog = true;
  }

  confirmDelete() {
    if (!this.userToDelete) return;

    this.usersService.deleteUser(this.userToDelete).subscribe({
      next: () => {
        this.users = this.users.filter(user => user._id !== this.userToDelete);
        this.applyFilters();
        this.userToDelete = null;
        this.showDeleteDialog = false;
      },
      error: (error) => {
        if (error.error.status === 401) {
          this.router.navigate(["/login"]);
        }
        this.toastr.error(error.error.message);
      }
    });
  }


  private loadUserInformations(_id: string) {
    this.usersService.getUserById(_id).subscribe({
      next: (user) => {
        this.currentUser = user;
      },
      error: (error) => {
        if (error.error.status === 401) {
          this.router.navigate(["/login"])
        }
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
          this.canValidate = false;
          this.getZemStatusText();
        },
        error: (error) => {
          if (error.error.status === 401) {
            this.router.navigate(["/login"])
          }
          this.toastr.error("Echec de validation de compte");
        }
      });
  }

  inValidZem(zemId: string) {
    const inValidationData: ZemValidationRequest = {
      profile_validation_status: 'rejected',
      type_action: 'rejected_zem'
    };

    this.usersService.validateZemProfile(zemId, inValidationData)
      .subscribe({
        next: (response) => {
          console.log('Validation réussie', response);
          this.toastr.success('Compte rejeté!');
          this.loadUsers();
          this.canValidate = false;
          this.getZemStatusText();
        },
        error: (error) => {
          if (error.error.status === 401) {
            this.router.navigate(["/login"])
          }
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

    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();

    this.counterService.getZemCounter(zemId).pipe(
      tap(data => console.log('2. Données brutes reçues du service:', data))
    ).subscribe({
      next: (data) => {


        this.counterData = data;
        this.loading = false;


        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur détaillée:', error);
        if (error.error.status === 401) {
          this.router.navigate(["/login"])
        }
        this.error = 'Erreur lors du chargement des données';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

    async canValidateZem(): Promise<boolean> {
      this.getZemStatusText();
      try {
        if (this.selectedUser?.user_type === 'zem' && this.selectedUser?.zem) {
          const zem = this.selectedUser?.zem;
          const data = await this.getZemDetails(zem!);
          //console.log("La reponse de getZemDetails avant la date", data);
          if (data && 'validated_at' in data) {
            //console.log("La reponse de getZemDetails", data.validated_at);
            return data.validated_at === null;
          }
        }
        return false;
      } catch (error) {
       // console.error('Erreur lors de la vérification de la validation du ZEM:', error);
        return false;
      }
    }

    private zemValidationCache: { [key: string]: Observable<Zem> } = {};
    private zemValidationInfo = new BehaviorSubject<{ validated: boolean, validatedAt?: string }>({ validated: false });

  get statusClass(): string {
    if (!this.selectedUser) return 'badge-light-primary';

    switch (this.selectedUser.user_type) {
      case 'zem':
        return this.zemValidationInfo.value.validatedAt 
          ? 'badge-light-success' 
          : 'badge-light-danger';
      case 'customer':
        return this.selectedUser.validated_at 
          ? 'badge-light-success' 
          : 'badge-light-warning';
      default:
        return 'badge-light-primary';
    }
  }

  get statusText(): string {
    if (!this.selectedUser) return '';

    switch (this.selectedUser.user_type) {
      case 'customer':
        return this.selectedUser.validated_at
          ? `Validé le ${formatDate(this.selectedUser.validated_at, 'dd/MM/yyyy HH:mm', 'en-US')}`
          : 'Non validé';
      
      case 'zem':
        return this.getZemStatusText();
      
      default:
        return '';
    }
  }

  private getZemStatusText(): string {
    const zemId = this.selectedUser?.zem;
    if (!zemId) return 'Non validé';

    if (!this.zemValidationCache[zemId]) {
      this.zemValidationCache[zemId] = this.usersService.getZemInfoById(zemId).pipe(
        map(info => {
          const validationInfo = {
            validated: info.validated_at !== null,
            validatedAt: info.validated_at
          };
          this.zemValidationInfo.next(validationInfo);
          return info;
        }),
        shareReplay(1)
      );
      
      // Déclencher la requête
      this.zemValidationCache[zemId].pipe(take(1)).subscribe();
    }

    return this.zemValidationInfo.value.validatedAt
      ? `Validé le ${formatDate(this.zemValidationInfo.value.validatedAt, 'dd/MM/yyyy HH:mm', 'en-US')}`
      : 'Non validé';
  }


  async getZemDetails(zemId: string) {
    try {
      const response = await this.usersService.getZemInfoById(zemId).toPromise();
      return response;
    } catch (error) {
     // console.error('Erreur lors de la récupération des détails du zem:', error);
      return null;
    }
  }

  /* applyDateFilters(): void {
    let filtered = [...this.originalUserRaces];

    if (this.startDate || this.endDate) {
      filtered = filtered.filter(race => {
        const raceDate = new Date(race.initial_datetime);
        raceDate.setHours(0, 0, 0, 0);

        if (this.startDate && this.endDate) {
          const start = new Date(this.startDate);
          const end = new Date(this.endDate);
          end.setHours(23, 59, 59, 999);
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
  } */

    applyDateFilters(): void {
      let filtered = [...this.originalUserRaces];
  
      if (this.startDate || this.endDate) {
        filtered = filtered.filter(race => {
          const raceDate = new Date(race.initial_datetime);
          raceDate.setHours(0, 0, 0, 0); // S'assurer que la date est à minuit
  
          const start = this.startDate ? new Date(this.startDate) : null;
          const end = this.endDate ? new Date(this.endDate) : null;
  
          if (start) start.setHours(0, 0, 0, 0);
          if (end) end.setHours(23, 59, 59, 999); // Fin de journée
  
          // Vérifier que la course est bien dans l'intervalle défini
          return (!start || raceDate >= start) && (!end || raceDate <= end);
        });
      }
  
      this.userRaces = filtered;
      this.cdr.detectChanges(); // Met à jour l'affichage si nécessaire
  }
  

  resetDateFilters(): void {
    this.startDate = '';
    this.endDate = '';
    this.userRaces = [...this.originalUserRaces];
    this.referenceFilter = '';
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
        return 'Retrait';
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

  getProfileDisplay(user: User): string {
    if (user?.profile_picture) {
      return user.profile_picture;
    }

    if (user?.user_type === 'zem' && user?.zem) {
      const zemUser = this.findZemUser(user.zem);
      if (zemUser?.profile_picture) {
        return zemUser.profile_picture;
      }
    }
    return this.getInitials(user);
  }

  currentPhoto: string = '';

  openPhotoModal(photoType: string) {
    switch (photoType) {
      case 'card_photo':
        this.currentPhoto = this.zem?.card_image || '';
        break;
      case 'plate_photo':
        this.currentPhoto = this.zem?.plate_picture || '';
        break;
      case 'residence_photo':
        this.currentPhoto = this.zem?.image_of_residence_certificate || '';
        break;
      case 'ifu_photo':
        this.currentPhoto = this.zem?.ifu_number_image || '';
        break;
    }
    const photoModal = new bootstrap.Modal(document.getElementById('photoModal')!);
    photoModal.show();
  }

  openLocationModal() {
    const locationModal = new bootstrap.Modal(document.getElementById('locationModal')!);
    locationModal.show();

    setTimeout(() => {
      this.initGoogleMap();
    }, 300);
  }

  initGoogleMap() {
    
    if (!(window as any).google || !(window as any).google.maps) {
      console.error('Google Maps JavaScript API not loaded');
      return;
    }

    if (this.zem?.service_latitude && this.zem?.service_longitude) {
      const mapOptions = {
        center: {
          lat: this.zem.service_latitude,
          lng: this.zem.service_longitude
        },
        zoom: 15
      };

      const map = new google.maps.Map(
        document.getElementById('zemLocationMap') as HTMLElement,
        mapOptions
      );

      new google.maps.Marker({
        position: mapOptions.center,
        map: map,
        title: 'Position du Zem'
      });
    }
  }

  async statutOfUser(user: User): Promise<string> {
    if (user.user_type === 'customer') {
      return user.validated_at ? 'Validé' : 'Non validé';
    }
    
    if (user.user_type === 'zem' && user.zem) {
      try {
        const zemDetails = await this.getZemDetails(user.zem);
        console.log("Les détails du zem", zemDetails);
        return zemDetails?.validated_at ? 'Validé' : 'Non validé';
      } catch (error) {
        console.error('Erreur lors de la récupération des détails ZEM:', error);
        return 'Non validé';
      }
    }
    
    return 'Non validé';
  }

  async loadUserStatuses(): Promise<void> {
    for (const user of this.users) {
      this.userStatus[user._id] = await this.statutOfUser(user);
    }
    this.cdr.detectChanges(); // Force la détection des changements
  }


  onContractFileSelected(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      // Vérifier si le fichier est un PDF
      if (file.type !== 'application/pdf') {
        this.toastr.error('Seuls les fichiers PDF sont acceptés');
        return;
      }
      // Vérifier la taille du fichier (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error('La taille du fichier ne doit pas dépasser 5MB');
        return;
      }
      this.selectedContractFile = file;
      this.ambassadorForm.get('contratDocument')?.setValue(file);
    }
  }

  showAmbassadorDialog = false;
 

openAmbassadorDialog() {
  this.showAmbassadorDialog = true;
}

closeAmbassadorDialog() {
  this.showAmbassadorDialog = false;
}


async toggleAmbassadorStatus() {
  if (!this.selectedUser) return;
  
  const zemId = this.selectedUser.zem;
  if (!zemId) return;
  
  if (!this.zem) {
    if (zemId) {
      const zemDetails = await this.getZemDetails(zemId);
      this.zem = zemDetails || null;
    }
    if (!this.zem) {
      this.toastr.error("Impossible de récupérer les détails du transporteur");
      this.closeAmbassadorDialog();
      return;
    }
  }

  console.log("L'ancien statut", this.zem.is_ambassador);
  
  this.newStatus = !this.zem.is_ambassador;
  console.log("Le nouveau statut", this.newStatus);
  
  // Si on promeut au statut d'ambassadeur et qu'aucun fichier n'est sélectionné
  if (this.newStatus && !this.selectedContractFile) {
    this.toastr.error("Veuillez sélectionner un document de contrat (PDF)");
    return;
  }
  
  if (this.newStatus) {
    // Cas où on promeut l'utilisateur comme ambassadeur (avec fichier)
    const formData = new FormData();
    formData.append('contrat_document', this.selectedContractFile as File);
    
    this.usersService.makeAmbassador(zemId, formData).subscribe(
      (response) => {
        if (this.zem) {
          this.zem.is_ambassador = true;
        }
        
        this.toastr.success(`${this.selectedUser?.firstname} ${this.selectedUser?.lastname} est maintenant ambassadeur`);
        this.closeAmbassadorDialog();
        this.selectedContractFile = null;
        this.ambassadorForm.get('contratDocument')?.setValue(null);
      },
      (error) => {
        this.toastr.error(error.error?.message || "Une erreur s'est produite lors de la mise à jour du statut d'ambassadeur");
        console.error(error);
        this.closeAmbassadorDialog();
      }
    );
  } else {
    // Cas où on retire le statut d'ambassadeur (sans fichier)
    this.usersService.updateAmbassadorStatus(zemId, "false").subscribe(
      (response) => {
        if (this.zem) {
          this.zem.is_ambassador = false;
        }
        
        this.toastr.success(`${this.selectedUser?.firstname} ${this.selectedUser?.lastname} n'est plus ambassadeur`);
        this.closeAmbassadorDialog();
      },
      (error) => {
        this.toastr.error("Une erreur s'est produite lors de la mise à jour du statut d'ambassadeur");
        console.error(error);
        this.closeAmbassadorDialog();
      }
    );
  }
}




/* async toggleAmbassadorStatus() {
  if (!this.selectedUser) return;
  
  const zemId = this.selectedUser.zem;
  if (!zemId) return;
  
  if (!this.zem) {
    if (zemId) {
      const zemDetails = await this.getZemDetails(zemId);
      this.zem = zemDetails || null;
    }
   // this.zem = await this.getZemDetails(zemId);
    if (!this.zem) {
      this.toastr.error("Impossible de récupérer les détails du transporteur");
      this.closeAmbassadorDialog();
      return;
    }
  }

  console.log("L'ancien statut", this.zem.is_ambassador);
  
  this.newStatus = !this.zem.is_ambassador;
  console.log("Le nouveau statut", this.newStatus);
  
 
  this.usersService.updateAmbassadorStatus(zemId, this.newStatus.toString()).subscribe(
    (response) => {
  
      if (this.zem) {
        this.zem.is_ambassador = this.newStatus;
      }
      
     
      this.toastr.success(
        this.newStatus 
          ? `${this.selectedUser?.firstname} ${this.selectedUser?.lastname} est maintenant ambassadeur` 
          : `${this.selectedUser?.firstname} ${this.selectedUser?.lastname} n'est plus ambassadeur`
      );
    },
    (error) => {
      this.toastr.error("Une erreur s'est produite lors de la mise à jour du statut d'ambassadeur");
      console.error(error);
    }
  );
  
  this.closeAmbassadorDialog();
} */
}
