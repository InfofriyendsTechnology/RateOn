import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PlatformStats {
  totalUsers: number;
  totalBusinesses: number;
  totalItems: number;
  totalReviews: number;
  totalReports: number;
  activeUsers: number;
  newUsersToday: number;
  newReviewsToday: number;
  pendingReports: number;
  averageTrustScore: number;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  trustScore: number;
  level: number;
  totalReviews: number;
  status: 'active' | 'suspended' | 'banned';
  suspendedUntil?: string;
  createdAt: string;
  lastActive?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // Platform Statistics
  getPlatformStats(): Observable<{ stats: PlatformStats }> {
    return this.http.get<{ stats: PlatformStats }>(`${this.apiUrl}/stats`);
  }

  // User Management
  getAllUsers(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sortBy?: string;
  }): Observable<{ users: AdminUser[]; total: number }> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    }

    return this.http.get<{ users: AdminUser[]; total: number }>(`${this.apiUrl}/users`, { params: httpParams });
  }

  suspendUser(userId: string, data: {
    duration: number;
    reason: string;
  }): Observable<{ user: AdminUser }> {
    return this.http.put<{ user: AdminUser }>(`${this.apiUrl}/users/${userId}/suspend`, data);
  }

  unsuspendUser(userId: string): Observable<{ user: AdminUser }> {
    return this.http.put<{ user: AdminUser }>(`${this.apiUrl}/users/${userId}/unsuspend`, {});
  }

  banUser(userId: string, data: {
    reason: string;
  }): Observable<{ user: AdminUser }> {
    return this.http.put<{ user: AdminUser }>(`${this.apiUrl}/users/${userId}/ban`, data);
  }

  unbanUser(userId: string): Observable<{ user: AdminUser }> {
    return this.http.put<{ user: AdminUser }>(`${this.apiUrl}/users/${userId}/unban`, {});
  }

  // Business Management (optional - for future)
  deleteBusinessPermanently(businessId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/businesses/${businessId}`);
  }

  // Review Management (optional - for future)
  deleteReviewPermanently(reviewId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reviews/${reviewId}`);
  }
}
