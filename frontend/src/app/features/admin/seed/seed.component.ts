import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { LucideAngularModule, Database, Trash2, RefreshCw } from 'lucide-angular';

@Component({
  selector: 'app-seed',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <!-- Top Bar -->
    <div class="top-bar">
      <div class="page-title">
        <h1>Seed Data Management</h1>
        <p class="header-subtitle">Manage dummy data for testing</p>
      </div>
    </div>

    <!-- Page Content -->
    <div class="page-content">
      <!-- Error Message -->
      <div *ngIf="error" class="alert alert-error">
        {{ error }}
      </div>

      <!-- Success Message -->
      <div *ngIf="success" class="alert alert-success">
        {{ success }}
      </div>

      <div class="stats-grid" *ngIf="stats">
        <div class="stat-card">
          <span class="label">Dummy Users</span>
          <span class="value">{{ stats.dummyUsers || 0 }}</span>
        </div>
        <div class="stat-card">
          <span class="label">Businesses</span>
          <span class="value">{{ stats.businesses || 0 }}</span>
        </div>
        <div class="stat-card">
          <span class="label">Items</span>
          <span class="value">{{ stats.items || 0 }}</span>
        </div>
      </div>

      <div class="actions">
        <button 
          class="btn-create" 
          (click)="create()" 
          [disabled]="isCreating || stats?.hasDummyData">
          <lucide-icon [img]="isCreating ? RefreshCw : Database" [size]="18" [class.spin]="isCreating"></lucide-icon>
          {{ isCreating ? 'Creating...' : stats?.hasDummyData ? 'Data Exists' : 'Create Data' }}
        </button>

        <button 
          class="btn-clear" 
          (click)="clear()" 
          [disabled]="isClearing || !stats?.hasDummyData">
          <lucide-icon [img]="isClearing ? RefreshCw : Trash2" [size]="18" [class.spin]="isClearing"></lucide-icon>
          {{ isClearing ? 'Clearing...' : 'Clear Data' }}
        </button>
      </div>

      <div class="info">
        <p><strong>Password:</strong> Password123</p>
      </div>
    </div>
  `,
  styles: [`
    .top-bar {
      padding: 2rem 2rem 0;
      margin-bottom: 2rem;
      border-bottom: 1px solid #1a1a1a;
      padding-bottom: 1.5rem;
    }
    
    .page-title h1 {
      margin: 0 0 0.5rem;
      font-size: 1.75rem;
      font-weight: 700;
      color: #fff;
    }
    
    .page-title .header-subtitle {
      margin: 0;
      color: #666;
      font-size: 0.875rem;
    }
    
    .page-content {
      padding: 0 2rem 2rem;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .stat-card {
      background: #0a0a0a;
      border: 1px solid #1a1a1a;
      border-radius: 8px;
      padding: 1.5rem;
    }
    
    .stat-card .label {
      display: block;
      font-size: 0.875rem;
      color: #666;
      margin-bottom: 0.5rem;
    }
    
    .stat-card .value {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      color: #C0C0C0;
    }
    
    .actions {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .actions button {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .actions button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .btn-create {
      background: linear-gradient(135deg, #A8A8A8, #C0C0C0);
      color: #000;
      box-shadow: 0 4px 14px rgba(192, 192, 192, 0.3);
    }
    
    .btn-create:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(192, 192, 192, 0.4);
    }
    
    .btn-clear {
      background: transparent;
      color: #fff;
      border: 1px solid #2a2a2a;
    }
    
    .btn-clear:hover:not(:disabled) {
      background: rgba(192, 192, 192, 0.1);
    }
    
    .info {
      background: #0a0a0a;
      border: 1px solid #1a1a1a;
      border-radius: 8px;
      padding: 1.5rem;
    }
    
    .info p {
      margin: 0;
      color: #999;
      font-size: 0.875rem;
    }
    
    .spin {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .alert {
      padding: 1rem 1.5rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    .alert-error {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
    }
    
    .alert-success {
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #4ade80;
    }
  `]
})
export class SeedComponent implements OnInit {
  readonly Database = Database;
  readonly Trash2 = Trash2;
  readonly RefreshCw = RefreshCw;

  stats: any = null;
  isCreating = false;
  isClearing = false;
  error: string = '';
  success: string = '';

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.error = '';
    this.adminService.getSeedStats().subscribe({
      next: (r: any) => this.stats = r.data,
      error: (err) => {
        this.error = err.error?.message || err.message || 'Failed to load stats';
        console.error('Load stats error:', err);
      }
    });
  }

  create() {
    this.isCreating = true;
    this.error = '';
    this.success = '';
    this.adminService.createDummyData().subscribe({
      next: (response) => {
        this.isCreating = false;
        this.success = 'Seed data created successfully!';
        console.log('Create success:', response);
        setTimeout(() => this.load(), 1000);
      },
      error: (err) => {
        this.isCreating = false;
        this.error = err.error?.message || err.message || 'Failed to create seed data';
        console.error('Create error:', err);
      }
    });
  }

  clear() {
    this.isClearing = true;
    this.error = '';
    this.success = '';
    this.adminService.clearDummyData().subscribe({
      next: (response) => {
        this.isClearing = false;
        this.success = 'Seed data cleared successfully!';
        console.log('Clear success:', response);
        setTimeout(() => this.load(), 1000);
      },
      error: (err) => {
        this.isClearing = false;
        this.error = err.error?.message || err.message || 'Failed to clear seed data';
        console.error('Clear error:', err);
      }
    });
  }
}
