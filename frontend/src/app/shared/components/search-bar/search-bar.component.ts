import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { BusinessService } from '../../../core/services/business';
import { ItemService } from '../../../core/services/item';

export interface SearchSuggestion {
  type: 'business' | 'item' | 'category';
  id: string;
  name: string;
  subtitle?: string;
}

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss'
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Output() search = new EventEmitter<string>();
  
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();
  
  searchQuery: string = '';
  suggestions: SearchSuggestion[] = [];
  recentSearches: string[] = [];
  showSuggestions: boolean = false;
  loading: boolean = false;
  selectedIndex: number = -1;
  private liveSearchSubject$ = new Subject<string>();

  constructor(
    private router: Router,
    private businessService: BusinessService,
    private itemService: ItemService
  ) {}

  ngOnInit(): void {
    // Load recent searches from localStorage
    this.loadRecentSearches();
    
    // Setup debounced search for suggestions
    this.searchSubject$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((query: string) => {
        if (query.length >= 2) {
          this.fetchSuggestions(query);
        } else {
          this.suggestions = [];
          this.showSuggestions = false;
        }
      });
    
    // Setup live search - triggers actual search on search results page
    this.liveSearchSubject$
      .pipe(
        debounceTime(500), // 500ms delay for live search
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((query: string) => {
        console.log('Live search triggered:', query, 'URL:', this.router.url);
        // Only trigger live search if on EXACT search results page
        const currentUrl = this.router.url.split('?')[0]; // Remove query params
        if (currentUrl === '/search') {
          console.log('Performing live search for:', query);
          this.performLiveSearch(query);
        } else {
          console.log('Not on search page, skipping live search');
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onInputChange(query: string): void {
    this.searchQuery = query;
    
    if (query.trim()) {
      this.showSuggestions = true;
      this.searchSubject$.next(query);
    } else {
      this.suggestions = [];
      this.showSuggestions = false;
    }
    
    // Trigger live search (with debounce)
    this.liveSearchSubject$.next(query);
  }

  onInputFocus(): void {
    if (this.searchQuery.trim()) {
      this.showSuggestions = true;
    }
  }

  onInputBlur(): void {
    // Delay to allow click on suggestion
    setTimeout(() => {
      this.showSuggestions = false;
      this.selectedIndex = -1;
    }, 200);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.showSuggestions || this.suggestions.length === 0) {
      if (event.key === 'Enter') {
        this.performSearch();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.suggestions.length - 1);
        break;
      
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        break;
      
      case 'Enter':
        event.preventDefault();
        if (this.selectedIndex >= 0) {
          this.selectSuggestion(this.suggestions[this.selectedIndex]);
        } else {
          this.performSearch();
        }
        break;
      
      case 'Escape':
        this.showSuggestions = false;
        this.selectedIndex = -1;
        break;
    }
  }

  fetchSuggestions(query: string): void {
    this.loading = true;
    
    // Search both businesses and items
    forkJoin({
      businesses: this.businessService.searchBusinesses(query, { limit: 5 }),
      items: this.itemService.searchItems(query, { limit: 5 })
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (results: any) => {
        const suggestions: SearchSuggestion[] = [];
        
        // Add business suggestions
        const businesses = results.businesses?.data?.businesses || results.businesses?.businesses || [];
        businesses.slice(0, 3).forEach((business: any) => {
          suggestions.push({
            type: 'business',
            id: business._id,
            name: business.name,
            subtitle: business.category || business.type || 'Business'
          });
        });
        
        // Add item suggestions
        const items = results.items?.data?.items || results.items?.items || [];
        items.slice(0, 3).forEach((item: any) => {
          const businessName = typeof item.businessId === 'object' ? item.businessId?.name : '';
          suggestions.push({
            type: 'item',
            id: item._id,
            name: item.name,
            subtitle: businessName ? `at ${businessName}` : 'Item'
          });
        });
        
        this.suggestions = suggestions;
        this.loading = false;
      },
      error: () => {
        this.suggestions = [];
        this.loading = false;
      }
    });
  }

  selectSuggestion(suggestion: SearchSuggestion): void {
    this.searchQuery = suggestion.name;
    this.showSuggestions = false;
    this.saveToRecentSearches(suggestion.name);
    
    // Navigate based on type
    if (suggestion.type === 'business') {
      this.router.navigate(['/business', suggestion.id]);
    } else if (suggestion.type === 'item') {
      // Navigate to item detail or search results
      this.performSearch();
    } else {
      this.performSearch();
    }
  }

  performSearch(): void {
    if (!this.searchQuery.trim()) return;
    
    this.saveToRecentSearches(this.searchQuery);
    this.showSuggestions = false;
    this.search.emit(this.searchQuery);
    
    // Navigate to search results
    this.router.navigate(['/search'], { 
      queryParams: { q: this.searchQuery } 
    });
  }
  
  performLiveSearch(query: string): void {
    console.log('performLiveSearch called with:', query);
    // Update URL with query param (or remove if empty)
    const queryParams: any = {};
    if (query.trim()) {
      queryParams.q = query;
      console.log('Setting query param to:', query);
    } else {
      queryParams.q = null; // Remove param to show all results
      console.log('Removing query param (empty search)');
    }
    
    this.router.navigate(['/search'], { 
      queryParams,
      queryParamsHandling: 'merge'
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.suggestions = [];
    this.showSuggestions = false;
    this.selectedIndex = -1;
    
    // Trigger live search with empty query (shows all results)
    this.liveSearchSubject$.next('');
  }

  removeRecentSearch(search: string): void {
    this.recentSearches = this.recentSearches.filter((s: string) => s !== search);
    this.saveRecentSearches();
  }

  private loadRecentSearches(): void {
    const stored = localStorage.getItem('recent_searches');
    if (stored) {
      try {
        this.recentSearches = JSON.parse(stored);
      } catch (e) {
        this.recentSearches = [];
      }
    }
  }

  private saveToRecentSearches(query: string): void {
    // Remove if already exists
    this.recentSearches = this.recentSearches.filter((s: string) => s !== query);
    
    // Add to beginning
    this.recentSearches.unshift(query);
    
    // Keep only last 5
    this.recentSearches = this.recentSearches.slice(0, 5);
    
    this.saveRecentSearches();
  }

  private saveRecentSearches(): void {
    localStorage.setItem('recent_searches', JSON.stringify(this.recentSearches));
  }

  getSuggestionIcon(type: string): string {
    switch (type) {
      case 'business': return 'lucide lucide-building-2';
      case 'item': return 'lucide lucide-shopping-bag';
      case 'category': return 'lucide lucide-tag';
      default: return 'lucide lucide-search';
    }
  }
}
