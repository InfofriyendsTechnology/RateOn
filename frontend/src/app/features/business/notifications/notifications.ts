import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Bell, MessageSquare, Star, ShoppingBag, Check, CheckCheck, Trash2, ThumbsUp, Reply, ExternalLink, UserPlus } from 'lucide-angular';
import { UserNotificationsService, AppNotification } from '../../../core/services/user-notifications.service';
import { ToastService } from '../../../core/services/toast';
import { Subscription } from 'rxjs';
import { ReactionButtons } from '../../../shared/components/reaction-buttons/reaction-buttons';
import { ReplyService } from '../../../core/services/reply.service';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ReactionButtons],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss'
})
export class NotificationsPageComponent implements OnInit, OnDestroy {
  // Icons
  readonly Bell = Bell;
  readonly MessageSquare = MessageSquare;
  readonly Star = Star;
  readonly ShoppingBag = ShoppingBag;
  readonly Check = Check;
  readonly CheckCheck = CheckCheck;
  readonly Trash2 = Trash2;
  readonly ThumbsUp = ThumbsUp;
  readonly Reply = Reply;
  readonly ExternalLink = ExternalLink;
  readonly UserPlus = UserPlus;

  // Data
  notifications: AppNotification[] = [];
  filteredNotifications: AppNotification[] = [];
  
  // Stats
  unreadCount = 0;
  todayCount = 0;
  
  // Filters
  filterType: 'all' | 'unread' | 'follow' | 'review' | 'reply' | 'reaction' = 'all';
  
  // Pagination
  currentPage = 1;
  pageSize = 20;
  hasMore = false;
  
  // Loading states
  loading = false;
  loadingMore = false;
  markingAll = false;
  
  // Reply states
  replyingToNotification: string | null = null;
  replyText: { [key: string]: string } = {};
  submittingReply = false;
  
  // Avatar error tracking
  avatarFailed: { [key: string]: boolean } = {};
  
  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private notificationService: UserNotificationsService,
    private toastService: ToastService,
    private router: Router,
    private replyService: ReplyService
  ) {}

  ngOnInit() {
    this.loadNotifications();
    this.setupRealtimeUpdates();
    this.setupVisibilityListener();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  setupRealtimeUpdates() {
    // Subscribe to new notifications
    const newNotifSub = this.notificationService.onNewNotification().subscribe(notification => {
      this.notifications.unshift(notification);
      this.updateStats();
      this.applyFilters();
    });

    // Subscribe to unread count updates
    const unreadSub = this.notificationService.onUnreadCount().subscribe(count => {
      this.unreadCount = count;
    });

    this.subscriptions.push(newNotifSub, unreadSub);
  }
  
  private handleVisibilityChange = () => {
    if (typeof document !== 'undefined' && !document.hidden) {
      // Page became visible - reload notifications to get fresh data
      this.loadNotifications();
    }
  }
  
  setupVisibilityListener() {
    // Refresh notifications when user returns to the page
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  loadNotifications() {
    this.loading = true;
    this.notificationService.getNotifications(this.currentPage, this.pageSize).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.notifications = response.data.notifications || [];
          this.unreadCount = response.data.unreadCount || 0;
          this.hasMore = response.data.hasMore || false;
          
          this.updateStats();
          this.applyFilters();
        }
        this.loading = false;
      },
      error: (err) => {
        this.toastService.error('Failed to load notifications');
        this.loading = false;
      }
    });
  }
  
  loadMore() {
    if (this.loadingMore || !this.hasMore) return;
    
    this.loadingMore = true;
    this.currentPage++;
    
    this.notificationService.getNotifications(this.currentPage, this.pageSize).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          const newNotifications = response.data.notifications || [];
          this.notifications.push(...newNotifications);
          this.hasMore = response.data.hasMore || false;
          
          this.updateStats();
          this.applyFilters();
        }
        this.loadingMore = false;
      },
      error: (err) => {
        this.toastService.error('Failed to load more notifications');
        this.loadingMore = false;
        this.currentPage--;
      }
    });
  }

  updateStats() {
    // Count today's notifications
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    this.todayCount = this.notifications.filter(n => {
      const notifDate = new Date(n.createdAt);
      notifDate.setHours(0, 0, 0, 0);
      return notifDate.getTime() === today.getTime();
    }).length;
  }

  setFilter(type: 'all' | 'unread' | 'follow' | 'review' | 'reply' | 'reaction') {
    this.filterType = type;
    this.applyFilters();
  }

  getTypeCount(type: 'follow' | 'review' | 'reply' | 'reaction'): number {
    const typeMap: Record<string, string[]> = {
      follow:   ['follow'],
      review:   ['new_review'],
      reply:    ['review_reply', 'reply_to_reply'],
      reaction: ['review_reaction', 'reply_reaction'],
    };
    return this.notifications.filter(n => typeMap[type].includes(n.type)).length;
  }

  applyFilters() {
    let filtered = [...this.notifications];

    switch (this.filterType) {
      case 'unread':
        filtered = filtered.filter(n => !n.isRead);
        break;
      case 'follow':
        filtered = filtered.filter(n => n.type === 'follow');
        break;
      case 'review':
        filtered = filtered.filter(n => n.type === 'new_review');
        break;
      case 'reply':
        filtered = filtered.filter(n => ['review_reply', 'reply_to_reply'].includes(n.type));
        break;
      case 'reaction':
        filtered = filtered.filter(n => ['review_reaction', 'reply_reaction'].includes(n.type));
        break;
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    this.filteredNotifications = filtered;
  }

  handleNotificationClick(notification: AppNotification) {
    // Mark as read
    if (!notification.isRead) {
      this.markAsRead(notification, null);
    }

    // Navigate to link if available
    if (notification.link) {
      this.router.navigateByUrl(notification.link);
    } else if (notification.metadata?.businessId) {
      this.router.navigate(['/business', notification.metadata.businessId]);
    }
  }

  markAsRead(notification: AppNotification, event: Event | null) {
    if (event) {
      event.stopPropagation();
    }

    if (notification.isRead) return;

    this.notificationService.markAsRead(notification._id).subscribe({
      next: () => {
        notification.isRead = true;
        // Recalculate unread count from actual notifications
        this.unreadCount = this.notifications.filter(n => !n.isRead).length;
        // Trigger service update
        this.notificationService['unreadCount$'].next(this.unreadCount);
        this.applyFilters();
      },
      error: (err) => {
      }
    });
  }

  markAllAsRead() {
    if (this.unreadCount === 0) return;

    this.markingAll = true;
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.isRead = true);
        this.unreadCount = 0;
        // Trigger service update
        this.notificationService['unreadCount$'].next(0);
        this.applyFilters();
        this.toastService.success('All notifications marked as read');
        this.markingAll = false;
      },
      error: (err) => {
        this.toastService.error('Failed to mark notifications as read');
        this.markingAll = false;
      }
    });
  }

  deleteNotification(notification: AppNotification, event: Event) {
    event.stopPropagation();
    
    // TODO: Replace with custom modal
    // For now, skip confirmation for better UX

    this.notificationService.deleteNotification(notification._id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n._id !== notification._id);
        // Recalculate unread count
        this.unreadCount = this.notifications.filter(n => !n.isRead).length;
        // Trigger service update
        this.notificationService['unreadCount$'].next(this.unreadCount);
        this.updateStats();
        this.applyFilters();
        this.toastService.success('Notification deleted');
      },
      error: (err) => {
        this.toastService.error('Failed to delete notification');
      }
    });
  }

  getNotificationIcon(type: string) {
    switch (type) {
      case 'new_review':
        return this.Star;
      case 'review_reply':
        return this.MessageSquare;
      case 'reply_reaction':
        return this.ThumbsUp;
      default:
        return this.Bell;
    }
  }

  getNotificationIconClass(type: string): string {
    switch (type) {
      case 'new_review':
        return 'review';
      case 'review_reply':
        return 'reply';
      case 'reply_reaction':
        return 'reaction';
      default:
        return 'default';
    }
  }

  getTimeAgo(date: string): string {
    const now = new Date();
    const notifDate = new Date(date);
    const seconds = Math.floor((now.getTime() - notifDate.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return notifDate.toLocaleDateString();
  }

  getUserAvatar(notification: AppNotification): string | null {
    const triggered = notification.triggeredBy;
    if (typeof triggered === 'object' && triggered !== null) {
      return triggered.profile?.avatar || null;
    }
    return null;
  }

  getUserName(notification: AppNotification): string {
    const triggered = notification.triggeredBy;
    if (typeof triggered === 'object' && triggered !== null) {
      return triggered.username || 'Someone';
    }
    return 'Someone';
  }
  
  onAvatarError(notificationId: string): void {
    this.avatarFailed[notificationId] = true;
  }

  getActionText(type: string): string {
    switch (type) {
      case 'new_review':
        return 'left a review';
      case 'review_reply':
        return 'replied to a review';
      case 'reply_to_reply':
        return 'replied to your reply';
      case 'review_reaction':
        return 'reacted to a review';
      case 'reply_reaction':
        return 'reacted to your reply';
      case 'business_response':
        return 'responded to a review';
      default:
        return 'interacted';
    }
  }

  isReviewNotification(notification: AppNotification): boolean {
    return (
      notification.type === 'new_review' ||
      notification.type === 'review_reply' ||
      notification.type === 'reply_to_reply'
    );
  }

  hasReviewId(notification: AppNotification): boolean {
    return !!(notification.metadata?.reviewId);
  }

  getReviewOwnerId(notification: AppNotification): string {
    // Return the user ID who created the review
    const triggered = notification.triggeredBy;
    if (typeof triggered === 'string') {
      return triggered;
    } else if (triggered && typeof triggered === 'object') {
      return triggered._id || '';
    }
    return '';
  }

  getReactionStats(notification: AppNotification): any {
    // Get reaction stats from notification metadata if available
    const reactions = notification.metadata?.reactions;
    if (reactions) {
      return {
        helpful: reactions.helpful || 0,
        notHelpful: reactions.notHelpful || 0,
        total: (reactions.helpful || 0) + (reactions.notHelpful || 0)
      };
    }
    return { helpful: 0, notHelpful: 0, total: 0 };
  }
  
  getUserReaction(notification: AppNotification): 'helpful' | 'not_helpful' | null {
    // Get user's current reaction from notification metadata
    return notification.metadata?.userReaction || null;
  }

  onReactionChanged(notification: AppNotification, event: any): void {
    // Update the notification's reaction stats immediately for responsive UI
    if (!notification.metadata) {
      notification.metadata = {} as any;
    }
    if (!notification.metadata.reactions) {
      notification.metadata.reactions = { helpful: 0, notHelpful: 0 };
    }
    notification.metadata.reactions.helpful = event.stats.helpful;
    notification.metadata.reactions.notHelpful = event.stats.notHelpful;
    
    // Update user's reaction state
    notification.metadata.userReaction = event.type;
  }

  startReply(notificationId: string, event: Event) {
    event.stopPropagation();
    this.replyingToNotification = notificationId;
    this.replyText[notificationId] = '';
  }

  cancelReply(notificationId: string, event: Event) {
    event.stopPropagation();
    this.replyingToNotification = null;
    delete this.replyText[notificationId];
  }

  submitReply(notification: AppNotification, event: Event) {
    event.stopPropagation();
    
    const reviewId = notification.metadata?.reviewId;
    const text = this.replyText[notification._id]?.trim();
    
    if (!reviewId) {
      this.toastService.error('Review ID not found');
      return;
    }
    
    if (!text) {
      this.toastService.error('Please enter a reply');
      return;
    }
    
    this.submittingReply = true;
    
    this.replyService.createReply({
      reviewId: reviewId,
      comment: text
    }).subscribe({
      next: (response: any) => {
        this.toastService.success('Reply added successfully!');
        
        // Update notification metadata to show reply was added
        if (!notification.metadata) {
          notification.metadata = {} as any;
        }
        if (!notification.metadata.replies) {
          notification.metadata.replies = [];
        }
        notification.metadata.replies.unshift(response.data); // Add to beginning
        
        // Update reply count
        notification.metadata.replyCount = (notification.metadata.replyCount || 0) + 1;
        
        // Close reply form
        this.cancelReply(notification._id, event);
        this.submittingReply = false;
        
        // Mark as read after replying
        if (!notification.isRead) {
          this.markAsRead(notification, null);
        }
      },
      error: (err: any) => {
        this.toastService.error(err.error?.message || 'Failed to add reply');
        this.submittingReply = false;
      }
    });
  }

  hasReply(notification: AppNotification): boolean {
    return !!(notification.metadata?.replies && notification.metadata.replies.length > 0);
  }

  getReplyCount(notification: AppNotification): number {
    return notification.metadata?.replies?.length || notification.metadata?.replyCount || 0;
  }

  viewReview(notification: AppNotification, event: Event) {
    event.stopPropagation();
    
    // Mark as read
    if (!notification.isRead) {
      this.markAsRead(notification, null);
    }
    
    // Navigate to reviews management page with query params to highlight the review
    const reviewId = notification.metadata?.reviewId;
    const businessId = notification.metadata?.businessId;
    
    if (reviewId) {
      // Pass reviewId as query param so the review page can auto-scroll and highlight it
      this.router.navigate(['/owner/reviews'], { 
        queryParams: { 
          reviewId: reviewId,
          businessId: businessId,
          action: 'reply' // Indicate user wants to reply
        } 
      });
    } else {
      // Fallback: just navigate to reviews page
      this.router.navigate(['/owner/reviews']);
    }
  }
}
