import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Business } from '../../../core/services/business';
import { LucideAngularModule, MapPin, ShoppingBag, CheckCircle } from 'lucide-angular';
import { ReviewService } from '../../../core/services/review';

@Component({
  selector: 'app-business-card',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './business-card.html',
  styleUrl: './business-card.scss'
})
export class BusinessCard implements OnInit {
  @Input() business!: Business;
  
  readonly MapPin = MapPin;
  readonly ShoppingBag = ShoppingBag;
  readonly CheckCircle = CheckCircle;
  
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
  
  getDefaultImage(): string {
    // SVG with store/building icon and gradient
    return 'data:image/svg+xml,%3Csvg width="400" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="g" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23082052;stop-opacity:1"/%3E%3Cstop offset="100%25" style="stop-color:%231e40af;stop-opacity:1"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="200" fill="url(%23g)"/%3E%3Cg transform="translate(200,70)"%3E%3Crect x="-30" y="0" width="60" height="50" fill="white" opacity="0.9" rx="4"/%3E%3Crect x="-24" y="6" width="18" height="16" fill="%23082052" opacity="0.3" rx="2"/%3E%3Crect x="6" y="6" width="18" height="16" fill="%23082052" opacity="0.3" rx="2"/%3E%3Crect x="-24" y="26" width="18" height="16" fill="%23082052" opacity="0.3" rx="2"/%3E%3Crect x="6" y="26" width="18" height="16" fill="%23082052" opacity="0.3" rx="2"/%3E%3Crect x="-8" y="36" width="16" height="14" fill="%23082052" opacity="0.5" rx="2"/%3E%3C/g%3E%3Ctext x="50%25" y="75%25" font-family="Arial" font-size="14" fill="white" text-anchor="middle" opacity="0.8"%3ENo Image Available%3C/text%3E%3C/svg%3E';
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
