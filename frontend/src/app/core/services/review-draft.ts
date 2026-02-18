import { Injectable } from '@angular/core';

export interface ReviewDraft {
  itemId?: string;
  businessId: string;
  reviewType?: 'item' | 'business';
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ReviewDraftService {
  private STORAGE_KEY = 'rateon_review_draft';

  saveDraft(draft: ReviewDraft): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(draft));
    } catch (error) {
    }
  }

  getDraft(): ReviewDraft | null {
    try {
      const draft = localStorage.getItem(this.STORAGE_KEY);
      return draft ? JSON.parse(draft) : null;
    } catch (error) {
      return null;
    }
  }

  clearDraft(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
    }
  }

  hasDraft(): boolean {
    return !!this.getDraft();
  }
}
