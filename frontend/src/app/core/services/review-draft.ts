import { Injectable } from '@angular/core';

export interface ReviewDraft {
  itemId: string;
  businessId: string;
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
      console.error('Failed to save review draft:', error);
    }
  }

  getDraft(): ReviewDraft | null {
    try {
      const draft = localStorage.getItem(this.STORAGE_KEY);
      return draft ? JSON.parse(draft) : null;
    } catch (error) {
      console.error('Failed to get review draft:', error);
      return null;
    }
  }

  clearDraft(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear review draft:', error);
    }
  }

  hasDraft(): boolean {
    return !!this.getDraft();
  }
}
