import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Business } from '../../../core/services/business';
import { LucideAngularModule, MapPin, ShoppingBag, CheckCircle, Star, Package, MessageSquare, ImageOff, Edit } from 'lucide-angular';
import { ReviewService } from '../../../core/services/review';

@Component({
  selector: 'app-business-card',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './business-card.html',
  styleUrl: './business-card.scss'
})
export class BusinessCard implements OnInit {
  @Input() business!: Business;
  @Input() hasUserReview: boolean = false;
  
  readonly MapPin = MapPin;
  readonly ShoppingBag = ShoppingBag;
  readonly CheckCircle = CheckCircle;
  readonly Star = Star;
  readonly Package = Package;
  readonly MessageSquare = MessageSquare;
  readonly ImageOff = ImageOff;
  readonly Edit = Edit;
  
  // Values actually shown on the card
  displayAverageRating = 0;
  displayReviewCount = 0;
  displayItemsCount = 0;
  
  constructor(
    private router: Router,
    private reviewService: ReviewService
  ) {}
  
  ngOnInit(): void {
    // Start with what backend gives us
    this.displayAverageRating = this.business.averageRating || 0;
    this.displayReviewCount = this.business.reviewCount || 0;
    this.displayItemsCount = this.business.itemsCount || 0;

    // If backend stats are missing/zero but this business has reviews,
    // fallback: compute from reviews API just like detail page.
    if (!this.displayReviewCount) {
      this.reviewService.getReviewsByBusiness(this.business._id, { limit: 100 }).subscribe({
        next: (response: any) => {
          const data = response.data || response;
          const reviews = data.reviews || data || [];
          this.displayReviewCount = reviews.length;
          if (reviews.length > 0) {
            const sum = reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0);
            this.displayAverageRating = sum / reviews.length;
          }
        },
        error: () => {
          // Keep existing values on error
        }
      });
    }
  }
  
  onBusinessClick(): void {
    this.router.navigate(['/business', this.business._id]);
  }
  
  onWriteReview(event: Event): void {
    event.stopPropagation(); // Prevent card click navigation
    
    // If user has already reviewed, navigate in edit mode
    const queryParams: any = {
      businessId: this.business._id,
      reviewType: 'business'
    };
    
    if (this.hasUserReview) {
      queryParams.edit = 'true';
      // Note: We don't have the reviewId here, but the write-review page
      // will fetch it based on businessId + current user
    }
    
    this.router.navigate(['/write-review'], { queryParams });
  }
  
  getReviewButtonText(): string {
    return this.hasUserReview ? 'Edit Review' : 'Write Review';
  }
  
  getDefaultImage(): string {
    // Dark gradient with icon and text
    return 'data:image/svg+xml,%3Csvg width="400" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="g" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%231a1a1a;stop-opacity:1"/%3E%3Cstop offset="100%25" style="stop-color:%230a0a0a;stop-opacity:1"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="200" fill="url(%23g)"/%3E%3Cg transform="translate(200,80)"%3E%3Crect x="-20" y="-20" width="40" height="40" fill="none" stroke="%23666666" stroke-width="2" rx="4"/%3E%3Cline x1="-12" y1="-12" x2="12" y2="12" stroke="%23666666" stroke-width="2"/%3E%3Cline x1="12" y1="-12" x2="-12" y2="12" stroke="%23666666" stroke-width="2"/%3E%3C/g%3E%3Ctext x="50%25" y="65%25" font-family="Arial" font-size="14" font-weight="500" fill="%23666666" text-anchor="middle" dominant-baseline="middle"%3ENo Image Available%3C/text%3E%3C/svg%3E';
  }
  
  onImageError(event: Event): void {
    // Replace broken image with default placeholder
    const img = event.target as HTMLImageElement;
    img.src = this.getDefaultImage();
  }
  
  getCategoryBadgeClass(): string {
    const category = this.business.category?.toLowerCase() || '';
    return `category-${category.replace(/\s+/g, '-')}`;
  }
}
