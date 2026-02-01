import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StorageService } from '../../../core/services/storage';
import { UserService } from '../../../core/services/user';
import { ReviewService } from '../../../core/services/review';
import { ImageCropperComponent, ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageCropperComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent implements OnInit {
  user: any = null;
  isEditing: boolean = false;
  editForm: any = {};
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  
  // Image cropper properties
  showCropper: boolean = false;
  imageChangedEvent: any = null;
  croppedImage: any = '';
  croppedBlob: Blob | null = null;
  
  // Delete modal
  showDeleteModal: boolean = false;
  
  // Reviews
  reviews: any[] = [];
  loadingReviews = false;
  avatarFailed = false;

  badges: any[] = [
    { id: 'foodie', name: 'Foodie', icon: '🍕', selected: false },
    { id: 'traveler', name: 'Traveler', icon: '✈️', selected: false },
    { id: 'local_guide', name: 'Local Guide', icon: '📍', selected: false },
    { id: 'food_vlogger', name: 'Food Vlogger', icon: '🎥', selected: false },
    { id: 'cafe_lover', name: 'Café Lover', icon: '☕', selected: false },
    { id: 'street_food', name: 'Street Food Expert', icon: '🌮', selected: false },
  ];

  constructor(
    private storage: StorageService,
    private router: Router,
    private userService: UserService,
    private reviewService: ReviewService,
    private sanitizer: DomSanitizer,
    private toast: ToastService
  ) {}

  ngOnInit() {
    const storedUser = this.storage.getUser();
    
    if (!storedUser) {
      this.router.navigate(['/auth/login']);
      return;
    }
    
    this.user = {
      id: storedUser.id || storedUser._id,
      username: storedUser.username || 'User',
      email: storedUser.email || '',
      trustScore: storedUser.trustScore || 50,
      level: this.getLevelName(storedUser.level || 1),
      totalReviews: storedUser.stats?.totalReviews || 0,
      totalFollowers: storedUser.stats?.totalFollowers || 0,
      totalFollowing: storedUser.stats?.totalFollowing || 0,
      helpfulReactions: storedUser.stats?.helpfulReactions || 0,
      avatar: storedUser.profile?.avatar || null,
      firstName: storedUser.profile?.firstName || '',
      lastName: storedUser.profile?.lastName || '',
      bio: storedUser.profile?.bio || '',
      location: storedUser.profile?.location || '',
      phone: storedUser.profile?.phone || '',
      selectedBadges: storedUser.profile?.badges || [],
      role: this.getRoleName(storedUser.role || 'user')
    };

    // Set selected badges
    this.user.selectedBadges.forEach((badgeId: string) => {
      const badge = this.badges.find(b => b.id === badgeId);
      if (badge) badge.selected = true;
    });

    this.resetEditForm();
    this.loadReviews();
  }
  
  loadReviews() {
    const storedUser = this.storage.getUser();
    const userId = storedUser?.id || storedUser?._id;
    if (!userId) {
      this.loadingReviews = false;
      return;
    }
    
    this.loadingReviews = true;
    this.reviewService.getReviewsByUser(userId, {}).subscribe({
      next: (response: any) => {
        const data = response.data || response;
        this.reviews = data.reviews || [];
        this.loadingReviews = false;
      },
      error: () => {
        this.loadingReviews = false;
      }
    });
  }

  getLevelName(level: number): string {
    const levels = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
    return levels[Math.min(level - 1, levels.length - 1)] || 'Bronze';
  }

  getRoleName(role: string): string {
    const roleMap: any = {
      'user': 'Reviewer',
      'business_owner': 'Business Owner',
      'admin': 'Administrator'
    };
    return roleMap[role] || 'Reviewer';
  }

  resetEditForm(): void {
    this.editForm = {
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      bio: this.user.bio,
      location: this.user.location,
      phone: this.user.phone
    };
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.resetEditForm();
      this.selectedFile = null;
      this.previewUrl = null;
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.toast.error('Invalid File Type', 'Only image files (JPEG, PNG, WebP) are allowed.');
      event.target.value = ''; // Clear input
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      this.toast.error('File Too Large', 'Please select an image under 5MB.');
      event.target.value = ''; // Clear input
      return;
    }

    // Open cropper modal
    this.imageChangedEvent = event;
    this.showCropper = true;
  }

  imageCropped(event: ImageCroppedEvent): void {
    this.croppedImage = event.objectUrl;
    this.croppedBlob = event.blob || null;
  }

  imageLoaded(image: LoadedImage): void {
    // Image loaded in cropper
  }

  cropperReady(): void {
    // Cropper ready
  }

  loadImageFailed(): void {
    this.toast.error('Image Load Failed', 'Please try another file.');
    this.showCropper = false;
  }

  applyCrop(): void {
    if (this.croppedBlob) {
      // Convert blob to file
      this.selectedFile = new File([this.croppedBlob], 'avatar.png', { type: 'image/png' });
      this.previewUrl = this.croppedImage;
      this.showCropper = false;
    }
  }

  cancelCrop(): void {
    this.showCropper = false;
    this.imageChangedEvent = null;
    this.croppedImage = '';
    this.croppedBlob = null;
  }

  toggleBadge(badge: any): void {
    if (this.isEditing) {
      badge.selected = !badge.selected;
    }
  }

  saveProfile(): void {
    const profileData = {
      firstName: this.editForm.firstName,
      lastName: this.editForm.lastName,
      bio: this.editForm.bio,
      location: this.editForm.location,
      phone: this.editForm.phone,
      badges: this.badges.filter(b => b.selected).map(b => b.id)
    };

    // Call API to update profile
    this.userService.updateProfile(profileData, this.selectedFile || undefined).subscribe({
      next: (response) => {
        if (response.success) {
          // Update localStorage with new user data
          this.storage.saveUser(response.data.user);
          
          // Reload user data
          this.ngOnInit();
          this.isEditing = false;
          this.selectedFile = null;
          this.previewUrl = null;
          
          this.toast.success('Success!', 'Your profile has been updated successfully.');
        }
      },
      error: (error) => {
        console.error('Profile update failed:', error);
        
        // Extract error message from response
        let errorMessage = 'Failed to update profile. Please try again.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        // Show specific error messages
        if (errorMessage.includes('File too large')) {
          this.toast.error('File Too Large', 'Please select an image under 5MB.');
        } else if (errorMessage.includes('Invalid token') || errorMessage.includes('expired')) {
          this.toast.error('Session Expired', 'Please login again.');
          this.storage.clearAuth();
          this.router.navigate(['/auth/login']);
        } else {
          this.toast.error('Update Failed', errorMessage);
        }
      }
    });
  }

  navigateToDashboard(): void {
    this.router.navigate(['/user/dashboard']);
  }

  openDeleteModal(): void {
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    this.showDeleteModal = false;
    
    this.userService.deleteProfile().subscribe({
      next: (response) => {
        if (response.success) {
          // Clear all auth data
          this.storage.clearAuth();
          
          // Redirect to home page
          this.toast.success('Account Deleted', 'Your profile has been deleted successfully.');
          setTimeout(() => this.router.navigate(['/']), 1000);
        }
      },
      error: (error) => {
        console.error('Profile deletion failed:', error);
        this.toast.error('Deletion Failed', 'Failed to delete profile. Please try again.');
      }
    });
  }
  
  getRatingArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }
  
  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.floor(rating)).fill(0);
  }
  
  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  
  viewBusiness(businessId: any) {
    // Handle both string and object businessId
    const id = typeof businessId === 'string' ? businessId : businessId?._id;
    if (id && id !== 'reviews') {
      this.router.navigate(['/business', id]);
    }
  }
  
  onAvatarError(event: any) {
    this.avatarFailed = true;
    event.target.style.display = 'none';
  }
}
