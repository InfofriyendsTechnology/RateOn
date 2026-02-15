import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { LucideAngularModule, Users, Building2, FileText, TrendingUp, LogOut, MapPin, Activity, Database, LayoutDashboard, Menu, Settings } from 'lucide-angular';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { AnalyticsChartsComponent, ChartData } from '../../../shared/components/analytics-charts/analytics-charts.component';
import { UserMapComponent, UserLocation } from '../../../shared/components/user-map/user-map.component';
import { TopBusinessesComponent, TopBusiness } from '../../../shared/components/top-businesses/top-businesses.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule, 
    StatCardComponent, 
    AnalyticsChartsComponent,
    UserMapComponent,
    TopBusinessesComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  readonly Users = Users;
  readonly Building2 = Building2;
  readonly FileText = FileText;
  readonly TrendingUp = TrendingUp;
  readonly LogOut = LogOut;
  readonly MapPin = MapPin;
  readonly Activity = Activity;
  readonly Database = Database;
  readonly LayoutDashboard = LayoutDashboard;
  readonly Menu = Menu;
  readonly Settings = Settings;

  // Existing analytics
  userAnalytics: any = null;
  contentAnalytics: any = null;
  
  // New analytics (Employee 5)
  userStatistics: any = null;
  reviewStatistics: any = null;
  businessStatistics: any = null;
  topBusinesses: TopBusiness[] = [];
  locationData: UserLocation[] = [];
  realTimeMetrics: any = null;
  
  // Chart data
  registrationMethodChart: ChartData | null = null;
  genderChart: ChartData | null = null;
  ratingChart: ChartData | null = null;
  countryChart: ChartData | null = null;
  
  // UI state
  isLoading = true;
  selectedPeriod: 'week' | 'month' = 'month';
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

    // Load all analytics data in parallel
    forkJoin({
      userAnalytics: this.adminService.getUserAnalytics(),
      contentAnalytics: this.adminService.getContentAnalytics(),
      userStatistics: this.adminService.getUserStatistics(),
      reviewStatistics: this.adminService.getReviewStatistics(),
      businessStatistics: this.adminService.getBusinessStatistics(),
      topBusinesses: this.adminService.getTopBusinesses(this.selectedPeriod),
      locationData: this.adminService.getLocationData(),
      realTimeMetrics: this.adminService.getRealTimeMetrics()
    }).subscribe({
      next: (results) => {
        this.userAnalytics = results.userAnalytics.data;
        this.contentAnalytics = results.contentAnalytics.data;
        this.userStatistics = results.userStatistics.data;
        this.reviewStatistics = results.reviewStatistics.data;
        this.businessStatistics = results.businessStatistics.data;
        this.realTimeMetrics = results.realTimeMetrics.data;
        
        // Process top businesses
        this.topBusinesses = (results.topBusinesses.data?.topBusinesses || []).map((b: any) => ({
          businessId: b.businessId,
          businessName: b.businessName,
          reviewCount: b.reviewCount,
          averageRating: b.averageRating,
          reactionCount: b.reactionCount
        }));
        
        // Process location data
        this.locationData = (results.locationData.data?.locations || []).map((loc: any) => ({
          userId: loc.userId,
          username: loc.username,
          latitude: loc.coordinates.coordinates[1],
          longitude: loc.coordinates.coordinates[0],
          city: loc.city,
          state: loc.state,
          country: loc.country
        }));
        
        // Prepare chart data
        this.prepareCharts();
        
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
      }
    });
  }

  prepareCharts() {
    // Registration Method Chart (Pie)
    if (this.userStatistics?.byRegistrationMethod) {
      const methods = this.userStatistics.byRegistrationMethod;
      this.registrationMethodChart = {
        labels: ['Email', 'Google', 'Facebook', 'Phone'],
        datasets: [{
          label: 'Users',
          data: [methods.email, methods.google, methods.facebook, methods.phone],
          backgroundColor: ['#3b82f6', '#ef4444', '#0ea5e9', '#10b981']
        }]
      };
    }

    // Gender Distribution Chart (Bar)
    if (this.userStatistics?.byGender) {
      const gender = this.userStatistics.byGender;
      this.genderChart = {
        labels: ['Male', 'Female', 'Other', 'Prefer not to say'],
        datasets: [{
          label: 'Users',
          data: [gender.male, gender.female, gender.other, gender.prefer_not_to_say],
          backgroundColor: '#fabd05'
        }]
      };
    }

    // Rating Distribution Chart (Bar)
    if (this.reviewStatistics?.byRating) {
      const ratings = this.reviewStatistics.byRating;
      this.ratingChart = {
        labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
        datasets: [{
          label: 'Reviews',
          data: [ratings['1'], ratings['2'], ratings['3'], ratings['4'], ratings['5']],
          backgroundColor: ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e']
        }]
      };
    }

    // Top Countries Chart (Bar)
    if (this.userStatistics?.byCountry?.length) {
      const topCountries = this.userStatistics.byCountry.slice(0, 10);
      this.countryChart = {
        labels: topCountries.map((c: any) => c.country),
        datasets: [{
          label: 'Users',
          data: topCountries.map((c: any) => c.count),
          backgroundColor: '#10b981'
        }]
      };
    }
  }

  onPeriodChange(period: 'week' | 'month') {
    this.selectedPeriod = period;
    
    // Reload top businesses with new period
    this.adminService.getTopBusinesses(period).subscribe({
      next: (response: any) => {
        this.topBusinesses = (response.data?.topBusinesses || []).map((b: any) => ({
          businessId: b.businessId,
          businessName: b.businessName,
          reviewCount: b.reviewCount,
          averageRating: b.averageRating,
          reactionCount: b.reactionCount
        }));
      },
      error: (error) => {
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
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return today.toLocaleDateString('en-US', options);
  }
}
