import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, Signal, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserNotificationsService, AppNotification } from '../../../core/services/user-notifications.service';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notification-panel.html',
  styleUrl: './notification-panel.scss'
})
export class NotificationPanelComponent implements OnInit, OnDestroy {
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();

  // state
  notifications: AppNotification[] = [];
  page = 1;
  limit = 20;
  hasMore = true;
  loading = false;
  filter: 'all' | 'read' | 'unread' = 'all';

  constructor(private notif: UserNotificationsService) {}

  ngOnInit(): void {
    this.notif.connect();
    this.notif.seedUnreadCount();
    this.load(true);

    this.notif.onNewNotification().subscribe(() => {
      // New item arrived -> reload first page
      this.load(true);
    });

    this.notif.onListRefresh().subscribe(() => this.load(true));
  }

  ngOnDestroy(): void {
    // keep socket connected globally; do not disconnect here
  }

  load(reset = false): void {
    if (this.loading) return;
    if (reset) {
      this.page = 1;
      this.notifications = [];
      this.hasMore = true;
    }
    this.loading = true;
    this.notif.getNotifications(this.page, this.limit, this.filter).subscribe({
      next: (resp) => {
        const list = resp?.data?.notifications || [];
        const pg = resp?.data?.pagination;
        this.notifications = reset ? list : [...this.notifications, ...list];
        this.hasMore = !!pg && this.page < (pg.pages || 1);
      },
      error: () => {},
      complete: () => (this.loading = false)
    });
  }

  loadMore(): void {
    if (!this.hasMore || this.loading) return;
    this.page += 1;
    this.load(false);
  }

  markAllRead(): void {
    this.notif.markAllAsRead().subscribe({ next: () => this.notif.seedUnreadCount() });
  }

  markRead(id: string): void {
    this.notif.markAsRead(id).subscribe({ next: () => this.notif.seedUnreadCount() });
  }

  remove(id: string): void {
    this.notif.deleteNotification(id).subscribe({ next: () => {
      this.notifications = this.notifications.filter(n => n._id !== id);
      this.notif.seedUnreadCount();
    }});
  }

  setFilter(f: 'all' | 'read' | 'unread'): void {
    this.filter = f;
    this.load(true);
  }

  getNotifIcon(type: string): string {
    const map: Record<string, string> = {
      follow: '👤',
      new_review: '⭐',
      review_reply: '💬',
      reply_to_reply: '↩️',
      review_reaction: '👍',
      business_response: '🏢',
      mention: '📣',
    };
    return map[type] || '🔔';
  }

  getTriggeredByAvatar(n: AppNotification): string | null {
    if (typeof n.triggeredBy === 'object' && n.triggeredBy?.profile?.avatar) {
      return n.triggeredBy.profile.avatar;
    }
    return null;
  }

  getTriggeredByInitial(n: AppNotification): string {
    if (typeof n.triggeredBy === 'object' && n.triggeredBy?.username) {
      return n.triggeredBy.username.charAt(0).toUpperCase();
    }
    return '?';
  }

  getNotifLink(n: AppNotification): string {
    if (n.link) return n.link;
    switch (n.type) {
      case 'follow':
        const uid = typeof n.triggeredBy === 'object' ? n.triggeredBy._id : n.triggeredBy;
        return uid ? `/user/${uid}` : '/';
      case 'new_review':
      case 'review_reply':
      case 'reply_to_reply':
      case 'review_reaction':
      case 'business_response':
        return n.metadata?.businessId ? `/business/${n.metadata.businessId}` : '/';
      default:
        return '/';
    }
  }

  getTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
