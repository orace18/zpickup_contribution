import { Component } from '@angular/core';
import { ThemeService } from '../../functions/theme.function';

@Component({
  selector: 'app-modal-theme',
  templateUrl: './modal-theme.component.html',
  styleUrls: ['./modal-theme.component.css']
})
export class ModalThemeComponent {
  isMenuOpen = false;
  currentTheme: string;

  constructor(private themeService: ThemeService) {
    this.currentTheme = this.themeService.getTheme();
  }

  toggleMenu(event: Event) {
    event.preventDefault();
    this.isMenuOpen = !this.isMenuOpen;
  }

  setTheme(event: Event, theme: 'light' | 'dark' | 'system') {
    event.preventDefault();
    this.themeService.setTheme(theme);
    this.currentTheme = theme;
    this.isMenuOpen = false;
  }
}