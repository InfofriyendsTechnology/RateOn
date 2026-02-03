import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { LucideAngularModule, Users, Building2, FileText, TrendingUp, LogOut } from 'lucide-angular';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  readonly Users = Users;
  readonly Building2 = Building2;
  readonly FileText = FileText;
  readonly TrendingUp = TrendingUp;
  readonly LogOut = LogOut;

  userAnalytics: any = null;
  contentAnalytics: any = null;
  isLoading = true;
  todayDate = this.getTodayDate();

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAnalytics();
  }

  loadAnalytics() {
    this.isLoading = true;

    // Load user analytics
    this.adminService.getUserAnalytics().subscribe({
      next: (response: any) => {
        this.userAnalytics = response.data || response;
      },
      error: (error) => {
        console.error('Failed to load user analytics:', error);
      }
    });

    // Load content analytics
    this.adminService.getContentAnalytics().subscribe({
      next: (response: any) => {
        this.contentAnalytics = response.data || response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load content analytics:', error);
        this.isLoading = false;
      }
    });
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/']);
  }

  getTodayDate(): string {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return today.toLocaleDateString('en-US', options);
  }
}
