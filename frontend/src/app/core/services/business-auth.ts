import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api';
import { StorageService } from './storage';
import { BusinessRegisterRequest, BusinessAuthResponse } from '../models/business-auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BusinessAuthService {
  constructor(
    private api: ApiService,
    private storage: StorageService
  ) {}

  registerBusiness(data: BusinessRegisterRequest): Observable<BusinessAuthResponse> {
    return this.api.post<BusinessAuthResponse>('/auth/business/register', data).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.storage.saveToken(response.data.token);
          this.storage.saveUser(response.data);
        }
      })
    );
  }

  completeGoogleRegistration(data: any): Observable<BusinessAuthResponse> {
    return this.api.post<BusinessAuthResponse>('/auth/business/complete-registration', data).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.storage.saveToken(response.data.token);
          this.storage.saveUser(response.data);
        }
      })
    );
  }

  initiateGoogleAuth(): void {
    window.location.href = `${environment.apiUrl}/auth/business/google`;
  }
}
