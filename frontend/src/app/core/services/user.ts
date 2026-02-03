import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private storage: StorageService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.storage.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/profile`, {
      headers: this.getAuthHeaders()
    });
  }

  updateProfile(profileData: any, avatarFile?: File): Observable<any> {
    const formData = new FormData();
    
    // Add profile fields
    if (profileData.firstName) formData.append('firstName', profileData.firstName);
    if (profileData.lastName) formData.append('lastName', profileData.lastName);
    if (profileData.bio) formData.append('bio', profileData.bio);
    if (profileData.location) formData.append('location', profileData.location);
    if (profileData.phone) formData.append('phone', profileData.phone);
    
    // Add badges as JSON string
    if (profileData.badges && Array.isArray(profileData.badges)) {
      formData.append('badges', JSON.stringify(profileData.badges));
    }
    
    // Add avatar file if provided
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    // For FormData, only set Authorization header (browser sets Content-Type automatically)
    const token = this.storage.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put(`${this.apiUrl}/user/profile`, formData, { headers });
  }

  uploadAvatar(avatarFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    // For FormData, only set Authorization header
    const token = this.storage.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}/user/profile/avatar`, formData, { headers });
  }

  deleteProfile(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/user/profile`, {
      headers: this.getAuthHeaders()
    });
  }

  becomeBusinessOwner(): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/become-business-owner`, {}, {
      headers: this.getAuthHeaders()
    });
  }
}
