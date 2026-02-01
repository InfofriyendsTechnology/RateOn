import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { StorageService } from '../../../core/services/storage';
import { ReviewService } from '../../../core/services/review';
import { LucideAngularModule, Shield, TrendingUp, Edit, Search, Settings, User, FileText, Users, UserPlus, ThumbsUp, Star, Building2, Check } from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
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
  
  user: any = null;
  stats: any[] = [];
  recentReviews: any[] = [];
  loadingReviews = false;
  avatarFailed = false;

  constructor(
    private storage: StorageService,
    private router: Router,
    private reviewService: ReviewService
  ) {}

  ngOnInit() {
    // Get actual user from localStorage
    const storedUser = this.storage.getUser();
    
    // If no user, redirect to login
    if (!storedUser) {
      this.router.navigate(['/auth/login']);
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
        firstName: storedUser.profile?.firstName || '',
        lastName: storedUser.profile?.lastName || '',
        role: this.getRoleName(storedUser.role || 'user')
      };

      this.stats = [
        { label: 'Total Reviews', value: this.user.totalReviews, icon: 'reviews' },
        { label: 'Followers', value: this.user.totalFollowers, icon: 'followers' },
        { label: 'Following', value: this.user.totalFollowing, icon: 'following' },
        { label: 'Helpful Reactions', value: this.user.helpfulReactions, icon: 'helpful' }
      ];
      
      this.loadRecentReviews();
    }
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
    this.router.navigate(['/user/profile']);
  }

  writeReview(): void {
    this.router.navigate(['/search/items']);
  }

  discoverPlaces(): void {
    this.router.navigate(['/explore']);
  }

  openSettings(): void {
    this.router.navigate(['/user/profile']);
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
