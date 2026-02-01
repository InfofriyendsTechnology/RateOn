import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ItemService, Item } from '../../../core/services/item';

@Component({
  selector: 'app-item-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './item-search.html',
  styleUrl: './item-search.scss'
})
export class ItemSearchComponent implements OnInit {
  searchQuery = '';
  items: any[] = [];
  loading = false;
  searched = false;

  // Filters
  selectedCategory = '';
  minPrice = 0;
  maxPrice = 10000;
  sortBy = 'relevance';

  categories = [
    'Food & Beverages',
    'Retail',
    'Services',
    'Entertainment',
    'Health & Wellness',
    'Education',
    'Technology',
    'Other'
  ];

  constructor(
    private itemService: ItemService,
    private router: Router
  ) {}

  ngOnInit() {
    // Load all items initially
    this.loadAllItems();
  }
  
  loadAllItems() {
    this.loading = true;
    this.searched = true;
    
    this.itemService.searchItems('', {}).subscribe({
      next: (response: any) => {
        const data = response.data || response;
        this.items = (data.items || []).map((item: any) => ({
          ...item,
          averageRating: item.stats?.averageRating || item.averageRating || 0,
          reviewCount: item.stats?.totalReviews || item.reviewCount || 0
        }));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.items = [];
      }
    });
  }

  searchItems() {
    if (!this.searchQuery.trim()) {
      return;
    }

    this.loading = true;
    this.searched = true;

    const filters: any = {};
    if (this.selectedCategory) filters.category = this.selectedCategory;
    if (this.minPrice > 0) filters.minPrice = this.minPrice;
    if (this.maxPrice < 10000) filters.maxPrice = this.maxPrice;
    if (this.sortBy !== 'relevance') filters.sortBy = this.sortBy;

    this.itemService.searchItems(this.searchQuery, filters).subscribe({
      next: (response: any) => {
        const data = response.data || response;
        this.items = (data.items || []).map((item: any) => ({
          ...item,
          averageRating: item.stats?.averageRating || item.averageRating || 0,
          reviewCount: item.stats?.totalReviews || item.reviewCount || 0
        }));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.items = [];
      }
    });
  }

  clearFilters() {
    this.selectedCategory = '';
    this.minPrice = 0;
    this.maxPrice = 10000;
    this.sortBy = 'relevance';
    if (this.searchQuery) {
      this.searchItems();
    }
  }

  viewItem(item: any) {
    // Handle both string and object businessId
    const businessId = typeof item.businessId === 'string' 
      ? item.businessId 
      : item.businessId?._id;
    
    if (businessId) {
      this.router.navigate(['/business', businessId]);
    }
  }

  writeReview(item: any, event: Event) {
    event.stopPropagation();
    
    // Handle both string and object businessId
    const businessId = typeof item.businessId === 'string' 
      ? item.businessId 
      : item.businessId?._id;
    
    if (item.hasUserReview) {
      // Navigate to business page to view their review
      if (businessId) {
        this.router.navigate(['/business', businessId]);
      }
    } else {
      // Navigate to write review page
      this.router.navigate(['/write-review'], {
        queryParams: { itemId: item._id, businessId: businessId }
      });
    }
  }
  
  getReviewButtonText(item: any): string {
    return item.hasUserReview ? 'View Review' : 'Write Review';
  }

  getRatingArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  hasHalfStar(rating: number): boolean {
    return rating % 1 >= 0.5;
  }

  getEmptyStars(rating: number): number[] {
    const filled = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    return Array(5 - filled - half).fill(0);
  }
}
