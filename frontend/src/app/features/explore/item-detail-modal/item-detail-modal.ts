import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ItemService, Item } from '../../../core/services/item';
import { ReviewService } from '../../../core/services/review';
import { StorageService } from '../../../core/services/storage';
import { LucideAngularModule, X, Star, MapPin, DollarSign, Clock, ChevronLeft, ChevronRight } from 'lucide-angular';

@Component({
  selector: 'app-item-detail-modal',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './item-detail-modal.html',
  styleUrl: './item-detail-modal.scss',
})
export class ItemDetailModal implements OnInit, OnChanges {
  @Input() item: Item | null = null;
  @Input() businessId: string | null = null;
  @Output() closeModal = new EventEmitter<void>();
  
  // Lucide icons
  readonly X = X;
  readonly Star = Star;
  readonly MapPin = MapPin;
  readonly DollarSign = DollarSign;
  readonly Clock = Clock;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  
  // State
  loading = false;
  reviews: any[] = [];
  currentImageIndex = 0;
  currentUser: any = null;
  hasUserReview = false;
  
  // Rating distribution
  ratingDistribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0
  };
  
  constructor(
    private itemService: ItemService,
    private reviewService: ReviewService,
    private storageService: StorageService,
    private router: Router
  ) {}
  
  ngOnInit() {
    this.currentUser = this.storageService.getUser();
    if (this.item) {
      this.loadReviews();
    }
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['item'] && this.item) {
      this.loadReviews();
      this.currentImageIndex = 0;
    }
  }
  
  // Close modal on ESC key
  @HostListener('document:keydown.escape')
  onEscapeKey() {
    this.close();
  }
  
  loadReviews() {
    if (!this.item) return;
    
    this.loading = true;
    this.reviewService.getReviewsByItem(this.item._id).subscribe({
      next: (response: any) => {
        const data = response.data || response;
        this.reviews = data.reviews || data || [];
        this.calculateRatingDistribution();
        this.checkUserReview();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load reviews', err);
        this.loading = false;
      }
    });
  }
  
  checkUserReview() {
    if (!this.currentUser || !this.item) {
      this.hasUserReview = false;
      return;
    }
    
    // Check if any review in the list is from the current user
    this.hasUserReview = this.reviews.some(review => 
      review.userId?._id === this.currentUser._id || 
      review.userId === this.currentUser._id
    );
  }
  
  calculateRatingDistribution() {
    this.ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    this.reviews.forEach(review => {
      const rating = review.rating;
      if (rating >= 1 && rating <= 5) {
        this.ratingDistribution[rating as keyof typeof this.ratingDistribution]++;
      }
    });
  }
  
  getRatingPercentage(rating: number): number {
    if (this.reviews.length === 0) return 0;
    return (this.ratingDistribution[rating as keyof typeof this.ratingDistribution] / this.reviews.length) * 100;
  }
  
  getRatingCount(rating: number): number {
    return this.ratingDistribution[rating as keyof typeof this.ratingDistribution];
  }
  
  getRatingArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }
  
  hasHalfStar(rating: number): boolean {
    return rating % 1 >= 0.5;
  }
  
  getEmptyStars(rating: number): number[] {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5 ? 1 : 0;
    return Array(5 - fullStars - hasHalf).fill(0);
  }
  
  // Image gallery navigation
  nextImage() {
    if (!this.item || !this.item.images) return;
    if (this.currentImageIndex < this.item.images.length - 1) {
      this.currentImageIndex++;
    } else {
      this.currentImageIndex = 0; // Loop back
    }
  }
  
  previousImage() {
    if (!this.item || !this.item.images) return;
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    } else {
      this.currentImageIndex = this.item.images.length - 1; // Loop to end
    }
  }
  
  selectImage(index: number) {
    this.currentImageIndex = index;
  }
  
  // Availability status
  getAvailabilityClass(): string {
    if (!this.item) return '';
    const status = this.item.availability?.status || 'available';
    return status.replace('_', '-');
  }
  
  getAvailabilityText(): string {
    if (!this.item) return '';
    const status = this.item.availability?.status || 'available';
    return status === 'available' ? 'In Stock' : 
           status === 'out_of_stock' ? 'Out of Stock' : 
           'Coming Soon';
  }
  
  // Navigation
  writeReview() {
    if (!this.item || !this.businessId) return;
    
    if (this.hasUserReview) {
      // Scroll to user's review
      const userReview = this.reviews.find(review => 
        review.userId?._id === this.currentUser._id || 
        review.userId === this.currentUser._id
      );
      if (userReview) {
        // Already in modal, just scroll to the review
        setTimeout(() => {
          const reviewElement = document.querySelector('.review-card.user-review');
          if (reviewElement) {
            reviewElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    } else {
      // Navigate to write review
      this.close();
      this.router.navigate(['/write-review'], {
        queryParams: {
          itemId: this.item._id,
          businessId: this.businessId
        }
      });
    }
  }
  
  getReviewButtonText(): string {
    return this.hasUserReview ? 'View Your Review' : 'Write Review';
  }
  
  close() {
    this.closeModal.emit();
  }
  
  // Prevent modal content click from closing modal
  onModalContentClick(event: Event) {
    event.stopPropagation();
  }
  
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
