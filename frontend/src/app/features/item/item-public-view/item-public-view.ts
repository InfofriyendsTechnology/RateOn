import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, Home, Star, MessageSquare, ThumbsUp, ThumbsDown, User, MoreVertical, Edit, Trash, Package, Building, IndianRupee, Sun, Moon } from 'lucide-angular';
import { ThemeService } from '../../../core/services/theme';
import { ItemService } from '../../../core/services/item';
import { BusinessService } from '../../../core/services/business';
import { ReviewService } from '../../../core/services/review';
import { StorageService } from '../../../core/services/storage';
import { NotificationService } from '../../../core/services/notification.service';
import { ReactionService } from '../../../core/services/reaction.service';
import { ReplyService, CreateReplyRequest } from '../../../core/services/reply.service';
import { BreadcrumbsComponent, Crumb } from '../../../shared/components/breadcrumbs/breadcrumbs';
import { AuthModalComponent } from '../../../shared/components/auth-modal/auth-modal.component';

@Component({
  selector: 'app-item-public-view',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, BreadcrumbsComponent, AuthModalComponent],
  templateUrl: './item-public-view.html',
  styleUrl: './item-public-view.scss',
})
export class ItemPublicView implements OnInit {
  loading = true;
  loadingReviews = true;
  item: any = null;
  business: any = null;
  reviews: any[] = [];
  userHasReview = false;
  currentUser: any = null;
  activeReviewMenu: string | null = null;
  activeReplyMenu: string | null = null;
  expandedReplies: Set<string> = new Set();
  replyingToReview: string | null = null;
  replyText: { [key: string]: string } = {};
  submittingReply = false;
  editingReply: string | null = null;
  editReplyText: { [key: string]: string } = {};
  submittingEdit = false;
  loadingReplies: { [key: string]: boolean } = {};
  showDeleteConfirm: boolean = false;
  reviewToDelete: any = null;
  adminDeleteMode: boolean = false;
  reviewAvatarFailed: { [key: string]: boolean } = {};
  replyAvatarFailed: { [key: string]: boolean } = {};
  showAuthModal = false;

  // Icons
  readonly Home = Home;
  readonly Star = Star;
  readonly MessageSquare = MessageSquare;
  readonly ThumbsUp = ThumbsUp;
  readonly ThumbsDown = ThumbsDown;
  readonly User = User;
  readonly MoreVertical = MoreVertical;
  readonly Edit = Edit;
  readonly Trash = Trash;
  readonly Package = Package;
  readonly Building = Building;
  readonly IndianRupee = IndianRupee;
  readonly Sun = Sun;
  readonly Moon = Moon;
  
  breadcrumbs: Crumb[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public themeService: ThemeService,
    private itemService: ItemService,
    private businessService: BusinessService,
    private reviewService: ReviewService,
    private storage: StorageService,
    private notification: NotificationService,
    private reactionService: ReactionService,
    private replyService: ReplyService
  ) {}

  ngOnInit() {
    this.currentUser = this.storage.getUser();
    
    // Check for admin delete mode
    this.route.queryParams.subscribe(params => {
      this.adminDeleteMode = params['adminDelete'] === 'true';
      if (this.adminDeleteMode) {
      }
    });
    
    const id = this.route.snapshot.paramMap.get('id') || '';
    if (id) {
      this.loadItem(id);
      this.loadReviews(id);
    } else {
      this.loading = false;
      this.loadingReviews = false;
    }

    // Close menu when clicking outside
    document.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (this.activeReviewMenu && !target.closest('.review-actions')) {
        this.activeReviewMenu = null;
      }
      if (this.activeReplyMenu && !target.closest('.reply-actions')) {
        this.activeReplyMenu = null;
      }
    });
  }

  loadItem(id: string) {
    this.itemService.getItemById(id).subscribe({
      next: (resp: any) => {
        const data = resp.data || resp;
        this.item = data.item || data;
        
        // Load business details if available
        if (this.item.businessId) {
          const businessId = typeof this.item.businessId === 'string' 
            ? this.item.businessId 
            : this.item.businessId._id;
          this.loadBusiness(businessId);
        }
        
        this.loading = false;
      },
      error: () => { 
        this.loading = false; 
      }
    });
  }

  loadBusiness(businessId: string) {
    this.businessService.getBusinessById(businessId).subscribe({
      next: (resp: any) => {
        const data = resp.data || resp;
        this.business = data.business || data;
        this.updateBreadcrumbs();
      },
      error: () => {
        // Ignore error, business details are optional
        this.updateBreadcrumbs();
      }
    });
  }

  loadReviews(itemId: string) {
    this.reviewService.getReviewsByItem(itemId).subscribe({
      next: (resp: any) => {
        const data = resp.data || resp;
        this.reviews = data.reviews || data || [];
        
        // Debug: Log to check user matching
        this.reviews.forEach((review, index) => {
          console.log(`Review ${index + 1}:`, {
            reviewId: review._id,
            userId: review.userId,
            userIdType: typeof review.userId,
            userId_id: review.userId?._id,
            userIdId: review.userId?.id,
            username: review.userId?.username || review.userId?.name
          });
        });
        // Check if current user already has a review
        const currentUserId = this.currentUser?._id || this.currentUser?.id;
        if (this.currentUser && currentUserId) {
          this.userHasReview = this.reviews.some((review: any) => {
            const reviewUserId = review.userId?._id || review.userId?.id || review.userId;
            return String(reviewUserId) === String(currentUserId);
          });
        }
        
        this.loadingReviews = false;
      },
      error: () => {
        this.loadingReviews = false;
      }
    });
  }

  writeReview() {
    if (!this.currentUser) {
      this.showAuthModal = true;
      return;
    }
    
    if (this.userHasReview) {
      // Navigate to edit mode - find user's review
      const currentUserId = this.currentUser?._id || this.currentUser?.id;
      const userReview = this.reviews.find((review: any) => {
        const reviewUserId = review.userId?._id || review.userId?.id || review.userId;
        return String(reviewUserId) === String(currentUserId);
      });
      
      if (userReview) {
        // Navigate to edit review page
        const businessId = typeof this.item.businessId === 'string' 
          ? this.item.businessId 
          : this.item.businessId?._id;
          
        this.router.navigate(['/write-review'], {
          queryParams: {
            itemId: this.item._id,
            businessId: businessId,
            reviewId: userReview._id,
            edit: 'true'
          }
        });
      }
      return;
    }
    
    const businessId = typeof this.item.businessId === 'string' 
      ? this.item.businessId 
      : this.item.businessId?._id;
      
    if (this.item._id && businessId) {
      this.router.navigate(['/write-review'], {
        queryParams: {
          itemId: this.item._id,
          businessId: businessId
        }
      });
    }
  }

  updateBreadcrumbs(): void {
    const businessId = typeof this.item?.businessId === 'string' 
      ? this.item.businessId 
      : this.item?.businessId?._id;
    
    if (this.business && this.item) {
      this.breadcrumbs = [
        { label: 'Home', link: '/', icon: this.Home },
        { label: 'Businesses', link: '/search?tab=businesses' },
        { label: this.business.name, link: `/business/${businessId}` },
        { label: this.item.name }
      ];
    } else if (this.item) {
      this.breadcrumbs = [
        { label: 'Home', link: '/', icon: this.Home },
        { label: 'Items', link: '/search?tab=items' },
        { label: this.item.name }
      ];
    }
  }

  navigateToBusiness() {
    const businessId = typeof this.item?.businessId === 'string' 
      ? this.item.businessId 
      : this.item?.businessId?._id;
      
    if (businessId) {
      this.router.navigate(['/business', businessId]);
    }
  }

  getStarFill(starPosition: number, rating: number): string {
    if (starPosition <= rating) {
      return 'currentColor';
    }
    return 'none';
  }
  
  getStarColor(starPosition: number, rating: number): string {
    if (starPosition <= rating) {
      return '#fbbf24'; // Yellow/amber
    }
    return '#4a4a4a'; // Dark gray for empty stars
  }

  isUserReview(review: any): boolean {
    // Admin delete mode - show delete for all reviews
    if (this.adminDeleteMode) {
      return true;
    }
    
    const currentUserId = this.currentUser?._id || this.currentUser?.id;
    if (!this.currentUser || !currentUserId) return false;
    
    const reviewUserId = review.userId?._id || review.userId?.id || review.userId;
    const match = String(reviewUserId) === String(currentUserId);
    
    console.log('isUserReview check:', { 
      reviewUserId, 
      currentUserId, 
      match,
      reviewUserIdType: typeof reviewUserId,
      currentUserIdType: typeof currentUserId
    });
    
    return match;
  }
  
  isBusinessOwner(): boolean {
    if (!this.currentUser || !this.business) return false;
    const businessOwnerId = this.business.ownerId?._id || this.business.ownerId;
    return this.currentUser._id === businessOwnerId;
  }

  isSuperAdmin(): boolean {
    return this.currentUser?.role === 'super_admin';
  }

  toggleReviewMenu(reviewId: string) {
    this.activeReviewMenu = this.activeReviewMenu === reviewId ? null : reviewId;
  }

  editReview(review: any) {
    this.activeReviewMenu = null;
    const businessId = typeof this.item.businessId === 'string' 
      ? this.item.businessId 
      : this.item.businessId?._id;
      
    this.router.navigate(['/write-review'], {
      queryParams: {
        itemId: this.item._id,
        businessId: businessId,
        reviewId: review._id,
        edit: 'true'
      }
    });
  }

  deleteReview(review: any) {
    this.activeReviewMenu = null;
    this.reviewToDelete = review;
    this.showDeleteConfirm = true;
  }

  confirmDeleteReview() {
    if (!this.reviewToDelete) return;

    const reviewId = this.reviewToDelete._id;
    this.showDeleteConfirm = false;
    
    this.reviewService.deleteReview(reviewId).subscribe({
      next: () => {
        this.notification.showSuccess('Review deleted successfully');
        this.reviewToDelete = null;
        // Reload reviews
        this.loadReviews(this.item._id);
      },
      error: (err: any) => {
        this.notification.showError(err.error?.message || 'Failed to delete review');
        this.reviewToDelete = null;
      }
    });
  }

  cancelDeleteReview() {
    this.showDeleteConfirm = false;
    this.reviewToDelete = null;
  }

  toggleReplies(reviewId: string) {
    if (this.expandedReplies.has(reviewId)) {
      this.expandedReplies.delete(reviewId);
    } else {
      this.expandedReplies.add(reviewId);
      // Reload replies to get fresh data with user info
      this.loadRepliesForReview(reviewId);
    }
  }
  
  loadRepliesForReview(reviewId: string) {
    this.loadingReplies[reviewId] = true;
    
    this.replyService.getRepliesByReview(reviewId).subscribe({
      next: (response: any) => {
        this.loadingReplies[reviewId] = false;
        
        if (response.success || response.data) {
          const data = response.data || response;
          const replies = data.replies || [];
          
          // Update the review's replies
          const review = this.reviews.find(r => r._id === reviewId);
          if (review) {
            review.replies = replies;
          }
        }
      },
      error: (err: any) => {
        this.loadingReplies[reviewId] = false;
      }
    });
  }

  isRepliesExpanded(reviewId: string): boolean {
    return this.expandedReplies.has(reviewId);
  }

  getRating(): number {
    return this.item?.stats?.averageRating || this.item?.averageRating || 0;
  }

  getReviewCount(): number {
    return this.item?.stats?.totalReviews || this.reviews.length || 0;
  }

  getDefaultImage(): string {
    return 'data:image/svg+xml,%3Csvg width="400" height="300" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="g" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23f59e0b;stop-opacity:1"/%3E%3Cstop offset="100%25" style="stop-color:%23f97316;stop-opacity:1"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="300" fill="url(%23g)"/%3E%3Cg transform="translate(200,125)"%3E%3Cpath d="M-20,0 L20,0 L24,40 L-24,40 Z" fill="white" opacity="0.9" stroke="white" stroke-width="2"/%3E%3Cpath d="M-12,-8 Q-12,-18 0,-18 Q12,-18 12,-8" fill="none" stroke="white" stroke-width="3" opacity="0.9"/%3E%3C/g%3E%3Ctext x="50%25" y="75%25" font-family="Arial" font-size="16" fill="white" text-anchor="middle" opacity="0.9"%3ENo Image Available%3C/text%3E%3C/svg%3E';
  }

  toggleReaction(review: any, type: 'helpful' | 'not_helpful') {
    if (!this.currentUser) {
      this.showAuthModal = true;
      return;
    }

    this.reactionService.toggleReaction(review._id, type).subscribe({
      next: (response: any) => {
        // Update the review's reaction counts locally
        if (!review.reactions) {
          review.reactions = { helpful: 0, notHelpful: 0 };
        }
        review.reactions.helpful = response.data.stats.helpful;
        review.reactions.notHelpful = response.data.stats.notHelpful;
        
        const action = response.data.action;
        if (action === 'added') {
          this.notification.showSuccess('Reaction added');
        } else if (action === 'removed') {
          this.notification.showSuccess('Reaction removed');
        } else if (action === 'updated') {
          this.notification.showSuccess('Reaction updated');
        }
      },
      error: (err: any) => {
        this.notification.showError(err.error?.message || 'Failed to react to review');
      }
    });
  }

  startReply(reviewId: string) {
    if (!this.currentUser) {
      this.showAuthModal = true;
      return;
    }
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
      this.notification.showError('Please enter a reply');
      return;
    }

    this.submittingReply = true;
    const replyData: CreateReplyRequest = {
      reviewId: reviewId,
      comment: text
    };

    this.replyService.createReply(replyData).subscribe({
      next: (response: any) => {
        this.notification.showSuccess('Reply added successfully');
        
        // Add the new reply to the review's replies array
        if (!review.replies) {
          review.replies = [];
        }
        review.replies.push(response.data);
        
        // Clear reply form
        this.cancelReply(reviewId);
        this.submittingReply = false;
        
        // Expand replies to show the new reply
        this.expandedReplies.add(reviewId);
      },
      error: (err: any) => {
        this.notification.showError(err.error?.message || 'Failed to add reply');
        this.submittingReply = false;
      }
    });
  }
  
  toggleReplyMenu(replyId: string) {
    this.activeReplyMenu = this.activeReplyMenu === replyId ? null : replyId;
  }
  
  isUserReply(reply: any): boolean {
    if (!this.currentUser) {
      return false;
    }
    
    const replyUserId = reply.userId?._id || reply.userId;
    const replyUsername = reply.userId?.username || '';
    const replyEmail = reply.userId?.email || '';
    
    const currentUserId = this.currentUser._id || this.currentUser.id;
    const currentUsername = this.currentUser.username || '';
    const currentEmail = this.currentUser.email || '';
    
    // Check if user matches by ID, username, or email
    const matchById = currentUserId && replyUserId && (replyUserId === currentUserId);
    const matchByUsername = currentUsername && replyUsername && (replyUsername === currentUsername);
    const matchByEmail = currentEmail && replyEmail && (replyEmail === currentEmail);
    
    return matchById || matchByUsername || matchByEmail;
  }
  
  startEditReply(reply: any) {
    this.editingReply = reply._id;
    this.editReplyText[reply._id] = reply.comment || reply.text;
  }
  
  cancelEditReply(replyId: string) {
    this.editingReply = null;
    delete this.editReplyText[replyId];
  }
  
  saveEditReply(reply: any, review: any) {
    const replyId = reply._id;
    const text = this.editReplyText[replyId]?.trim();
    
    if (!text) {
      this.notification.showError('Please enter a reply');
      return;
    }
    
    this.submittingEdit = true;
    
    this.replyService.updateReply(replyId, { comment: text }).subscribe({
      next: (response: any) => {
        this.notification.showSuccess('Reply updated successfully');
        
        // Update the reply in the review's replies array
        if (review.replies) {
          const index = review.replies.findIndex((r: any) => r._id === replyId);
          if (index !== -1) {
            review.replies[index] = response.data;
          }
        }
        
        // Clear edit form
        this.cancelEditReply(replyId);
        this.submittingEdit = false;
      },
      error: (err: any) => {
        this.notification.showError(err.error?.message || 'Failed to update reply');
        this.submittingEdit = false;
      }
    });
  }
  
  deleteReplyConfirm(reply: any, review: any) {
    if (!confirm('Are you sure you want to delete this reply? This action cannot be undone.')) {
      return;
    }
    
    this.replyService.deleteReply(reply._id).subscribe({
      next: () => {
        this.notification.showSuccess('Reply deleted successfully');
        
        // Remove the reply from the review's replies array
        if (review.replies) {
          review.replies = review.replies.filter((r: any) => r._id !== reply._id);
        }
      },
      error: (err: any) => {
        this.notification.showError(err.error?.message || 'Failed to delete reply');
      }
    });
  }
  
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
  
  // Avatar helper methods
  getReviewerAvatar(review: any): string | null {
    const userId = review.userId;
    if (!userId) return null;
    
    // Check for Google profile picture
    if (userId.profilePicture) {
      return userId.profilePicture;
    }
    
    // Check for regular profile avatar
    if (userId.profile?.avatar) {
      return userId.profile.avatar;
    }
    
    return null;
  }

  getReviewerInitial(review: any): string {
    const userId = review.userId;
    if (!userId) return '?';
    
    const name = userId.name || userId.username || 'User';
    return name.charAt(0).toUpperCase();
  }

  onReviewAvatarError(reviewId: string): void {
    this.reviewAvatarFailed[reviewId] = true;
  }

  navigateToUserProfile(review: any): void {
    const user = review.userId;
    if (!user) return;
    const userId = typeof user === 'object' ? user._id : user;
    if (userId) {
      this.router.navigate(['/user', userId]);
    }
  }

  getReplyAvatar(reply: any): string | null {
    const userId = reply?.userId;
    if (!userId) return null;
    
    // Check for Google profile picture
    if (userId.profilePicture) {
      return userId.profilePicture;
    }
    
    // Check for regular profile avatar
    if (userId.profile?.avatar) {
      return userId.profile.avatar;
    }
    
    return null;
  }

  getReplyInitial(reply: any): string {
    const userId = reply?.userId;
    if (!userId) return '?';
    
    const name = userId.name || userId.username || 'User';
    return name.charAt(0).toUpperCase();
  }

  onReplyAvatarError(replyId: string): void {
    this.replyAvatarFailed[replyId] = true;
  }

  onAuthSuccess(): void {
    this.showAuthModal = false;
    this.currentUser = this.storage.getUser();
    // Reload reviews to check if user has review
    if (this.item?._id) {
      this.loadReviews(this.item._id);
    }
  }

  closeAuthModal(): void {
    this.showAuthModal = false;
  }
}
