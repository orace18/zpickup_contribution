import { CoursesComponent } from './features/dashboard/pages/courses/courses.component';
import { GainsComponent } from './features/dashboard/pages/gains/gains.component';
import { Routes } from '@angular/router';
import {MainLayoutComponent} from '../core/layouts/main-layout/main-layout.component';
import {authGuard} from '../core/services/auth.guard';
import {PermissionDeniedComponent} from './permission-denied/permission-denied.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/dashboard/pages/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/dashboard/pages/register/register.component')
      .then(m => m.RegisterComponent)
  },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/pages/home/home.component')
          .then(m => m.HomeComponent),
      },
      {
        path: 'cartes',
        loadComponent: () => import('./features/dashboard/pages/cartes/cartes.component')
          .then(m => m.CartesComponent),
        data: { permission: 'view_cartes' }
      },
      {
        path: 'users',
        loadComponent: () => import('./features/dashboard/pages/users/users.component')
          .then(m => m.UsersComponent),
        data: { permission: 'view_users' }
      },
      {
        path: 'tickets',
        loadComponent: () => import('./features/dashboard/pages/tickets/tickets.component')
          .then(m => m.TicketsComponent),
        data: { permission: 'view_tickets' }
      },
      {
        path: 'chats',
        loadComponent: () => import('./features/dashboard/pages/chats/chats.component')
          .then(m => m.ChatsComponent),
        data: { permission: 'manage_chats' }
      },
      {
        path: 'finance',
        data: { permission: 'view_finances' },
        children: [
          {
            path: 'gains',
            loadComponent: () => import('./features/dashboard/pages/gains/gains.component')
              .then(m => m.GainsComponent),
            data: { permission: 'view_gains' }
          },
          {
            path: 'courses',
            loadComponent: () => import('./features/dashboard/pages/courses/courses.component')
              .then(m => m.CoursesComponent),
            data: { permission: 'view_courses' }
          }
        ]
      },
      {
        path: 'assureurs',
        loadComponent: () => import('./features/dashboard/pages/assureurs/assureurs.component')
          .then(m => m.AssureursComponent),
        data: { permission: 'view_assureurs' }
      },
      {
        path: 'statistics',
        loadComponent: () => import('./features/dashboard/pages/statistics/statistics.component')
          .then(m => m.StatisticsComponent),
        data: { permission: 'view_statistics' }
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/dashboard/pages/settings/settings.component')
          .then(m => m.SettingsComponent),
        data: { permission: 'manage_settings' }
      },
      {
        path: 'roles',
        loadComponent: () => import('./features/dashboard/pages/roles/roles.component')
          .then(m => m.RolesComponent),
        data: { permission: 'manage_roles' }
      },
      {
        path: 'faqs',
        loadComponent: () => import('./features/dashboard/pages/faqs/faqs.component')
          .then(m => m.FaqsComponent),
        data: { permission: 'manage_faqs' }
      },
      {
        path: 'parametre',
        data: { permission: 'manage_settings' },
        children: [
          {
            path: 'politique',
            loadComponent: () => import('./features/dashboard/pages/cgus/private_polity.component')
              .then(m => m.CgusComponent),
            data: { permission: 'view_policy' }
          },
          {
            path: 'configs',
            loadComponent: () => import('./features/dashboard/pages/configs/configs.component')
              .then(m => m.ConfigsComponent),
            data: { permission: 'view_configs' }
          }
          ,
          {
            path: 'cgus',
            loadComponent: () => import('./features/dashboard/pages/terms_condition/terms_condition.component')
              .then(m => m.ConfidentialiteComponent),
            data: { permission: 'view_cgu' }
          }
        ]
      },
      { path: 'access-denied', component: PermissionDeniedComponent },
    ]
  },
  {
    path: '**',
    redirectTo: ''
  },
];
