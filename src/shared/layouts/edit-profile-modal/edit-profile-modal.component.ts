import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../app/features/dashboard/pages/home/services/home.service';

@Component({
  selector: 'app-edit-profile-modal',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './edit-profile-modal.component.html',
  styleUrl: './edit-profile-modal.component.css'
})
export class EditProfileModalComponent implements OnInit{

  isModalOpen = false;
  currentStep = 1; // 1: Email, 2: Verification Code, 3: Password
  profileForm!: FormGroup;
  verificationForm!: FormGroup;
  passwordForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
     private userService: UserService
  ) { }

  ngOnInit(): void {
    this.initForms();
  }

  initForms(): void {
    this.profileForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.verificationForm = this.fb.group({
      verificationCode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });

    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.checkPasswords });
  }

  checkPasswords(group: FormGroup) {
    const password = group.get('password')!.value;
    const confirmPassword = group.get('confirmPassword')!.value;
    return password === confirmPassword ? null : { notMatching: true };
  }

  openModal(): void {
    this.isModalOpen = true;
    this.currentStep = 1;
    this.resetForms();
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForms();
  }

  resetForms(): void {
    this.profileForm.reset();
    this.verificationForm.reset();
    this.passwordForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }

  submitEmail(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const email = this.profileForm.get('email')!.value;

    console.log('Email:', email);

    // Appel API pour envoyer le code de vérification
    this.userService.sendVerificationCode(email).subscribe(
      () => {
        this.isLoading = false;
        this.currentStep = 2;
        console.log('Code de vérification envoyé à:', email);
      },
      (error) => {
        console.error('Erreur lors de l\'envoi du code de vérification:', error);
        this.isLoading = false;
        this.errorMessage = 'Erreur lors de l\'envoi du code de vérification.';
      }
    );

    // Pour la démonstration, on passe directement à l'étape suivante
    setTimeout(() => {
      this.isLoading = false;
      this.currentStep = 2;
    }, 1000);
  }

  verifyCode(): void {
    if (this.verificationForm.invalid) {
      this.verificationForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const code = this.verificationForm.get('verificationCode')!.value;
    const email = this.profileForm.get('email')!.value;
    console.log('Code de vérification:', code);
    console.log('Email:', email);

    // Appel API pour vérifier le code
    this.userService.verifyCode(email, code).subscribe(
      () => {
        this.isLoading = false;
        this.currentStep = 3;
      },
      (error) => {
        this.isLoading = false;
        this.errorMessage = 'Code de vérification incorrect.';
      }
    );

    // Pour la démonstration, on passe directement à l'étape suivante
   /*  setTimeout(() => {
      this.isLoading = false;
      this.currentStep = 3;
    }, 1000); */
  }

  updatePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const email = this.profileForm.get('email')!.value;
    const password = this.passwordForm.get('password')!.value;
    const code = this.verificationForm.get('verificationCode')!.value;

    // Appel API pour mettre à jour le mot de passe
    this.userService.updatePassword(email,code ,password).subscribe(
      () => {
        this.isLoading = false;
        this.successMessage = 'Mot de passe mis à jour avec succès.';
        setTimeout(() => {
          this.closeModal();
        }, 2000);
      },
      (error) => {
        console.error('Erreur lors de la mise à jour du mot de passe:', error);
        this.isLoading = false;
        this.errorMessage = 'Erreur lors de la mise à jour du mot de passe.';
      }
    );

    // Pour la démonstration
   /*  setTimeout(() => {
      this.isLoading = false;
      this.successMessage = 'Mot de passe mis à jour avec succès.';
      setTimeout(() => {
        this.closeModal();
      }, 2000);
    }, 1000); */
  }

  // Helper pour vérifier si un champ est invalide et a été touché
  isFieldInvalid(formGroup: FormGroup, controlName: string): boolean {
    const control = formGroup.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

}
