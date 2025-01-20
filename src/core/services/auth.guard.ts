/*
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  //console.log('AuthGuard checking authentication and permissions');
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifier d'abord l'authentification
  const isAuth = authService.isAuthenticated();
  //console.log('Is authenticated?', isAuth);

  if (!isAuth) {
    //console.log('Not authenticated, redirecting to login');
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  // Vérifier ensuite les permissions si elles sont requises
  const requiredPermission = route.data['permission'];
  if (requiredPermission) {

    /!*console.log('Guard checking permission:', {
      requiredPermission,
      user: authService.getCurrentUser(),
      userPermissions: authService.getCurrentUser()?.user?.role?.permissions
    });*!/
    const hasPermission = authService.hasPermission(requiredPermission);


    //const hasPermission = authService.getCurrentUser()?.user?.role?.permissions?.includes(requiredPermission);
    //console.log(`Checking permission: ${requiredPermission}, Has permission: ${hasPermission}`);

    if (!hasPermission) {
     // console.log('Permission denied');
      router.navigate(['/access-denied']); // ou une autre route de fallback
      return false;
    }
  }

  if (requiredPermission) {

  }

  return true;
};
*/

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { PermissionService } from './permission.service';
import { Observable, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state): Observable<boolean> => {
  const authService = inject(AuthService);
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  // Vérification de l'authentification
  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return of(false);
  }

  const requiredPermission = route.data['permission'] as string;
  if (!requiredPermission) {
    return of(true);
  }

  const currentUser = authService.getCurrentUser();
  if (!currentUser?.permissions) {
    router.navigate(['/access-denied']);
    return of(false);
  }

  console.log('Les permissons du gar:',currentUser.permissions);

  // Convertir toutes les permissions (IDs ou clés) en clés
  const userPermissionKeys = permissionService.convertPermissionsToKeys(currentUser.permissions);

  // Vérifier si l'utilisateur a la permission requise
  const hasPermission = userPermissionKeys.includes(requiredPermission);
 // userPermissionsed: authService.getCurrentUser()?.user?.role?.permissions;

  if (!hasPermission) {
    router.navigate(['/access-denied']);
    return of(false);
  }

  return of(true);
};
