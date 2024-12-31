import {Component, OnInit} from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { RouterLink, Router, RouterLinkActive } from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {MENU_CONFIG} from './sidebar.config';
import {AuthResponse} from '../../models/datatype.model';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  animations: [
    trigger('submenuAnimation', [
      state('collapsed', style({
        height: '0',
        overflow: 'hidden'
      })),
      state('expanded', style({
        height: '*'
      })),
      transition('collapsed <=> expanded', [
        animate('300ms ease-in-out')
      ])
    ])
  ],
  templateUrl: './sidebar.component.html',
  standalone: true,
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit{
  isDarkMode = false;
  isCollapsed = false;
  isDashboardExpanded = true;
  menuItems: any[] = [];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const authData = localStorage.getItem('access_token');
    if (authData) {
      const auth: AuthResponse = JSON.parse(authData);
      const userPermissions = auth.user?.role?.permissions || [];

      this.menuItems = MENU_CONFIG.dashboard.items.filter(item =>
        userPermissions.includes(item.permission)
      );
    }
  }

  toggleDashboard() {
    this.isDashboardExpanded = !this.isDashboardExpanded;
  }

  isRouteActive(route: string): boolean {
    return this.router.url === route;
  }

  deconnexion(): void {
    this.authService.logout().subscribe({
      error: (err) => {
        console.error('Échec de la déconnexion:', err);
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    });
  }
}
