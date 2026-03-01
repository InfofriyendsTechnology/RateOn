import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Bell, BellOff, Heart, MessageSquare, UserPlus, Star, ThumbsUp, Building2, Check, CheckCheck, Trash2, Home, Inbox } from 'lucide-angular';
import { UserNotificationsService, AppNotification } from '../../../core/services/user-notifications.service';
import { ToastService } from '../../../core/services/toast';
import { Subscription } from 'rxjs';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { BreadcrumbsComponent, Crumb } from '../../../shared/components/breadcrumbs/breadcrumbs';

@Component({
  selector: 'app-user-notifications-page',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, Navbar, BreadcrumbsComponent],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss'
})
export class UserNotificationsPageComponent implements OnInit, OnDestroy {
  readonly Bell = Bell;
  readonly Heart = Heart;
  readonly MessageSquare = MessageSquare;
  readonly UserPlus = UserPlus;
  readonly Star = Star;
  readonly ThumbsUp = ThumbsUp;
  readonly Building2 = Building2;
  readonly Check = Check;
  readonly CheckCheck = CheckCheck;
  readonly Trash2 = Trash2;
  readonly Home = Home;
  readonly BellOff = BellOff;
  readonly Inbox = Inbox;

  breadcrumbs: Crumb[] = [
    { label: 'Home', link: '/' },
    { label: 'Notifications' }
  ];

  notifications: AppNotification[] = [];
  filteredNotifications: AppNotification[] = [];

  unreadCount = 0;
  filterType: 'all' | 'unread' | 'follow' | 'review' | 'reaction' = 'all';

  currentPage = 1;
  pageSize = 20;
  hasMore = false;

  loading = false;
  loadingMore = false;
  markingAll = false;

  avatarFailed: { [key: string]: boolean } = {};

  private subscriptions: Subscription[] = [];

  constructor(
    private notifService: UserNotificationsService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.notifService.connect();
    this.loadNotifications();
    this.setupRealtime();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  setupRealtime() {
    const newSub = this.notifService.onNewNotification().subscribe(n => {
      this.notifications.unshift(n);
      this.applyFilter();
    });
    const countSub = this.notifService.onUnreadCount().subscribe(c => {
      this.unreadCount = c;
    });
    const refreshSub = this.notifService.onListRefresh().subscribe(() => {
      this.loadNotifications();
    });
    this.subscriptions.push(newSub, countSub, refreshSub);
  }

  loadNotifications() {
    this.loading = true;
    this.notifService.getNotifications(this.currentPage, this.pageSize).subscribe({
      next: (resp) => {
        if (resp.success && resp.data) {
          this.notifications = resp.data.notifications || [];
          this.unreadCount = resp.data.unreadCount || 0;
          const pg = resp.data.pagination;
          this.hasMore = !!pg && this.currentPage < (pg.pages || 1);
          this.applyFilter();
        }
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Failed to load notifications');
        this.loading = false;
      }
    });
  }

  loadMore() {
    if (this.loadingMore || !this.hasMore) return;
    this.loadingMore = true;
    this.currentPage++;
    this.notifService.getNotifications(this.currentPage, this.pageSize).subscribe({
      next: (resp) => {
        if (resp.success && resp.data) {
          this.notifications.push(...(resp.data.notifications || []));
          const pg = resp.data.pagination;
          this.hasMore = !!pg && this.currentPage < (pg.pages || 1);
          this.applyFilter();
        }
        this.loadingMore = false;
      },
      error: () => {
        this.toastService.error('Failed to load more');
        this.loadingMore = false;
        this.currentPage--;
      }
    });
  }

  setFilter(f: 'all' | 'unread' | 'follow' | 'review' | 'reaction') {
    this.filterType = f;
    this.applyFilter();
  }

  applyFilter() {
    let list = [...this.notifications];
    switch (this.filterType) {
      case 'unread':
        list = list.filter(n => !n.isRead);
        break;
      case 'follow':
        list = list.filter(n => n.type === 'follow');
        break;
      case 'review':
        list = list.filter(n => ['new_review', 'review_reply', 'reply_to_reply', 'business_response'].includes(n.type));
        break;
      case 'reaction':
        list = list.filter(n => ['review_reaction', 'reply_reaction'].includes(n.type));
        break;
    }
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    this.filteredNotifications = list;
  }

  getTypeCount(type: 'follow' | 'review' | 'reaction'): number {
    const typeMap: Record<string, string[]> = {
      follow:   ['follow'],
      review:   ['new_review', 'review_reply', 'reply_to_reply', 'business_response'],
      reaction: ['review_reaction', 'reply_reaction'],
    };
    return this.notifications.filter(n => typeMap[type].includes(n.type)).length;
  }

  getEmptyMessage(): string {
    switch (this.filterType) {
      case 'unread':   return "You're all caught up! No unread notifications.";
      case 'follow':   return 'No follow notifications yet.';
      case 'review':   return 'No review notifications yet.';
      case 'reaction': return 'No reaction notifications yet.';
      default:         return 'When someone follows you, reacts to your review, or replies — you will see it here.';
    }
  }

  markAsRead(n: AppNotification, event?: Event) {
    if (event) event.stopPropagation();
    if (n.isRead) return;
    this.notifService.markAsRead(n._id).subscribe({
      next: () => {
        n.isRead = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
        this.notifService['unreadCount$'].next(this.unreadCount);
        this.applyFilter();
      }
    });
  }

  markAllAsRead() {
    if (this.unreadCount === 0) return;
    this.markingAll = true;
    this.notifService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => (n.isRead = true));
        this.unreadCount = 0;
        this.notifService['unreadCount$'].next(0);
        this.applyFilter();
        this.toastService.success('All notifications marked as read');
        this.markingAll = false;
      },
      error: () => {
        this.toastService.error('Failed to mark all as read');
        this.markingAll = false;
      }
    });
  }

  deleteNotification(n: AppNotification, event: Event) {
    event.stopPropagation();
    this.notifService.deleteNotification(n._id).subscribe({
      next: () => {
        const wasUnread = !n.isRead;
        this.notifications = this.notifications.filter(x => x._id !== n._id);
        if (wasUnread) {
          this.unreadCount = Math.max(0, this.unreadCount - 1);
          this.notifService['unreadCount$'].next(this.unreadCount);
        }
        this.applyFilter();
        this.toastService.success('Notification deleted');
      },
      error: () => this.toastService.error('Failed to delete notification')
    });
  }

  handleClick(n: AppNotification) {
    if (!n.isRead) this.markAsRead(n);
    const link = this.getLink(n);
    if (link && link !== '/') this.router.navigateByUrl(link);
  }

  getLink(n: AppNotification): string {
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

  getIcon(type: string) {
    const map: Record<string, any> = {
      follow: this.UserPlus,
      new_review: this.Star,
      review_reply: this.MessageSquare,
      reply_to_reply: this.MessageSquare,
      review_reaction: this.ThumbsUp,
      reply_reaction: this.Heart,
      business_response: this.Building2,
      mention: this.Bell,
    };
    return map[type] || this.Bell;
  }

  getIconClass(type: string): string {
    const map: Record<string, string> = {
      follow: 'follow',
      new_review: 'review',
      review_reply: 'reply',
      reply_to_reply: 'reply',
      review_reaction: 'reaction',
      reply_reaction: 'reaction',
      business_response: 'business',
      mention: 'mention',
    };
    return map[type] || 'default';
  }

  getEmoji(type: string): string {
    const map: Record<string, string> = {
      follow: '👤',
      new_review: '⭐',
      review_reply: '💬',
      reply_to_reply: '↩️',
      review_reaction: '👍',
      reply_reaction: '❤️',
      business_response: '🏢',
      mention: '📣',
    };
    return map[type] || '🔔';
  }

  getAvatar(n: AppNotification): string | null {
    if (typeof n.triggeredBy === 'object') return n.triggeredBy?.profile?.avatar || null;
    return null;
  }

  getName(n: AppNotification): string {
    if (typeof n.triggeredBy === 'object') return n.triggeredBy?.username || 'Someone';
    return 'Someone';
  }

  onAvatarError(id: string) {
    this.avatarFailed[id] = true;
  }

  // Returns a human-friendly message based on notification type
  // avoids raw backend text like "found your review helpful"
  getDisplayMessage(n: AppNotification): string {
    const name = this.getName(n);
    switch (n.type) {
      case 'follow':            return `${name} started following you`;
      case 'new_review':        return `${name} wrote a review on your listing`;
      case 'review_reply':      return `${name} replied to your review`;
      case 'reply_to_reply':    return `${name} replied to your comment`;
      case 'review_reaction':   return `${name} reacted to your review`;
      case 'reply_reaction':    return `${name} liked your reply`;
      case 'business_response': return `A business responded to your review`;
      case 'mention':           return `${name} mentioned you in a comment`;
      default:                  return n.message;
    }
  }

  getEmptyIcon() {
    switch (this.filterType) {
      case 'follow':   return this.UserPlus;
      case 'review':   return this.Star;
      case 'reaction': return this.ThumbsUp;
      default:         return this.BellOff;
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
