import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LucideAngularModule, LayoutDashboard, Database, Settings, LogOut, Users, Menu, X, BarChart2 } from 'lucide-angular';
import { BreadcrumbsComponent, Crumb } from '../../../shared/components/breadcrumbs/breadcrumbs';
import { ThemeService } from '../../../core/services/theme';
import { StorageService } from '../../../core/services/storage';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, BreadcrumbsComponent],
  template: `
    <div class="dashboard-layout">

      <!-- Mobile Backdrop -->
      <div class="mobile-backdrop" [class.show]="sidebarOpen" (click)="toggleSidebar()"></div>

      <!-- Sidebar -->
      <aside class="sidebar" [class.mobile-open]="sidebarOpen">
        <div class="sidebar-header">
          <div class="logo">
            <img *ngIf="sidebarOpen && isDarkMode"  src="/LOGO_WHITE.png"      alt="RateOn" class="logo-full">
            <img *ngIf="sidebarOpen && !isDarkMode" src="/LOGO_BLACK.png"      alt="RateOn" class="logo-full">
            <img *ngIf="!sidebarOpen && isDarkMode"  src="/LOGO_WHITE_ICON.png" alt="RateOn" class="logo-small">
            <img *ngIf="!sidebarOpen && !isDarkMode" src="/LOGO_BLACK_ICON.png" alt="RateOn" class="logo-small">
          </div>
          <button *ngIf="sidebarOpen" class="sidebar-close-btn" (click)="toggleSidebar()" aria-label="Close sidebar">
            <lucide-icon [img]="X" [size]="20"></lucide-icon>
          </button>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-item" (click)="closeSidebarOnMobile()">
            <lucide-icon [img]="LayoutDashboard" [size]="16" class="nav-icon"></lucide-icon>
            <span class="nav-text" *ngIf="sidebarOpen">Dashboard</span>
          </a>

          <div class="nav-divider" *ngIf="sidebarOpen"></div>
          <span class="nav-section-label" *ngIf="sidebarOpen">TOOLS</span>

          <a routerLink="/admin/users" routerLinkActive="active" class="nav-item" (click)="closeSidebarOnMobile()">
            <lucide-icon [img]="Users" [size]="16" class="nav-icon"></lucide-icon>
            <span class="nav-text" *ngIf="sidebarOpen">Users</span>
          </a>

          <a routerLink="/admin/analytics" routerLinkActive="active" class="nav-item" (click)="closeSidebarOnMobile()">
            <lucide-icon [img]="BarChart2" [size]="16" class="nav-icon"></lucide-icon>
            <span class="nav-text" *ngIf="sidebarOpen">Analytics</span>
          </a>

          <a routerLink="/admin/seed" routerLinkActive="active" class="nav-item" (click)="closeSidebarOnMobile()">
            <lucide-icon [img]="Database" [size]="16" class="nav-icon"></lucide-icon>
            <span class="nav-text" *ngIf="sidebarOpen">Seed Data</span>
          </a>

          <div class="nav-divider" *ngIf="sidebarOpen"></div>
          <span class="nav-section-label" *ngIf="sidebarOpen">SETTINGS</span>

          <a routerLink="/admin/settings" routerLinkActive="active" class="nav-item" (click)="closeSidebarOnMobile()">
            <lucide-icon [img]="Settings" [size]="16" class="nav-icon"></lucide-icon>
            <span class="nav-text" *ngIf="sidebarOpen">Settings</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="user-profile">
            <div class="user-avatar">
              <span class="avatar-initial">A</span>
            </div>
            <div class="user-info" *ngIf="sidebarOpen">
              <div class="user-name">Super Admin</div>
              <div class="user-role">Administrator</div>
            </div>
          </div>
          <button class="logout-btn" (click)="logout()">
            <lucide-icon [img]="LogOut" [size]="16"></lucide-icon>
            <span *ngIf="sidebarOpen">Logout</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Top Bar -->
        <div class="top-bar">
          <div class="top-bar-left">
            <button class="sidebar-toggle" (click)="toggleSidebar(); \$event.stopPropagation()">
              <lucide-icon [img]="Menu" [size]="20"></lucide-icon>
            </button>
            <app-breadcrumbs class="top-crumbs" [crumbs]="topBarCrumbs"></app-breadcrumbs>
          </div>
        </div>

        <!-- Page Content -->
        <div class="content-wrapper">
          <router-outlet></router-outlet>
        </div>
      </main>

    </div>
  `,
  styleUrls: ['./admin-shell.component.scss']
})
export class AdminShellComponent implements OnInit {
  readonly LayoutDashboard = LayoutDashboard;
  readonly Database = Database;
  readonly Settings = Settings;
  readonly LogOut = LogOut;
  readonly Users = Users;
  readonly Menu = Menu;
  readonly X = X;
  readonly BarChart2 = BarChart2;

  sidebarOpen = true;
  isDarkMode = true;
  topBarCrumbs: Crumb[] = [];

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private storage: StorageService
  ) {}

  ngOnInit() {
    this.loadTheme();
    if (typeof window !== 'undefined') {
      this.sidebarOpen = window.innerWidth > 768;
    }
    this.updateTopBarCrumbs();
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.updateTopBarCrumbs());
  }

  updateTopBarCrumbs() {
    const url = this.router.url;
    const admin: Crumb = { label: 'Admin', link: '/admin/dashboard' };
    if (url.includes('/users'))      this.topBarCrumbs = [admin, { label: 'Users' }];
    else if (url.includes('/analytics')) this.topBarCrumbs = [admin, { label: 'Analytics' }];
    else if (url.includes('/seed'))       this.topBarCrumbs = [admin, { label: 'Seed Data' }];
    else if (url.includes('/settings'))   this.topBarCrumbs = [admin, { label: 'Settings' }];
    else                                  this.topBarCrumbs = [{ label: 'Admin Dashboard' }];
  }

  loadTheme() {
    this.isDarkMode = this.themeService.isDarkMode();
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebarOnMobile() {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      this.sidebarOpen = false;
    }
  }

  getPageTitle(): string {
    const url = this.router.url;
    if (url.includes('/users'))     return 'Users';
    if (url.includes('/analytics'))  return 'Analytics';
    if (url.includes('/seed'))       return 'Seed Data';
    if (url.includes('/settings'))   return 'Settings';
    return 'Dashboard';
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/']);
  }
}
