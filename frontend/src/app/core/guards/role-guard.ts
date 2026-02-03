import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { StorageService } from '../services/storage';

// Business Owner Guard - Only allows business_owner role
export const businessOwnerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const storageService = inject(StorageService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  const user = storageService.getUser();
  const role = user?.role || 'user';

  if (role === 'business_owner') {
    return true;
  }

  // Redirect others to main home
  router.navigate(['/home']);
  return false;
};
