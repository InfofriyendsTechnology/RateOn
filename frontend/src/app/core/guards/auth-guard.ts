import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../services/storage';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const storage = inject(StorageService);
  const authService = inject(AuthService);
  const router = inject(Router);

  // Use token check (same as navbar) as primary check,
  // with AuthService BehaviorSubject as fallback.
  // This prevents mismatch where navbar shows the link but guard blocks.
  if (storage.isAuthenticated() || authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
