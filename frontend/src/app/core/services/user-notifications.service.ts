import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { io, Socket } from 'socket.io-client';
import { StorageService } from './storage';

export interface AppNotification {
  _id: string;
  userId: string;
  type:
    | 'new_review'
    | 'review_reply'
    | 'reply_to_reply'
    | 'review_reaction'
    | 'reply_reaction'
    | 'business_response'
    | 'mention'
    | 'follow';
  entityType: 'review' | 'reply' | 'reaction' | 'user' | 'business';
  entityId: string;
  triggeredBy: { _id: string; username: string; profile?: { avatar?: string } } | string;
  title?: string;
  message: string;
  metadata?: any;
  isRead: boolean;
  readAt?: string | null;
  link?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  success: boolean;
  message: string;
  data: {
    notifications: AppNotification[];
    pagination: { page: number; limit: number; total: number; pages: number };
    unreadCount: number;
  };
}

@Injectable({ providedIn: 'root' })
export class UserNotificationsService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  private socket: Socket | null = null;

  private newNotification$ = new Subject<AppNotification>();
  private unreadCount$ = new BehaviorSubject<number>(0);
  private unreadReviewsCount$ = new BehaviorSubject<number>(0);
  private listRefresh$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private zone: NgZone
  ) {}

  // REST
  getNotifications(page = 1, limit = 20, filter: 'all' | 'read' | 'unread' = 'all'): Observable<NotificationListResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit).set('filter', filter);
    return this.http.get<NotificationListResponse>(`${this.apiUrl}`, { params });
  }

  markAsRead(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/read`, {});
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/read-all`, {});
  }

  deleteNotification(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // WebSocket
  connect(): void {
    if (this.socket) return; // already connected

    const token = this.storage.getToken();
    if (!token) return;

const base = (() => { try { return new URL(environment.apiUrl, window.location.origin).origin; } catch { return window.location.origin; } })();
    this.socket = io(base, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      auth: { token }
    });

    // Wrap socket events with NgZone so Angular change detection runs
    this.socket.on('connect', () => {
      // no-op
    });

    this.socket.on('new_notification', (notif: AppNotification) => {
      this.zone.run(() => {
        this.newNotification$.next(notif);
        // bump counts locally
        this.unreadCount$.next((this.unreadCount$.value || 0) + 1);
        if (notif.type === 'new_review') {
          this.unreadReviewsCount$.next((this.unreadReviewsCount$.value || 0) + 1);
        }
        this.listRefresh$.next();
      });
    });

    this.socket.on('unread_count_update', (payload: { unreadCount?: number, unreadReviewsCount?: number }) => {
      this.zone.run(() => {
        if (payload?.unreadCount !== undefined) {
          this.unreadCount$.next(payload.unreadCount);
        }
        if (payload?.unreadReviewsCount !== undefined) {
          this.unreadReviewsCount$.next(payload.unreadReviewsCount);
        }
        this.listRefresh$.next();
      });
    });

    this.socket.on('disconnect', () => {
      // keep instance to allow reconnects later
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Streams
  onNewNotification(): Observable<AppNotification> { return this.newNotification$.asObservable(); }
  onUnreadCount(): Observable<number> { return this.unreadCount$.asObservable(); }
  onUnreadReviewsCount(): Observable<number> { return this.unreadReviewsCount$.asObservable(); }
  onListRefresh(): Observable<void> { return this.listRefresh$.asObservable(); }

  // Helper to seed unread count from REST once (call after login or on app init)
  seedUnreadCount(): void {
    this.http.get<any>(`${this.apiUrl}/unread-count`).subscribe({
      next: (resp) => {
        if (resp?.success && resp.data) {
          this.unreadCount$.next(resp.data.count || 0);
          this.unreadReviewsCount$.next(resp.data.reviewCount || 0);
        }
      },
      error: () => {}
    });
  }
}
