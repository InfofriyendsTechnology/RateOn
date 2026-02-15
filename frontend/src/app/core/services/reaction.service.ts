import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Reaction {
  _id: string;
  reviewId: string;
  userId: string;
  type: 'helpful' | 'not_helpful';
  createdAt: string;
  updatedAt: string;
}

export interface ReactionStats {
  helpful: number;
  notHelpful: number;
  total: number;
}

export interface ToggleReactionResponse {
  success: boolean;
  message: string;
  data: {
    action: 'added' | 'removed' | 'updated';
    reaction?: Reaction;
    reviewId?: string;
    stats: {
      helpful: number;
      notHelpful: number;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class ReactionService {
  private apiUrl = `${environment.apiUrl}/reactions`;
  private reactionUpdates$ = new Subject<{ reviewId: string; stats: ReactionStats }>();

  constructor(private http: HttpClient) {}

  /**
   * Toggle reaction on a review (add/remove/change)
   * @param reviewId - Review ID
   * @param type - Reaction type ('helpful' or 'not_helpful')
   */
  toggleReaction(reviewId: string, type: 'helpful' | 'not_helpful'): Observable<ToggleReactionResponse> {
    return this.http.post<ToggleReactionResponse>(`${this.apiUrl}/toggle`, { reviewId, type });
  }

  /**
   * Get all reactions by a specific user
   * @param userId - User ID
   * @param params - Optional query parameters (type, limit, skip)
   */
  getUserReactions(userId: string, params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get(`${this.apiUrl}/user/${userId}`, { params: httpParams });
  }

  /**
   * Get all reactions for a specific review
   * @param reviewId - Review ID
   * @param type - Optional: filter by reaction type
   */
  getReactionsByReview(reviewId: string, type?: 'helpful' | 'not_helpful'): Observable<any> {
    let httpParams = new HttpParams();
    if (type) {
      httpParams = httpParams.set('type', type);
    }
    return this.http.get(`${this.apiUrl}/review/${reviewId}`, { params: httpParams });
  }

  /**
   * Legacy method - Add reaction (use toggleReaction instead)
   * @deprecated Use toggleReaction() for better toggle behavior
   */
  addReaction(reviewId: string, type: 'helpful' | 'not_helpful'): Observable<any> {
    return this.http.post(this.apiUrl, { reviewId, type });
  }

  /**
   * Legacy method - Remove reaction (use toggleReaction instead)
   * @deprecated Use toggleReaction() for better toggle behavior
   */
  removeReaction(reviewId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/review/${reviewId}`);
  }

  /**
   * Subscribe to real-time reaction updates
   * Note: WebSocket integration would be implemented here
   */
  subscribeToReactionUpdates(): Observable<{ reviewId: string; stats: ReactionStats }> {
    return this.reactionUpdates$.asObservable();
  }

  /**
   * Emit reaction update (for internal use or WebSocket integration)
   */
  emitReactionUpdate(reviewId: string, stats: ReactionStats): void {
    this.reactionUpdates$.next({ reviewId, stats });
  }
}
