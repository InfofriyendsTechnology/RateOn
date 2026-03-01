import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/components/toast/toast';
import { NotificationComponent } from './shared/notification/notification.component';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Sun, Moon, ShieldCheck } from 'lucide-angular';
import { ThemeService } from './core/services/theme';
import { StorageService } from './core/services/storage';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent, NotificationComponent, CommonModule, LucideAngularModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');
  readonly Sun          = Sun;
  readonly Moon         = Moon;
  readonly ShieldCheck  = ShieldCheck;

  constructor(
    public themeService: ThemeService,
    private storage: StorageService,
    private router: Router
  ) {}

  get isAdminImpersonating(): boolean {
    return localStorage.getItem('rateon_is_impersonating') === 'true';
  }

  exitImpersonation() {
    const adminToken = localStorage.getItem('rateon_admin_backup_token');
    const returnUrl  = localStorage.getItem('rateon_admin_return_url') || '/admin/users';

    // Restore admin session
    if (adminToken) { this.storage.saveToken(adminToken); }
    const adminUserStr = localStorage.getItem('rateon_admin_backup_user');
    if (adminUserStr) {
      this.storage.saveUser(JSON.parse(adminUserStr));
    } else {
      this.storage.removeUser();
    }

    // Clear impersonation flags
    localStorage.removeItem('rateon_is_impersonating');
    localStorage.removeItem('rateon_admin_backup_token');
    localStorage.removeItem('rateon_admin_backup_user');
    localStorage.removeItem('rateon_admin_return_url');

    this.router.navigateByUrl(returnUrl);
  }
}
