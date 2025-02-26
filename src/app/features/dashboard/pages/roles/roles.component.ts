import {AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators, AbstractControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { PermissionsResponse } from './models/permission.model';
import { PermissionsService } from './services/permission.service';
import { RoleService } from './services/role.service';
import {ToastrModule, ToastrService} from 'ngx-toastr';
import { finalize } from 'rxjs/operators';
import {CommonModule} from '@angular/common';
import {Role} from './models/role.model';
import { Modal } from 'bootstrap';
import { LoadingComponent } from "../../../../../core/components/loading/loading.component";
declare const bootstrap: any;

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ToastrModule, LoadingComponent],
  templateUrl: './roles.component.html'
})
export class RolesComponent implements OnInit, AfterViewInit {
  roleForm!: FormGroup;
  permissionGroups: PermissionsResponse = {};
  loading = false;
  submitting = false;
  roles: any[] = [];
  selectedRole: Role | null = null;
  private unfilteredRoles: any[] = [];
  permissionNames: Map<string, string> = new Map();
  permissionsByKey: Map<string, string> = new Map();
  private accordions: Map<string, any> = new Map();
  dropdowns: any[] = [];
  isLoading: boolean = false;
  loadingMessage: string = 'Chargement des données...';

  constructor(
    private fb: FormBuilder,
    private permissionsService: PermissionsService,
    private roleService: RoleService,
    private toastr: ToastrService
  ) {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      permissions: this.fb.group({})
    });
  }

  private initializePermissionNames(): void {
    Object.values(this.permissionGroups).forEach(permissions => {
      permissions.forEach(permission => {
        this.permissionNames.set(permission._id, permission.name);
        this.permissionsByKey.set(permission.key, permission.name);
      });
    });
  }

  addModal: any;

  getPermissionName(permissionIdentifier: unknown): string {
    const identifier = permissionIdentifier as string;

    // Essayer de trouver par ID
    let name = this.permissionNames.get(identifier);

    // Si non trouvé par ID, essayer par clé
    if (!name) {
      name = this.permissionsByKey.get(identifier);
    }

    if (!name) {
      console.warn(`Permission name not found for identifier: ${identifier}`);
      return 'Permission inconnue';
    }

    return name;
  }


  // Nouvelle méthode pour rafraîchir toutes les données
  private refreshData(): void {
    // Recharger les permissions
    this.permissionsService.getAllPermissions()
      .subscribe({
        next: (permissions) => {
          this.permissionGroups = permissions;
          this.initializePermissionNames();
          // Puis recharger les rôles
          this.loadRoles();
        },
        error: (error) => {
          console.error('Error refreshing permissions:', error);
          this.toastr.error('Erreur lors du rafraîchissement des permissions');
        }
      });
  }


  ngOnInit(): void {
    this.loading = true;
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    

    this.roleService.getAllRoles()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (roles) => {
          this.roles = roles;
          this.unfilteredRoles = [...roles];
        },
        error: (error) => {
          this.toastr.error('Erreur lors du chargement des rôles');
          console.error('Role loading error:', error);
        }
      });

    this.permissionsService.getAllPermissions()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (permissions) => {
          this.permissionGroups = permissions;
          this.initializePermissionNames(); // Initialiser les noms des permissions
          this.setupPermissionControls();
          this.refreshData();
          this.roleForm.reset();
          this.discardForm()
        },
        error: (error) => {
          this.toastr.error('Erreur lors du chargement des permissions');
          console.error('Permission loading error:', error);
        }
      });


    setTimeout(() => {
      const dropdownElements = document.querySelectorAll('.dropdown-toggle');
      dropdownElements.forEach(element => {
        const dropdown = new bootstrap.Dropdown(element);
        this.dropdowns.push(dropdown);
      });
    });

    this.addModal = new Modal(document.getElementById('kt_modal_add_role')!);

    setTimeout(() => {
      this.initializeAccordions();
      this.initializeDropdowns();
    }, 100);
  }, 1000);
  }

  private initializeAccordions(): void {
    // Réinitialiser les accordéons existants
    this.accordions.clear();

    // Initialiser tous les éléments d'accordéon
    document.querySelectorAll('.accordion-collapse').forEach(element => {
      const accordionId = element.id;
      if (accordionId) {
        const accordion = new bootstrap.Collapse(element, {
          toggle: false
        });
        this.accordions.set(accordionId, accordion);
      }
    });
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation(); // Important pour empêcher la propagation
    
    const button = event.target as HTMLElement;
    const dropdownMenu = button.closest('.dropdown')?.querySelector('.dropdown-menu');
    
    if (dropdownMenu) {
      // Fermer tous les autres dropdowns d'abord
      document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
        if (menu !== dropdownMenu) {
          menu.classList.remove('show');
        }
      });
      
      // Toggle le dropdown actuel
      dropdownMenu.classList.toggle('show');
      
      // Ajouter un gestionnaire de clic sur le document pour fermer le dropdown
      const closeDropdown = (e: MouseEvent) => {
        if (!button.contains(e.target as Node) && !dropdownMenu.contains(e.target as Node)) {
          dropdownMenu.classList.remove('show');
          document.removeEventListener('click', closeDropdown);
        }
      };
      
      document.addEventListener('click', closeDropdown);
    }
  }

  toggleAccordion(event: Event, groupKey: string): void {
    event.preventDefault();
    event.stopPropagation();

    const collapseId = `collapse_${groupKey}`;
    const collapseElement = document.getElementById(collapseId);
    
    if (collapseElement) {
      const bsCollapse = this.accordions.get(collapseId) || 
                        new bootstrap.Collapse(collapseElement, { toggle: false });
      
      if (!this.accordions.has(collapseId)) {
        this.accordions.set(collapseId, bsCollapse);
      }

      // Fermer les autres accordéons ouverts
      this.accordions.forEach((accordion, id) => {
        if (id !== collapseId && accordion) {
          accordion.hide();
        }
      });

      // Toggle l'accordéon actuel
      bsCollapse.toggle();
    }
  }

  ngAfterViewInit() {
    // Réinitialiser les composants après chaque changement de vue
    setTimeout(() => {
      this.initializeAccordions();
      this.initializeDropdowns();
    });
  }

  private setupPermissionControls(): void {
    const permissionsGroup = this.fb.group({});

    Object.entries(this.permissionGroups).forEach(([groupName, permissions]) => {
      const groupControls = this.fb.group({
        permissions: this.fb.group(
          permissions.reduce((acc, perm) => ({
            ...acc,
            [perm.key]: [false]
          }), {})
        )
      });

      permissionsGroup.addControl(groupName, groupControls);
    });

    this.roleForm.setControl('permissions', permissionsGroup);
  }

  updateChildControls(groupName: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const group = this.roleForm.get(`permissions.${groupName}.permissions`);
    if (group && group instanceof FormGroup) {
      Object.keys(group.controls).forEach(key => {
        group.get(key)?.setValue(checked);
      });
    }
  }

  isGroupFullySelected(groupName: string): boolean {
    const group = this.roleForm.get(`permissions.${groupName}.permissions`);
    if (!group || !(group instanceof FormGroup)) return false;

    const controls = Object.keys(group.controls);
    if (controls.length === 0) return false;

    return controls.every(key => group.get(key)?.value === true);
  }

  selectAllPermissions(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const permissionsGroup = this.roleForm.get('permissions');

    if (permissionsGroup && permissionsGroup instanceof FormGroup) {
      Object.keys(permissionsGroup.controls).forEach(groupName => {
        const group = permissionsGroup.get(groupName);
        if (group && group instanceof FormGroup) {
          const perms = group.get('permissions');
          if (perms && perms instanceof FormGroup) {
            Object.keys(perms.controls).forEach(key => {
              perms.get(key)?.setValue(checked);
            });
          }
        }
      });
    }
  }

  isAllPermissionsSelected(): boolean {
    const permissionsGroup = this.roleForm.get('permissions');
    if (!permissionsGroup || !(permissionsGroup instanceof FormGroup)) return false;

    return Object.keys(this.permissionGroups).every(groupName => {
      const group = permissionsGroup.get(groupName);
      if (!group || !(group instanceof FormGroup)) return false;
      const perms = group.get('permissions');
      if (!perms || !(perms instanceof FormGroup)) return false;
      return Object.keys(perms.controls || {}).every(key => perms.get(key)?.value === true);
    });
  }

  private setupPermissionsForEdit(permissions: string[]): void {
    const permissionsFormGroup = this.roleForm.get('permissions');
    if (permissionsFormGroup && permissionsFormGroup instanceof FormGroup) {
      Object.keys(this.permissionGroups).forEach(groupName => {
        const group = permissionsFormGroup.get(groupName);
        if (group && group instanceof FormGroup) {
          const permissionsControl = group.get('permissions');
          if (permissionsControl && permissionsControl instanceof FormGroup) {
            Object.keys(permissionsControl.controls).forEach(key => {
              const isSelected = permissions.includes(key);
              permissionsControl.get(key)?.setValue(isSelected);
            });
          }
        }
      });
    }
  }
  discardForm(): void {
    this.roleForm.reset();
    const modal = document.getElementById('kt_modal_add_role');
    if (modal) {
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance?.hide();
    }
  }

  discardUpdateForm(): void {
    this.roleForm.reset();
    const modal = document.getElementById('kt_modal_update_role');
    if (modal) {
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance?.hide();
    }
  }



  @ViewChild('kt_modal_add_role') modal!: ElementRef;

  closeModal() {
    if (this.modal) {
      const modalElement = this.modal.nativeElement;
      const bsModal = bootstrap.Modal.getInstance(modalElement);
      if (bsModal) {
        bsModal.hide();
      }
    }
  }

 /*  ngAfterViewInit() {
    // Initialiser les boutons de fermeture modaux
    const closeButton = document.querySelector('[data-kt-roles-modal-action="close"]');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.closeModal();
      });
    }


    setTimeout(() => {
      this.initializeDropdowns();
    });
  } */

    

  private initializeDropdowns(): void {
    // Détruire les anciens dropdowns
    this.dropdowns.forEach(dropdown => dropdown.dispose());
    this.dropdowns = [];

    // Initialiser les nouveaux dropdowns
    const dropdownElements = document.querySelectorAll('.dropdown-toggle');
    dropdownElements.forEach(element => {
      const dropdown = new bootstrap.Dropdown(element);
      this.dropdowns.push(dropdown);
    });
  }

  editRole(role: Role): void {
    console.log('Selected role for edit:', role);
    this.selectedRole = role;

    // Réinitialiser et préremplir le formulaire
    this.roleForm.patchValue({
      name: role.name,
      description: role.description || ''
    });

    // Mettre à jour les permissions si elles sont chargées
    if (Object.keys(this.permissionGroups).length > 0) {
      this.setupPermissionsForEdit(role.permissions);
    }

    // Ouvrir la modal
    const modalElement = document.getElementById('kt_modal_update_role');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
  onSubmit(): void {
    if (this.roleForm.invalid) {
      this.toastr.warning('Veuillez remplir correctement tous les champs requis');
      return;
    }

    const formValue = this.roleForm.value;
    const selectedPermissions: string[] = [];

    Object.values(formValue.permissions || {}).forEach((group: any) => {
      if (group.permissions) {
        Object.entries(group.permissions).forEach(([key, value]) => {
          if (value === true) {
            selectedPermissions.push(key);
          }
        });
      }
    });

    if (selectedPermissions.length === 0) {
      this.toastr.warning('Veuillez sélectionner au moins une permission');
      return;
    }

    // Création d'un objet Role complet pour la création
    const roleData: Role = {
      name: formValue.name,
      description: formValue.description || '',
      key: formValue.name.toLowerCase().replace(/\s+/g, '_'),
      permissions: selectedPermissions
    };

    this.submitting = true;

    // Pour la mise à jour, on peut utiliser Partial<Role>
    if (this.selectedRole?._id) {
      this.roleService.updateRole(this.selectedRole._id, roleData)
        .pipe(finalize(() => this.submitting = false))
        .subscribe({
          next: (response) => {
            console.log('Role updated successfully:', response);
            this.toastr.success('Rôle mis à jour avec succès');
            this.roleForm.reset();
            this.selectedRole = null;
            this.discardForm();
            this.discardUpdateForm();
            this.loadRoles();
            this.addModal.hide();
          },
          error: (error) => {
            console.error('Error updating role:', error);
            this.toastr.error('Erreur lors de la mise à jour du rôle');
          }
        });
    } else {
      // Pour la création, on utilise l'objet Role complet
      this.roleService.createRole(roleData)
        .pipe(finalize(() => this.submitting = false))
        .subscribe({
          next: (response) => {
            console.log('Role created successfully:', response);
            this.toastr.success('Rôle créé avec succès');
            this.roleForm.reset();
            this.discardForm();
            this.loadRoles();
            this.refreshData();
          },
          error: (error) => {
            console.error('Error creating role:', error);
            this.toastr.error('Erreur lors de la création du rôle');
          }
        });
    }
  }


  private loadRoles(): void {
    this.loading = true;
    this.roleService.getAllRoles()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (roles) => {
          this.roles = roles;
          this.unfilteredRoles = [...roles];
          setTimeout(() => {
            this.initializeDropdowns();
          });
        },
        error: (error) => {
          this.toastr.error('Erreur lors du chargement des rôles');
          console.error('Role loading error:', error);
        }
      });
  }



  @ViewChild('kt_modal_delete_role') deleteModal!: ElementRef;
  searchQuery: any;

  openDeleteModal(role: Role): void {
    this.selectedRole = role;
    const modalElement = document.getElementById('kt_modal_delete_role');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  openViewModal(role: Role): void {
    this.selectedRole = role;
    const modalElement = document.getElementById('kt_modal_view_role');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmDeleteRole(): void {
    if (!this.selectedRole?._id) return;

    this.submitting = true;
    this.roleService.deleteRole(this.selectedRole._id)
      .pipe(finalize(() => this.submitting = false))
      .subscribe({
        next: () => {
          this.toastr.success('Rôle supprimé avec succès');
          // Fermer le modal
          const modalElement = document.getElementById('kt_modal_delete_role');
          if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal?.hide();
          }
          // Recharger la liste des rôles
          this.loadRoles();
          this.selectedRole = null;
        },
        error: (error) => {
          console.error('Error deleting role:', error);
          this.toastr.error(`${error.error.message}`);
        }
      });
  }

  applyFilters(): void {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      this.roles = [...this.unfilteredRoles];
      return;
    }

    const query = this.searchQuery.toLowerCase().trim();
    this.roles = this.unfilteredRoles.filter(role =>
      role.name.toLowerCase().includes(query) ||
      role.description?.toLowerCase().includes(query) ||
      role.key.toLowerCase().includes(query)
    );
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

  private hideOverlay(): void {
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());
    document.body.classList.remove('modal-open');
  }

}
