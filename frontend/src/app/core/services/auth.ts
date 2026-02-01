import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api';
import { StorageService } from './storage';
import { User } from '../models/user.model';
import { LoginRequest, RegisterRequest, AuthResponse, LogoutResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private api: ApiService,
    private storage: StorageService
  ) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const user = this.storage.getUser();
    const token = this.storage.getToken();
    
    if (user && token) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', credentials).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Clear any existing auth data first
          this.storage.clearAuth();
          // Save new auth data
          this.storage.saveToken(response.data.token);
          this.storage.saveUser(response.data.user);
          this.currentUserSubject.next(response.data.user);
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/register', data).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.storage.saveToken(response.data.token);
          this.storage.saveUser(response.data.user);
          this.currentUserSubject.next(response.data.user);
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  logout(): Observable<LogoutResponse> {
    return this.api.post<LogoutResponse>('/auth/logout', {}).pipe(
      tap(() => {
        this.storage.clearAuth();
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
      })
    );
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  updateCurrentUser(user: User): void {
    this.storage.saveUser(user);
    this.currentUserSubject.next(user);
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}
