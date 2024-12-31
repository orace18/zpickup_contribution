import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  console.log('AuthGuard checking authentication');
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuth = authService.isAuthenticated();
  console.log('Is authenticated?', isAuth);

  if (isAuth) {
    return true;
  }

  console.log('Not authenticated, redirecting to login');
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};
