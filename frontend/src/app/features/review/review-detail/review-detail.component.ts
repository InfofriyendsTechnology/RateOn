import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ReviewService } from '../../../core/services/review';
import { AuthService } from '../../../core/services/auth';
import { ReactionButtons } from '../../../shared/components/reaction-buttons/reaction-buttons';
import { ReplyThreadComponent } from '../../../shared/components/reply-thread/reply-thread.component';
import { AuthModalComponent } from '../../../shared/components/auth-modal/auth-modal.component';
import { StorageService } from '../../../core/services/storage';

@Component({
  selector: 'app-review-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactionButtons, ReplyThreadComponent, AuthModalComponent],
  templateUrl: './review-detail.component.html',
  styleUrls: ['./review-detail.component.scss']
})
export class ReviewDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  reviewId: string = '';
  review: any = null;
  replies: any[] = [];
  statistics: any = null;
  loading: boolean = true;
  error: string = '';
  
  currentUser: any = null;
  isOwner: boolean = false;
  showReportModal: boolean = false;
  reportReason: string = '';
  reportDescription: string = '';
  submittingReport: boolean = false;
  showAuthModal: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reviewService: ReviewService,
    private authService: AuthService,
    private storage: StorageService
  ) {}

  ngOnInit(): void {
    // Get review ID from route
    this.reviewId = this.route.snapshot.paramMap.get('id') || '';
    
    if (!this.reviewId) {
      this.error = 'Invalid review ID';
      this.loading = false;
      return;
    }

    // Get current user
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user: any) => {
      this.currentUser = user;
      this.checkOwnership();
    });

    // Load review data
    this.loadReviewWithReplies();
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadReviewWithReplies(): void {
    this.loading = true;
    this.error = '';

    this.reviewService.getReviewWithReplies(this.reviewId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.review = response.data.review;
            this.replies = response.data.replies || [];
            this.checkOwnership();
          } else {
            this.error = response.message || 'Failed to load review';
          }
          this.loading = false;
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Failed to load review';
          this.loading = false;
        }
      });
  }

  loadStatistics(): void {
    this.reviewService.getReviewStatistics(this.reviewId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.statistics = response.data;
          }
        },
        error: (err: any) => {
        }
      });
  }

  checkOwnership(): void {
    if (this.currentUser && this.review) {
      this.isOwner = this.currentUser.id === this.review.userId?._id;
    }
  }

  getReactionStats(): any {
    if (!this.review?.stats) {
      return { helpful: 0, not_helpful: 0, total: 0 };
    }
    return {
      helpful: this.review.stats.helpfulCount || 0,
      not_helpful: this.review.stats.notHelpfulCount || 0,
      total: (this.review.stats.helpfulCount || 0) + (this.review.stats.notHelpfulCount || 0)
    };
  }

  getUserReaction(): 'helpful' | 'not_helpful' | null {
    return this.statistics?.userReaction || null;
  }

  handleReactionChange(event: any): void {
    // Update local review stats
    if (this.review?.stats) {
      this.review.stats.helpfulCount = event.stats.helpful;
      this.review.stats.notHelpfulCount = event.stats.not_helpful;
    }
    // Reload statistics to sync user reaction
    this.loadStatistics();
  }

  editReview(): void {
    // Determine review type and navigate appropriately
    if (this.review.itemId) {
      // Item review - navigate to write-review with item params
      this.router.navigate(['/write-review'], {
        queryParams: {
          itemId: this.review.itemId._id,
          businessId: this.review.businessId._id,
          reviewId: this.reviewId,
          edit: 'true'
        }
      });
    } else {
      // Business review
      this.router.navigate(['/write-review'], {
        queryParams: {
          businessId: this.review.businessId._id,
          reviewType: 'business',
          reviewId: this.reviewId,
          edit: 'true'
        }
      });
    }
  }
  
  deleteReview(): void {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }
    
    this.reviewService.deleteReview(this.reviewId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            alert('Review deleted successfully');
            // Navigate back to the business page
            if (this.review.businessId) {
              this.router.navigate(['/business', this.review.businessId._id]);
            } else {
              this.router.navigate(['/explore']);
            }
          } else {
            alert(response.message || 'Failed to delete review');
          }
        },
        error: (err: any) => {
          alert(err.error?.message || 'Failed to delete review');
        }
      });
  }

  openReportModal(): void {
    if (!this.currentUser) {
      this.showAuthModal = true;
      return;
    }
    this.showReportModal = true;
  }

  closeReportModal(): void {
    this.showReportModal = false;
    this.reportReason = '';
    this.reportDescription = '';
  }

  submitReport(): void {
    if (!this.reportReason || !this.reportDescription || this.reportDescription.length < 10) {
      return;
    }

    this.submittingReport = true;

    this.reviewService.reportReview(this.reviewId, {
      reason: this.reportReason,
      description: this.reportDescription
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response: any) => {
        if (response.success) {
          alert('Review reported successfully. Our team will review it shortly.');
          this.closeReportModal();
        } else {
          alert(response.message || 'Failed to report review');
        }
        this.submittingReport = false;
      },
      error: (err: any) => {
        alert(err.error?.message || 'Failed to report review');
        this.submittingReport = false;
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStarArray(rating: number): number[] {
    return Array(rating).fill(0);
  }

  getEmptyStarArray(rating: number): number[] {
    return Array(5 - rating).fill(0);
  }

  goBack(): void {
    window.history.back();
  }

  handleAuthRequired(): void {
    this.showAuthModal = true;
  }

  onAuthSuccess(): void {
    this.showAuthModal = false;
    this.currentUser = this.storage.getUser();
    this.loadReviewWithReplies();
    this.loadStatistics();
  }

  closeAuthModal(): void {
    this.showAuthModal = false;
  }
}
