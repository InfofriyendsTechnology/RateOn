import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { LucideAngularModule, Database, Trash2, RefreshCw, Users, Building2, Package, Key, UserCheck } from 'lucide-angular';

@Component({
  selector: 'app-seed',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './seed.component.html',
  styleUrl: './seed.component.scss'
})
export class SeedComponent implements OnInit {
  readonly Database  = Database;
  readonly Trash2    = Trash2;
  readonly RefreshCw = RefreshCw;
  readonly Users     = Users;
  readonly Building2 = Building2;
  readonly Package   = Package;
  readonly Key       = Key;
  readonly UserCheck = UserCheck;

  stats: any    = null;
  accounts: any[] = [];
  isCreating  = false;
  isClearing  = false;
  loadingAccounts = false;
  confirmClear = false;
  error   = '';
  success = '';

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.error = '';
    this.adminService.getSeedStats().subscribe({
      next: (r: any) => {
        this.stats = r.data;
        if (this.stats?.hasDummyData) this.loadAccounts();
      },
      error: (err) => this.error = err.error?.message || 'Failed to load stats'
    });
  }

  loadAccounts() {
    this.loadingAccounts = true;
    this.adminService.getDummyAccounts().subscribe({
      next: (r: any) => {
        this.accounts = r.data?.accounts || r.data || [];
        this.loadingAccounts = false;
      },
      error: () => { this.loadingAccounts = false; }
    });
  }

  create() {
    this.isCreating = true;
    this.error = '';
    this.success = '';
    this.adminService.createDummyData().subscribe({
      next: () => {
        this.isCreating = false;
        this.success = 'Seed data created successfully!';
        setTimeout(() => this.load(), 800);
      },
      error: (err) => {
        this.isCreating = false;
        this.error = err.error?.message || 'Failed to create seed data';
      }
    });
  }

  requestClear() { this.confirmClear = true; }
  cancelClear()  { this.confirmClear = false; }

  clear() {
    this.confirmClear = false;
    this.isClearing = true;
    this.error = '';
    this.success = '';
    this.adminService.clearDummyData().subscribe({
      next: () => {
        this.isClearing = false;
        this.success = 'Seed data cleared successfully!';
        this.accounts = [];
        setTimeout(() => this.load(), 800);
      },
      error: (err) => {
        this.isClearing = false;
        this.error = err.error?.message || 'Failed to clear seed data';
      }
    });
  }

  getRoleBadge(role: string): string {
    return role === 'business_owner' ? 'Owner' : 'User';
  }
}
