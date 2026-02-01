import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BusinessService, Business } from '../../../core/services/business';
import { BusinessCard } from '../../../shared/components/business-card/business-card';
import { LucideAngularModule, Search, X } from 'lucide-angular';

@Component({
  selector: 'app-business-list',
  imports: [CommonModule, FormsModule, BusinessCard, LucideAngularModule],
  templateUrl: './business-list.html',
  styleUrl: './business-list.scss',
})
export class BusinessList implements OnInit {
  businesses: Business[] = [];
  filteredBusinesses: Business[] = [];
  loading = false;
  error = '';
  
  // Lucide icons
  readonly Search = Search;
  readonly X = X;
  
  // UI state
  showSearch = false;
  
  // Search & Filter
  searchQuery = '';
  selectedCategory = '';
  selectedRating = 0;
  
  // Pagination
  page = 1;
  limit = 12;
  total = 0;
  totalPages = 0;
  
  categories = ['Food', 'Restaurant', 'Cafe', 'Street Food', 'Bakery', 'Fast Food', 'Desserts', 'Tea', 'Coffee'];
  ratings = [5, 4, 3, 2, 1];

  constructor(
    private businessService: BusinessService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadBusinesses();
  }

  loadBusinesses() {
    this.loading = true;
    this.error = '';
    
    const params: any = {
      page: this.page,
      limit: this.limit
    };
    
    if (this.selectedCategory) {
      params.category = this.selectedCategory;
    }
    
    if (this.selectedRating) {
      params.minRating = this.selectedRating;
    }

    this.businessService.getBusinesses(params).subscribe({
      next: (response: any) => {
        // Backend returns data.businesses and data.pagination
        const data = response.data || response;
        this.businesses = data.businesses || [];
        
        // Map backend fields to frontend expected fields
        this.businesses = this.businesses.map((b: any) => ({
          ...b,
          images: b.coverImages || b.images || [],
          address: {
            street: b.location?.address || '',
            area: b.location?.address || '',
            city: b.location?.city || '',
            state: b.location?.state || ''
          },
          phone: b.contact?.phone || '',
          claimed: b.isClaimed || false,
          // Use stats from backend just like detail page
          averageRating: b.stats?.avgRating || b.rating?.average || b.averageRating || 0,
          reviewCount: b.stats?.totalReviews || b.rating?.count || b.totalReviews || 0,
          itemsCount: b.stats?.totalItems || b.totalItems || 0
        }));
        
        this.filteredBusinesses = this.businesses;
        this.total = data.pagination?.total || 0;
        this.totalPages = Math.ceil(this.total / this.limit);
        this.loading = false;
        
        if (this.searchQuery) {
          this.onSearch();
        }
      },
      error: (err: any) => {
        this.error = 'Failed to load businesses';
        this.businesses = [];
        this.filteredBusinesses = [];
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSearch() {
    if (!this.searchQuery.trim()) {
      this.filteredBusinesses = this.businesses;
      return;
    }
    
    const query = this.searchQuery.toLowerCase();
    this.filteredBusinesses = this.businesses.filter(b => 
      b.name.toLowerCase().includes(query) ||
      b.description?.toLowerCase().includes(query)
    );
  }

  onCategoryChange() {
    this.page = 1;
    this.loadBusinesses();
  }

  onRatingChange() {
    this.page = 1;
    this.loadBusinesses();
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedRating = 0;
    this.page = 1;
    this.loadBusinesses();
  }
  
  toggleSearch() {
    this.showSearch = !this.showSearch;
  }
  
  clearSearch() {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.onSearch();
  }
  
  toggleCategory(category: string) {
    if (this.selectedCategory === category) {
      this.selectedCategory = '';
    } else {
      this.selectedCategory = category;
    }
    this.onCategoryChange();
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadBusinesses();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage() {
    if (this.page > 1) {
      this.page--;
      this.loadBusinesses();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToPage(pageNum: number) {
    this.page = pageNum;
    this.loadBusinesses();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

}
