import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { StorageService } from '../services/storage';

export const userGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const storageService = inject(StorageService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  const user = storageService.getUser();
  const role = user?.role || 'user';

  // Allow only 'user' role
  if (role === 'user') {
    return true;
  }

  // Redirect business owners to their dashboard
  if (role === 'business_owner') {
    router.navigate(['/business/dashboard']);
    return false;
  }

  // Redirect admins to admin panel
  if (role === 'admin') {
    router.navigate(['/admin/dashboard']);
    return false;
  }

  router.navigate(['/']);
  return false;
};

export const businessGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const storageService = inject(StorageService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  const user = storageService.getUser();
  const role = user?.role || 'user';

  // Allow only 'business_owner' role
  if (role === 'business_owner') {
    return true;
  }

  // Redirect regular users to their dashboard
  if (role === 'user') {
    router.navigate(['/user/dashboard']);
    return false;
  }

  // Redirect admins to admin panel
  if (role === 'admin') {
    router.navigate(['/admin/dashboard']);
    return false;
  }

  router.navigate(['/']);
  return false;
};
