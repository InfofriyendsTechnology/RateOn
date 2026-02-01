import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  
  saveToken(token: string): void {
    localStorage.setItem(environment.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(environment.tokenKey);
  }

  removeToken(): void {
    localStorage.removeItem(environment.tokenKey);
  }

  saveUser(user: any): void {
    localStorage.setItem(environment.userKey, JSON.stringify(user));
  }

  getUser(): any | null {
    const user = localStorage.getItem(environment.userKey);
    return user ? JSON.parse(user) : null;
  }

  removeUser(): void {
    localStorage.removeItem(environment.userKey);
  }

  clearAuth(): void {
    this.removeToken();
    this.removeUser();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
