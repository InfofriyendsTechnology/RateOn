import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LucideAngularModule, Store, Star, MapPin, Package, IndianRupee, Tag } from 'lucide-angular';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { FilterSidebarComponent, FilterState } from '../../../shared/components/filter-sidebar/filter-sidebar.component';
import { BusinessCard } from '../../../shared/components/business-card/business-card';
import { ItemCard } from '../../../shared/components/item-card/item-card';
import { BusinessService } from '../../../core/services/business';
import { ItemService } from '../../../core/services/item';
import { ReviewService } from '../../../core/services/review';
import { StorageService } from '../../../core/services/storage';

interface Business {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  address: string;
  image: string;
  priceRange: string;
  distance?: number;
  isOpen?: boolean;
  location?: {
    city?: string;
    address?: string;
    state?: string;
  };
  stats?: {
    totalItems?: number;
    totalReviews?: number;
  };
}

interface Item {
  id: string;
  name: string;
  businessName: string;
  businessId: string;
  rating: number;
  reviewCount: number;
  price: number;
  image: string;
  category: string;
}

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, SearchBarComponent, FilterSidebarComponent, BusinessCard, ItemCard],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.scss'
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Lucide Icons
  readonly Store = Store;
  readonly Star = Star;
  readonly MapPin = MapPin;
  readonly Package = Package;
  readonly IndianRupee = IndianRupee;
  readonly Tag = Tag;
  
  searchQuery: string = '';
  activeTab: 'businesses' | 'items' = 'businesses';
  
  // Data
  businesses: Business[] = [];
  items: Item[] = [];
  userReviews: Map<string, any> = new Map(); // Map of entity ID to user's review
  currentUser: any = null;
  
  // UI state
  loading: boolean = false;
  showFilters: boolean = true;
  currentPage: number = 1;
  pageSize: number = 12;
  totalResults: number = 0;
  
  // Filters
  currentFilters: FilterState | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private businessService: BusinessService,
    private itemService: ItemService,
    private reviewService: ReviewService,
    private storage: StorageService
  ) {}

  ngOnInit(): void {
    // Get current user
    this.currentUser = this.storage.getUser();
    
    // Listen to query params
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params: any) => {
        this.searchQuery = params['q'] || '';
        this.activeTab = params['tab'] || 'businesses';
        this.currentPage = parseInt(params['page'] || '1', 10);
        this.performSearch();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  performSearch(): void {
    this.loading = true;
    
    if (this.activeTab === 'businesses') {
      // Fetch real businesses
      this.businessService.getBusinesses().subscribe({
        next: (response: any) => {
          const data = response.data || response;
          const allBusinesses = data.businesses || data || [];
          
          // Map to expected format
          this.businesses = allBusinesses.map((b: any) => ({
            id: b._id,
            name: b.name,
            category: b.category || b.type || 'Business',
            rating: b.rating || 0,
            reviewCount: b.stats?.totalReviews || 0,
            address: `${b.location?.city || ''}, ${b.location?.state || ''}`.trim(),
            image: b.logo || b.coverImages?.[0] || '',
            priceRange: '$$',
            isOpen: b.isOpen,
            location: b.location,
            stats: b.stats
          }));
          
          // Filter by search query if present
          if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            this.businesses = this.businesses.filter(b => 
              b.name.toLowerCase().includes(query) || 
              b.category.toLowerCase().includes(query) ||
              b.address.toLowerCase().includes(query)
            );
          }
          
          this.totalResults = this.businesses.length;
          
          // Load user reviews for businesses
          if (this.currentUser && this.businesses.length > 0) {
            this.loadUserReviewsForBusinesses();
          }
          
          this.loading = false;
        },
        error: () => {
          this.businesses = [];
          this.totalResults = 0;
          this.loading = false;
        }
      });
    } else {
      // Fetch all items by searching with empty query
      this.itemService.searchItems('').subscribe({
        next: (response: any) => {
          const data = response.data || response;
          const allItems = data.items || data || [];
          
          // Map to expected format
          this.items = allItems.map((item: any) => ({
            id: item._id,
            name: item.name,
            businessName: item.businessId?.name || 'Unknown Business',
            businessId: typeof item.businessId === 'string' ? item.businessId : item.businessId?._id,
            rating: item.stats?.averageRating || item.averageRating || 0,
            reviewCount: item.stats?.totalReviews || item.reviewCount || 0,
            price: item.price || 0,
            image: item.images?.[0] || '',
            category: item.category || 'Item'
          }));
          
          // Filter by search query if present
          if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            this.items = this.items.filter(item => 
              item.name.toLowerCase().includes(query) || 
              item.category.toLowerCase().includes(query) ||
              item.businessName.toLowerCase().includes(query)
            );
          }
          
          this.totalResults = this.items.length;
          
          // Load user reviews for items
          if (this.currentUser && this.items.length > 0) {
            this.loadUserReviewsForItems();
          }
          
          this.loading = false;
        },
        error: () => {
          this.items = [];
          this.totalResults = 0;
          this.loading = false;
        }
      });
    }
  }
  
  loadUserReviewsForBusinesses(): void {
    // For each business, check if user has reviewed it
    this.businesses.forEach(business => {
      this.reviewService.getReviewsByBusiness(business.id, { reviewType: 'business', limit: 100 }).subscribe({
        next: (response: any) => {
          const data = response.data || response;
          const reviews = data.reviews || data || [];
          const userReview = reviews.find((review: any) => {
            const reviewUserId = review.userId?._id || review.userId;
            return reviewUserId === this.currentUser._id;
          });
          if (userReview) {
            this.userReviews.set(business.id, userReview);
          }
        },
        error: () => {
          // Ignore errors, just don't mark as reviewed
        }
      });
    });
  }
  
  loadUserReviewsForItems(): void {
    // For each item, check if user has reviewed it
    this.items.forEach(item => {
      this.reviewService.getReviewsByItem(item.id, { limit: 100 }).subscribe({
        next: (response: any) => {
          const data = response.data || response;
          const reviews = data.reviews || data || [];
          const userReview = reviews.find((review: any) => {
            const reviewUserId = review.userId?._id || review.userId;
            return reviewUserId === this.currentUser._id;
          });
          if (userReview) {
            this.userReviews.set(item.id, userReview);
          }
        },
        error: () => {
          // Ignore errors, just don't mark as reviewed
        }
      });
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.currentPage = 1;
    this.updateQueryParams();
  }

  onTabChange(tab: 'businesses' | 'items'): void {
    this.activeTab = tab;
    this.currentPage = 1;
    this.updateQueryParams();
  }

  onFilterChange(filters: FilterState): void {
    this.currentFilters = filters;
    this.currentPage = 1;
    this.performSearch();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updateQueryParams();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  updateQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.searchQuery,
        tab: this.activeTab,
        page: this.currentPage
      },
      queryParamsHandling: 'merge'
    });
  }

  getTotalPages(): number {
    return Math.ceil(this.totalResults / this.pageSize);
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push(-1);
        pages.push(totalPages);
      } else if (this.currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push(-1);
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(totalPages);
      }
    }
    
    return pages;
  }

  navigateToBusiness(businessId: string): void {
    this.router.navigate(['/business', businessId]);
  }

  navigateToItem(item: Item): void {
    // Navigate to business with item query
    this.router.navigate(['/business', item.businessId], {
      queryParams: { item: item.id }
    });
  }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  hasHalfStar(rating: number): boolean {
    return rating % 1 >= 0.5;
  }

  onImageError(event: any): void {
    // Hide broken image by setting display to none
    event.target.style.display = 'none';
  }
  
  transformBusinessForCard(business: Business): any {
    return {
      _id: business.id,
      name: business.name,
      category: business.category,
      averageRating: business.rating,
      reviewCount: business.reviewCount,
      itemsCount: business.stats?.totalItems || 0,
      address: {
        street: business.location?.address || '',
        city: business.location?.city || '',
        state: business.location?.state || ''
      },
      images: business.image ? [business.image] : [],
      claimed: false
    };
  }
  
  transformItemForCard(item: Item): any {
    return {
      _id: item.id,
      name: item.name,
      description: '',
      category: item.category,
      price: item.price,
      images: item.image ? [item.image] : [],
      averageRating: item.rating,
      reviewCount: item.reviewCount,
      businessId: item.businessId,
      availability: { status: 'available' },
      stats: {
        averageRating: item.rating,
        totalReviews: item.reviewCount
      }
    };
  }
  
  hasUserReviewedBusiness(businessId: string): boolean {
    return this.userReviews.has(businessId);
  }
  
  hasUserReviewedItem(itemId: string): boolean {
    return this.userReviews.has(itemId);
  }
  
  onItemReviewAction(item: any): void {
    // Navigate to write review page with item and business info
    const queryParams: any = {
      itemId: item._id,
      businessId: item.businessId
    };
    
    // If user has already reviewed this item, go to edit mode directly
    if (this.hasUserReviewedItem(item._id)) {
      queryParams.edit = 'true';
    }
    
    this.router.navigate(['/write-review'], { queryParams });
  }
  
  onItemCardClick(item: any): void {
    // Navigate to item detail page
    this.router.navigate(['/item', item._id]);
  }
}
