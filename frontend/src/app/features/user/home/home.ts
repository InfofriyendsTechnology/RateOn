import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StorageService } from '../../../core/services/storage';
import { ReviewService } from '../../../core/services/review';
import { UserService } from '../../../core/services/user';
import { ToastService } from '../../../core/services/toast';
import { LucideAngularModule, Shield, TrendingUp, Edit, Search, Settings, User, FileText, Users, UserPlus, ThumbsUp, Star, Building2, Check, Briefcase, Camera, Award, X } from 'lucide-angular';
import { ThemeService } from '../../../core/services/theme';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class HomeComponent implements OnInit {
  // Lucide Icons
  readonly Shield = Shield;
  readonly TrendingUp = TrendingUp;
  readonly Edit = Edit;
  readonly Search = Search;
  readonly Settings = Settings;
  readonly User = User;
  readonly FileText = FileText;
  readonly Users = Users;
  readonly UserPlus = UserPlus;
  readonly ThumbsUp = ThumbsUp;
  readonly Star = Star;
  readonly Building2 = Building2;
  readonly Check = Check;
  readonly Briefcase = Briefcase;
  readonly Camera = Camera;
  readonly Award = Award;
  readonly X = X;
  
  user: any = null;
  stats: any[] = [];
  recentReviews: any[] = [];
  loadingReviews = false;
  avatarFailed = false;
  coverFailed = false;
  isBusinessOwner = false;
  converting = false;
  starPositions: any[] = [];
  
  // Avatar upload
  showAvatarModal = false;
  selectedAvatar: File | null = null;
  avatarPreview: string | null = null;
  uploading = false;
  
  // Cover photo upload
  showCoverModal = false;
  selectedCover: File | null = null;
  coverPreview: string | null = null;
  
  // Delete account
  showDeleteModal = false;
  deleting = false;
  
  // Business owner upgrade
  showBusinessOwnerModal = false;
  showBusinessInfoModal = false;
  businessInfoForm: any = {
    name: '',
    description: '',
    category: '',
    address: '',
    city: '',
    phone: '',
    website: ''
  };
  addingBusiness = false;
  currentBusinessStep = 1;
  totalBusinessSteps = 3;

  constructor(
    private storage: StorageService,
    private router: Router,
    private reviewService: ReviewService,
    private userService: UserService,
    private toastService: ToastService,
    public themeService: ThemeService
  ) {}

  ngOnInit() {
    // Get actual user from localStorage
    const storedUser = this.storage.getUser();
    
    // If no user, redirect to login
    if (!storedUser) {
      this.router.navigate(['/auth/login']);
      return;
    }
    
    // If user is business owner, redirect to business dashboard
    if (storedUser.role === 'business_owner') {
      this.router.navigate(['/business/dashboard']);
      return;
    }
    
    if (storedUser) {
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
        bio: storedUser.profile?.bio || null,
        firstName: storedUser.profile?.firstName || '',
        lastName: storedUser.profile?.lastName || '',
        role: this.getRoleName(storedUser.role || 'user')
      };

      // Check if already business owner
      this.isBusinessOwner = storedUser.role === 'business_owner';

      this.stats = [
        { label: 'Total Reviews', value: this.user.totalReviews, icon: 'reviews' },
        { label: 'Followers', value: this.user.totalFollowers, icon: 'followers' },
        { label: 'Following', value: this.user.totalFollowing, icon: 'following' },
        { label: 'Helpful Reactions', value: this.user.helpfulReactions, icon: 'helpful' }
      ];
      
      this.generateStarPositions();
      this.loadRecentReviews();
    }
  }
  
  generateStarPositions() {
    // Generate 5 random star positions for animation
    this.starPositions = Array(5).fill(0).map(() => ({
      left: Math.random() * 80 + 10, // 10-90%
      top: Math.random() * 60 + 20, // 20-80%
      size: Math.random() > 0.5 ? 12 : 16,
      delay: Math.random() * 5
    }));
  }
  
  loadRecentReviews() {
    const userId = this.user?.id || this.storage.getUser()?.id;
    if (!userId) {
      this.loadingReviews = false;
      return;
    }
    
    this.loadingReviews = true;
    this.reviewService.getReviewsByUser(userId, { limit: 5 }).subscribe({
      next: (response: any) => {
        const data = response.data || response;
        this.recentReviews = data.reviews || [];
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

  // Trust score circle calculations
  getTrustScoreCircumference(): number {
    return 2 * Math.PI * 70; // radius = 70 (updated for new design)
  }

  getTrustScoreOffset(): number {
    const circumference = this.getTrustScoreCircumference();
    const percentage = this.user?.trustScore || 0;
    return circumference - (percentage / 100) * circumference;
  }

  getTrustFromReviews(): number {
    return Math.min(30, (this.user?.totalReviews || 0) * 10);
  }

  getTrustFromReactions(): number {
    return Math.min(20, (this.user?.helpfulReactions || 0) * 5);
  }
  
  getTrustFromSocial(): number {
    return Math.min(20, ((this.user?.totalFollowers || 0) + (this.user?.totalFollowing || 0)) * 2);
  }
  
  getTrustColor(): string {
    const score = this.user?.trustScore || 0;
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#3b82f6'; // Blue
    if (score >= 40) return '#f59e0b'; // Orange
    return '#6b7280'; // Gray
  }
  
  getTrustLabel(): string {
    const score = this.user?.trustScore || 0;
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Very Good';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Getting Started';
  }
  
  getNextLevel(): string {
    const currentLevel = this.user?.level || 'Bronze';
    const levels = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
    const currentIndex = levels.indexOf(currentLevel);
    return levels[Math.min(currentIndex + 1, levels.length - 1)];
  }
  
  getLevelClass(level: string): string {
    return level.toLowerCase();
  }

  // Navigation methods
  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  writeReview(): void {
    this.router.navigate(['/search/items']);
  }

  discoverPlaces(): void {
    this.router.navigate(['/explore']);
  }

  openSettings(): void {
    this.router.navigate(['/profile']);
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

  openBusinessOwnerModal() {
    if (this.isBusinessOwner) return;
    this.showBusinessOwnerModal = true;
  }
  
  closeBusinessOwnerModal() {
    this.showBusinessOwnerModal = false;
  }
  
  becomeBusinessOwner() {
    // Don't upgrade yet - just show the business form
    this.closeBusinessOwnerModal();
    setTimeout(() => {
      this.showBusinessInfoModal = true;
    }, 300);
  }
  
  closeBusinessInfoModal() {
    this.showBusinessInfoModal = false;
    this.currentBusinessStep = 1;
    this.resetBusinessInfoForm();
  }
  
  resetBusinessInfoForm() {
    this.businessInfoForm = {
      name: '',
      description: '',
      category: '',
      address: '',
      city: '',
      phone: '',
      website: ''
    };
  }
  
  nextBusinessStep() {
    if (this.currentBusinessStep === 1) {
      if (!this.businessInfoForm.name || !this.businessInfoForm.category) {
        this.toastService.error('Please fill in business name and category');
        return;
      }
    }
    
    if (this.currentBusinessStep === 2) {
      if (!this.businessInfoForm.city) {
        this.toastService.error('Please enter your city');
        return;
      }
    }
    
    if (this.currentBusinessStep < this.totalBusinessSteps) {
      this.currentBusinessStep++;
    }
  }
  
  previousBusinessStep() {
    if (this.currentBusinessStep > 1) {
      this.currentBusinessStep--;
    }
  }
  
  addBusiness() {
    // Validate required fields
    if (!this.businessInfoForm.name || !this.businessInfoForm.category || !this.businessInfoForm.city) {
      this.toastService.error('Please fill in all required fields');
      return;
    }
    
    this.addingBusiness = true;
    
    // Upgrade account to business owner after completing form
    this.userService.becomeBusinessOwner().subscribe({
      next: (response: any) => {
        const userData = response.data?.user || response.user;
        
        // Update storage with new user data
        this.storage.saveUser(userData);
        
        this.toastService.success('Business information saved!');
        this.isBusinessOwner = true;
        this.addingBusiness = false;
        this.closeBusinessInfoModal();
        
        setTimeout(() => {
          this.router.navigate(['/business/dashboard']);
        }, 1000);
      },
      error: (error) => {
        this.toastService.error(error?.message || 'Failed to upgrade account');
        this.addingBusiness = false;
      }
    });
  }
  
  skipBusinessInfo() {
    // Only upgrade and redirect if user skips
    this.converting = true;
    
    this.userService.becomeBusinessOwner().subscribe({
      next: (response: any) => {
        const userData = response.data?.user || response.user;
        
        // Update storage with new user data
        this.storage.saveUser(userData);
        
        this.isBusinessOwner = true;
        this.converting = false;
        this.closeBusinessInfoModal();
        
        this.router.navigate(['/business/dashboard']);
      },
      error: (error) => {
        this.toastService.error(error?.message || 'Failed to upgrade account');
        this.converting = false;
      }
    });
  }
  
  logout() {
    this.storage.clearAuth();
    this.toastService.success('Logged out successfully');
    this.router.navigate(['/']);
  }
  
  // Avatar Upload Methods
  openAvatarUpload() {
    this.showAvatarModal = true;
    this.selectedAvatar = null;
    this.avatarPreview = null;
  }
  
  closeAvatarModal() {
    this.showAvatarModal = false;
    this.selectedAvatar = null;
    this.avatarPreview = null;
  }
  
  onAvatarSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.toastService.error('Invalid file type. Please select an image.');
      return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.toastService.error('File too large. Please select an image under 5MB.');
      return;
    }
    
    this.selectedAvatar = file;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.avatarPreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }
  
  uploadAvatar() {
    if (!this.selectedAvatar) return;
    
    this.uploading = true;
    this.userService.uploadAvatar(this.selectedAvatar).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.toastService.success('Profile picture updated successfully!');
          
          // Update user data in storage and component
          const userData = response.data.user || response.user;
          this.storage.saveUser(userData);
          
          // Reload component
          this.ngOnInit();
          
          this.closeAvatarModal();
        }
        this.uploading = false;
      },
      error: (error) => {
        this.toastService.error(error?.error?.message || 'Failed to upload profile picture');
        this.uploading = false;
      }
    });
  }
  
  // Cover Photo Upload Methods
  openCoverUpload() {
    this.showCoverModal = true;
    this.selectedCover = null;
    this.coverPreview = null;
  }
  
  closeCoverModal() {
    this.showCoverModal = false;
    this.selectedCover = null;
    this.coverPreview = null;
  }
  
  onCoverSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.toastService.error('Invalid file type. Please select an image.');
      return;
    }
    
    // Validate file size (10MB for cover)
    if (file.size > 10 * 1024 * 1024) {
      this.toastService.error('File too large. Please select an image under 10MB.');
      return;
    }
    
    this.selectedCover = file;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.coverPreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }
  
  uploadCover() {
    if (!this.selectedCover) return;
    
    this.uploading = true;
    this.userService.updateProfile({ coverPhoto: true }, this.selectedCover).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.toastService.success('Cover photo updated successfully!');
          
          // Update user data in storage and component
          const userData = response.data.user || response.user;
          this.storage.saveUser(userData);
          
          // Reload component
          this.ngOnInit();
          
          this.closeCoverModal();
        }
        this.uploading = false;
      },
      error: (error) => {
        this.toastService.error(error?.error?.message || 'Failed to upload cover photo');
        this.uploading = false;
      }
    });
  }
  
  // Delete Account Methods
  openDeleteModal() {
    this.showDeleteModal = true;
  }
  
  closeDeleteModal() {
    this.showDeleteModal = false;
  }
  
  confirmDelete() {
    this.deleting = true;
    this.userService.deleteProfile().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.toastService.success('Account deleted successfully');
          this.storage.clearAuth();
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1000);
        }
        this.deleting = false;
      },
      error: (error) => {
        this.toastService.error(error?.error?.message || 'Failed to delete account');
        this.deleting = false;
      }
    });
  }
}
