import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReviewService } from '../../../core/services/review';
import { StorageService } from '../../../core/services/storage';
import { LucideAngularModule, Star, FileText, Building2, Package, Calendar, LayoutGrid, List } from 'lucide-angular';
import { BreadcrumbsComponent } from '../../../shared/components/breadcrumbs/breadcrumbs';

@Component({
  selector: 'app-my-reviews',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink, BreadcrumbsComponent],
  templateUrl: './my-reviews.html',
  styleUrls: ['./my-reviews.scss']
})
export class MyReviewsComponent implements OnInit {
  readonly Star = Star;
  readonly FileText = FileText;
  readonly Building2 = Building2;
  readonly Package = Package;
  readonly Calendar = Calendar;
  readonly LayoutGrid = LayoutGrid;
  readonly List = List;

  reviews: any[] = [];
  loading = true;
  user: any = null;
  avatarFailed = false;
  viewMode: 'list' | 'card' = 'list';

  constructor(
    private reviewService: ReviewService,
    private storage: StorageService,
    public router: Router
  ) {}

  ngOnInit() {
    const storedUser = this.storage.getUser();
    if (!storedUser) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.user = storedUser;
    this.loadReviews(storedUser.id || storedUser._id);
  }

  loadReviews(userId: string) {
    this.loading = true;
    this.reviewService.getReviewsByUser(userId, {}).subscribe({
      next: (response: any) => {
        const data = response.data || response;
        this.reviews = data.reviews || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }

  getRatingArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.floor(rating)).fill(0);
  }

  formatDate(date: any): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  }

  getTargetName(review: any): string {
    return review.itemId?.name
      || review.businessId?.name
      || review.item?.name
      || review.business?.name
      || review.businessName
      || 'Business';
  }

  getTargetType(review: any): string {
    return review.itemId ? 'Item' : 'Business';
  }

  getTargetImage(review: any): string | null {
    if (review.itemId?.images?.[0])       return review.itemId.images[0];
    if (review.businessId?.logo)           return review.businessId.logo;
    if (review.businessId?.coverImages?.[0]) return review.businessId.coverImages[0];
    if (review.item?.images?.[0])          return review.item.images[0];
    if (review.business?.logo)             return review.business.logo;
    return null;
  }

  getTargetLink(review: any): string[] {
    // businessId / itemId can be a populated object OR a plain string ID
    const bId = review.businessId?._id || (typeof review.businessId === 'string' ? review.businessId : null)
              || review.business?._id || (typeof review.business === 'string' ? review.business : null);
    const iId = review.itemId?._id   || (typeof review.itemId   === 'string' ? review.itemId   : null)
              || review.item?._id    || (typeof review.item    === 'string' ? review.item    : null);
    if (iId && bId) return ['/business', bId, 'item', iId];
    if (bId)        return ['/business', bId];
    if (review._id) return ['/review', review._id];
    return ['/my-reviews'];
  }

  onAvatarError() {
    this.avatarFailed = true;
  }

  getInitial(): string {
    const u = this.user;
    if (u?.profile?.firstName) return u.profile.firstName.charAt(0).toUpperCase();
    if (u?.username) return u.username.charAt(0).toUpperCase();
    return '?';
  }
}
