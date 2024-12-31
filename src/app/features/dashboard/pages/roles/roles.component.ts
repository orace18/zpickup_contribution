import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {PermissionsResponse} from './models/permission.model';
import {PermissionsService} from './services/permission.service';
import {RoleService} from './services/role.service';
import {ToastrModule, ToastrService} from 'ngx-toastr';


@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,ToastrModule],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {

  roleForm!: FormGroup;
  permissionGroups: PermissionsResponse = {};
  loading = true;
  showSuccessDialog = false;

  constructor(
    private fb: FormBuilder,
    private permissionsService: PermissionsService,
    private roleService: RoleService,
    private toastr: ToastrService
  ) {
    // Initialize the form here
    this.roleForm = this.fb.group({
      key: ['', Validators.required],
      name: ['', Validators.required],
      description: [''],
      permissions: this.fb.group({})
    });
  }

  ngOnInit() {
    this.loadPermissions();
  }


  private loadPermissions() {
    this.permissionsService.getAllPermissions().subscribe({
      next: (response) => {
        this.permissionGroups = response;
        this.initForm();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des permissions:', error);
        this.loading = false;
      }
    });
  }

  private initForm() {
    const permissionsGroup = this.fb.group({});

    // Créer les contrôles de formulaire basés sur les permissions reçues
    Object.entries(this.permissionGroups).forEach(([groupName, permissions]) => {
      const permissionControls: { [key: string]: boolean } = {
        enabled: false
      };

      permissions.forEach(permission => {
        permissionControls[permission.key] = false;
      });

      permissionsGroup.addControl(
        groupName,
        this.fb.group(permissionControls)
      );
    });

    this.roleForm = this.fb.group({
      name: [''],
      description: [''],
      permissions: permissionsGroup
    });
  }

  updateChildControls(groupName: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const group = this.roleForm.get(`permissions.${groupName}`);

    if (group && group instanceof FormGroup) {
      Object.keys(group.controls).forEach(key => {
        if (key !== 'enabled') {
          const control = group.get(key);
          if (control) {
            control.setValue(checked, { emitEvent: false });
          }
        }
      });
    }
  }

  /*onSubmit() {
    if (this.roleForm.valid) {
      const formValue = this.roleForm.value;
      const selectedPermissions: string[] = [];

      // Extraire les permissions sélectionnées (on utilise les keys)
      Object.entries(formValue.permissions || {}).forEach(([groupName, group]) => {
        if (group && typeof group === 'object') {
          Object.entries(group as Record<string, unknown>).forEach(([permKey, value]) => {
            if (permKey !== 'enabled' && value === true) {
              selectedPermissions.push(permKey);
            }
          });
        }
      });

      const roleData = {
        name: formValue.name,
        description: formValue.description,
        permissions: selectedPermissions
      };

      console.log('Role à créer:', roleData);
      // Appel à votre API pour créer le rôle
    }
  }*/


  onSubmit() {
    if (this.roleForm.valid) {
      const formValue = this.roleForm.value;
      const selectedPermissions: string[] = [];

      // Debug log
      console.log('Form Value:', formValue);

      Object.entries(formValue.permissions || {}).forEach(([groupName, group]) => {
        if (group && typeof group === 'object') {
          Object.entries(group as Record<string, unknown>).forEach(([permKey, value]) => {
            if (permKey !== 'enabled' && value === true) {
              selectedPermissions.push(permKey);
            }
          });
        }
      });

      const roleData = {
        key: formValue.name.toLowerCase().replace(/\s+/g, '_'), // Génère une clé à partir du nom
        name: formValue.name,
        description: formValue.description,
        permissions: selectedPermissions
      };

      // Debug log

      console.log('Données détaillées du rôle:', {
        name: roleData.name,
        description: roleData.description,
        permissions: roleData.permissions.map(p => ({
          key: p,
          type: typeof p
        }))
      });

      this.roleService.createRole(roleData).subscribe({
        next: (response) => {
          console.log('Rôle créé avec succès:', response);
          this.toastr.success('Le rôle a été créé avec succès!', 'Succès');
          this.roleForm.reset();
        },
        error: (error) => {
          // Log plus détaillé de l'erreur
          console.error('Erreur détaillée:', {
            status: error.status,
            message: error.message,
            error: error.error,
            url: error.url,
            body: roleData
          });

          this.toastr.error('Une erreur est survenue lors de la création du rôle', 'Erreur');
          console.error('Erreur détaillée:', error);
        }
      });
    }
  }
}
