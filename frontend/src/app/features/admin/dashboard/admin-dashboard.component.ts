import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { LucideAngularModule, Users, Building2, FileText, TrendingUp, ShieldCheck, UserCheck } from 'lucide-angular';
import { TopBusinessesComponent, TopBusiness } from '../../../shared/components/top-businesses/top-businesses.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, TopBusinessesComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  readonly Users = Users;
  readonly Building2 = Building2;
  readonly FileText = FileText;
  readonly TrendingUp = TrendingUp;
  readonly ShieldCheck = ShieldCheck;
  readonly UserCheck = UserCheck;

  userAnalytics: any = null;
  contentAnalytics: any = null;
  topBusinesses: TopBusiness[] = [];

  isLoading = true;
  selectedPeriod: 'week' | 'month' = 'month';
  todayDate = this.getTodayDate();

  constructor(private adminService: AdminService) {}

  ngOnInit() { this.loadData(); }

  loadData() {
    this.isLoading = true;
    forkJoin({
      userAnalytics:  this.adminService.getUserAnalytics(),
      contentAnalytics: this.adminService.getContentAnalytics(),
      topBusinesses: this.adminService.getTopBusinesses(this.selectedPeriod)
    }).subscribe({
      next: (r) => {
        this.userAnalytics   = r.userAnalytics.data;
        this.contentAnalytics = r.contentAnalytics.data;
        this.topBusinesses  = (r.topBusinesses.data?.topBusinesses || []).map((b: any) => ({
          businessId: b.businessId, businessName: b.businessName,
          reviewCount: b.reviewCount, averageRating: b.averageRating, reactionCount: b.reactionCount
        }));
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  onPeriodChange(period: 'week' | 'month') {
    this.selectedPeriod = period;
    this.adminService.getTopBusinesses(period).subscribe({
      next: (r: any) => {
        this.topBusinesses = (r.data?.topBusinesses || []).map((b: any) => ({
          businessId: b.businessId, businessName: b.businessName,
          reviewCount: b.reviewCount, averageRating: b.averageRating, reactionCount: b.reactionCount
        }));
      }
    });
  }

  getTodayDate(): string {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
}
