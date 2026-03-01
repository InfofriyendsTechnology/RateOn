import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideAngularModule,
  Settings, Shield, LogOut, Info,
  Eye, EyeOff, Copy, Check, Key,
  RefreshCw, Trash2, Lock
} from 'lucide-angular';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './admin-settings.component.html',
  styleUrl: './admin-settings.component.scss'
})
export class AdminSettingsComponent implements OnInit {
  readonly Settings  = Settings;
  readonly Shield    = Shield;
  readonly LogOut    = LogOut;
  readonly Info      = Info;
  readonly Eye       = Eye;
  readonly EyeOff    = EyeOff;
  readonly Copy      = Copy;
  readonly Check     = Check;
  readonly Key       = Key;
  readonly RefreshCw = RefreshCw;
  readonly Trash2    = Trash2;
  readonly Lock      = Lock;

  // Daily password
  showPassword      = false;
  copied            = false;
  showLogoutConfirm = false;

  // Weekly password
  weeklyInfo: any   = null;
  weeklyCustomPw    = '';
  weeklyLoading     = false;
  weeklyNewPw       = '';        // plain text returned after set (show once)
  weeklyCopied      = false;
  weeklyError       = '';
  weeklySuccess     = '';
  showWeeklyPw      = false;
  clearConfirm      = false;

  constructor(private router: Router, private adminService: AdminService) {}

  ngOnInit() { this.loadWeeklyInfo(); }

  /** Compute today's admin password: DD + MM + YYYY + 9325 */
  get todayPassword(): string {
    const now   = new Date();
    const dd    = String(now.getDate()).padStart(2, '0');
    const mm    = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy  = String(now.getFullYear());
    return `${dd}${mm}${yyyy}9325`;
  }

  get displayPassword(): string {
    return this.showPassword ? this.todayPassword : '•'.repeat(12);
  }

  togglePassword() { this.showPassword = !this.showPassword; }

  copyPassword() {
    navigator.clipboard.writeText(this.todayPassword).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 2000);
    });
  }

  get passwordHint(): string {
    const now  = new Date();
    const dd   = String(now.getDate()).padStart(2, '0');
    const mm   = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = String(now.getFullYear());
    return `${dd} + ${mm} + ${yyyy} + 9325`;
  }

  get todayLabel(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/admin/login']);
  }

  // ── Weekly password ──────────────────────────────
  loadWeeklyInfo() {
    this.adminService.getWeeklyPasswordInfo().subscribe({
      next: (r: any) => this.weeklyInfo = r.data,
      error: () => {}
    });
  }

  generateWeekly() {
    this.weeklyLoading = true;
    this.weeklyError   = '';
    this.weeklySuccess = '';
    this.weeklyNewPw   = '';
    const pw = this.weeklyCustomPw.trim() || undefined;
    this.adminService.setWeeklyPassword(pw).subscribe({
      next: (r: any) => {
        this.weeklyLoading = false;
        this.weeklyNewPw   = r.data.password;
        this.weeklySuccess = 'Weekly password set! Valid for 7 days.';
        this.weeklyCustomPw = '';
        this.loadWeeklyInfo();
      },
      error: (err: any) => {
        this.weeklyLoading = false;
        this.weeklyError = err.error?.message || 'Failed to set password';
      }
    });
  }

  clearWeekly() {
    this.clearConfirm  = false;
    this.weeklyLoading = true;
    this.adminService.clearWeeklyPassword().subscribe({
      next: () => {
        this.weeklyLoading = false;
        this.weeklyNewPw   = '';
        this.weeklySuccess = 'Weekly password cleared.';
        this.loadWeeklyInfo();
      },
      error: (err: any) => {
        this.weeklyLoading = false;
        this.weeklyError = err.error?.message || 'Failed to clear';
      }
    });
  }

  copyWeeklyPw() {
    navigator.clipboard.writeText(this.weeklyNewPw).then(() => {
      this.weeklyCopied = true;
      setTimeout(() => this.weeklyCopied = false, 2000);
    });
  }

  get weeklyExpiryLabel(): string {
    if (!this.weeklyInfo?.expiresAt) return '';
    return new Date(this.weeklyInfo.expiresAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  }
}
