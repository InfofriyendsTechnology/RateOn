import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, MapPin, Phone, Globe, Star, Clock, Building, Package, ImageIcon, ChevronUp, Info, Edit, User, MoreVertical, Trash, ThumbsUp, ThumbsDown, MessageSquare, Edit2, Trash2 } from 'lucide-angular';
import { BusinessService } from '../../../core/services/business';
import { ItemService } from '../../../core/services/item';
import { ReviewService } from '../../../core/services/review';
import { StorageService } from '../../../core/services/storage';
import { NotificationService } from '../../../core/services/notification.service';
import { ReactionService } from '../../../core/services/reaction.service';
import { ReplyService, CreateReplyRequest } from '../../../core/services/reply.service';
import { ItemCard } from '../../../shared/components/item-card/item-card';

@Component({
  selector: 'app-business-public-view',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ItemCard],
  templateUrl: './business-public-view.html',
  styleUrl: './business-public-view.scss',
})
export class BusinessPublicView implements OnInit {
  loading = true;
  loadingItems = true;
  loadingReviews = true;
  business: any = null;
  items: any[] = [];
  businessReviews: any[] = [];
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
  showAllPhotos = false;
  showAllHours = false;
  activeTab: 'items' | 'reviews' = 'items';
  readonly MapPin = MapPin;
  readonly Phone = Phone;
  readonly Globe = Globe;
  readonly Star = Star;
  readonly Clock = Clock;
  readonly Building = Building;
  readonly Package = Package;
  readonly ImageIcon = ImageIcon;
  readonly ChevronUp = ChevronUp;
  readonly Info = Info;
  readonly Edit = Edit;
  readonly User = User;
  readonly MoreVertical = MoreVertical;
  readonly Trash = Trash;
  readonly ThumbsUp = ThumbsUp;
  readonly ThumbsDown = ThumbsDown;
  readonly MessageSquare = MessageSquare;
  readonly Edit2 = Edit2;
  readonly Trash2 = Trash2;
  readonly Math = Math;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private businessService: BusinessService,
    private itemService: ItemService,
    private reviewService: ReviewService,
    private storage: StorageService,
    private notification: NotificationService,
    private reactionService: ReactionService,
    private replyService: ReplyService
  ) {}

  ngOnInit() {
    this.currentUser = this.storage.getUser();
    const id = this.route.snapshot.paramMap.get('id') || '';
    if (id) {
      this.loadBusiness(id);
      this.loadItems(id);
      this.loadBusinessReviews(id);
    } else {
      this.loading = false;
      this.loadingItems = false;
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

  loadBusiness(id: string) {
    this.businessService.getBusinessById(id).subscribe({
      next: (resp: any) => {
        const data = resp.data || resp;
        this.business = data.business || data;
        console.log('Business Data:', this.business);
        console.log('Description:', this.business.description);
        console.log('Location:', this.business.location);
        console.log('Contact:', this.business.contact);
        console.log('Hours:', this.business.businessHours);
        this.loading = false;
      },
      error: () => { 
        this.loading = false; 
      }
    });
  }

  loadItems(businessId: string) {
    this.itemService.getItemsByBusiness(businessId).subscribe({
      next: (resp: any) => {
        const data = resp.data || resp;
        this.items = data.items || data || [];
        console.log('Items loaded:', this.items.length, this.items);
        this.loadingItems = false;
      },
      error: () => {
        this.loadingItems = false;
      }
    });
  }

  loadBusinessReviews(businessId: string) {
    this.reviewService.getReviewsByBusiness(businessId, { reviewType: 'business' }).subscribe({
      next: (resp: any) => {
        const data = resp.data || resp;
        this.businessReviews = data.reviews || data || [];
        
        // Check if current user already has a review
        if (this.currentUser && this.currentUser._id) {
          this.userHasReview = this.businessReviews.some((review: any) => {
            const reviewUserId = review.userId?._id || review.userId;
            return reviewUserId === this.currentUser._id;
          });
        }
        
        this.loadingReviews = false;
      },
      error: () => {
        this.loadingReviews = false;
      }
    });
  }

  onReviewAction(item: any) {
    // Extract businessId - handle both string and object format
    const businessId = typeof item.businessId === 'string' 
      ? item.businessId 
      : item.businessId?._id || this.business?._id;

    // Navigate to write review with proper query params
    this.router.navigate(['/write-review'], {
      queryParams: {
        itemId: item._id,
        businessId: businessId
      }
    });
  }

  onCardClick(item: any) {
    // Navigate to item detail page
    this.router.navigate(['/item', item._id]);
  }

  writeBusinessReview() {
    if (!this.currentUser) {
      this.notification.showError('Please login to write a review');
      return;
    }
    
    if (this.userHasReview) {
      // Navigate to edit mode - find user's review
      const userReview = this.businessReviews.find((review: any) => {
        const reviewUserId = review.userId?._id || review.userId;
        return reviewUserId === this.currentUser._id;
      });
      
      if (userReview) {
        // Navigate to edit review page
        this.router.navigate(['/write-review'], {
          queryParams: {
            businessId: this.business._id,
            reviewType: 'business',
            reviewId: userReview._id,
            edit: 'true'
          }
        });
      }
      return;
    }
    
    if (this.business?._id) {
      this.router.navigate(['/write-review'], {
        queryParams: {
          businessId: this.business._id,
          reviewType: 'business'
        }
      });
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
      return '#C0C0C0'; // Silver metallic
    }
    return '#4a4a4a'; // Dark gray for empty stars
  }
  
  formatTime(time24: string): string {
    if (!time24) return '';
    
    const [hourStr, minute] = time24.split(':');
    const hour = parseInt(hourStr, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    
    return `${hour12}:${minute} ${period}`;
  }

  setActiveTab(tab: 'items' | 'reviews') {
    this.activeTab = tab;
  }

  isUserReview(review: any): boolean {
    if (!this.currentUser || !this.currentUser._id) return false;
    const reviewUserId = review.userId?._id || review.userId;
    return reviewUserId === this.currentUser._id;
  }
  
  isBusinessOwner(): boolean {
    if (!this.currentUser || !this.business) return false;
    const businessOwnerId = this.business.ownerId?._id || this.business.ownerId;
    return this.currentUser._id === businessOwnerId;
  }

  toggleReviewMenu(reviewId: string) {
    this.activeReviewMenu = this.activeReviewMenu === reviewId ? null : reviewId;
  }

  toggleReplyMenu(replyId: string) {
    this.activeReplyMenu = this.activeReplyMenu === replyId ? null : replyId;
  }

  editReview(review: any) {
    this.activeReviewMenu = null;
    this.router.navigate(['/write-review'], {
      queryParams: {
        businessId: this.business._id,
        reviewType: 'business',
        reviewId: review._id,
        edit: 'true'
      }
    });
  }

  deleteReview(review: any) {
    this.activeReviewMenu = null;
    
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    this.reviewService.deleteReview(review._id).subscribe({
      next: () => {
        this.notification.showSuccess('Review deleted successfully');
        // Reload reviews
        this.loadBusinessReviews(this.business._id);
      },
      error: (err: any) => {
        this.notification.showError(err.error?.message || 'Failed to delete review');
      }
    });
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
          const review = this.businessReviews.find(r => r._id === reviewId);
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

  toggleReaction(review: any, type: 'helpful' | 'not_helpful') {
    if (!this.currentUser) {
      this.notification.showError('Please login to react to reviews');
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
      this.notification.showError('Please login to reply to reviews');
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
  
}
 
