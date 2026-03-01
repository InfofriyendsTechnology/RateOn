import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast';
import { ThemeService } from '../../../core/services/theme';
import { environment } from '../../../../environments/environment';
import { LucideAngularModule, User, Mail, Shield, CheckCircle, Eye, Building, X, AlertTriangle, Trash2, Palette, Sun, Moon, Bell, Key, ExternalLink, BarChart3, Settings } from 'lucide-angular';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, RouterLink],
  templateUrl: './account-settings.html',
  styleUrl: './account-settings.scss'
})
export class AccountSettingsComponent implements OnInit {
  user: any = null;
  loading = true;
  isDarkMode = false;
  
  // Settings
  notificationSettings = {
    email: true,
    newReviews: true,
    businessUpdates: true
  };
  
  privacySettings = {
    profileVisibility: 'public',
    showEmail: false
  };
  
  twoFactorEnabled = false;
  
  // Password change
  showChangePasswordModal = false;
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  changingPassword = false;
  
  // Delete account
  showDeleteModal = false;
  deleteConfirmationText = '';
  deletingAccount = false;
  
  // Icons
  readonly User = User;
  readonly Mail = Mail;
  readonly Shield = Shield;
  readonly CheckCircle = CheckCircle;
  readonly Eye = Eye;
  readonly Building = Building;
  readonly X = X;
  readonly AlertTriangle = AlertTriangle;
  readonly Trash2 = Trash2;
  readonly Palette = Palette;
  readonly Sun = Sun;
  readonly Moon = Moon;
  readonly Bell = Bell;
  readonly Key = Key;
  readonly ExternalLink = ExternalLink;
  readonly BarChart3 = BarChart3;
  readonly Settings = Settings;
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService,
    private themeService: ThemeService
  ) {}
  
  ngOnInit() {
    this.loadUserData();
    this.loadTheme();
    this.loadUserPreferences();
  }
  
  loadUserData() {
    this.loading = true;
    this.user = this.authService.getCurrentUser();
    
    if (this.user) {
      this.loading = false;
    } else {
      this.loading = false;
    }
  }
  
  loadTheme() {
    this.isDarkMode = this.themeService.isDarkMode();
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }
  
  loadUserPreferences() {
    // Load user preferences from localStorage or API
    const savedNotifications = localStorage.getItem('notificationSettings');
    if (savedNotifications) {
      this.notificationSettings = JSON.parse(savedNotifications);
    }
    
    const savedPrivacy = localStorage.getItem('privacySettings');
    if (savedPrivacy) {
      this.privacySettings = JSON.parse(savedPrivacy);
    }
  }
  
  setTheme(theme: 'light' | 'dark') {
    if (theme === 'dark' && !this.isDarkMode) {
      this.themeService.toggleTheme();
    } else if (theme === 'light' && this.isDarkMode) {
      this.themeService.toggleTheme();
    }
  }
  
  updateNotificationSettings() {
    localStorage.setItem('notificationSettings', JSON.stringify(this.notificationSettings));
    this.toast.success('Notification preferences updated');
  }
  
  updatePrivacySettings() {
    localStorage.setItem('privacySettings', JSON.stringify(this.privacySettings));
    this.toast.success('Privacy settings updated');
  }
  
  
  // Password change
  openChangePasswordModal() {
    this.showChangePasswordModal = true;
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }
  
  closeChangePasswordModal() {
    this.showChangePasswordModal = false;
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }
  
  changePassword() {
    if (!this.passwordForm.currentPassword || !this.passwordForm.newPassword || !this.passwordForm.confirmPassword) {
      this.toast.error('Please fill all password fields');
      return;
    }
    
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.toast.error('New passwords do not match');
      return;
    }
    
    if (this.passwordForm.newPassword.length < 6) {
      this.toast.error('New password must be at least 6 characters');
      return;
    }
    
    this.changingPassword = true;
    
    this.http.put(`${environment.apiUrl}/user/change-password`, {
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword
    }).subscribe({
      next: () => {
        this.toast.success('Password changed successfully!');
        this.closeChangePasswordModal();
        this.changingPassword = false;
      },
      error: (err: any) => {
        const errorMessage = err.error?.message || 'Failed to change password';
        this.toast.error(errorMessage);
        this.changingPassword = false;
      }
    });
  }
  
  // Delete account
  showDeleteConfirmation() {
    this.showDeleteModal = true;
    this.deleteConfirmationText = '';
  }
  
  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deleteConfirmationText = '';
  }
  
  confirmDeleteAccount() {
    if (this.deleteConfirmationText !== 'DELETE') {
      return;
    }
    
    this.deletingAccount = true;
    
    this.http.delete(`${environment.apiUrl}/user/account`).subscribe({
      next: () => {
        this.toast.success('Account deleted successfully');
        this.authService.logout();
        this.router.navigate(['/']);
      },
      error: (err: any) => {
        const errorMessage = err.error?.message || 'Failed to delete account';
        this.toast.error(errorMessage);
        this.deletingAccount = false;
      }
    });
  }
}
