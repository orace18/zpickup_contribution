import { Component, HostListener } from '@angular/core';
import { ModalComponent } from "../../../shared/layouts/modal/modal.component";
import { ModalThemeComponent } from "../../../shared/layouts/modal-theme/modal-theme.component";

@Component({
  selector: 'app-header',
  imports: [ModalComponent, ModalThemeComponent],
  templateUrl: './header.component.html',
  standalone: true,
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  isOpen = false;

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  // Fermer le menu quand on clique en dehors
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!(event.target as Element).closest('#kt_header_user_menu_toggle')) {
      this.isOpen = false;
    }
  }
}
