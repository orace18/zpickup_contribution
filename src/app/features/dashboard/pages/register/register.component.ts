import {Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import {Role, RoleService} from './services/role.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit{
  signupForm: FormGroup;
  roles: Role[] = [];
  selectedRoleDescription: string = '';

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService
  ) {
    this.signupForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      roleId: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      toc: [false, Validators.requiredTrue]
    });
  }

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des rôles:', error);
        // Gérer l'erreur (afficher un message à l'utilisateur, etc.)
      }
    });
  }

  onRoleHover(event: MouseEvent) {
    const select = event.target as HTMLSelectElement;
    const selectedOption = select.options[select.selectedIndex];
    if (selectedOption) {
      this.selectedRoleDescription = selectedOption.getAttribute('data-description') || '';
    }
  }

  onRoleSelect(event: Event) {
    const select = event.target as HTMLSelectElement;
    const selectedOption = select.options[select.selectedIndex];
    if (selectedOption) {
      this.selectedRoleDescription = selectedOption.getAttribute('data-description') || '';
    }
  }

  onSubmit() {
    if (this.signupForm.valid) {
      // Logique de soumission du formulaire
      console.log(this.signupForm.value);
    }
  }
}
