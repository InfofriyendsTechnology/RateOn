import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BusinessService, Business } from '../../../core/services/business';
import { ItemService, Item } from '../../../core/services/item';
import { ReviewService } from '../../../core/services/review';
import { StorageService } from '../../../core/services/storage';
import { ItemDetailModal } from '../item-detail-modal/item-detail-modal';
import { ItemCard } from '../../../shared/components/item-card/item-card';
import { RatingStars } from '../../../shared/components/rating-stars/rating-stars';
import { LucideAngularModule, ArrowLeft, MapPin, Phone, Clock, CheckCircle, Star, ChevronLeft, ChevronRight, ChevronDown, Edit, X } from 'lucide-angular';
import { BreadcrumbsComponent } from '../../../shared/components/breadcrumbs/breadcrumbs';
@Component({
  selector: 'app-business-detail',
imports: [CommonModule, FormsModule, RouterLink, ItemCard, RatingStars, LucideAngularModule, BreadcrumbsComponent],
  templateUrl: './business-detail.html',
  styleUrl: './business-detail.scss',
})
export class BusinessDetail implements OnInit {
  business: Business | null = null;
  items: Item[] = [];
  reviews: any[] = [];
  loading = false;
  error = '';
  
  selectedTab: 'items' | 'reviews' = 'items';
  
  // Filters
  showAvailableOnly = false;
  selectedCategory = '';
  categories: string[] = [];
  
  // Reply functionality
  replyingToReview: string | null = null;
  replyText: { [key: string]: string } = {};
  currentUser: any = null;
  isBusinessOwner = false;

  // Per-review image slider state
  reviewImageIndex: { [reviewId: string]: number } = {};

  // Image preview modal state
  showImagePreview: boolean = false;
  previewImages: string[] = [];
  previewIndex: number = 0;

  // Lucide icons
  readonly ArrowLeft = ArrowLeft;
  readonly MapPin = MapPin;
  readonly Phone = Phone;
  readonly Clock = Clock;
  readonly CheckCircle = CheckCircle;
  readonly Star = Star;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly ChevronDown = ChevronDown;
  readonly Edit = Edit;
  readonly X = X;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private businessService: BusinessService,
    private itemService: ItemService,
    private reviewService: ReviewService,
    private storage: StorageService
  ) {}

  ngOnInit() {
    const businessId = this.route.snapshot.paramMap.get('id');
    if (businessId) {
      this.loadBusinessDetails(businessId);
      this.loadItems(businessId);
      this.loadReviews(businessId);
    }
    
    // Check if current user is business owner
    this.currentUser = this.storage.getUser();
    if (this.currentUser && businessId) {
      const userBusinessId = this.currentUser.business?._id || this.currentUser.claimedBusiness?._id;
      this.isBusinessOwner = userBusinessId === businessId;
    }
  }

  loadBusinessDetails(businessId: string) {
    this.loading = true;
    this.businessService.getBusinessById(businessId).subscribe({
      next: (response: any) => {
        const data = response.data || response;
        const rawBusiness: any = data.business || data;
        
        // Map backend fields to frontend
        if (rawBusiness) {
          this.business = {
            ...rawBusiness,
            images: rawBusiness.coverImages || rawBusiness.images || [],
            address: {
              street: rawBusiness.location?.address || '',
              area: rawBusiness.location?.address || '',
              city: rawBusiness.location?.city || '',
              state: rawBusiness.location?.state || ''
            },
            phone: rawBusiness.contact?.phone || '',
            hours: rawBusiness.operatingHours || '',
            claimed: rawBusiness.isClaimed || false,
            averageRating: rawBusiness.stats?.avgRating || 0,
            totalReviews: rawBusiness.stats?.totalReviews || 0,
            totalItems: rawBusiness.stats?.totalItems || 0
          } as Business;
        }
        
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load business details';
        this.loading = false;
        console.error('Business detail error:', err);
      }
    });
  }

  loadItems(businessId: string) {
    this.itemService.getItemsByBusiness(businessId).subscribe({
      next: (response: any) => {
        const data = response.data || response;
        this.items = data.items || data || [];
        
        // Map backend fields
        this.items = this.items.map((item: any) => ({
          ...item,
          isAvailable: item.availability?.status === 'available',
          totalReviews: item.reviewCount || 0,
          hasUserReview: false // Will be updated by checkUserReviews
        }));
        
        // Extract unique categories
        this.categories = [...new Set(this.items.map(item => item.category).filter(Boolean))];
        
        // Check user review status for each item if user is logged in
        if (this.currentUser) {
          this.checkUserReviews();
        }
      },
      error: (err: any) => {
        console.error('Failed to load items', err);
      }
    });
  }

  loadReviews(businessId: string) {
    this.reviewService.getReviewsByBusiness(businessId, { limit: 100 }).subscribe({
      next: (response: any) => {
        const data = response.data || response;
        this.reviews = data.reviews || data || [];
        console.log('Loaded reviews:', this.reviews);
        console.log('First review structure:', this.reviews[0]);
      },
      error: (err: any) => {
        console.error('Failed to load reviews', err);
      }
    });
  }
  
  checkUserReviews() {
    if (!this.currentUser) return;
    
    // Check each item to see if user has reviewed it
    this.items.forEach((item, index) => {
      this.reviewService.getReviewsByItem(item._id).subscribe({
        next: (response: any) => {
          const data = response.data || response;
          const reviews = data.reviews || data || [];
          // Check if any review belongs to current user
          const hasReview = reviews.some((review: any) => 
            review.userId?._id === this.currentUser._id || 
            review.userId === this.currentUser._id
          );
          // Update the item in the array to trigger change detection
          this.items[index] = {
            ...item,
            hasUserReview: hasReview
          };
        },
        error: () => {
          this.items[index] = {
            ...item,
            hasUserReview: false
          };
        }
      });
    });
  }

  get filteredItems(): Item[] {
    let filtered = this.items;
    
    if (this.showAvailableOnly) {
      filtered = filtered.filter(item => item.isAvailable);
    }
    
    if (this.selectedCategory) {
      filtered = filtered.filter(item => item.category === this.selectedCategory);
    }
    
    return filtered;
  }

  selectTab(tab: 'items' | 'reviews') {
    this.selectedTab = tab;
  }


  navigateToReview(item: any) {
    // Business owners shouldn't be able to review their own items
    if (this.isBusinessOwner) {
      return;
    }
    
    // Navigate to write review page (will handle both new and edit)
    this.router.navigate(['/write-review'], { 
      queryParams: { 
        itemId: item._id,
        businessId: this.business?._id 
      } 
    });
  }
  
  handleItemAction(item: any) {
    // Same as navigateToReview for consistency
    this.navigateToReview(item);
  }
  
  getReviewButtonText(item: any): string {
    return (item as any).hasUserReview ? 'View Review' : 'Write Review';
  }
  
  hasReviewed(item: any): boolean {
    return !!(item as any).hasUserReview;
  }

  goBack() {
    this.router.navigate(['/explore']);
  }
  
  editBusiness() {
    if (this.business) {
      // Navigate to edit business page within dashboard
      this.router.navigate(['/business/dashboard/edit', this.business._id]);
    }
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

  getStatusClass(isAvailable: boolean): string {
    return isAvailable ? 'available' : 'unavailable';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  getDefaultBusinessImage(): string {
    // SVG with store/building icon and gradient for main business image
    return 'data:image/svg+xml,%3Csvg width="800" height="400" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="g" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23082052;stop-opacity:1"/%3E%3Cstop offset="100%25" style="stop-color:%231e40af;stop-opacity:1"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="400" fill="url(%23g)"/%3E%3Cg transform="translate(400,150)"%3E%3Crect x="-50" y="0" width="100" height="90" fill="white" opacity="0.9" rx="6"/%3E%3Crect x="-40" y="12" width="30" height="28" fill="%23082052" opacity="0.3" rx="3"/%3E%3Crect x="10" y="12" width="30" height="28" fill="%23082052" opacity="0.3" rx="3"/%3E%3Crect x="-40" y="48" width="30" height="28" fill="%23082052" opacity="0.3" rx="3"/%3E%3Crect x="10" y="48" width="30" height="28" fill="%23082052" opacity="0.3" rx="3"/%3E%3Crect x="-14" y="66" width="28" height="24" fill="%23082052" opacity="0.5" rx="3"/%3E%3C/g%3E%3Ctext x="50%25" y="75%25" font-family="Arial" font-size="20" fill="white" text-anchor="middle" opacity="0.8" font-weight="bold"%3ENo Image Available%3C/text%3E%3C/svg%3E';
  }
  
  onBusinessImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = this.getDefaultBusinessImage();
  }
  
  onGalleryImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = this.getDefaultBusinessImage();
  }
  
  startReply(reviewId: string) {
    this.replyingToReview = reviewId;
    if (!this.replyText[reviewId]) {
      this.replyText[reviewId] = '';
    }
  }
  
  cancelReply(reviewId: string) {
    this.replyingToReview = null;
    this.replyText[reviewId] = '';
  }
  
  submitReply(reviewId: string) {
    const comment = this.replyText[reviewId]?.trim();
    if (!comment) return;
    
    this.reviewService.addOwnerReply(reviewId, comment).subscribe({
      next: () => {
        // Reload reviews to show the new reply
        if (this.business) {
          this.loadReviews(this.business._id);
        }
        this.replyingToReview = null;
        this.replyText[reviewId] = '';
      },
      error: (err) => {
        console.error('Failed to post reply:', err);
      }
    });
  }
  
  isUserReview(review: any): boolean {
    if (!this.currentUser) return false;
    // Backend sends userId as populated object or as string ID
    const userId = review.userId || review.user;
    const reviewUserId = typeof userId === 'string' ? userId : userId?._id;
    return reviewUserId === this.currentUser._id;
  }
  
  editReview(review: any) {
    // Navigate to write-review page with the item info
    // Backend sends itemId as populated object
    const itemId = review.itemId?._id || review.item?._id || review.itemId;
    if (itemId && this.business) {
      this.router.navigate(['/write-review'], { 
        queryParams: { 
          itemId: itemId,
          businessId: this.business._id 
        } 
      });
    }
  }
  
  getUserName(review: any): string {
    // Backend populates userId with user data
    const userId = review.userId || review.user;
    if (!userId) return 'Anonymous';
    
    // Try different name combinations
    if (userId.profile?.firstName || userId.profile?.lastName) {
      const firstName = userId.profile.firstName || '';
      const lastName = userId.profile.lastName || '';
      return `${firstName} ${lastName}`.trim() || 'Anonymous';
    }
    
    return userId.username || userId.name || 'Anonymous';
  }
  
  getUserAvatar(review: any): string {
    const userId = review.userId || review.user;
    return userId?.profile?.avatar || userId?.avatar || this.getDefaultAvatar(review);
  }
  
  getDefaultAvatar(review: any): string {
    const name = this.getUserName(review);
    const initial = name[0].toUpperCase();
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect fill='%231e40af' width='50' height='50'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='20' font-family='Arial'%3E${initial}%3C/text%3E%3C/svg%3E`;
  }
  
  onAvatarError(event: Event, review: any) {
    const img = event.target as HTMLImageElement;
    img.src = this.getDefaultAvatar(review);
  }
  
  getRatingCount(rating: number): number {
    return this.reviews.filter(review => review.rating === rating).length;
  }
  
  getRatingPercentage(rating: number): number {
    if (this.reviews.length === 0) return 0;
    const count = this.getRatingCount(rating);
    return (count / this.reviews.length) * 100;
  }
  
  getCalculatedAverageRating(): number {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return sum / this.reviews.length;
  }
  
  getTotalReviewsCount(): number {
    return this.reviews.length;
  }
  
  getItemForRating(rating: number): {name: string, image: string} | null {
    // Get first review with this rating
    const review = this.reviews.find(review => review.rating === rating);
    
    if (!review) return null;
    
    const itemName = review.itemId?.name || review.item?.name || 'Unknown Item';
    const itemImage = review.itemId?.images?.[0] || review.item?.images?.[0] || '';
    
    return { name: itemName, image: itemImage };
  }
  
  getDefaultItemImage(): string {
    return 'data:image/svg+xml,%3Csvg width="40" height="40" xmlns="http://www.w3.org/2000/svg"%3E%3Crect fill="%23f59e0b" width="40" height="40" rx="8"/%3E%3Cpath d="M20,12 L24,16 L20,28 L16,16 Z" fill="white" opacity="0.9"/%3E%3C/svg%3E';
  }
  
  onItemIconError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = this.getDefaultItemImage();
  }

  // Review image slider helpers
  getReviewImageIndex(reviewId: string): number {
    const idx = this.reviewImageIndex[reviewId];
    return typeof idx === 'number' ? idx : 0;
  }

  setReviewImageIndex(reviewId: string, index: number): void {
    this.reviewImageIndex[reviewId] = index;
  }

  nextReviewImage(review: any): void {
    const images = review.images || [];
    if (!images.length) return;
    const id = review._id;
    const current = this.getReviewImageIndex(id);
    this.reviewImageIndex[id] = (current + 1) % images.length;
  }

  prevReviewImage(review: any): void {
    const images = review.images || [];
    if (!images.length) return;
    const id = review._id;
    const current = this.getReviewImageIndex(id);
    this.reviewImageIndex[id] = (current - 1 + images.length) % images.length;
  }

  openImagePreview(review: any, index: number): void {
    const images = review.images || [];
    if (!images.length) return;
    this.previewImages = images;
    this.previewIndex = index;
    this.showImagePreview = true;
  }

  closeImagePreview(): void {
    this.showImagePreview = false;
  }

  nextPreviewImage(event: Event): void {
    event.stopPropagation();
    if (!this.previewImages.length) return;
    this.previewIndex = (this.previewIndex + 1) % this.previewImages.length;
  }

  prevPreviewImage(event: Event): void {
    event.stopPropagation();
    if (!this.previewImages.length) return;
    this.previewIndex = (this.previewIndex - 1 + this.previewImages.length) % this.previewImages.length;
  }
}
