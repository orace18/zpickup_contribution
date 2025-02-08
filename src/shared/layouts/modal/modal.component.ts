import { Component, HostListener } from '@angular/core';
import { UserData } from './models/userdata.model';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {
  constructor(private authService: AuthService,
    private router: Router,
    private toast: ToastrService
  ) { }

  isOpen = false;
  userImage = '../assets/media/avatars/300-1.jpg';
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
     // console.log("Données utilisateur chargées:", this.userData);
    }
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
