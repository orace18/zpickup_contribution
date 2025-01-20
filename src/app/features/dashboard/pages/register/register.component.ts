import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Role, RoleService } from './services/role.service';
import {SignupPayload} from './models/register.model';
import {RegisterService} from './services/register.service';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  signupForm!: FormGroup;
  roles: Role[] = [];
  selectedRoleDescription: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private router: Router,
    private registerService : RegisterService,
    private toast : ToastrService,
  ) {
    this.initForm();
  }

  private initForm(): void {
    this.signupForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email_address: ['', [Validators.required, Validators.email]],
      phone_number: ['', [Validators.required, Validators.pattern(/^\+229[0-9]{9}$/)]],
      address: ['', Validators.required],
      birthday: ['', Validators.required],
      role: ['', Validators.required],
      password: ['', Validators.required],
      password_confirmation: ['', Validators.required],
      toc: [false, Validators.requiredTrue]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('password_confirmation')?.value
      ? null
      : { mismatch: true };
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

  private preparePayload(): SignupPayload {
    const formValue = this.signupForm.value;
    const now = new Date().toISOString();

    return {
      phone_number: formValue.phone_number,
      password: formValue.password,
      address: formValue.address,
      email_address: formValue.email_address,
      firstname: formValue.firstname,
      lastname: formValue.lastname,
      birthday: this.formatDate(formValue.birthday),
      user_type: 'admin',
      role: formValue.role,
      created_at: now,
      updated_at: now
    };
  }

  private formatDate(date: string): string {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      Object.keys(this.signupForm.controls).forEach(key => {
        const control = this.signupForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    const payload = this.preparePayload();

    this.registerService.register(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/login']);
        this.toast.success(response.message);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Registration error:', error);
      }
    });

    console.log('Form payload:', payload);
  }

  // Getters pour la validation dans le template
  get phoneNumberControl() { return this.signupForm.get('phone_number'); }
  get passwordControl() { return this.signupForm.get('password'); }
  get passwordConfirmationControl() { return this.signupForm.get('password_confirmation'); }
  get addressControl() { return this.signupForm.get('address'); }
  get emailControl() { return this.signupForm.get('email_address'); }
  get birthdayControl() { return this.signupForm.get('birthday'); }
  get roleControl() { return this.signupForm.get('role'); }
  get firstNameControl() { return this.signupForm.get('firstname'); }
  get lastNameControl() { return this.signupForm.get('lastname'); }
  get tocControl() { return this.signupForm.get('toc'); }

  get passwordMismatch(): boolean {
    return Boolean(
      this.signupForm.hasError('mismatch') &&
      this.passwordControl?.touched &&
      this.passwordConfirmationControl?.touched
    );
  }
}
