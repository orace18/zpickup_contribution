import { Routes } from '@angular/router';
import {MainLayoutComponent} from '../core/layouts/main-layout/main-layout.component';
import {authGuard} from '../core/services/auth.guard';

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
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/pages/home/home.component')
          .then(m => m.HomeComponent)
      },
      {
        path: 'cartes',
        loadComponent: () => import('./features/dashboard/pages/cartes/cartes.component')
          .then(m => m.CartesComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/dashboard/pages/users/users.component')
          .then(m => m.UsersComponent)
      },
      {
        path: 'tickets',
        loadComponent: () => import('./features/dashboard/pages/tickets/tickets.component')
          .then(m => m.TicketsComponent)
      },
      {
        path: 'chats',
        loadComponent: () => import('./features/dashboard/pages/chats/chats.component')
          .then(m => m.ChatsComponent)
      },
      {
        path: 'assureurs',
        loadComponent: () => import('./features/dashboard/pages/assureurs/assureurs.component')
          .then(m => m.AssureursComponent)
      },
      {
        path: 'statistics',
        loadComponent: () => import('./features/dashboard/pages/statistics/statistics.component')
          .then(m => m.StatisticsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/dashboard/pages/settings/settings.component')
          .then(m => m.SettingsComponent)
      },
      {
        path: 'roles',
        loadComponent: () => import('./features/dashboard/pages/roles/roles.component')
          .then(m => m.RolesComponent)
      },
      {
        path: 'logistics',
        loadComponent: () => import('./features/dashboard/pages/logistic/logistic.component')
          .then(m => m.LogisticComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./features/dashboard/pages/analytic/analytic.component')
          .then(m => m.AnalyticComponent)
      },
      {
        path: 'projects',
        loadComponent: () => import('./features/dashboard/pages/project/project.component')
          .then(m => m.ProjectComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
