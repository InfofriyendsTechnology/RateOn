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
    this.notif.deleteNotification(id).subscribe({ next: () => this.notif.seedUnreadCount() });
  }
}
