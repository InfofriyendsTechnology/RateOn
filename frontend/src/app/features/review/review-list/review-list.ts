import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ReviewService } from '../../../core/services/review';
import { ReactionButtons } from '../../../shared/components/reaction-buttons/reaction-buttons';
import { AuthModalComponent } from '../../../shared/components/auth-modal/auth-modal.component';
import { StorageService } from '../../../core/services/storage';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactionButtons, AuthModalComponent],
  templateUrl: './review-list.html',
  styleUrl: './review-list.scss',
})
export class ReviewList implements OnInit, OnDestroy {
  Math = Math;
  private destroy$ = new Subject<void>();

  @Input() businessId?: string;
  @Input() itemId?: string;
  @Input() userId?: string;

  reviews: any[] = [];
  loading: boolean = true;
  error: string = '';
  
  // Pagination
  currentPage: number = 1;
  totalPages: number = 1;
  limit: number = 10;
  totalReviews: number = 0;

  // Sorting
  sortBy: string = 'createdAt';
  sortOrder: string = 'desc';
  sortOptions = [
    { value: 'createdAt-desc', label: 'Newest First' },
    { value: 'createdAt-asc', label: 'Oldest First' },
    { value: 'rating-desc', label: 'Highest Rated' },
    { value: 'rating-asc', label: 'Lowest Rated' },
    { value: 'helpful-desc', label: 'Most Helpful' },
  ];

  // Filtering
  filterRating: number = 0;
  ratingOptions = [0, 1, 2, 3, 4, 5];

  // Auth
  showAuthModal = false;
  currentUser: any = null;

  constructor(
    private reviewService: ReviewService,
    private storage: StorageService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.storage.getUser();
    this.loadReviews();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadReviews(): void {
    this.loading = true;
    this.error = '';

    const params: any = {
      page: this.currentPage,
      limit: this.limit,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
    };

    if (this.filterRating > 0) {
      params.rating = this.filterRating;
    }

    if (this.businessId) {
      params.businessId = this.businessId;
    }

    if (this.itemId) {
      params.itemId = this.itemId;
    }

    if (this.userId) {
      params.userId = this.userId;
    }

    this.reviewService.getReviews(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.reviews = response.data.reviews || [];
            this.totalReviews = response.data.pagination?.total || 0;
            this.totalPages = Math.ceil(this.totalReviews / this.limit);
          } else {
            this.error = response.message || 'Failed to load reviews';
          }
          this.loading = false;
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Failed to load reviews';
          this.loading = false;
        }
      });
  }

  onSortChange(value: string): void {
    const [sortBy, sortOrder] = value.split('-');
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    this.currentPage = 1;
    this.loadReviews();
  }

  onFilterChange(rating: number): void {
    this.filterRating = rating;
    this.currentPage = 1;
    this.loadReviews();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadReviews();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadReviews();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadReviews();
    }
  }

  getStarArray(rating: number): number[] {
    return Array(rating).fill(0);
  }

  getEmptyStarArray(rating: number): number[] {
    return Array(5 - rating).fill(0);
  }

  formatDate(date: string): string {
    const reviewDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - reviewDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }

  getReactionStats(review: any): any {
    return {
      helpful: review.stats?.helpfulCount || 0,
      not_helpful: review.stats?.notHelpfulCount || 0,
      total: (review.stats?.helpfulCount || 0) + (review.stats?.notHelpfulCount || 0)
    };
  }

  handleReactionChange(event: any, review: any): void {
    review.stats.helpfulCount = event.stats.helpful;
    review.stats.notHelpfulCount = event.stats.not_helpful;
  }

  getPaginationRange(): number[] {
    const range = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  }

  handleAuthRequired(): void {
    this.showAuthModal = true;
  }

  onAuthSuccess(): void {
    this.showAuthModal = false;
    this.currentUser = this.storage.getUser();
    this.loadReviews();
  }

  closeAuthModal(): void {
    this.showAuthModal = false;
  }
}
