import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FilterState {
  categories: string[];
  rating: number | null;
  priceRange: { min: number; max: number };
  availability: string[];
  location: { lat: number; lng: number; radius: number } | null;
  sortBy: string;
}

@Component({
  selector: 'app-filter-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-sidebar.component.html',
  styleUrl: './filter-sidebar.component.scss'
})
export class FilterSidebarComponent implements OnInit {
  @Output() filterChange = new EventEmitter<FilterState>();
  @Output() close = new EventEmitter<void>();
  
  // Available options
  availableCategories = [
    { id: 'restaurant', name: 'Restaurant', icon: 'utensils' },
    { id: 'cafe', name: 'Café', icon: 'coffee' },
    { id: 'bar', name: 'Bar', icon: 'wine' },
    { id: 'fastfood', name: 'Fast Food', icon: 'pizza' },
    { id: 'grocery', name: 'Grocery', icon: 'shopping-cart' },
    { id: 'bakery', name: 'Bakery', icon: 'croissant' },
    { id: 'dessert', name: 'Dessert', icon: 'ice-cream' },
    { id: 'other', name: 'Other', icon: 'store' }
  ];

  availabilityOptions = [
    { id: 'open_now', name: 'Open Now' },
    { id: 'delivery', name: 'Delivery Available' },
    { id: 'takeout', name: 'Takeout Available' },
    { id: 'dine_in', name: 'Dine-in Available' }
  ];

  sortOptions = [
    { id: 'relevance', name: 'Relevance' },
    { id: 'rating_high', name: 'Highest Rated' },
    { id: 'rating_low', name: 'Lowest Rated' },
    { id: 'reviews_most', name: 'Most Reviews' },
    { id: 'distance', name: 'Distance' },
    { id: 'name_asc', name: 'Name (A-Z)' },
    { id: 'name_desc', name: 'Name (Z-A)' }
  ];

  // Filter state
  selectedCategories: string[] = [];
  selectedRating: number | null = null;
  priceMin: number = 0;
  priceMax: number = 1000;
  selectedAvailability: string[] = [];
  useLocation: boolean = false;
  locationRadius: number = 5;
  selectedSort: string = 'relevance';

  // UI state
  expandedSections: { [key: string]: boolean } = {
    category: true,
    rating: true,
    price: false,
    availability: false,
    location: false,
    sort: true
  };

  ratingStars = [5, 4, 3, 2, 1];

  ngOnInit(): void {
    // Initialize with default state
  }

  toggleSection(section: string): void {
    this.expandedSections[section] = !this.expandedSections[section];
  }

  toggleCategory(categoryId: string): void {
    const index = this.selectedCategories.indexOf(categoryId);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(categoryId);
    }
    this.emitFilters();
  }

  selectRating(rating: number): void {
    if (this.selectedRating === rating) {
      this.selectedRating = null;
    } else {
      this.selectedRating = rating;
    }
    this.emitFilters();
  }

  onPriceChange(): void {
    // Ensure min doesn't exceed max
    if (this.priceMin > this.priceMax) {
      this.priceMin = this.priceMax;
    }
    this.emitFilters();
  }

  toggleAvailability(availabilityId: string): void {
    const index = this.selectedAvailability.indexOf(availabilityId);
    if (index > -1) {
      this.selectedAvailability.splice(index, 1);
    } else {
      this.selectedAvailability.push(availabilityId);
    }
    this.emitFilters();
  }

  onLocationToggle(): void {
    this.emitFilters();
  }

  onRadiusChange(): void {
    if (this.useLocation) {
      this.emitFilters();
    }
  }

  onSortChange(): void {
    this.emitFilters();
  }

  clearAllFilters(): void {
    this.selectedCategories = [];
    this.selectedRating = null;
    this.priceMin = 0;
    this.priceMax = 1000;
    this.selectedAvailability = [];
    this.useLocation = false;
    this.locationRadius = 5;
    this.selectedSort = 'relevance';
    this.emitFilters();
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.selectedCategories.length > 0) count += this.selectedCategories.length;
    if (this.selectedRating !== null) count++;
    if (this.priceMin !== 0 || this.priceMax !== 1000) count++;
    if (this.selectedAvailability.length > 0) count += this.selectedAvailability.length;
    if (this.useLocation) count++;
    return count;
  }

  private emitFilters(): void {
    const filters: FilterState = {
      categories: this.selectedCategories,
      rating: this.selectedRating,
      priceRange: { min: this.priceMin, max: this.priceMax },
      availability: this.selectedAvailability,
      location: this.useLocation 
        ? { lat: 0, lng: 0, radius: this.locationRadius } 
        : null,
      sortBy: this.selectedSort
    };
    this.filterChange.emit(filters);
  }

  closeSidebar(): void {
    this.close.emit();
  }

  getCategoryIcon(iconName: string): string {
    return `lucide lucide-${iconName}`;
  }

  getStarArray(count: number): number[] {
    return Array(count).fill(0);
  }
}
