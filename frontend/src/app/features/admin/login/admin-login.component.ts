import { Component, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth';
import { StorageService } from '../../../core/services/storage';
import { ToastService } from '../../../core/services/toast';
import { LucideAngularModule, Eye, EyeOff } from 'lucide-angular';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss'
})
export class AdminLoginComponent implements AfterViewInit {
  // Lucide Icons
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;

  password = '';
  isLoading = false;
  showError = false;
  errorMessage = '';
  showPassword = false;
  randomString = Math.random().toString(36).substring(7);
  todayDate = this.getTodayDate();

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private storageService: StorageService,
    private toastService: ToastService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  ngAfterViewInit() {
    // Nuclear option: disable autofill after view init
    const inputs = this.elementRef.nativeElement.querySelectorAll('input');
    inputs.forEach((input: HTMLInputElement) => {
      input.setAttribute('autocomplete', 'nope');
      input.setAttribute('autocorrect', 'off');
      input.setAttribute('autocapitalize', 'off');
      input.setAttribute('spellcheck', 'false');
      // Disable autofill with a delay
      setTimeout(() => {
        input.setAttribute('autocomplete', 'off');
      }, 100);
    });
  }

  async onSubmit() {
    if (!this.password) {
      this.showError = true;
      this.errorMessage = 'Password is required';
      return;
    }

    this.isLoading = true;
    this.showError = false;

    // Get admin credentials from environment or use default
    const adminEmail = 'admin@rateon.com';

    this.adminService.login({ email: adminEmail, password: this.password }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        
        console.log('📦 Full response:', response);
        
        // Backend returns: { success: true, message: "...", data: { token, admin, userType } }
        if (response.success && response.data) {
          console.log('✅ Response is valid, proceeding with token storage');
          
          // Clear any existing auth data first
          this.storageService.clearAuth();
          console.log('🧹 Cleared old auth data');
          
          // Store admin token and user data
          if (response.data.token) {
            this.storageService.saveToken(response.data.token);
          }

          if (response.data.admin) {
            this.storageService.saveUser(response.data.admin);
            // ✅ Update AuthService in-memory state so the guard passes immediately
            this.authService.updateCurrentUser(response.data.admin);
          }

          this.toastService.success('Welcome, Admin!');
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.showError = true;
          this.errorMessage = response.message || 'Login failed';
          console.error('❌ Login failed - response:', response);
          console.error('❌ response.success:', response.success);
          console.error('❌ response.data:', response.data);
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.showError = true;
        this.errorMessage = error?.error?.message || 'Invalid password';
        console.error('❌ Login error:', error);
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onInputFocus(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    input.removeAttribute('readonly');
  }

  getTodayDate(): string {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return today.toLocaleDateString('en-US', options);
  }
}
