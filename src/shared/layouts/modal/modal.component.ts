// modal.component.ts
import { Component, HostListener } from '@angular/core';
import { UserData } from './models/userdata.model';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toast: ToastrService
  ) { }

  isOpen = false;
  userData: UserData | null = null;

  ngOnInit() {
    this.getCurrentUser();
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  getCurrentUser() {
    const userString = localStorage.getItem('currentUser');
    if (userString) {
      this.userData = JSON.parse(userString);
    }
  }

  getInitials(): string {
    if (!this.userData?.user) return '';
    const firstname = this.userData.user.firstname || '';
    const lastname = this.userData.user.lastname || '';
    return `${firstname[0] || ''}${lastname[0] || ''}`.toUpperCase();
  }

  getInitialsBackground(): string {
    // Générer une couleur aléatoire mais cohérente pour un utilisateur
    const str = this.userData?.user?._id || '';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`; // Utilise HSL pour une couleur vibrante
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!(event.target as Element).closest('.position-relative')) {
      this.isOpen = false;
    }
  }

  deconnexion(): void {
    this.authService.logout(this.userData?.user._id).subscribe({
      next: () => {
        localStorage.clear();
        this.router.navigate(['/login']);
        this.toast.success('Déconnexion avec succès!');
      },
      error: (err) => {
        console.error('Échec de la déconnexion:', err);
        localStorage.clear();
        this.toast.error('Échec de la déconnexion');
      }
    });
  }
}