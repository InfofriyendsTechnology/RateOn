import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LeaderboardService, LeaderboardUser } from '../../../core/services/leaderboard.service';

@Component({
  selector: 'app-leaderboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.scss',
})
export class Leaderboard implements OnInit {
  selectedTab: 'reviewers' | 'active' | 'category' = 'reviewers';
  users: LeaderboardUser[] = [];
  loading = false;
  
  // For category tab
  categories = ['Restaurant', 'Cafe', 'Street Food', 'Bakery', 'Fast Food', 'Desserts'];
  selectedCategory = 'Restaurant';
  
  // For active users tab
  timeframe: 'week' | 'month' | 'year' | 'all' = 'month';

  constructor(
    private leaderboardService: LeaderboardService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadLeaderboard();
  }

  selectTab(tab: 'reviewers' | 'active' | 'category') {
    this.selectedTab = tab;
    this.loadLeaderboard();
  }

  onCategoryChange() {
    this.loadLeaderboard();
  }

  onTimeframeChange() {
    this.loadLeaderboard();
  }

  loadLeaderboard() {
    this.loading = true;
    
    if (this.selectedTab === 'reviewers') {
      this.leaderboardService.getTopReviewers({ limit: 50 }).subscribe({
        next: (response: any) => {
          this.users = response.users.map((user: any, index: number) => ({
            ...user,
            rank: index + 1
          }));
          this.loading = false;
        },
        error: (err: any) => {
          console.error(err);
          this.loading = false;
        }
      });
    } else if (this.selectedTab === 'active') {
      this.leaderboardService.getMostActiveUsers({ 
        limit: 50, 
        timeframe: this.timeframe 
      }).subscribe({
        next: (response: any) => {
          this.users = response.users.map((user: any, index: number) => ({
            ...user,
            rank: index + 1
          }));
          this.loading = false;
        },
        error: (err: any) => {
          console.error(err);
          this.loading = false;
        }
      });
    } else if (this.selectedTab === 'category') {
      this.leaderboardService.getTopContributorsByCategory(this.selectedCategory, { limit: 50 }).subscribe({
        next: (response: any) => {
          this.users = response.users.map((user: any, index: number) => ({
            ...user,
            rank: index + 1
          }));
          this.loading = false;
        },
        error: (err: any) => {
          console.error(err);
          this.loading = false;
        }
      });
    }
  }

  viewProfile(userId: string) {
    this.router.navigate(['/user/profile', userId]);
  }

  getLevelColor(level: number): string {
    if (level >= 9) return '#b19cd9'; // Diamond
    if (level >= 7) return '#e5e4e2'; // Platinum
    if (level >= 5) return '#ffd700'; // Gold
    if (level >= 3) return '#c0c0c0'; // Silver
    if (level >= 1) return '#cd7f32'; // Bronze
    return '#808080'; // Starter
  }

  getLevelName(level: number): string {
    if (level >= 9) return 'Diamond';
    if (level >= 7) return 'Platinum';
    if (level >= 5) return 'Gold';
    if (level >= 3) return 'Silver';
    if (level >= 1) return 'Bronze';
    return 'Starter';
  }

  getMedalEmoji(rank: number): string {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  }
}
