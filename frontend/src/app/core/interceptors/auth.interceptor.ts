import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);
  const token = storageService.getToken();

  // Log requests to admin endpoints
  if (req.url.includes('/admin/')) {
    console.log('🔐 Auth Interceptor - Request to:', req.url);
    console.log('🔑 Token from storage:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
  }

  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (req.url.includes('/admin/')) {
      console.log('✅ Authorization header added to request');
    }
    
    return next(clonedRequest);
  }

  if (req.url.includes('/admin/')) {
    console.warn('⚠️ NO TOKEN - Request will fail authentication');
  }

  return next(req);
};
