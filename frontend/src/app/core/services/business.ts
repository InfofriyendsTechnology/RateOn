import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Business {
  _id: string;
  name: string;
  type: string;
  category: string;
  description?: string;
  logo?: string;
  coverImages?: string[];
  images?: string[]; // Deprecated, kept for backward compatibility
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: { lat: number; lng: number };
  };
  contact: {
    phone?: string;
    whatsapp?: string;
    website?: string;
    email?: string;
  };
  rating: {
    average: number;
    count: number;
    distribution: { [key: number]: number };
  };
  owner?: string;
  isClaimed: boolean;
  isVerified: boolean;
  stats: {
    totalItems: number;
    totalReviews: number;
  };
  // Helper properties for templates
  address?: { street: string; area: string; city: string; state: string };
  phone?: string;
  hours?: string;
  claimed?: boolean;
  averageRating?: number;
  totalReviews?: number;
  totalItems?: number;
  reviewCount?: number;
  itemsCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  private apiUrl = `${environment.apiUrl}/businesses`;

  constructor(private http: HttpClient) {}

  getBusinesses(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get(this.apiUrl, { params: httpParams });
  }

  getNearbyBusinesses(lat: number, lng: number, radius: number = 5): Observable<any> {
    return this.http.get(`${this.apiUrl}/nearby`, {
      params: { lat: lat.toString(), lng: lng.toString(), radius: radius.toString() }
    });
  }

  getBusinessById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createBusiness(business: any): Observable<any> {
    return this.http.post(this.apiUrl, business);
  }

  updateBusiness(id: string, business: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, business);
  }
  
  updateBusinessWithFiles(id: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, formData);
  }

  claimBusiness(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/claim`, {});
  }

  deleteBusiness(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  searchBusinesses(query: string, filters?: any): Observable<any> {
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
