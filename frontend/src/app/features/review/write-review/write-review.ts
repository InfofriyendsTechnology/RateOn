import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Star, Upload, X, Check, Building, Package } from 'lucide-angular';
import { ItemService, Item } from '../../../core/services/item';
import { ReviewService } from '../../../core/services/review';
import { BusinessService, Business } from '../../../core/services/business';
import { NotificationService } from '../../../core/services/notification.service';
import { StorageService } from '../../../core/services/storage';
import { AuthService } from '../../../core/services/auth';
import { ReviewDraftService } from '../../../core/services/review-draft';
import { AuthModalComponent } from '../../../shared/components/auth-modal/auth-modal.component';

@Component({
  selector: 'app-write-review',
  imports: [CommonModule, FormsModule, LucideAngularModule, AuthModalComponent],
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
  readonly Building = Building;
  readonly Package = Package;
  item: Item | null = null;
  business: Business | null = null;
  existingReview: any = null;
  isEditMode = false;
  isViewMode = false; // View-only mode when user has existing review
  reviewType: 'item' | 'business' = 'item'; // Determines if reviewing business or item
  
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
  showAuthModal = false;
  
  maxImages = 5;
  maxFileSize = 5 * 1024 * 1024; // 5MB

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private itemService: ItemService,
    private reviewService: ReviewService,
    private businessService: BusinessService,
    private notificationService: NotificationService,
    private storage: StorageService,
    private authService: AuthService,
    private reviewDraftService: ReviewDraftService
  ) {}

  ngOnInit() {
    const itemId = this.route.snapshot.queryParamMap.get('itemId');
    const businessId = this.route.snapshot.queryParamMap.get('businessId');
    const reviewType = this.route.snapshot.queryParamMap.get('reviewType');
    const reviewId = this.route.snapshot.queryParamMap.get('reviewId');
    const isEdit = this.route.snapshot.queryParamMap.get('edit') === 'true';
    
    // Check for saved draft and restore it
    this.restoreDraftIfExists();
    
    // Determine review type
    this.reviewType = reviewType === 'business' ? 'business' : 'item';
    
    if (this.reviewType === 'business') {
      // Business review mode
      if (businessId) {
        this.loadBusinessDetails(businessId);
        
        // Check if editing existing business review
        if (isEdit && reviewId) {
          this.isEditMode = true;
          this.loadExistingBusinessReview(reviewId);
        } else if (isEdit) {
          // Edit mode without reviewId - will fetch and go to edit mode directly
          this.checkExistingBusinessReview(businessId, true);
        } else {
          // Check if user already has a review for this business
          this.checkExistingBusinessReview(businessId, false);
        }
      } else {
        this.error = 'Invalid review request. Business not specified.';
      }
    } else {
      // Item review mode
      if (itemId) {
        this.loadItemDetails(itemId);
        this.checkExistingReview(itemId, isEdit);
      }
      
      if (businessId) {
        this.loadBusinessDetails(businessId);
      }
      
      if (!itemId || !businessId) {
        this.error = 'Invalid review request. Item or Business not specified.';
      }
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
      }
    });
  }
  
  checkExistingReview(itemId: string, forceEditMode: boolean = false) {
    this.reviewService.getReviewsByItem(itemId).subscribe({
      next: (response: any) => {
        const data = response.data || response;
        const reviews = data.reviews || data || [];
        // Find user's review (get current user from storage)
        const currentUser = this.storage.getUser();
        if (currentUser && currentUser._id) {
          this.existingReview = reviews.find((review: any) => {
            const reviewUserId = review.userId?._id || review.userId || review.user?._id;
            return reviewUserId === currentUser._id;
          });
          if (this.existingReview) {
            if (forceEditMode) {
              // Go directly to edit mode
              this.isEditMode = true;
              this.isViewMode = false;
            } else {
              // Start in view mode
              this.isViewMode = true;
              this.isEditMode = false;
            }
            this.prefillForm();
          }
        }
      },
      error: (err: any) => {
      }
    });
  }
  
  checkExistingBusinessReview(businessId: string, forceEditMode: boolean = false) {
    this.reviewService.getReviewsByBusiness(businessId, { reviewType: 'business' }).subscribe({
      next: (response: any) => {
        const data = response.data || response;
        const reviews = data.reviews || data || [];
        // Find user's review (get current user from storage)
        const currentUser = this.storage.getUser();
        if (currentUser && currentUser._id) {
          this.existingReview = reviews.find((review: any) => {
            const reviewUserId = review.userId?._id || review.userId || review.user?._id;
            return reviewUserId === currentUser._id;
          });
          if (this.existingReview) {
            if (forceEditMode) {
              // Go directly to edit mode
              this.isEditMode = true;
              this.isViewMode = false;
            } else {
              // Start in view mode
              this.isViewMode = true;
              this.isEditMode = false;
            }
            this.prefillForm();
          }
        }
      },
      error: (err: any) => {
      }
    });
  }
  
  loadExistingBusinessReview(reviewId: string) {
    this.loading = true;
    this.reviewService.getReviewById(reviewId).subscribe({
      next: (response: any) => {
        const data = response.data || response;
        this.existingReview = data.review || data;
        this.prefillForm();
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load review for editing';
        this.loading = false;
      }
    });
  }
  
  prefillForm() {
    if (!this.existingReview) return;
    this.rating = this.existingReview.rating || 0;
    this.reviewText = this.existingReview.reviewText || this.existingReview.comment || '';
    // Load existing images
    if (this.existingReview.images && this.existingReview.images.length > 0) {
      this.existingImageUrls = [...this.existingReview.images];
      this.imagePreviewUrls = [...this.existingReview.images];
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
    // Remove from preview
    this.imagePreviewUrls.splice(index, 1);
    
    // Check if it's an existing image URL or a new file
    const existingImagesCount = this.existingImageUrls.length;
    
    if (index < existingImagesCount) {
      // Remove from existing images
      this.existingImageUrls.splice(index, 1);
    } else {
      // Remove from new files
      const fileIndex = index - existingImagesCount;
      if (fileIndex >= 0 && fileIndex < this.selectedFiles.length) {
        this.selectedFiles.splice(fileIndex, 1);
      }
    }
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

    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.saveDraftAndShowAuth();
      return;
    }
    
    this.submitting = true;
    
    const formData = new FormData();
    
    if (this.reviewType === 'business') {
      // Business review
      if (!this.business) {
        this.notificationService.showError('Business information not found');
        this.submitting = false;
        return;
      }
      
      formData.append('businessId', this.business._id);
      formData.append('rating', this.rating.toString());
      formData.append('comment', this.reviewText);
      
      // If editing, include existing images that weren't removed
      if (this.isEditMode) {
        formData.append('existingImages', JSON.stringify(this.existingImageUrls));
      }
      
      // Append new images
      this.selectedFiles.forEach((file) => {
        formData.append('images', file);
      });
      
      // Use update or create based on edit mode
      const reviewObservable = this.isEditMode && this.existingReview 
        ? this.reviewService.updateReview(this.existingReview._id, formData)
        : this.reviewService.createBusinessReview(formData);
      
      reviewObservable.subscribe({
        next: (response: any) => {
          const message = this.isEditMode ? 'Business review updated successfully!' : 'Business review submitted successfully!';
          this.notificationService.showSuccess(message);
          this.submitting = false;
          
          // Clear draft after successful submission
          this.reviewDraftService.clearDraft();
          
          this.router.navigate(['/business', this.business!._id]);
        },
        error: (err: any) => {
          const message = this.isEditMode ? 'Failed to update business review' : 'Failed to submit business review';
          this.notificationService.showError(err.error?.message || message);
          this.submitting = false;
        }
      });
    } else {
      // Item review
      if (!this.item) {
        this.notificationService.showError('Item information not found');
        this.submitting = false;
        return;
      }
      
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
          
          // Clear draft after successful submission
          this.reviewDraftService.clearDraft();
          
          // Navigate back to item detail page
          if (this.item?._id) {
            this.router.navigate(['/item', this.item._id]);
          } else if (this.business) {
            this.router.navigate(['/business', this.business._id]);
          } else {
            this.router.navigate(['/home']);
          }
        },
        error: (err: any) => {
          // If user already has a review (409 conflict), fetch it and switch to edit mode
          if (err.status === 409 || err.statusCode === 409) {
            this.notificationService.showInfo('Loading your existing review for editing...');
            
            // Fetch user's review for this item
            if (this.item?._id) {
              this.reviewService.getUserReviewForItem(this.item._id).subscribe({
                next: (response: any) => {
                  const review = response.data || response;
                  if (review && this.item) {
                    // Navigate to edit mode with the review ID
                    const businessId = typeof this.item.businessId === 'string' 
                      ? this.item.businessId 
                      : (this.item.businessId as any)?._id;
                    
                    this.router.navigate(['/write-review'], {
                      queryParams: {
                        itemId: this.item._id,
                        businessId: businessId,
                        reviewId: review._id,
                        edit: 'true'
                      }
                    });
                  }
                  this.submitting = false;
                },
                error: (fetchErr: any) => {
                  // If we can't fetch the review, just show the error
                  this.notificationService.showError(err.error?.message || 'You have already reviewed this item');
                  this.submitting = false;
                }
              });
            } else {
              this.notificationService.showError(err.error?.message || 'You have already reviewed this item');
              this.submitting = false;
            }
          } else {
            const message = this.isEditMode ? 'Failed to update review' : 'Failed to submit review';
            this.notificationService.showError(err.error?.message || message);
            this.submitting = false;
          }
        }
      });
    }
  }

  cancel() {
    if (this.item?._id) {
      this.router.navigate(['/item', this.item._id]);
    } else if (this.business) {
      this.router.navigate(['/business', this.business._id]);
    } else {
      this.router.navigate(['/home']);
    }
  }

  saveDraftAndShowAuth() {
    // Save review draft to localStorage
    const businessId = typeof this.item?.businessId === 'string' 
      ? this.item.businessId 
      : (this.item?.businessId as any)?._id || this.business?._id;

    const draft: any = {
      businessId: businessId,
      reviewType: this.reviewType,
      rating: this.rating,
      comment: this.reviewText
    };
    
    // Add itemId only for item reviews
    if (this.reviewType === 'item' && this.item) {
      draft.itemId = this.item._id;
    }
    
    this.reviewDraftService.saveDraft(draft);

    // Show auth modal
    this.showAuthModal = true;
  }

  onAuthSuccess() {
    // After successful auth, restore draft and submit
    this.showAuthModal = false;
    
    // Small delay to ensure auth state is updated
    setTimeout(() => {
      const draft = this.reviewDraftService.getDraft();
      if (draft) {
        // Restore draft to form
        this.rating = draft.rating;
        this.reviewText = draft.comment;
        
        // Auto-submit the review
        this.submitReview();
        
        // Clear draft after successful submission attempt
        this.reviewDraftService.clearDraft();
      }
    }, 500);
  }

  closeAuthModal() {
    this.showAuthModal = false;
  }
  
  restoreDraftIfExists() {
    const draft = this.reviewDraftService.getDraft();
    if (draft && this.authService.isAuthenticated()) {
      // User is now authenticated, restore the draft to form
      this.rating = draft.rating;
      this.reviewText = draft.comment;
      
      // Show a notification that draft was restored
      this.notificationService.showInfo('Your review draft has been restored');
      
      // Don't clear draft yet - wait for successful submission
    }
  }
}
