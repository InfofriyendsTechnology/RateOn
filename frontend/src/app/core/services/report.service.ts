import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Report {
  _id: string;
  reportedBy: {
    _id: string;
    name: string;
    email: string;
  };
  targetType: 'review' | 'user' | 'business';
  targetId: string;
  reason: 'spam' | 'inappropriate' | 'fake' | 'harassment' | 'other';
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'rejected';
  actionTaken?: 'none' | 'warning' | 'content_removed' | 'user_suspended' | 'user_banned';
  reviewedBy?: {
    _id: string;
    name: string;
  };
  reviewedAt?: string;
  createdAt: string;
}

export interface ReportStats {
  total: number;
  pending: number;
  reviewed: number;
  resolved: number;
  rejected: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  createReport(data: {
    targetType: 'review' | 'user' | 'business';
    targetId: string;
    reason: 'spam' | 'inappropriate' | 'fake' | 'harassment' | 'other';
    description: string;
  }): Observable<{ report: Report }> {
    return this.http.post<{ report: Report }>(this.apiUrl, data);
  }

  getAllReports(params?: {
    page?: number;
    limit?: number;
    status?: string;
    targetType?: string;
  }): Observable<{ reports: Report[]; stats: ReportStats }> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.targetType) httpParams = httpParams.set('targetType', params.targetType);
    }

    return this.http.get<{ reports: Report[]; stats: ReportStats }>(this.apiUrl, { params: httpParams });
  }

  getReportById(reportId: string): Observable<{ report: Report }> {
    return this.http.get<{ report: Report }>(`${this.apiUrl}/${reportId}`);
  }

  resolveReport(reportId: string, data: {
    actionTaken: 'none' | 'warning' | 'content_removed' | 'user_suspended' | 'user_banned';
    adminNotes?: string;
  }): Observable<{ report: Report }> {
    return this.http.put<{ report: Report }>(`${this.apiUrl}/${reportId}/resolve`, data);
  }
}
