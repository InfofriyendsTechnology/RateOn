import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LeaderboardUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  trustScore: number;
  level: number;
  totalReviews: number;
  totalPoints: number;
  rank?: number;
}

export interface LeaderboardResponse {
  users: LeaderboardUser[];
  currentUserRank?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private apiUrl = `${environment.apiUrl}/leaderboard`;

  constructor(private http: HttpClient) {}

  getTopReviewers(params?: {
    limit?: number;
    page?: number;
  }): Observable<LeaderboardResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
    }

    return this.http.get<LeaderboardResponse>(`${this.apiUrl}/top-reviewers`, { params: httpParams });
  }

  getMostActiveUsers(params?: {
    limit?: number;
    page?: number;
    timeframe?: 'week' | 'month' | 'year' | 'all';
  }): Observable<LeaderboardResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.timeframe) httpParams = httpParams.set('timeframe', params.timeframe);
    }

    return this.http.get<LeaderboardResponse>(`${this.apiUrl}/most-active`, { params: httpParams });
  }

  getTopContributorsByCategory(category: string, params?: {
    limit?: number;
    page?: number;
  }): Observable<LeaderboardResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
    }

    return this.http.get<LeaderboardResponse>(`${this.apiUrl}/category/${category}`, { params: httpParams });
  }
}
