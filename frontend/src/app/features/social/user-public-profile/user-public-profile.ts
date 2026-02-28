import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import {
  LucideAngularModule,
  Star, Users, UserPlus, FileText, Award, ArrowLeft, MapPin,
  Shield, CheckCircle, Calendar, ChevronLeft, MessageCircle,
  TrendingUp, UserCheck, Building2, BadgeCheck
} from 'lucide-angular';
import { UserService } from '../../../core/services/user';
import { ReviewService } from '../../../core/services/review';
import { FollowService } from '../../../core/services/follow.service';
import { AuthService } from '../../../core/services/auth';
import { ThemeService } from '../../../core/services/theme';
import { FollowButtonComponent } from '../../../shared/components/follow-button/follow-button.component';
import { ReviewCard } from '../../review/review-card/review-card';
import { BreadcrumbsComponent } from '../../../shared/components/breadcrumbs/breadcrumbs';

@Component({
  selector: 'app-user-public-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, FollowButtonComponent, ReviewCard, BreadcrumbsComponent],
  templateUrl: './user-public-profile.html',
  styleUrl: './user-public-profile.scss',
})
export class UserPublicProfile implements OnInit, OnDestroy {
  profileUserId = '';
  profileUser: any = null;
  reviews: any[] = [];
  businesses: any[] = [];
  businessCount = 0;

  loading = true;
  loadingReviews = true;
  notFound = false;

  currentUser: any = null;
  isOwnProfile = false;
  profileFollowsMe = false;
  avatarFailed = false;

  readonly Star = Star;
  readonly Users = Users;
  readonly FileText = FileText;
  readonly Award = Award;
  readonly ArrowLeft = ArrowLeft;
  readonly MapPin = MapPin;
  readonly Shield = Shield;
  readonly CheckCircle = CheckCircle;
  readonly Calendar = Calendar;
  readonly ChevronLeft = ChevronLeft;
  readonly MessageCircle = MessageCircle;
  readonly TrendingUp = TrendingUp;
  readonly UserCheck = UserCheck;
  readonly UserPlus = UserPlus;
  readonly Building2 = Building2;
  readonly BadgeCheck = BadgeCheck;

  starPositions: any[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private reviewService: ReviewService,
    private followService: FollowService,
    private authService: AuthService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.generateStarPositions();
    this.currentUser = this.authService.getCurrentUser();

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('id') || '';
      if (id !== this.profileUserId) {
        this.profileUserId = id;
        this.resetState();
        if (id) {
          this.isOwnProfile = this.currentUser?._id === id;
          this.loadProfile();
          this.loadReviews();
          if (this.currentUser && !this.isOwnProfile) {
            this.checkFollowsMe();
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private resetState(): void {
    this.profileUser = null;
    this.reviews = [];
    this.loading = true;
    this.loadingReviews = true;
    this.notFound = false;
    this.profileFollowsMe = false;
    this.avatarFailed = false;
  }

  loadProfile(): void {
    this.userService.getUserById(this.profileUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp: any) => {
          this.profileUser = resp.data || resp;
          this.businesses = this.profileUser.businesses || [];
          this.businessCount = this.profileUser.businessCount || this.businesses.length;
          this.loading = false;
        },
        error: () => {
          this.notFound = true;
          this.loading = false;
        }
      });
  }

  loadReviews(): void {
    this.reviewService.getReviewsByUser(this.profileUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp: any) => {
          const data = resp.data || resp;
          this.reviews = data.reviews || [];
          this.loadingReviews = false;
        },
        error: () => {
          this.loadingReviews = false;
        }
      });
  }

  /** Check if the profile user follows the currently logged-in user */
  checkFollowsMe(): void {
    this.followService.checkFollowsMe(this.profileUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp: any) => {
          const data = resp.data || resp;
          this.profileFollowsMe = data.followsMe === true;
        },
        error: () => {
          // not logged in or other error — silently ignore
        }
      });
  }

  getUserName(): string {
    if (!this.profileUser) return '';
    const p = this.profileUser.profile;
    if (p?.firstName || p?.lastName) {
      return `${p.firstName || ''} ${p.lastName || ''}`.trim();
    }
    return this.profileUser.username || '';
  }

  getUserInitial(): string {
    return this.getUserName().charAt(0).toUpperCase() || '?';
  }

  getAvatar(): string | null {
    return this.profileUser?.profile?.avatar || null;
  }

  getTrustLabel(): string {
    const score = this.profileUser?.trustScore || 0;
    const level = this.profileUser?.level || 1;
    if (level >= 9) return 'Elite Reviewer';
    if (level >= 7) return 'Expert';
    if (level >= 5) return 'Trusted';
    if (level >= 3) return 'Active';
    return 'Newcomer';
  }

  getBannerGradient(): string {
    if (!this.profileUser) return 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
    const name = (this.profileUser.username || '').toLowerCase();
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

  getJoinDate(): string {
    if (!this.profileUser?.createdAt) return '';
    return new Date(this.profileUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  onFollowChanged(event: { isFollowing: boolean; followerCount: number }): void {
    if (this.profileUser?.stats) {
      this.profileUser.stats.totalFollowers = event.followerCount;
    }
  }

  generateStarPositions(): void {
    this.starPositions = Array(6).fill(0).map(() => ({
      left: Math.random() * 80 + 10,
      top: Math.random() * 60 + 20,
      size: Math.random() > 0.5 ? 12 : 16,
      delay: Math.random() * 5
    }));
  }

  goBack(): void {
    window.history.back();
  }

  getLevelName(level: number): string {
    const levels = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
    return levels[Math.min(level - 1, levels.length - 1)] || 'Bronze';
  }

  isBusinessOwner(): boolean {
    return this.profileUser?.role === 'business_owner';
  }

  isVerified(): boolean {
    return this.profileUser?.registrationMethod === 'google' || this.profileUser?.isEmailVerified === true;
  }

  navigateToBusiness(businessId: string): void {
    this.router.navigate(['/business', businessId]);
  }

  getBusinessRating(business: any): number {
    return business?.rating?.average || business?.stats?.avgRating || 0;
  }
}
