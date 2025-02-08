import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'data-bs-theme';
  defaultThemeMode = 'light';

  constructor() {
    this.initTheme();
  }

  private initTheme() {
    let themeMode = this.getTheme();
    this.setTheme(themeMode as 'light' | 'dark' | 'system');
  }

  setTheme(theme: 'light' | 'dark' | 'system') {
    let effectiveTheme = theme;

    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    localStorage.setItem(this.THEME_KEY, theme);
    document.documentElement.setAttribute('data-bs-theme', effectiveTheme);
    document.documentElement.setAttribute('data-theme', effectiveTheme);
  }

  getTheme(): string {
    if (document.documentElement.hasAttribute('data-bs-theme-mode')) {
      return document.documentElement.getAttribute('data-bs-theme-mode') || this.defaultThemeMode;
    }
    
    return localStorage.getItem(this.THEME_KEY) || this.defaultThemeMode;
  }
}