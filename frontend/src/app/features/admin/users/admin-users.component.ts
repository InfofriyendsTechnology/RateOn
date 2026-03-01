import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { StorageService } from '../../../core/services/storage';
import { LucideAngularModule, Search, LogIn, RefreshCw, ChevronLeft, ChevronRight, Mail, Shield, Users, Info } from 'lucide-angular';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss'
})
export class AdminUsersComponent implements OnInit {
  readonly Users = Users;
  readonly Search = Search;
  readonly LogIn = LogIn;
  readonly RefreshCw = RefreshCw;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly Mail = Mail;
  readonly Shield = Shield;
  readonly Info = Info;

  users: any[] = [];
  loading = false;
  loggingInAs: string | null = null;
  expandedUserId: string | null = null;

  toggleDetails(id: string) {
    this.expandedUserId = this.expandedUserId === id ? null : id;
  }

  // Filters
  search = '';
  roleFilter = '';
  statusFilter = '';
  searchTimeout: any;

  // Pagination
  page = 1;
  limit = 20;
  total = 0;
  totalPages = 0;

  constructor(
    private adminService: AdminService,
    private storage: StorageService,
    private router: Router
  ) {}

  ngOnInit() { this.loadUsers(); }

  loadUsers() {
    this.loading = true;
    this.adminService.getUsers({
      page: this.page,
      limit: this.limit,
      search: this.search || undefined,
      role: this.roleFilter || undefined,
      status: this.statusFilter || undefined
    }).subscribe({
      next: (r: any) => {
        this.users = r.data?.users || [];
        this.total = r.data?.pagination?.total || 0;
        this.totalPages = r.data?.pagination?.totalPages || 1;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.page = 1;
      this.loadUsers();
    }, 400);
  }

  onFilterChange() {
    this.page = 1;
    this.loadUsers();
  }

  prevPage() { if (this.page > 1) { this.page--; this.loadUsers(); } }
  nextPage() { if (this.page < this.totalPages) { this.page++; this.loadUsers(); } }

  loginAsUser(user: any) {
    if (this.loggingInAs) return;
    this.loggingInAs = user._id;

    this.adminService.loginAsUser(user._id).subscribe({
      next: (r: any) => {
        const { token, user: userData } = r.data;

        // Backup admin session so the floating button can restore it
        const adminToken = this.storage.getToken();
        if (adminToken) {
          localStorage.setItem('rateon_admin_backup_token', adminToken);
        }
        const adminUser = this.storage.getUser();
        if (adminUser) {
          localStorage.setItem('rateon_admin_backup_user', JSON.stringify(adminUser));
        }
        localStorage.setItem('rateon_is_impersonating', 'true');
        localStorage.setItem('rateon_admin_return_url', this.router.url);

        // Save to localStorage (same keys the app uses)
        this.storage.saveToken(token);
        this.storage.saveUser(userData);
        this.loggingInAs = null;
        // Open app in new tab so admin session is preserved
        window.open('/', '_blank');
      },
      error: (err: any) => {
        alert(err?.error?.message || 'Could not login as this user');
        this.loggingInAs = null;
      }
    });
  }

  isGmail(email: string): boolean {
    return email?.toLowerCase().endsWith('@gmail.com');
  }

  getInitial(user: any): string {
    return (user.profile?.firstName || user.username || '?').charAt(0).toUpperCase();
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
