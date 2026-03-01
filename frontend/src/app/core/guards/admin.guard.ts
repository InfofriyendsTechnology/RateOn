import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../services/storage';

// Admin Guard - Only allows super_admin role
export const adminGuard: CanActivateFn = (route, state) => {
  const storageService = inject(StorageService);
  const router = inject(Router);

  // Use localStorage directly — reliable across both first login and page refresh
  const token = storageService.getToken();
  if (!token) {
    router.navigate(['/admin/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  const user = storageService.getUser();
  const role = user?.role || 'user';

  if (role === 'admin' || role === 'super_admin') {
    return true;
  }

  // Redirect non-admins to home
  router.navigate(['/home']);
  return false;
};
