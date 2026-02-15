import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, LayoutDashboard, Database, Settings, LogOut } from 'lucide-angular';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="dashboard-layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <img src="/LOGO_WHITE.png" alt="RateOn" class="logo-full" />
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-item">
            <lucide-icon [img]="LayoutDashboard" [size]="16"></lucide-icon>
            <span>Dashboard</span>
          </a>

          <div class="nav-divider"></div>
          <span class="nav-section-label">TOOLS</span>

          <a routerLink="/admin/seed" routerLinkActive="active" class="nav-item">
            <lucide-icon [img]="Database" [size]="16"></lucide-icon>
            <span>Seed Data</span>
          </a>

          <a class="nav-item disabled">
            <lucide-icon [img]="Settings" [size]="16"></lucide-icon>
            <span>Settings</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <button class="logout-btn" (click)="logout()">
            <lucide-icon [img]="LogOut" [size]="16"></lucide-icon>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styleUrls: ['./admin-shell.component.scss']
})
export class AdminShellComponent {
  readonly LayoutDashboard = LayoutDashboard;
  readonly Database = Database;
  readonly Settings = Settings;
  readonly LogOut = LogOut;

  constructor(private router: Router) {}

  logout() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/']);
  }
}
