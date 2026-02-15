import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Load recent searches from localStorage
    this.loadRecentSearches();
    
    // Setup debounced search
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
    
    // Mock suggestions - In real app, call API
    // For now, create mock data
    setTimeout(() => {
      const all: SearchSuggestion[] = [
        { type: 'business', id: '1', name: 'Pizza Palace', subtitle: 'Italian Restaurant' },
        { type: 'business', id: '2', name: 'Burger King', subtitle: 'Fast Food' },
        { type: 'item', id: '3', name: 'Margherita Pizza', subtitle: 'at Pizza Palace' },
        { type: 'item', id: '4', name: 'Cheese Burger', subtitle: 'at Burger King' },
        { type: 'category', id: '5', name: 'Italian', subtitle: 'Category' }
      ];
      this.suggestions = all.filter((s: SearchSuggestion) => 
        s.name.toLowerCase().includes(query.toLowerCase())
      );
      
      this.loading = false;
    }, 100);
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

  clearSearch(): void {
    this.searchQuery = '';
    this.suggestions = [];
    this.showSuggestions = false;
    this.selectedIndex = -1;
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
