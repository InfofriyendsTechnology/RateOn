import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AvailabilityStatus = 'available' | 'out_of_stock' | 'coming_soon';
export type BadgeSize = 'small' | 'medium';

@Component({
  selector: 'app-availability-badge',
  imports: [CommonModule],
  templateUrl: './availability-badge.html',
  styleUrl: './availability-badge.scss'
})
export class AvailabilityBadge {
  @Input() status: AvailabilityStatus = 'available';
  @Input() size: BadgeSize = 'medium';
  
  getStatusClass(): string {
    return this.status.replace('_', '-');
  }
  
  getStatusText(): string {
    switch (this.status) {
      case 'available':
        return 'In Stock';
      case 'out_of_stock':
        return 'Out of Stock';
      case 'coming_soon':
        return 'Coming Soon';
      default:
        return 'Available';
    }
  }
}
