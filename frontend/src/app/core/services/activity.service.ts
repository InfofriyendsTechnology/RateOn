import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Activity {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
    trustScore: number;
    level: number;
  };
  activityType: 'review' | 'reaction' | 'follow' | 'reply' | 'business_claimed' | 'item_added';
  points: number;
  metadata?: {
    reviewId?: string;
    businessId?: string;
    itemId?: string;
    targetUserId?: string;
  };
  createdAt: string;
}

export interface ActivityResponse {
  activities: Activity[];
  stats: {
    totalActivities: number;
    totalPoints: number;
    activitiesByType: {
      review: number;
      reaction: number;
      follow: number;
      reply: number;
      business_claimed: number;
      item_added: number;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private apiUrl = `${environment.apiUrl}/activity`;

  constructor(private http: HttpClient) {}

  getUserActivity(userId: string, params?: {
    page?: number;
    limit?: number;
    activityType?: string;
  }): Observable<ActivityResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.activityType) httpParams = httpParams.set('activityType', params.activityType);
    }

    return this.http.get<ActivityResponse>(`${this.apiUrl}/user/${userId}`, { params: httpParams });
  }

  getFollowingActivity(params?: {
    page?: number;
    limit?: number;
  }): Observable<{ activities: Activity[] }> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    }

    return this.http.get<{ activities: Activity[] }>(`${this.apiUrl}/feed`, { params: httpParams });
  }
}
