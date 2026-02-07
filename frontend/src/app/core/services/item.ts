import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Item {
  _id: string;
  businessId: string;
  name: string;
  description?: string;
  price: number;
  images: string[];
  category: string;
  availability: {
    status: 'available' | 'out_of_stock' | 'coming_soon';
    availableUntil?: Date;
    note?: string;
  };
  averageRating: number;
  reviewCount: number;
  ratingDistribution: { [key: number]: number };
  createdAt?: string;
  updatedAt?: string;
  // Stats object (nested format from API)
  stats?: {
    ratingDistribution: { [key: number]: number };
    averageRating: number;
    totalReviews: number;
    views: number;
  };
  // Helper properties for templates
  isAvailable?: boolean;
  totalReviews?: number;
  hasUserReview?: boolean;
  userReviewId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private apiUrl = `${environment.apiUrl}/items`;

  constructor(private http: HttpClient) {}

  getItemsByBusiness(businessId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/business/${businessId}`);
  }

  getItemById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createItem(businessId: string, item: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/business/${businessId}`, item);
  }

  updateItem(id: string, item: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, item);
  }

  updateAvailability(id: string, status: string, note?: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/availability`, { status, note });
  }

  deleteItem(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  searchItems(query: string, filters?: any): Observable<any> {
    let params = new HttpParams().set('search', query);
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get(`${this.apiUrl}/search`, { params });
  }
}
