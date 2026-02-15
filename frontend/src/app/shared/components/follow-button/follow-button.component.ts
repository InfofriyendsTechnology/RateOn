import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FollowService } from '../../../core/services/follow.service';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-follow-button',
  imports: [CommonModule],
  templateUrl: './follow-button.component.html',
  styleUrl: './follow-button.component.scss'
})
export class FollowButtonComponent implements OnInit, OnDestroy {
  @Input() userId!: string;
  @Input() initialIsFollowing: boolean = false;
  @Input() initialFollowerCount: number = 0;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() showCount: boolean = true;
  @Output() followChanged = new EventEmitter<{ isFollowing: boolean; followerCount: number }>();

  isFollowing = false;
  followerCount = 0;
  isLoading = false;
  isHovering = false;
  currentUserId: string | null = null;
  canFollow = true;

  private destroy$ = new Subject<void>();

  constructor(
    private followService: FollowService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.isFollowing = this.initialIsFollowing;
    this.followerCount = this.initialFollowerCount;

    // Get current user
    const user = this.authService.getCurrentUser();
    this.currentUserId = user?._id || null;

    // Can't follow yourself
    if (this.currentUserId && this.currentUserId === this.userId) {
      this.canFollow = false;
    }

    // Load follow status if not provided
    if (!this.initialIsFollowing && this.currentUserId && this.canFollow) {
      this.loadFollowStatus();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFollowStatus(): void {
    this.followService.checkFollowStatus(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.isFollowing = response.data.isFollowing;
          }
        },
        error: (error: any) => {
        }
      });
  }

  toggleFollow(): void {
    // Check if user is authenticated
    if (!this.currentUserId) {
      this.toastService.error('Please log in to follow users');
      return;
    }

    // Can't follow yourself
    if (!this.canFollow) {
      this.toastService.error('You cannot follow yourself');
      return;
    }

    // Prevent multiple clicks
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    const action = this.isFollowing 
      ? this.followService.unfollowUser(this.userId)
      : this.followService.followUser(this.userId);

    action.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.isLoading = false;

        if (response.success) {
          this.isFollowing = !this.isFollowing;
          
          // Update follower count
          if (this.isFollowing) {
            this.followerCount++;
            this.toastService.success('Following user');
          } else {
            this.followerCount = Math.max(0, this.followerCount - 1);
            this.toastService.success('Unfollowed user');
          }

          // Emit change event
          this.followChanged.emit({
            isFollowing: this.isFollowing,
            followerCount: this.followerCount
          });
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.toastService.error(
          error?.error?.message || 
          `Failed to ${this.isFollowing ? 'unfollow' : 'follow'} user`
        );
      }
    });
  }

  onMouseEnter(): void {
    this.isHovering = true;
  }

  onMouseLeave(): void {
    this.isHovering = false;
  }

  getButtonText(): string {
    if (this.isLoading) {
      return this.isFollowing ? 'Unfollowing...' : 'Following...';
    }

    if (this.isFollowing) {
      return this.isHovering ? 'Unfollow' : 'Following';
    }

    return 'Follow';
  }

  getButtonClass(): string {
    const classes = ['follow-btn'];
    
    // Size
    classes.push(`follow-btn-${this.size}`);
    
    // State
    if (this.isFollowing) {
      if (this.isHovering) {
        classes.push('follow-btn-danger');
      } else {
        classes.push('follow-btn-secondary');
      }
    } else {
      classes.push('follow-btn-primary');
    }

    // Loading
    if (this.isLoading) {
      classes.push('follow-btn-loading');
    }

    // Disabled
    if (!this.canFollow || !this.currentUserId) {
      classes.push('follow-btn-disabled');
    }

    return classes.join(' ');
  }

  formatFollowerCount(): string {
    if (this.followerCount === 0) {
      return '0 followers';
    } else if (this.followerCount === 1) {
      return '1 follower';
    } else if (this.followerCount < 1000) {
      return `${this.followerCount} followers`;
    } else if (this.followerCount < 1000000) {
      return `${(this.followerCount / 1000).toFixed(1)}K followers`;
    } else {
      return `${(this.followerCount / 1000000).toFixed(1)}M followers`;
    }
  }
}
