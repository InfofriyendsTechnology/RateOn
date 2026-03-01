import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TopBusiness {
  businessId: string;
  businessName: string;
  category?: string;
  reviewCount: number;
  averageRating: number;
  reactionCount: number;
}

@Component({
  selector: 'app-top-businesses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-businesses.component.html',
  styleUrl: './top-businesses.component.scss'
})
export class TopBusinessesComponent {
  @Input() businesses: TopBusiness[] = [];
  @Input() loading: boolean = false;
  @Input() selectedPeriod: 'week' | 'month' = 'month';
  @Output() periodChange = new EventEmitter<'week' | 'month'>();
  
  sortColumn: string = 'reviewCount';
  sortDirection: 'asc' | 'desc' = 'desc';

  readonly filterChips = [
    { label: 'Most Reviews',   column: 'reviewCount',   dir: 'desc' as const },
    { label: 'Top Rating',     column: 'averageRating', dir: 'desc' as const },
    { label: 'Most Reactions', column: 'reactionCount', dir: 'desc' as const },
    { label: 'A–Z',            column: 'businessName',  dir: 'asc'  as const },
  ];

  onPeriodChange(period: 'week' | 'month'): void {
    this.periodChange.emit(period);
  }

  setFilter(column: string, dir: 'asc' | 'desc'): void {
    this.sortColumn    = column;
    this.sortDirection = dir;
  }

  isChipActive(column: string, dir: 'asc' | 'desc'): boolean {
    return this.sortColumn === column && this.sortDirection === dir;
  }

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'desc';
    }
  }

  get sortedBusinesses(): TopBusiness[] {
    if (!this.businesses || this.businesses.length === 0) {
      return [];
    }

    return [...this.businesses].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (this.sortColumn) {
        case 'businessName':
          aValue = a.businessName.toLowerCase();
          bValue = b.businessName.toLowerCase();
          break;
        case 'reviewCount':
          aValue = a.reviewCount;
          bValue = b.reviewCount;
          break;
        case 'averageRating':
          aValue = a.averageRating;
          bValue = b.averageRating;
          break;
        case 'reactionCount':
          aValue = a.reactionCount;
          bValue = b.reactionCount;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  getRatingStars(rating: number): string[] {
    const stars: string[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push('full');
    }
    if (hasHalfStar) {
      stars.push('half');
    }
    while (stars.length < 5) {
      stars.push('empty');
    }
    return stars;
  }
}
