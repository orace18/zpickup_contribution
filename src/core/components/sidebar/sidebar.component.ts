/* import {Component, OnInit} from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { RouterLink, Router, RouterLinkActive } from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {MENU_CONFIG} from './sidebar.config';
import {AuthResponse} from '../../models/datatype.model';
import {filter} from 'rxjs';
import {map} from 'rxjs/operators';
import {CommonModule} from '@angular/common';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink,
    RouterLinkActive,
    CommonModule
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
  userId = "";

  constructor(
    private router: Router,
    protected authService: AuthService,
    protected toast : ToastrService
  ) {}



  ngOnInit() {
    this.authService.currentUser$.pipe(
      filter(user => !!user),
      map(auth => {
       // console.log('Current auth in sidebar:', auth);
        const userPermissions = auth.user?.role?.permissions || [];
        console.log('User permissions:', userPermissions);
        this.userId = auth.user?._id;

        const filteredItems = MENU_CONFIG.menuItems.filter(item => {
          const hasPermission = !item.permission || userPermissions.includes(item.permission);
          console.log(`Menu item ${item.title}: permission=${item.permission}, has permission=${hasPermission}`);
          return hasPermission;
        });

        return filteredItems;
      })
    ).subscribe(filteredItems => {
      console.log('Final filtered items:', filteredItems);
      this.menuItems = filteredItems;
    });
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }


  isRouteActive(route: string): boolean {
    return this.router.url === route;
  }

  deconnexion(): void {
    this.authService.logout(this.userId).subscribe({
      next: () => {
        // Nettoyage du localStorage
        localStorage.clear();

        // Redirection vers la page de login
        this.router.navigate(['/login']);
        this.toast.success('Déconnexion avec succès!');
      },
      error: (err) => {
        console.error('Échec de la déconnexion:', err);
        localStorage.clear();
        this.toast.error('Échec de la déconnexion');
       // this.router.navigate(['/login']);
      }
    });
  }
}
 */

import { Component, OnInit } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { RouterLink, Router, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MENU_CONFIG } from './sidebar.config';
import { AuthResponse } from '../../models/datatype.model';
import { filter, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { PermissionService } from '../../services/permission.service';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink,
    RouterLinkActive,
    CommonModule
  ],
  templateUrl: './sidebar.component.html',
  standalone: true,
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  isDarkMode = false;
  isCollapsed = false;
  isDashboardExpanded = true;
  menuItems: any[] = [];
  userId = "";

  constructor(
    private router: Router,
    protected authService: AuthService,
    protected toast: ToastrService,
    private permissionService: PermissionService
  ) {}

  ngOnInit() {
    // Combine the user data with permission conversion
    this.authService.currentUser$.pipe(
      filter(user => !!user),
      switchMap(auth => {
        const userPermissions = auth.user?.role?.permissions || [];
        this.userId = auth.user?._id;
        
        // Convert permission IDs to keys
        return this.permissionService.getPermissionKeys(userPermissions).pipe(
          map(permissionKeys => {
            console.log('Converted permission keys:', permissionKeys);
            
            const filteredItems = MENU_CONFIG.menuItems.filter(item => {
              const hasPermission = !item.permission || permissionKeys.includes(item.permission);
              console.log(`Menu item ${item.title}: permission=${item.permission}, has permission=${hasPermission}`);
              return hasPermission;
            });
            
            return filteredItems;
          })
        );
      })
    ).subscribe({
      next: (filteredItems) => {
        console.log('Final filtered items:', filteredItems);
        this.menuItems = filteredItems;
      },
      error: (error) => {
        console.error('Error loading menu items:', error);
        this.toast.error('Erreur lors du chargement du menu');
      }
    });
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  isRouteActive(route: string): boolean {
    return this.router.url === route;
  }

  deconnexion(): void {
    this.authService.logout(this.userId).subscribe({
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