import { Injectable } from '@angular/core';

interface ExploreState {
  businesses: any[];
  items: any[];
  allBusinesses: any[];
  allItems: any[];
  totalResults: number;
  activeTab: 'businesses' | 'items';
  scrollPosition: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExploreStateService {
  private state: ExploreState | null = null;

  saveState(state: ExploreState): void {
    this.state = state;
  }

  getState(): ExploreState | null {
    return this.state;
  }

  clearState(): void {
    this.state = null;
  }

  hasState(): boolean {
    return this.state !== null;
  }
}
