import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Reply {
  _id: string;
  reviewId: string;
  userId: {
    _id: string;
    username: string;
    profile: {
      firstName?: string;
      lastName?: string;
      avatar?: string;
    };
  };
  parentReplyId?: string | null;
  comment: string;
  isEdited: boolean;
  editedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  children?: Reply[]; // For threaded structure
}

export interface ReplyPagination {
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}

export interface CreateReplyRequest {
  reviewId: string;
  comment: string;
  parentReplyId?: string;
}

export interface UpdateReplyRequest {
  comment: string;
}

export interface CreateReplyResponse {
  success: boolean;
  message: string;
  data: Reply;
}

export interface GetRepliesResponse {
  success: boolean;
  message: string;
  data: {
    replies: Reply[];
    pagination: ReplyPagination;
  };
}

export interface UpdateReplyResponse {
  success: boolean;
  message: string;
  data: Reply;
}

export interface DeleteReplyResponse {
  success: boolean;
  message: string;
  data: null;
}

@Injectable({
  providedIn: 'root'
})
export class ReplyService {
  private apiUrl = `${environment.apiUrl}/replies`;
  private replyUpdates$ = new Subject<{ reviewId: string; reply: Reply; action: 'created' | 'updated' | 'deleted' }>();

  constructor(private http: HttpClient) {}

  /**
   * Create a new reply to a review or another reply
   * @param data - Reply creation data
   */
  createReply(data: CreateReplyRequest): Observable<CreateReplyResponse> {
    return this.http.post<CreateReplyResponse>(this.apiUrl, data);
  }

  /**
   * Get all replies for a specific review (with threaded structure)
   * @param reviewId - Review ID
   * @param limit - Number of replies to fetch (default: 50)
   * @param skip - Number of replies to skip for pagination (default: 0)
   */
  getRepliesByReview(reviewId: string, limit: number = 50, skip: number = 0): Observable<GetRepliesResponse> {
    let httpParams = new HttpParams()
      .set('limit', limit.toString())
      .set('skip', skip.toString());

    return this.http.get<GetRepliesResponse>(`${this.apiUrl}/review/${reviewId}`, { params: httpParams });
  }

  /**
   * Update a reply (owner only)
   * @param replyId - Reply ID
   * @param data - Update data
   */
  updateReply(replyId: string, data: UpdateReplyRequest): Observable<UpdateReplyResponse> {
    return this.http.put<UpdateReplyResponse>(`${this.apiUrl}/${replyId}`, data);
  }

  /**
   * Delete a reply (owner only, soft delete)
   * @param replyId - Reply ID
   */
  deleteReply(replyId: string): Observable<DeleteReplyResponse> {
    return this.http.delete<DeleteReplyResponse>(`${this.apiUrl}/${replyId}`);
  }

  /**
   * Subscribe to real-time reply updates
   * Note: Can be integrated with WebSocket for real-time updates
   */
  subscribeToReplyUpdates(): Observable<{ reviewId: string; reply: Reply; action: 'created' | 'updated' | 'deleted' }> {
    return this.replyUpdates$.asObservable();
  }

  /**
   * Emit reply update (for internal use or WebSocket integration)
   */
  emitReplyUpdate(reviewId: string, reply: Reply, action: 'created' | 'updated' | 'deleted'): void {
    this.replyUpdates$.next({ reviewId, reply, action });
  }

  /**
   * Helper: Count total replies in a threaded structure
   * @param replies - Array of replies with children
   */
  countTotalReplies(replies: Reply[]): number {
    let count = replies.length;
    replies.forEach(reply => {
      if (reply.children && reply.children.length > 0) {
        count += this.countTotalReplies(reply.children);
      }
    });
    return count;
  }

  /**
   * Helper: Find a reply by ID in a threaded structure
   * @param replies - Array of replies with children
   * @param replyId - Reply ID to find
   */
  findReplyById(replies: Reply[], replyId: string): Reply | null {
    for (const reply of replies) {
      if (reply._id === replyId) {
        return reply;
      }
      if (reply.children && reply.children.length > 0) {
        const found = this.findReplyById(reply.children, replyId);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * Helper: Get display name for a user
   * @param reply - Reply object
   */
  getUserDisplayName(reply: Reply): string {
    if (reply.userId.profile?.firstName && reply.userId.profile?.lastName) {
      return `${reply.userId.profile.firstName} ${reply.userId.profile.lastName}`;
    }
    return reply.userId.username;
  }
}
