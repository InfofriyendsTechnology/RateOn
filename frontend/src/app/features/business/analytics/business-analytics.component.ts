import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StorageService } from '../../../core/services/storage';
import { BusinessService } from '../../../core/services/business';
import { LucideAngularModule, BarChart2, ShoppingBag, Package, MessageSquare, Star, TrendingUp, RefreshCw } from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-business-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, BaseChartDirective],
  templateUrl: './business-analytics.component.html',
  styleUrl: './business-analytics.component.scss'
})
export class BusinessAnalyticsComponent implements OnInit {
  readonly BarChart2     = BarChart2;
  readonly ShoppingBag   = ShoppingBag;
  readonly Package       = Package;
  readonly MessageSquare = MessageSquare;
  readonly Star          = Star;
  readonly TrendingUp    = TrendingUp;
  readonly RefreshCw     = RefreshCw;

  businesses: any[] = [];
  isLoading = true;
  todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Computed overview stats
  totalBusinesses = 0;
  totalItems      = 0;
  totalReviews    = 0;
  avgRating       = 0;

  hasChartData = false;

  // ── Chart 1: Reviews per business (horizontal bar) ──
  reviewsChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  reviewsChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.x} reviews` } }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: '#888', stepSize: 1 },
        grid: { color: 'rgba(128,128,128,0.15)' }
      },
      y: {
        ticks: { color: '#ccc', font: { size: 11 } },
        grid: { display: false }
      }
    }
  };

  // ── Chart 2: Avg rating per business (bar) ──
  ratingChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  ratingChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => ` ${(ctx.parsed.y as number).toFixed(1)} ★` } }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        ticks: { color: '#888', stepSize: 1 },
        grid: { color: 'rgba(128,128,128,0.15)' }
      },
      x: {
        ticks: { color: '#ccc', font: { size: 11 } },
        grid: { display: false }
      }
    }
  };

  // ── Chart 3: Rating distribution doughnut ──
  doughnutData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#ccc', boxWidth: 14, padding: 12 } },
      tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed} reviews` } }
    }
  };

  constructor(
    private storage: StorageService,
    private businessService: BusinessService
  ) {}

  ngOnInit() { this.loadData(); }

  loadData() {
    this.isLoading = true;
    const user   = this.storage.getUser();
    const userId = user?._id || user?.id;
    if (!userId) { this.isLoading = false; return; }

    this.businessService.getBusinesses({ owner: userId, _nocache: Date.now() }).subscribe({
      next: (response: any) => {
        const data = response.data || response;
        this.businesses = data.businesses || data || [];
        this.computeStats();
        this.buildCharts();
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  // ── Helpers (correct backend field names) ──────────
  getBusinessItems(b: any):   number { return b.stats?.totalItems   || b.itemsCount  || 0; }
  getBusinessReviews(b: any): number { return b.stats?.totalReviews  || b.reviewCount || 0; }
  getBusinessRating(b: any):  string { return (b.averageRating ?? b.rating ?? 0).toFixed(1); }
  getBusinessRatingNum(b: any): number { return +(b.averageRating ?? b.rating ?? 0); }

  getBarWidth(business: any): number {
    const max = Math.max(...this.businesses.map(b => this.getBusinessReviews(b)), 1);
    return Math.round((this.getBusinessReviews(business) / max) * 100);
  }

  computeStats() {
    this.totalBusinesses = this.businesses.length;
    this.totalItems    = this.businesses.reduce((s, b) => s + this.getBusinessItems(b), 0);
    this.totalReviews  = this.businesses.reduce((s, b) => s + this.getBusinessReviews(b), 0);
    const withRating   = this.businesses.filter(b => this.getBusinessRatingNum(b) > 0);
    this.avgRating     = withRating.length
      ? withRating.reduce((s, b) => s + this.getBusinessRatingNum(b), 0) / withRating.length
      : 0;
    this.hasChartData  = this.totalReviews > 0;
  }

  buildCharts() {
    const labels  = this.businesses.map(b => b.name || 'Business');
    const reviews = this.businesses.map(b => this.getBusinessReviews(b));
    const ratings = this.businesses.map(b => this.getBusinessRatingNum(b));

    // Chart 1 — reviews horizontal bar
    this.reviewsChartData = {
      labels,
      datasets: [{
        data: reviews,
        backgroundColor: 'rgba(251,191,36,0.75)',
        borderColor: '#fbbf24',
        borderWidth: 1,
        borderRadius: 6,
        label: 'Reviews'
      }]
    };

    // Chart 2 — avg rating bar
    this.ratingChartData = {
      labels,
      datasets: [{
        data: ratings,
        backgroundColor: this.businesses.map((_, i) =>
          ['rgba(251,191,36,0.8)', 'rgba(59,130,246,0.8)', 'rgba(34,197,94,0.8)', 'rgba(249,115,22,0.8)', 'rgba(168,85,247,0.8)'][i % 5]
        ),
        borderColor: this.businesses.map((_, i) =>
          ['#fbbf24', '#3b82f6', '#22c55e', '#f97316', '#a855f7'][i % 5]
        ),
        borderWidth: 1,
        borderRadius: 6,
        label: 'Avg Rating'
      }]
    };

    // Chart 3 — rating distribution doughnut (aggregate 1-5 stars)
    const dist: number[] = [0, 0, 0, 0, 0]; // index 0 = 1 star … index 4 = 5 stars
    this.businesses.forEach(b => {
      if (b.rating?.distribution) {
        // backend may provide distribution object {1: n, 2: n, ...}
        for (let star = 1; star <= 5; star++) {
          dist[star - 1] += b.rating.distribution[star] || 0;
        }
      } else {
        // fallback: bucket all reviews into the avg star bracket
        const r = this.getBusinessReviews(b);
        const avg = Math.round(this.getBusinessRatingNum(b));
        if (avg >= 1 && avg <= 5) dist[avg - 1] += r;
      }
    });
    this.doughnutData = {
      labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
      datasets: [{
        data: dist,
        backgroundColor: ['#ef4444', '#f97316', '#fbbf24', '#84cc16', '#22c55e'],
        borderColor: 'transparent',
        hoverOffset: 8
      }]
    };
  }
}
