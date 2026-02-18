import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LucideAngularModule, Store, Star, MapPin, Package, IndianRupee, Tag, Sun, Moon } from 'lucide-angular';
import { ThemeService } from '../../../core/services/theme';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { FilterSidebarComponent, FilterState } from '../../../shared/components/filter-sidebar/filter-sidebar.component';
import { BreadcrumbsComponent, Crumb } from '../../../shared/components/breadcrumbs/breadcrumbs';
import { BusinessCard } from '../../../shared/components/business-card/business-card';
import { ItemCard } from '../../../shared/components/item-card/item-card';
import { BusinessService } from '../../../core/services/business';
import { ItemService } from '../../../core/services/item';
import { ReviewService } from '../../../core/services/review';
import { StorageService } from '../../../core/services/storage';
import { ExploreStateService } from '../../../core/services/explore-state.service';

interface Business {
  id: string;
  _id: string;
  name: string;
  type: string;
  description?: string;
  category: string;
  rating: {
    average: number;
    count: number;
    distribution: { [key: number]: number };
  };
  averageRating: number;
  reviewCount: number;
  itemsCount: number;
  address: {
    street: string;
    area: string;
    city: string;
    state: string;
  };
  addressString?: string;
  images: string[];
  image: string;
  priceRange: string;
  distance?: number;
  isOpen?: boolean;
  claimed: boolean;
  isClaimed: boolean;
  isVerified: boolean;
  contact: {
    phone?: string;
    whatsapp?: string;
    website?: string;
    email?: string;
  };
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: { lat: number; lng: number };
  };
  stats: {
    totalItems: number;
    totalReviews: number;
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
  imports: [CommonModule, LucideAngularModule, SearchBarComponent, FilterSidebarComponent, BusinessCard, ItemCard, BreadcrumbsComponent],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.scss'
})
export class SearchResultsComponent implements OnInit, AfterViewInit, OnDestroy {
  private savedScrollPosition: number = 0;
  private destroy$ = new Subject<void>();
  
  // Lucide Icons
  readonly Store = Store;
  readonly Star = Star;
  readonly MapPin = MapPin;
  readonly Package = Package;
  readonly IndianRupee = IndianRupee;
  readonly Tag = Tag;
  readonly Sun = Sun;
  readonly Moon = Moon;
  
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
  pageSize: number = 10; // Load 10 more at a time
  totalResults: number = 0;
  displayedCount: number = 10; // Initially show 10 items
  
  // Filters
  currentFilters: FilterState | null = null;
  
  // Breadcrumbs
  breadcrumbs: Crumb[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    public themeService: ThemeService,
    private businessService: BusinessService,
    private itemService: ItemService,
    private reviewService: ReviewService,
    private storage: StorageService,
    private exploreState: ExploreStateService
  ) {}

  ngOnInit(): void {
    // Get current user
    this.currentUser = this.storage.getUser();
    
    // Restore state if coming back from navigation
    this.restoreState();
    
    // Listen to query params
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params: any) => {
        this.searchQuery = params['q'] || '';
        this.activeTab = params['tab'] || 'businesses';
        this.currentPage = parseInt(params['page'] || '1', 10);
        this.updateBreadcrumbs();
        
        // Only perform search if we don't have restored state
        if (!this.exploreState.hasState()) {
          this.performSearch();
        }
      });
  }

  ngOnDestroy(): void {
    // Save state before leaving
    this.saveState();
    this.destroy$.next();
    this.destroy$.complete();
  }

  performSearch(): void {
    // Check if we have cached data and no search query
    if (!this.searchQuery && this.allBusinesses.length > 0 && this.activeTab === 'businesses') {
      // Use cached data - restore previous view state
      const currentDisplayed = this.businesses.length || this.displayedCount;
      this.businesses = this.allBusinesses.slice(0, currentDisplayed);
      this.totalResults = this.allBusinesses.length;
      return;
    }
    
    if (!this.searchQuery && this.allItems.length > 0 && this.activeTab === 'items') {
      // Use cached data - restore previous view state
      const currentDisplayed = this.items.length || this.displayedCount;
      this.items = this.allItems.slice(0, currentDisplayed);
      this.totalResults = this.allItems.length;
      return;
    }
    
    this.loading = true;
    this.currentPage = 1; // Reset to page 1 on new search
    
    if (this.activeTab === 'businesses') {
      // Fetch real businesses
      this.businessService.getBusinesses().subscribe({
        next: (response: any) => {
          const data = response.data || response;
          const allBusinesses = data.businesses || data || [];
          
          // Map to expected format - match landing page format directly
          this.businesses = allBusinesses.map((b: any) => ({
            id: b._id,
            _id: b._id, // Add _id for card
            name: b.name,
            type: b.type || b.category || 'Business',
            description: b.description || '',
            category: b.category || b.type || 'Business',
            rating: {
              average: Number(b.rating) || 0,
              count: Number(b.stats?.totalReviews) || 0,
              distribution: {}
            },
            averageRating: Number(b.rating) || 0,
            reviewCount: Number(b.stats?.totalReviews) || 0,
            itemsCount: Number(b.stats?.totalItems) || 0,
            address: {
              street: b.location?.address || '',
              area: '',
              city: b.location?.city || '',
              state: b.location?.state || ''
            },
            addressString: `${b.location?.city || ''}, ${b.location?.state || ''}`.trim(),
            images: b.logo ? [b.logo] : b.coverImages || [],
            image: b.logo || b.coverImages?.[0] || '',
            priceRange: '$$',
            isOpen: b.isOpen,
            claimed: false,
            isClaimed: b.isClaimed || false,
            isVerified: b.isVerified || false,
            contact: {
              phone: b.contact?.phone || '',
              whatsapp: b.contact?.whatsapp || '',
              website: b.contact?.website || '',
              email: b.contact?.email || ''
            },
            location: {
              address: b.location?.address || '',
              city: b.location?.city || '',
              state: b.location?.state || '',
              country: b.location?.country || '',
              coordinates: b.location?.coordinates || { lat: 0, lng: 0 }
            },
            stats: {
              totalItems: Number(b.stats?.totalItems) || 0,
              totalReviews: Number(b.stats?.totalReviews) || 0
            }
          }));
          
          // Filter by search query if present
          if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            this.businesses = this.businesses.filter(b => 
              b.name.toLowerCase().includes(query) || 
              b.category.toLowerCase().includes(query) ||
              (b.addressString || '').toLowerCase().includes(query)
            );
          }
          
          // Store all results for explore page (in-memory cache)
          this.allBusinesses = [...this.businesses];
          this.totalResults = this.businesses.length;
          
          // Show first 10 businesses initially
          this.businesses = this.businesses.slice(0, this.displayedCount);
          
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
          
          // Store all results for explore page (in-memory cache)
          this.allItems = [...this.items];
          this.totalResults = this.items.length;
          
          // Show first 10 items initially
          this.items = this.items.slice(0, this.displayedCount);
          
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
    if (this.activeTab === tab) return; // Don't reload if same tab
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
    // Image will be hidden by CSS
  }
  
  transformBusinessForCard(business: Business): any {
    return {
      _id: business.id,
      name: business.name,
      description: business.description || '',
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
  
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
  
  updateBreadcrumbs(): void {
    this.breadcrumbs = [
      { label: 'Home', link: '/' },
      { label: 'Explore' }
    ];
  }
  
  // Store all fetched results for pagination (in-memory cache)
  allBusinesses: Business[] = [];
  allItems: Item[] = [];
  
  saveState(): void {
    // Save current scroll position
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    
    this.exploreState.saveState({
      businesses: this.businesses,
      items: this.items,
      allBusinesses: this.allBusinesses,
      allItems: this.allItems,
      totalResults: this.totalResults,
      activeTab: this.activeTab,
      scrollPosition: scrollPosition
    });
  }
  
  restoreState(): void {
    const savedState = this.exploreState.getState();
    
    if (savedState) {
      // Restore all data
      this.businesses = savedState.businesses;
      this.items = savedState.items;
      this.allBusinesses = savedState.allBusinesses;
      this.allItems = savedState.allItems;
      this.totalResults = savedState.totalResults;
      this.activeTab = savedState.activeTab;
      
      // Store scroll position to restore after view init
      this.savedScrollPosition = savedState.scrollPosition;
      
      // Clear state after restoring
      this.exploreState.clearState();
    }
  }
  
  ngAfterViewInit(): void {
    // Restore scroll position after view is fully rendered
    if (this.savedScrollPosition > 0) {
      setTimeout(() => {
        window.scrollTo({
          top: this.savedScrollPosition,
          behavior: 'instant'
        });
        this.savedScrollPosition = 0;
      }, 100);
    }
  }
  
  loadMore(): void {
    // Get current length before loading
    const currentLength = this.activeTab === 'businesses' ? this.businesses.length : this.items.length;
    
    // Calculate slice indices (load 10 more)
    const startIndex = currentLength;
    const endIndex = startIndex + this.pageSize; // Load 10 more
    
    if (this.activeTab === 'businesses') {
      // Get 10 more businesses from already fetched results
      const moreBusinesses = this.allBusinesses.slice(startIndex, endIndex);
      this.businesses = [...this.businesses, ...moreBusinesses];
    } else {
      // Get 10 more items from already fetched results
      const moreItems = this.allItems.slice(startIndex, endIndex);
      this.items = [...this.items, ...moreItems];
    }
  }
  
  goBack(): void {
    this.location.back();
  }
}
