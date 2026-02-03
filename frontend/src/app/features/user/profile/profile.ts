import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StorageService } from '../../../core/services/storage';
import { UserService } from '../../../core/services/user';
import { ReviewService } from '../../../core/services/review';
import { LucideAngularModule, User, Edit, Mail, Phone, MapPin, Shield, Star, FileText, Users, UserPlus, ThumbsUp, Camera, Trash2, X, Check, ArrowLeft, Award, Image } from 'lucide-angular';
import { ToastService } from '../../../core/services/toast';
import { ThemeService } from '../../../core/services/theme';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent implements OnInit {
  // Lucide Icons
  readonly User = User;
  readonly Edit = Edit;
  readonly Mail = Mail;
  readonly Phone = Phone;
  readonly MapPin = MapPin;
  readonly Shield = Shield;
  readonly Star = Star;
  readonly FileText = FileText;
  readonly Users = Users;
  readonly UserPlus = UserPlus;
  readonly ThumbsUp = ThumbsUp;
  readonly Camera = Camera;
  readonly Trash2 = Trash2;
  readonly X = X;
  readonly Check = Check;
  readonly ArrowLeft = ArrowLeft;
  readonly Award = Award;
  readonly Image = Image;

  user: any = null;
  isEditing: boolean = false;
  editForm: any = {};
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  selectedCoverFile: File | null = null;
  coverPreviewUrl: string | null = null;
  saving = false;
  
  // Delete modal
  showDeleteModal: boolean = false;
  deleting = false;
  
  // Reviews
  reviews: any[] = [];
  loadingReviews = false;
  avatarFailed = false;
  coverFailed = false;

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
    private toast: ToastService,
    public themeService: ThemeService
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
      coverPhoto: storedUser.profile?.coverPhoto || null,
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
      this.selectedCoverFile = null;
      this.coverPreviewUrl = null;
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.toast.error('Only image files are allowed');
      event.target.value = '';
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.toast.error('Please select an image under 5MB');
      event.target.value = '';
      return;
    }

    // Set file and create preview
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }
  
  onCoverFileSelected(event: any): void {
    const file = event.target.files[0];
    
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.toast.error('Only image files are allowed');
      event.target.value = '';
      return;
    }

    // Validate file size (10MB limit for cover)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      this.toast.error('Please select an image under 10MB');
      event.target.value = '';
      return;
    }

    // Set file and create preview
    this.selectedCoverFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.coverPreviewUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  toggleBadge(badge: any): void {
    if (this.isEditing) {
      badge.selected = !badge.selected;
    }
  }
  
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  saveProfile(): void {
    this.saving = true;
    
    // Handle cover photo separately if selected
    if (this.selectedCoverFile) {
      this.userService.updateProfile({ coverPhoto: true }, this.selectedCoverFile).subscribe({
        next: (response) => {
          if (response.success) {
            this.storage.saveUser(response.data.user);
            // Continue with regular profile update
            this.updateProfileData();
          }
        },
        error: (error) => {
          this.toast.error('Failed to upload cover photo');
          this.saving = false;
        }
      });
    } else {
      this.updateProfileData();
    }
  }
  
  private updateProfileData(): void {
    const profileData = {
      firstName: this.editForm.firstName,
      lastName: this.editForm.lastName,
      bio: this.editForm.bio,
      location: this.editForm.location,
      phone: this.editForm.phone,
      badges: this.badges.filter(b => b.selected).map(b => b.id)
    };

    this.userService.updateProfile(profileData, this.selectedFile || undefined).subscribe({
      next: (response) => {
        if (response.success) {
          this.storage.saveUser(response.data.user);
          this.ngOnInit();
          this.isEditing = false;
          this.selectedFile = null;
          this.previewUrl = null;
          this.selectedCoverFile = null;
          this.coverPreviewUrl = null;
          this.toast.success('Profile updated successfully!');
        }
        this.saving = false;
      },
      error: (error) => {
        const errorMessage = error.error?.message || error.message || 'Failed to update profile';
        this.toast.error(errorMessage);
        this.saving = false;
      }
    });
  }

  navigateToHome(): void {
    this.router.navigate(['/home']);
  }

  openDeleteModal(): void {
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    this.deleting = true;
    
    this.userService.deleteProfile().subscribe({
      next: (response) => {
        if (response.success) {
          this.storage.clearAuth();
          this.toast.success('Account deleted successfully');
          setTimeout(() => this.router.navigate(['/']), 1000);
        }
        this.deleting = false;
      },
      error: (error) => {
        this.toast.error('Failed to delete account');
        this.deleting = false;
        this.showDeleteModal = false;
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
  
  onCoverError(event: any) {
    this.coverFailed = true;
    event.target.style.display = 'none';
  }
}
