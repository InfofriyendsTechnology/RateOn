import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { LucideAngularModule, MessageSquare, Star, ThumbsUp, ThumbsDown, Filter, Search, ChevronDown, ShoppingBag, ExternalLink, Clock, CheckCheck, Check, Reply } from 'lucide-angular';
import { StorageService } from '../../../core/services/storage';
import { BusinessService } from '../../../core/services/business';
import { ReviewService } from '../../../core/services/review';
import { ReplyService } from '../../../core/services/reply.service';
import { ToastService } from '../../../core/services/toast';
import { ReactionButtons } from '../../../shared/components/reaction-buttons/reaction-buttons';

@Component({
  selector: 'app-reviews-management',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ReactionButtons],
  templateUrl: './reviews.html',
  styleUrl: './reviews.scss'
})
export class ReviewsManagementComponent implements OnInit, OnDestroy {
  // Icons
  readonly MessageSquare = MessageSquare;
  readonly Star = Star;
  readonly ThumbsUp = ThumbsUp;
  readonly ThumbsDown = ThumbsDown;
  readonly Filter = Filter;
  readonly Search = Search;
  readonly ChevronDown = ChevronDown;
  readonly ShoppingBag = ShoppingBag;
  readonly ExternalLink = ExternalLink;
  readonly Clock = Clock;
  readonly CheckCheck = CheckCheck;
  readonly Check = Check;
  readonly Reply = Reply;

  // Data
  currentUser: any = null;
  businesses: any[] = [];
  reviews: any[] = [];
  filteredReviews: any[] = [];
  
  // Filters
  selectedBusiness: string = 'all';
  selectedStatus: string = 'all'; // all, pending, replied
  searchQuery: string = '';
  
  // Loading states
  loadingBusinesses = false;
  loadingReviews = false;
  
  // Reply states
  replyingToReview: string | null = null;
  replyText: { [key: string]: string } = {};
  submittingReply = false;
  
  // Avatar error tracking
  avatarFailed: { [key: string]: boolean } = {};
  
  // Subscriptions
  private routerSubscription?: Subscription;

  constructor(
    private storage: StorageService,
    private businessService: BusinessService,
    private reviewService: ReviewService,
    private replyService: ReplyService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.currentUser = this.storage.getUser();
    this.loadBusinesses();
    
    // Check for query params from notifications
    this.route.queryParams.subscribe(params => {
      const reviewId = params['reviewId'];
      const businessId = params['businessId'];
      const action = params['action'];
      
      if (reviewId && action === 'reply') {
        // Set filters if businessId provided
        if (businessId) {
          this.selectedBusiness = businessId;
        }
        
        // Wait for reviews to load, then auto-open reply
        setTimeout(() => {
          this.handleNotificationReply(reviewId);
        }, 500);
      }
    });
    
    // Reload reviews when navigating to this page
    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url.includes('/owner/reviews')) {
          this.loadAllReviews();
        }
      });
  }
  
  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }

  loadBusinesses() {
    this.loadingBusinesses = true;
    const userId = this.currentUser?._id || this.currentUser?.id;
    
    if (!userId) {
      this.loadingBusinesses = false;
      return;
    }
    
    this.businessService.getBusinesses({ owner: userId }).subscribe({
      next: (response: any) => {
        const data = response.data || response;
        this.businesses = data.businesses || data || [];
        
        // Load reviews for all businesses
        this.loadAllReviews();
        
        this.loadingBusinesses = false;
      },
      error: (err) => {
        this.toastService.error('Failed to load businesses');
        this.loadingBusinesses = false;
      }
    });
  }

  loadAllReviews() {
    if (this.businesses.length === 0) {
      this.reviews = [];
      this.filteredReviews = [];
      return;
    }
    
    this.loadingReviews = true;
    const businessIds = this.businesses.map(b => b._id);
    
    // Load reviews for all businesses
    const reviewPromises = businessIds.map(businessId => 
      this.reviewService.getReviewsByBusiness(businessId).toPromise()
    );
    
    Promise.all(reviewPromises).then((results: any[]) => {
      this.reviews = [];
      
      results.forEach((response, index) => {
        if (response && response.data) {
          const businessReviews = response.data.reviews || [];
          // Add business info to each review
          const business = this.businesses[index];
          businessReviews.forEach((review: any) => {
            review.businessInfo = {
              _id: business._id,
              name: business.name,
              type: business.type
            };
            // Debug: Log review to check userId structure
            if (businessReviews.length > 0 && this.reviews.length === 0) {
            }
          });
          this.reviews.push(...businessReviews);
        }
      });
      
      // Sort by date (newest first)
      this.reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      this.applyFilters();
      this.loadingReviews = false;
    }).catch(err => {
      this.toastService.error('Failed to load reviews');
      this.loadingReviews = false;
    });
  }

  applyFilters() {
    let filtered = [...this.reviews];
    
    // Filter by business
    if (this.selectedBusiness !== 'all') {
      filtered = filtered.filter(r => r.businessId === this.selectedBusiness || r.businessInfo?._id === this.selectedBusiness);
    }
    
    // Filter by status
    if (this.selectedStatus === 'pending') {
      filtered = filtered.filter(r => !r.replies || r.replies.length === 0);
    } else if (this.selectedStatus === 'replied') {
      filtered = filtered.filter(r => r.replies && r.replies.length > 0);
    }
    
    // Search
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.reviewText?.toLowerCase().includes(query) ||
        r.comment?.toLowerCase().includes(query) ||
        r.userId?.username?.toLowerCase().includes(query) ||
        r.userId?.name?.toLowerCase().includes(query)
      );
    }
    
    this.filteredReviews = filtered;
  }

  onBusinessFilterChange() {
    this.applyFilters();
  }

  onStatusFilterChange() {
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  startReply(reviewId: string) {
    this.replyingToReview = reviewId;
    this.replyText[reviewId] = '';
  }

  cancelReply(reviewId: string) {
    this.replyingToReview = null;
    delete this.replyText[reviewId];
  }

  submitReply(review: any) {
    const reviewId = review._id;
    const text = this.replyText[reviewId]?.trim();
    
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
        this.toastService.success('Reply added successfully');
        
        // Add reply to review
        if (!review.replies) {
          review.replies = [];
        }
        review.replies.push(response.data);
        
        this.cancelReply(reviewId);
        this.submittingReply = false;
        
        // Reapply filters
        this.applyFilters();
      },
      error: (err: any) => {
        this.toastService.error(err.error?.message || 'Failed to add reply');
        this.submittingReply = false;
      }
    });
  }

  viewReview(review: any) {
    // Navigate to public view
    if (review.businessInfo?._id) {
      this.router.navigate(['/business', review.businessInfo._id]);
    }
  }

  getPendingRepliesCount(): number {
    return this.reviews.filter(r => !r.replies || r.replies.length === 0).length;
  }

  getRepliedCount(): number {
    return this.reviews.filter(r => r.replies && r.replies.length > 0).length;
  }

  getTimeAgo(date: string): string {
    const now = new Date();
    const reviewDate = new Date(date);
    const seconds = Math.floor((now.getTime() - reviewDate.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return reviewDate.toLocaleDateString();
  }

  getReviewOwnerId(review: any): string {
    return review.userId?._id || review.userId;
  }

  onReactionChanged(review: any, event: any): void {
    // Update the review's reaction stats
    if (!review.reactions) {
      review.reactions = { helpful: 0, notHelpful: 0 };
    }
    review.reactions.helpful = event.stats.helpful;
    review.reactions.notHelpful = event.stats.notHelpful;
  }

  handleNotificationReply(reviewId: string): void {
    // Find the review in filtered reviews
    const review = this.filteredReviews.find(r => r._id === reviewId);
    
    if (review) {
      // Auto-open reply form
      this.startReply(reviewId);
      
      // Scroll to the review
      setTimeout(() => {
        const reviewElement = document.getElementById(`review-${reviewId}`);
        if (reviewElement) {
          reviewElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add highlight effect
          reviewElement.classList.add('highlight-review');
          setTimeout(() => {
            reviewElement.classList.remove('highlight-review');
          }, 2000);
        }
      }, 100);
    } else {
      // Review not found in current filters
      this.toastService.error('Review not found. Try adjusting your filters.');
    }
  }
  
  viewUserProfile(review: any): void {
    const userId = review.userId?._id || review.userId;
    if (userId) this.router.navigate(['/user', userId]);
  }

  viewItem(review: any): void {
    const itemId = review.itemId?._id || review.itemId;
    if (itemId) this.router.navigate(['/item', itemId]);
  }

  getAverageRating(): string {
    if (this.reviews.length === 0) return '0.0';
    const sum = this.reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return (sum / this.reviews.length).toFixed(1);
  }

  getRatingClass(rating: number): string {
    if (rating >= 5) return 'rating-5';
    if (rating >= 4) return 'rating-4';
    if (rating >= 3) return 'rating-3';
    if (rating >= 2) return 'rating-2';
    if (rating >= 1) return 'rating-1';
    return 'rating-default';
  }

  isVerified(review: any): boolean {
    return review.userId?.registrationMethod === 'google' || review.userId?.isEmailVerified === true;
  }

  onAvatarError(reviewId: string): void {
    this.avatarFailed[reviewId] = true;
  }
  
  getAvatarUrl(review: any): string | null {
    if (!review.userId) return null;
    return review.userId.profile?.avatar || review.userId.avatar || review.userId.googleProfile?.picture || null;
  }
  
  getUserDisplayName(review: any): string {
    if (!review.userId) return 'U';
    return review.userId.name || review.userId.firstName || review.userId.username || 'User';
  }
}
