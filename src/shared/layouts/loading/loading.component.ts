import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.css'
})
export class LoadingComponent {
  @Input() isOpen = false;
  @Input() isLoading = false;
  @Input() loadingText = 'Chargement en cours...';

  close() {
    this.isOpen = false;
  }
}
