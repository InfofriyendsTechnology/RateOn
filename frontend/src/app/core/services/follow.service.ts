import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FollowUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  trustScore: number;
  level: number;
}

export interface FollowResponse {
  followers: FollowUser[];
  following: FollowUser[];
  followersCount: number;
  followingCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class FollowService {
  private apiUrl = `${environment.apiUrl}/follow`;

  constructor(private http: HttpClient) {}

  followUser(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}`, {});
  }

  unfollowUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`);
  }

  getFollowers(userId: string): Observable<FollowResponse> {
    return this.http.get<FollowResponse>(`${this.apiUrl}/followers/${userId}`);
  }

  getFollowing(userId: string): Observable<FollowResponse> {
    return this.http.get<FollowResponse>(`${this.apiUrl}/following/${userId}`);
  }

  checkFollowStatus(userId: string): Observable<{ isFollowing: boolean }> {
    return this.http.get<{ isFollowing: boolean }>(`${this.apiUrl}/status/${userId}`);
  }
}
