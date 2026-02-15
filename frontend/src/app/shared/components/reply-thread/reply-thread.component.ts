import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReplyService, Reply } from '../../../core/services/reply.service';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-reply-thread',
  imports: [CommonModule, FormsModule],
  templateUrl: './reply-thread.component.html',
  styleUrl: './reply-thread.component.scss'
})
export class ReplyThreadComponent implements OnInit, OnDestroy {
  @Input() reviewId!: string;
  @Input() autoLoad: boolean = true;

  replies: Reply[] = [];
  isLoading = false;
  isLoadingMore = false;
  currentUserId: string | null = null;
  
  // Pagination
  limit = 50;
  skip = 0;
  hasMore = false;
  totalReplies = 0;

  // Reply form states
  replyForms: { [key: string]: { visible: boolean; text: string; isSubmitting: boolean } } = {};
  
  // Edit form states
  editForms: { [key: string]: { visible: boolean; text: string; isSubmitting: boolean } } = {};

  // Main reply form (for top-level replies)
  mainReplyText = '';
  isSubmittingMainReply = false;

  private destroy$ = new Subject<void>();

  constructor(
    private replyService: ReplyService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Get current user
    const user = this.authService.getCurrentUser();
    this.currentUserId = user?._id || null;

    // Load replies if autoLoad is true
    if (this.autoLoad) {
      this.loadReplies();
    }

    // Subscribe to real-time updates
    this.replyService.subscribeToReplyUpdates()
      .pipe(takeUntil(this.destroy$))
      .subscribe(update => {
        if (update.reviewId === this.reviewId) {
          this.handleReplyUpdate(update.reply, update.action);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadReplies(reset: boolean = false): void {
    if (reset) {
      this.skip = 0;
      this.replies = [];
    }

    this.isLoading = reset || this.replies.length === 0;
    this.isLoadingMore = !reset && this.replies.length > 0;

    this.replyService.getRepliesByReview(this.reviewId, this.limit, this.skip)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.isLoadingMore = false;

          if (response.success) {
            if (reset) {
              this.replies = response.data.replies;
            } else {
              this.replies = [...this.replies, ...response.data.replies];
            }

            this.totalReplies = response.data.pagination.total;
            this.hasMore = response.data.pagination.hasMore;
            this.skip += response.data.replies.length;
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.isLoadingMore = false;
          this.toastService.error(error?.error?.message || 'Failed to load replies');
        }
      });
  }

  loadMore(): void {
    if (!this.isLoadingMore && this.hasMore) {
      this.loadReplies(false);
    }
  }

  // Create main reply (top-level)
  submitMainReply(): void {
    if (!this.currentUserId) {
      this.toastService.error('Please log in to reply');
      return;
    }

    if (!this.mainReplyText.trim()) {
      this.toastService.error('Reply cannot be empty');
      return;
    }

    if (this.mainReplyText.length > 1000) {
      this.toastService.error('Reply cannot exceed 1000 characters');
      return;
    }

    this.isSubmittingMainReply = true;

    this.replyService.createReply({
      reviewId: this.reviewId,
      comment: this.mainReplyText.trim()
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        this.isSubmittingMainReply = false;
        if (response.success) {
          this.mainReplyText = '';
          this.toastService.success('Reply posted successfully');
          // Add to beginning of list
          this.replies.unshift(response.data);
          this.totalReplies++;
          this.replyService.emitReplyUpdate(this.reviewId, response.data, 'created');
        }
      },
      error: (error) => {
        this.isSubmittingMainReply = false;
        this.toastService.error(error?.error?.message || 'Failed to post reply');
      }
    });
  }

  // Show reply form for nested reply
  showReplyForm(replyId: string): void {
    if (!this.currentUserId) {
      this.toastService.error('Please log in to reply');
      return;
    }

    this.replyForms[replyId] = {
      visible: true,
      text: '',
      isSubmitting: false
    };
  }

  cancelReplyForm(replyId: string): void {
    delete this.replyForms[replyId];
  }

  // Submit nested reply
  submitNestedReply(parentReplyId: string): void {
    const form = this.replyForms[parentReplyId];
    if (!form || !form.text.trim()) {
      this.toastService.error('Reply cannot be empty');
      return;
    }

    if (form.text.length > 1000) {
      this.toastService.error('Reply cannot exceed 1000 characters');
      return;
    }

    form.isSubmitting = true;

    this.replyService.createReply({
      reviewId: this.reviewId,
      comment: form.text.trim(),
      parentReplyId: parentReplyId
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        form.isSubmitting = false;
        if (response.success) {
          this.toastService.success('Reply posted successfully');
          delete this.replyForms[parentReplyId];
          // Reload to get updated threaded structure
          this.loadReplies(true);
          this.replyService.emitReplyUpdate(this.reviewId, response.data, 'created');
        }
      },
      error: (error) => {
        form.isSubmitting = false;
        this.toastService.error(error?.error?.message || 'Failed to post reply');
      }
    });
  }

  // Show edit form
  showEditForm(reply: Reply): void {
    this.editForms[reply._id] = {
      visible: true,
      text: reply.comment,
      isSubmitting: false
    };
  }

  cancelEditForm(replyId: string): void {
    delete this.editForms[replyId];
  }

  // Update reply
  updateReply(replyId: string): void {
    const form = this.editForms[replyId];
    if (!form || !form.text.trim()) {
      this.toastService.error('Reply cannot be empty');
      return;
    }

    if (form.text.length > 1000) {
      this.toastService.error('Reply cannot exceed 1000 characters');
      return;
    }

    form.isSubmitting = true;

    this.replyService.updateReply(replyId, { comment: form.text.trim() })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          form.isSubmitting = false;
          if (response.success) {
            this.toastService.success('Reply updated successfully');
            delete this.editForms[replyId];
            // Update in the list
            this.updateReplyInList(this.replies, response.data);
            this.replyService.emitReplyUpdate(this.reviewId, response.data, 'updated');
          }
        },
        error: (error) => {
          form.isSubmitting = false;
          this.toastService.error(error?.error?.message || 'Failed to update reply');
        }
      });
  }

  // Delete reply
  deleteReply(replyId: string): void {
    if (!confirm('Are you sure you want to delete this reply?')) {
      return;
    }

    this.replyService.deleteReply(replyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.success('Reply deleted successfully');
            // Remove from list
            this.removeReplyFromList(this.replies, replyId);
            this.totalReplies--;
          }
        },
        error: (error) => {
          this.toastService.error(error?.error?.message || 'Failed to delete reply');
        }
      });
  }

  // Helper: Check if user can edit/delete reply
  canModifyReply(reply: Reply): boolean {
    return !!this.currentUserId && reply.userId._id === this.currentUserId;
  }

  // Helper: Get user display name
  getUserDisplayName(reply: Reply): string {
    return this.replyService.getUserDisplayName(reply);
  }

  // Helper: Format date
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  }

  // Helper: Update reply in nested structure
  private updateReplyInList(replies: Reply[], updatedReply: Reply): boolean {
    for (let i = 0; i < replies.length; i++) {
      if (replies[i]._id === updatedReply._id) {
        replies[i] = { ...replies[i], ...updatedReply };
        return true;
      }
      if (replies[i].children && replies[i].children!.length > 0) {
        if (this.updateReplyInList(replies[i].children!, updatedReply)) {
          return true;
        }
      }
    }
    return false;
  }

  // Helper: Remove reply from nested structure
  private removeReplyFromList(replies: Reply[], replyId: string): boolean {
    for (let i = 0; i < replies.length; i++) {
      if (replies[i]._id === replyId) {
        replies.splice(i, 1);
        return true;
      }
      if (replies[i].children && replies[i].children!.length > 0) {
        if (this.removeReplyFromList(replies[i].children!, replyId)) {
          return true;
        }
      }
    }
    return false;
  }

  // Helper: Handle real-time updates
  private handleReplyUpdate(reply: Reply, action: 'created' | 'updated' | 'deleted'): void {
    if (action === 'created') {
      // Don't add if already exists (prevents duplicates)
      const exists = this.replyService.findReplyById(this.replies, reply._id);
      if (!exists) {
        // Reload to maintain threaded structure
        this.loadReplies(true);
      }
    } else if (action === 'updated') {
      this.updateReplyInList(this.replies, reply);
    } else if (action === 'deleted') {
      this.removeReplyFromList(this.replies, reply._id);
    }
  }

  // Helper: Get character count class
  getCharCountClass(text: string): string {
    const length = text.length;
    if (length > 900) return 'text-danger';
    if (length > 800) return 'text-warning';
    return 'text-muted';
  }
}
