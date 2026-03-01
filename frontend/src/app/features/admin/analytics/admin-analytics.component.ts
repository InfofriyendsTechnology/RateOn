import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import {
  LucideAngularModule,
  BarChart2, RefreshCw,
  UserPlus, MessageSquare, ThumbsUp, Zap,
  FileText, Star, MessageCircle,
  Building2, ShieldCheck, BadgeCheck, Package,
  Globe2
} from 'lucide-angular';
import { AnalyticsChartsComponent, ChartData } from '../../../shared/components/analytics-charts/analytics-charts.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, AnalyticsChartsComponent],
  templateUrl: './admin-analytics.component.html',
  styleUrl: './admin-analytics.component.scss'
})
export class AdminAnalyticsComponent implements OnInit {
  // Icons
  readonly BarChart2      = BarChart2;
  readonly RefreshCw      = RefreshCw;
  readonly UserPlus       = UserPlus;
  readonly MessageSquare  = MessageSquare;
  readonly ThumbsUp       = ThumbsUp;
  readonly Zap            = Zap;
  readonly FileText       = FileText;
  readonly Star           = Star;
  readonly MessageCircle  = MessageCircle;
  readonly Building2      = Building2;
  readonly ShieldCheck    = ShieldCheck;
  readonly BadgeCheck     = BadgeCheck;
  readonly Package        = Package;
  readonly Globe2         = Globe2;

  // Data
  realTimeMetrics: any  = null;
  reviewStatistics: any = null;
  businessStats: any    = null;
  userAnalytics: any    = null;
  userStatistics: any   = null;

  // Charts (5 actionable charts)
  ratingChart: ChartData        | null = null;
  authMethodChart: ChartData    | null = null;
  availabilityChart: ChartData  | null = null;
  reactionsTypeChart: ChartData | null = null;
  topCountriesChart: ChartData  | null = null;

  isLoading = true;

  constructor(private adminService: AdminService) {}

  ngOnInit() { this.load(); }

  load() {
    this.isLoading = true;
    forkJoin({
      realTimeMetrics:  this.adminService.getRealTimeMetrics(),
      reviewStatistics: this.adminService.getReviewStatistics(),
      businessStats:    this.adminService.getBusinessStatistics(),
      userAnalytics:    this.adminService.getUserAnalytics(),
      userStatistics:   this.adminService.getUserStatistics()
    }).subscribe({
      next: (r) => {
        this.realTimeMetrics  = r.realTimeMetrics.data;
        this.reviewStatistics = r.reviewStatistics.data;
        this.businessStats    = r.businessStats.data;
        this.userAnalytics    = r.userAnalytics.data;
        this.userStatistics   = r.userStatistics.data;
        this.buildCharts();
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  buildCharts() {
    const rs = this.reviewStatistics;
    const ua = this.userAnalytics;
    const bs = this.businessStats;
    const us = this.userStatistics;

    // Chart 1 — Rating Distribution
    if (rs?.byRating) {
      const r = rs.byRating;
      this.ratingChart = {
        labels: ['1 ★', '2 ★', '3 ★', '4 ★', '5 ★'],
        datasets: [{ label: 'Reviews',
          data: [r['1'], r['2'], r['3'], r['4'], r['5']],
          backgroundColor: ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'] }]
      };
    }

    // Chart 2 — Auth Method Breakdown
    if (ua?.authMethod) {
      this.authMethodChart = {
        labels: ['Google OAuth', 'Email & Password'],
        datasets: [{ label: 'Users',
          data: [ua.authMethod.googleAccounts, ua.authMethod.emailPasswordAccounts],
          backgroundColor: ['#4285F4', '#f59e0b'] }]
      };
    }

    // Chart 3 — Item Availability
    if (bs?.items?.byAvailability) {
      const av = bs.items.byAvailability;
      this.availabilityChart = {
        labels: ['Available', 'Out of Stock', 'Discontinued'],
        datasets: [{ label: 'Items',
          data: [av.available ?? 0, av.out_of_stock ?? 0, av.discontinued ?? 0],
          backgroundColor: ['#22c55e', '#ef4444', '#94a3b8'] }]
      };
    }

    // Chart 4 — Reactions by Type
    if (rs?.reactionsByType) {
      const rt = rs.reactionsByType;
      this.reactionsTypeChart = {
        labels: ['Helpful', 'Not Helpful'],
        datasets: [{ label: 'Reactions',
          data: [rt.helpful ?? 0, rt.not_helpful ?? 0],
          backgroundColor: ['#22c55e', '#ef4444'] }]
      };
    }

    // Chart 5 — Top Countries (horizontal bar)
    if (us?.byCountry && us.byCountry.length > 0) {
      const top10 = us.byCountry.slice(0, 10);
      this.topCountriesChart = {
        labels: top10.map((c: any) => c.country),
        datasets: [{ label: 'Users',
          data: top10.map((c: any) => c.count),
          backgroundColor: '#6366f1' }]
      };
    }
  }
}
