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

  // Authentication
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {});
  }

  // Analytics
  getUserAnalytics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics/users`);
  }

  getContentAnalytics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics/content`);
  }

  // New Analytics Endpoints (Employee 5)
  getUserStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/users`);
  }

  getReviewStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/reviews`);
  }

  getBusinessStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/businesses`);
  }

  getTopBusinesses(period: 'week' | 'month' = 'month'): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/businesses/top?period=${period}`);
  }

  getLocationData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/locations`);
  }

  getRealTimeMetrics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/realtime`);
  }

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

  loginAsUser(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/login-as`, {});
  }

  getUsers(params?: { page?: number; limit?: number; role?: string; search?: string; status?: string }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.role) httpParams = httpParams.set('role', params.role);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    return this.http.get(`${this.apiUrl}/users`, { params: httpParams });
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

  // Seed Data Management
  getSeedStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/seed/stats`);
  }

  createDummyData(): Observable<any> {
    return this.http.post(`${this.apiUrl}/seed/create`, {});
  }

  clearDummyData(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/seed/clear`);
  }

  getDummyAccounts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/seed/accounts`);
  }

  impersonateBusinessOwner(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/seed/impersonate/${userId}`, {});
  }

  // Settings — Weekly password
  getWeeklyPasswordInfo(): Observable<any> {
    return this.http.get(`${this.apiUrl}/settings/weekly-password`);
  }

  setWeeklyPassword(password?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/settings/weekly-password`, password ? { password } : {});
  }

  clearWeeklyPassword(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/settings/weekly-password`);
  }
}
