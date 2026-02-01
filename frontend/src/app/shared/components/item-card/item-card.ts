import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Item } from '../../../core/services/item';
import { AvailabilityBadge } from '../availability-badge/availability-badge';
import { LucideAngularModule, Star, MessageSquare } from 'lucide-angular';

@Component({
  selector: 'app-item-card',
  imports: [CommonModule, AvailabilityBadge, LucideAngularModule],
  templateUrl: './item-card.html',
  styleUrl: './item-card.scss'
})
export class ItemCard {
  // Lucide icons
  readonly Star = Star;
  readonly MessageSquare = MessageSquare;

  @Input() item!: Item;
  @Input() businessId: string | null = null;
  @Input() isOwner: boolean = false;
  @Input() hasUserReview: boolean = false;
  @Output() reviewAction = new EventEmitter<Item>();
  @Output() cardClick = new EventEmitter<Item>();
  
  constructor(private router: Router) {}
  
  onCardClick(): void {
    // Don't navigate if owner
    if (this.isOwner) return;
    this.cardClick.emit(this.item);
  }
  
  onReviewAction(event: Event): void {
    event.stopPropagation();
    this.reviewAction.emit(this.item);
  }
  
  getReviewButtonText(): string {
    if (this.hasUserReview) return 'Edit Review';
    return 'Write Review';
  }
  
  getReviewButtonClass(): string {
    if (this.hasUserReview) return 'reviewed-btn';
    return 'review-btn';
  }
  
  showReviewButton(): boolean {
    // Don't show review button for business owners - they can't review their own items
    return !this.isOwner;
  }
  
  getDefaultImage(): string {
    // SVG with shopping bag icon and gradient
    return 'data:image/svg+xml,%3Csvg width="400" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="g" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23f59e0b;stop-opacity:1"/%3E%3Cstop offset="100%25" style="stop-color:%23f97316;stop-opacity:1"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="200" fill="url(%23g)"/%3E%3Cg transform="translate(200,75)"%3E%3Cpath d="M-20,0 L20,0 L24,40 L-24,40 Z" fill="white" opacity="0.9" stroke="white" stroke-width="2"/%3E%3Cpath d="M-12,-8 Q-12,-18 0,-18 Q12,-18 12,-8" fill="none" stroke="white" stroke-width="3" opacity="0.9"/%3E%3C/g%3E%3Ctext x="50%25" y="75%25" font-family="Arial" font-size="14" fill="white" text-anchor="middle" opacity="0.8"%3ENo Image Available%3C/text%3E%3C/svg%3E';
  }
  
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = this.getDefaultImage();
  }

  getRating(): number {
    // Support both nested stats object and direct properties
    return (this.item as any).stats?.averageRating || this.item.averageRating || 0;
  }

  getReviewCount(): number {
    // Support both nested stats object and direct properties
    return (this.item as any).stats?.totalReviews || this.item.reviewCount || 0;
  }
}
