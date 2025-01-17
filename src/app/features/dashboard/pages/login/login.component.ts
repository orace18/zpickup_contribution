import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { finalize } from 'rxjs/operators';
import {AuthService} from '../../../../../core/services/auth.service';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [ReactiveFormsModule, CommonModule],
  standalone: true
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isSubmitting = false;
  formError = '';
  returnUrl: string = '/dashboard';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    protected toast: ToastrService,
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email_address: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });
      this.formError = 'Please check your inputs';
      return;
    }

    this.isSubmitting = true;
    this.formError = '';

    console.log('Form values:', this.loginForm.value);

    this.authService.login(this.loginForm.value)
      .pipe(
        finalize(() => {
          console.log('Login process finished');
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Login successful, about to navigate to:', this.returnUrl);
          this.router.navigate([this.returnUrl]);
          this.toast.success('Utilisateur connecté!')
        },
        error: (error) => {
          console.log('Login failed with error:', error);
          this.formError = error.error?.message || 'Login failed';
        }
      });
  }

  showError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }
}
