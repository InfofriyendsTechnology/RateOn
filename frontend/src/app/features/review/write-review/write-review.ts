import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Star, Upload, X, Check } from 'lucide-angular';
import { ItemService, Item } from '../../../core/services/item';
import { ReviewService } from '../../../core/services/review';
import { BusinessService, Business } from '../../../core/services/business';
import { NotificationService } from '../../../core/services/notification.service';
import { StorageService } from '../../../core/services/storage';

@Component({
  selector: 'app-write-review',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './write-review.html',
  styleUrl: './write-review.scss',
})
export class WriteReview implements OnInit {
  // Lucide Icons
  readonly ArrowLeft = ArrowLeft;
  readonly Star = Star;
  readonly Upload = Upload;
  readonly X = X;
  readonly Check = Check;
  item: Item | null = null;
  business: Business | null = null;
  existingReview: any = null;
  isEditMode = false;
  isViewMode = false; // View-only mode when user has existing review
  
  // Review Form Data
  rating = 0;
  reviewText = '';
  selectedFiles: File[] = [];
  imagePreviewUrls: string[] = [];
  existingImageUrls: string[] = [];
  
  // UI State
  loading = false;
  submitting = false;
  error = '';
  hoveredRating = 0;
  showValidation = false;
  
  maxImages = 5;
  maxFileSize = 5 * 1024 * 1024; // 5MB

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private itemService: ItemService,
    private reviewService: ReviewService,
    private businessService: BusinessService,
    private notificationService: NotificationService,
    private storage: StorageService
  ) {}

  ngOnInit() {
    const itemId = this.route.snapshot.queryParamMap.get('itemId');
    const businessId = this.route.snapshot.queryParamMap.get('businessId');
    
    if (itemId) {
      this.loadItemDetails(itemId);
      this.checkExistingReview(itemId);
    }
    
    if (businessId) {
      this.loadBusinessDetails(businessId);
    }
    
    if (!itemId || !businessId) {
      this.error = 'Invalid review request. Item or Business not specified.';
    }
  }

  loadItemDetails(itemId: string) {
    this.loading = true;
    this.itemService.getItemById(itemId).subscribe({
      next: (response: any) => {
        const data = response.data || response;
        this.item = data.item || data;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load item details';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadBusinessDetails(businessId: string) {
    this.businessService.getBusinessById(businessId).subscribe({
      next: (response: any) => {
        const data = response.data || response;
        this.business = data.business || data;
      },
      error: (err: any) => {
        console.error('Failed to load business', err);
      }
    });
  }
  
  checkExistingReview(itemId: string) {
    this.reviewService.getReviewsByItem(itemId).subscribe({
      next: (response: any) => {
        const data = response.data || response;
        const reviews = data.reviews || data || [];
        
        console.log('All reviews for item:', reviews);
        
        // Find user's review (get current user from storage)
        const currentUser = this.storage.getUser();
        console.log('Current user:', currentUser);
        
        if (currentUser && currentUser._id) {
          this.existingReview = reviews.find((review: any) => {
            const reviewUserId = review.userId?._id || review.userId || review.user?._id;
            console.log('Comparing:', reviewUserId, 'with', currentUser._id);
            return reviewUserId === currentUser._id;
          });
          
          console.log('Found existing review:', this.existingReview);
          
          if (this.existingReview) {
            this.isViewMode = true; // Start in view mode
            this.isEditMode = false;
            console.log('View mode activated');
            this.prefillForm();
          }
        }
      },
      error: (err: any) => {
        console.error('Failed to check existing review', err);
      }
    });
  }
  
  prefillForm() {
    if (!this.existingReview) return;
    
    console.log('Prefilling form with:', this.existingReview);
    
    this.rating = this.existingReview.rating || 0;
    this.reviewText = this.existingReview.reviewText || this.existingReview.comment || '';
    
    console.log('Rating:', this.rating);
    console.log('Review text:', this.reviewText);
    
    // Load existing images
    if (this.existingReview.images && this.existingReview.images.length > 0) {
      this.existingImageUrls = [...this.existingReview.images];
      this.imagePreviewUrls = [...this.existingReview.images];
      console.log('Images loaded:', this.imagePreviewUrls);
    }
  }
  
  enableEditMode() {
    this.isViewMode = false;
    this.isEditMode = true;
  }

  // Rating Methods
  setRating(rating: number) {
    this.rating = rating;
  }

  setHoveredRating(rating: number) {
    this.hoveredRating = rating;
  }

  clearHoveredRating() {
    this.hoveredRating = 0;
  }

  getStarClass(star: number): string {
    const displayRating = this.hoveredRating || this.rating;
    return star <= displayRating ? 'filled' : 'empty';
  }
  
  getRatingLabel(): string {
    const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    return labels[this.rating] || '';
  }

  // Image Upload Methods
  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    
    if (this.selectedFiles.length + files.length > this.maxImages) {
      this.notificationService.showError(`Maximum ${this.maxImages} images allowed`);
      return;
    }
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.notificationService.showError('Only image files are allowed');
        continue;
      }
      
      // Validate file size
      if (file.size > this.maxFileSize) {
        this.notificationService.showError(`File ${file.name} is too large. Max size is 5MB`);
        continue;
      }
      
      this.selectedFiles.push(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviewUrls.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(index: number) {
    // Check if it's an existing image URL or a new file
    if (index < this.existingImageUrls.length) {
      // Remove from existing images
      this.existingImageUrls.splice(index, 1);
    } else {
      // Remove from new files
      const fileIndex = index - this.existingImageUrls.length;
      this.selectedFiles.splice(fileIndex, 1);
    }
    this.imagePreviewUrls.splice(index, 1);
  }

  // Form Validation
  isFormValid(): boolean {
    return this.rating > 0 && this.reviewText.trim().length >= 10;
  }

  // Submit Review
  async submitReview() {
    this.showValidation = true;
    
    if (!this.isFormValid()) {
      this.notificationService.showError('Please complete all required fields');
      return;
    }
    
    if (!this.item) {
      this.notificationService.showError('Item information not found');
      return;
    }
    
    this.submitting = true;
    
    const formData = new FormData();
    formData.append('itemId', this.item._id);
    
    // Extract businessId - handle both string and object format
    const businessId = typeof this.item.businessId === 'string' 
      ? this.item.businessId 
      : (this.item.businessId as any)?._id || this.business?._id;
    
    if (!businessId) {
      this.notificationService.showError('Business information not found');
      this.submitting = false;
      return;
    }
    
    formData.append('businessId', businessId);
    formData.append('rating', this.rating.toString());
    formData.append('comment', this.reviewText);
    
    // Append images
    this.selectedFiles.forEach((file) => {
      formData.append('images', file);
    });
    
    // If editing, include existing images that weren't removed
    if (this.isEditMode) {
      formData.append('existingImages', JSON.stringify(this.existingImageUrls));
    }
    
    // Use update or create based on edit mode
    const reviewObservable = this.isEditMode && this.existingReview 
      ? this.reviewService.updateReview(this.existingReview._id, formData)
      : this.reviewService.createReview(formData);
    
    reviewObservable.subscribe({
      next: (response: any) => {
        const message = this.isEditMode ? 'Review updated successfully!' : 'Review submitted successfully!';
        this.notificationService.showSuccess(message);
        this.submitting = false;
        
        // Navigate back to business detail or item page
        if (this.business) {
          this.router.navigate(['/business', this.business._id]);
        } else {
          this.router.navigate(['/explore']);
        }
      },
      error: (err: any) => {
        const message = this.isEditMode ? 'Failed to update review' : 'Failed to submit review';
        this.notificationService.showError(err.error?.message || message);
        this.submitting = false;
        console.error(err);
      }
    });
  }

  cancel() {
    if (this.business) {
      this.router.navigate(['/business', this.business._id]);
    } else {
      this.router.navigate(['/explore']);
    }
  }
}
