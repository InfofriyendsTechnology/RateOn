import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StorageService } from '../../../core/services/storage';
import { UserService } from '../../../core/services/user';
import { ReviewService } from '../../../core/services/review';
import { FollowService } from '../../../core/services/follow.service';
import { LucideAngularModule, User, Edit, Mail, Phone, MapPin, Shield, Star, FileText, Users, UserPlus, ThumbsUp, Camera, Trash2, X, Check, ArrowLeft, Award, Image, Search, Building2, ChevronRight } from 'lucide-angular';
import { ToastService } from '../../../core/services/toast';
import { ThemeService } from '../../../core/services/theme';
import { BreadcrumbsComponent } from '../../../shared/components/breadcrumbs/breadcrumbs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, BreadcrumbsComponent],
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
  readonly Search = Search;
  readonly Building2 = Building2;
  readonly ChevronRight = ChevronRight;

  user: any = null;
  isEditing: boolean = false;
  editForm: any = {};
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  selectedCoverFile: File | null = null;
  coverPreviewUrl: string | null = null;
  saving = false;
  converting = false;
  starPositions: any[] = [];

  // Followers / Following modal
  showFollowModal = false;
  followModalType: 'followers' | 'following' = 'followers';
  followModalList: any[] = [];
  followModalLoading = false;

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
    public router: Router,
    private userService: UserService,
    private reviewService: ReviewService,
    private followService: FollowService,
    private toast: ToastService,
    public themeService: ThemeService
  ) {}

  ngOnInit() {
    const storedUser = this.storage.getUser();
    
    if (!storedUser) {
      this.router.navigate(['/auth/login']);
      return;
    }
    
    this.mapUser(storedUser);
    this.resetEditForm();
    this.generateStarPositions();
    this.loadReviews();

    // Fetch fresh profile data from API to get accurate follow counts
    this.userService.getProfile().subscribe({
      next: (response: any) => {
        // getUserProfile returns: { success, data: { user: { stats, ... } } }
        const freshUser = response.data?.user || response.data || response;
        if (freshUser?.stats) {
          this.user.totalFollowers = freshUser.stats.totalFollowers ?? this.user.totalFollowers;
          this.user.totalFollowing = freshUser.stats.totalFollowing ?? this.user.totalFollowing;
          this.user.totalReviews   = freshUser.stats.totalReviews   ?? this.user.totalReviews;
          this.user.trustScore     = freshUser.trustScore           ?? this.user.trustScore;
        }
      },
      error: () => { /* silently use cached data */ }
    });
  }

  private mapUser(storedUser: any): void {
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
  }

  generateStarPositions() {
    this.starPositions = Array(5).fill(0).map(() => ({
      left: Math.random() * 80 + 10,
      top: Math.random() * 60 + 20,
      size: Math.random() > 0.5 ? 12 : 16,
      delay: Math.random() * 5
    }));
  }
  
  loadReviews() {
    const storedUser = this.storage.getUser();
    const userId = storedUser?.id || storedUser?._id;
    
    // Skip loading reviews for admin users (they don't have ObjectId)
    if (!userId || userId === 'super-admin' || storedUser?.role === 'super_admin' || storedUser?.role === 'admin') {
      this.loadingReviews = false;
      this.reviews = [];
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

  getLevelClass(level: string): string {
    const map: any = { 'Bronze': 'level-bronze', 'Silver': 'level-silver', 'Gold': 'level-gold', 'Platinum': 'level-platinum', 'Diamond': 'level-diamond' };
    return map[level] || 'level-bronze';
  }

  getNextLevel(): string {
    const levels = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
    const idx = levels.indexOf(this.user?.level || 'Bronze');
    return levels[Math.min(idx + 1, levels.length - 1)] || 'Diamond';
  }

  getTrustScoreCircumference(): number { return 2 * Math.PI * 70; }

  getTrustScoreOffset(): number {
    const c = this.getTrustScoreCircumference();
    return c - ((this.user?.trustScore || 0) / 100) * c;
  }

  getTrustColor(): string {
    const s = this.user?.trustScore || 0;
    if (s >= 80) return '#10b981';
    if (s >= 60) return '#3b82f6';
    if (s >= 40) return '#fbbf24';
    return '#f59e0b';
  }

  getTrustLabel(): string {
    const s = this.user?.trustScore || 0;
    if (s >= 80) return 'Expert';
    if (s >= 60) return 'Trusted';
    if (s >= 40) return 'Active';
    return 'Beginner';
  }

  writeReview(): void { this.router.navigate(['/search']); }

  convertToBusiness(): void {
    if (this.converting) return;
    this.converting = true;

    this.userService.becomeBusinessOwner().subscribe({
      next: (response: any) => {
        const userData = response.data?.user || response.user;
        const token = response.data?.token || response.token;

        if (token) this.storage.saveToken(token);
        if (userData) this.storage.saveUser(userData);

        this.converting = false;
        this.toast.success('You are now a Business Owner! 🎉');

        setTimeout(() => this.router.navigate(['/business/dashboard']), 500);
      },
      error: (error: any) => {
        if (error?.error?.message?.includes('already a business owner')) {
          this.converting = false;
          this.router.navigate(['/business/dashboard']);
        } else {
          this.toast.error(error?.error?.message || 'Failed to convert account');
          this.converting = false;
        }
      }
    });
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
    this.router.navigate(['/']);
  }

  openFollowModal(type: 'followers' | 'following'): void {
    this.followModalType = type;
    this.showFollowModal = true;
    this.followModalList = [];
    this.followModalLoading = true;

    const userId = this.user?.id;
    if (!userId) { this.followModalLoading = false; return; }

    const obs = type === 'followers'
      ? this.followService.getFollowers(userId)
      : this.followService.getFollowing(userId);

    obs.subscribe({
      next: (resp: any) => {
        const data = resp.data || resp;
        this.followModalList = data.followers || data.following || [];
        this.followModalLoading = false;
      },
      error: () => { this.followModalLoading = false; }
    });
  }

  closeFollowModal(): void {
    this.showFollowModal = false;
  }

  navigateToFollowUser(item: any): void {
    const id = item?._id || item?.user?._id;
    if (id) {
      this.closeFollowModal();
      this.router.navigate(['/user', id]);
    }
  }

  getFollowUserName(item: any): string {
    const u = item.user || item;
    const first = u.profile?.firstName || '';
    const last = u.profile?.lastName || '';
    return (first + ' ' + last).trim() || u.username || 'User';
  }

  getFollowUserInitial(item: any): string {
    return this.getFollowUserName(item).charAt(0).toUpperCase();
  }

  getFollowUserAvatar(item: any): string | null {
    const u = item.user || item;
    return u.profile?.avatar || null;
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
  }

  getInitial(): string {
    if (this.user?.firstName) return this.user.firstName.charAt(0).toUpperCase();
    if (this.user?.username)  return this.user.username.charAt(0).toUpperCase();
    return '?';
  }
  
  onCoverError(event: any) {
    this.coverFailed = true;
  }

  getBannerGradient(): string {
    const name = (this.user?.username || '').toLowerCase();
    const palettes = [
      'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
      'linear-gradient(135deg, #0d0d0d 0%, #1a0533 40%, #2d0b5a 100%)',
      'linear-gradient(135deg, #0a0a0a 0%, #0d1b2a 40%, #1b2838 100%)',
      'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      'linear-gradient(135deg, #141e30 0%, #243b55 100%)',
      'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
      'linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)',
      'linear-gradient(135deg, #200122 0%, #6f0000 100%)',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffff;
    return palettes[hash % palettes.length];
  }
}
