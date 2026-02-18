import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactionService, ReactionStats } from '../../../core/services/reaction.service';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-reaction-buttons',
  imports: [CommonModule],
  templateUrl: './reaction-buttons.html',
  styleUrl: './reaction-buttons.scss'
})
export class ReactionButtons implements OnInit, OnDestroy {
  @Input() reviewId!: string;
  @Input() reviewOwnerId!: string;
  @Input() initialStats: ReactionStats = { helpful: 0, notHelpful: 0, total: 0 };
  @Input() userReaction?: 'helpful' | 'not_helpful' | null = null;
  @Input() compact: boolean = false; // Compact mode shows only icons
  @Output() reactionChanged = new EventEmitter<{ type: 'helpful' | 'not_helpful' | null; stats: ReactionStats }>();
  @Output() authRequired = new EventEmitter<void>();

  stats: ReactionStats = { helpful: 0, notHelpful: 0, total: 0 };
  currentUserReaction: 'helpful' | 'not_helpful' | null = null;
  isLoading = false;
  isDisabled = false;
  currentUserId: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private reactionService: ReactionService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.stats = { ...this.initialStats };
    this.currentUserReaction = this.userReaction || null;

    // Get current user ID
    const user = this.authService.getCurrentUser();
    this.currentUserId = user?._id || null;

    // Check if user owns the review
    if (this.currentUserId && this.reviewOwnerId === this.currentUserId) {
      this.isDisabled = true;
    }

    // Subscribe to real-time reaction updates
    this.reactionService.subscribeToReactionUpdates()
      .pipe(takeUntil(this.destroy$))
      .subscribe(update => {
        if (update.reviewId === this.reviewId) {
          this.stats = update.stats;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleReaction(type: 'helpful' | 'not_helpful'): void {
    // Check if user is authenticated
    if (!this.currentUserId) {
      this.authRequired.emit();
      return;
    }

    // Check if disabled (user owns review)
    if (this.isDisabled) {
      this.toastService.error('You cannot react to your own review');
      return;
    }

    // Prevent multiple clicks
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    this.reactionService.toggleReaction(this.reviewId, type)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;

          if (response.success) {
            const action = response.data.action;
            const newStats = response.data.stats;

            // Update stats
            this.stats = {
              helpful: newStats.helpful,
              notHelpful: newStats.notHelpful,
              total: newStats.helpful + newStats.notHelpful
            };

            // Update current user reaction based on action
            if (action === 'removed') {
              this.currentUserReaction = null;
              this.toastService.success('Reaction removed');
            } else if (action === 'added') {
              this.currentUserReaction = type;
              this.toastService.success('Reaction added');
            } else if (action === 'updated') {
              this.currentUserReaction = type;
              this.toastService.success('Reaction updated');
            }

            // Emit change event
            this.reactionChanged.emit({
              type: this.currentUserReaction,
              stats: this.stats
            });

            // Emit to other components via service
            this.reactionService.emitReactionUpdate(this.reviewId, this.stats);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.toastService.error(error?.error?.message || 'Failed to toggle reaction');
        }
      });
  }

  isHelpfulActive(): boolean {
    return this.currentUserReaction === 'helpful';
  }

  isNotHelpfulActive(): boolean {
    return this.currentUserReaction === 'not_helpful';
  }

  getHelpfulButtonClass(): string {
    const classes = ['reaction-btn'];
    if (this.isHelpfulActive()) classes.push('active');
    if (this.isDisabled) classes.push('disabled');
    if (this.isLoading) classes.push('loading');
    return classes.join(' ');
  }

  getNotHelpfulButtonClass(): string {
    const classes = ['reaction-btn'];
    if (this.isNotHelpfulActive()) classes.push('active');
    if (this.isDisabled) classes.push('disabled');
    if (this.isLoading) classes.push('loading');
    return classes.join(' ');
  }
}
