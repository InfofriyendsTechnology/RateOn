import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  createReview(review: any): Observable<any> {
    return this.http.post(this.apiUrl, review);
  }

  getReviewById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getReviewsByItem(itemId: string, params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get(`${this.apiUrl}/item/${itemId}`, { params: httpParams });
  }

  getReviewsByBusiness(businessId: string, params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get(`${this.apiUrl}/business/${businessId}`, { params: httpParams });
  }

  getReviewsByUser(userId: string, params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get(`${this.apiUrl}/user/${userId}`, { params: httpParams });
  }

  updateReview(id: string, review: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, review);
  }

  deleteReview(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  addReaction(reviewId: string, type: 'helpful' | 'not_helpful'): Observable<any> {
    return this.http.post(`${environment.apiUrl}/reactions`, { reviewId, type });
  }

  removeReaction(reviewId: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/reactions/review/${reviewId}`);
  }

  addOwnerReply(reviewId: string, comment: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/replies/review/${reviewId}`, { comment });
  }
  
  getUserReviewForItem(itemId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/item/${itemId}`);
  }
}
