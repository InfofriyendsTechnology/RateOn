import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { StorageService } from '../../../core/services/storage';
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
  @ViewChild(TopBusinessesComponent) topBizRef?: TopBusinessesComponent;

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

  constructor(
    private adminService: AdminService,
    private storage: StorageService,
    private router: Router
  ) {}

  ngOnInit() { this.loadData(); }

  private mapBusinesses(list: any[]): TopBusiness[] {
    return list.map((b: any) => ({
      businessId:    b.businessId,
      businessName:  b.businessName,
      ownerId:       b.ownerId?.toString?.() || b.ownerId,
      reviewCount:   b.reviewCount,
      averageRating: b.averageRating,
      reactionCount: b.reactionCount
    }));
  }

  loadData() {
    this.isLoading = true;
    forkJoin({
      userAnalytics:    this.adminService.getUserAnalytics(),
      contentAnalytics: this.adminService.getContentAnalytics(),
      topBusinesses:    this.adminService.getTopBusinesses(this.selectedPeriod)
    }).subscribe({
      next: (r) => {
        this.userAnalytics    = r.userAnalytics.data;
        this.contentAnalytics = r.contentAnalytics.data;
        this.topBusinesses    = this.mapBusinesses(r.topBusinesses.data?.topBusinesses || []);
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  onPeriodChange(period: 'week' | 'month') {
    this.selectedPeriod = period;
    this.adminService.getTopBusinesses(period).subscribe({
      next: (r: any) => {
        this.topBusinesses = this.mapBusinesses(r.data?.topBusinesses || []);
      }
    });
  }

  onLoginAsOwner(ownerId: string) {
    this.adminService.loginAsUser(ownerId).subscribe({
      next: (r: any) => {
        const { token, user: userData } = r.data;

        // Backup admin session
        const adminToken = this.storage.getToken();
        if (adminToken) localStorage.setItem('rateon_admin_backup_token', adminToken);
        const adminUser = this.storage.getUser();
        if (adminUser) localStorage.setItem('rateon_admin_backup_user', JSON.stringify(adminUser));
        localStorage.setItem('rateon_is_impersonating', 'true');
        localStorage.setItem('rateon_admin_return_url', this.router.url);

        this.storage.saveToken(token);
        this.storage.saveUser(userData);
        this.topBizRef?.resetLoggingIn();
        window.open('/', '_blank');
      },
      error: (err: any) => {
        alert(err?.error?.message || 'Could not login as this user');
        this.topBizRef?.resetLoggingIn();
      }
    });
  }

  getTodayDate(): string {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
}
