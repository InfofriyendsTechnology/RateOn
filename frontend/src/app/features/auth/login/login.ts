import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';
import { StorageService } from '../../../core/services/storage';
import { ThemeService } from '../../../core/services/theme';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  showGoogleModal = false;
  returnUrl: string = '/home';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private storage: StorageService,
    public themeService: ThemeService
  ) {
    this.loginForm = this.fb.group({
      login: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  
  ngOnInit() {
    // Get return URL from query params or default to home
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
    
    // Show Google modal if auto param exists
    const autoGoogle = this.route.snapshot.queryParams['auto'];
    if (autoGoogle === 'google') {
      this.showGoogleModal = true;
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            // Redirect based on user role if no return URL specified
            let targetUrl = this.returnUrl;
            if (this.returnUrl === '/home') {
              const user = this.storage.getUser();
              targetUrl = user?.role === 'business_owner' ? '/owner' : '/home';
            }
            this.router.navigate([targetUrl]);
          } else {
            this.errorMessage = response.message || 'Login failed';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Login failed. Please try again.';
        }
      });
    }
  }

  loginWithGoogle() {
    // Clear any existing auth data before Google OAuth
    this.storage.clearAuth();
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${environment.apiUrl}/auth/google`;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  
  closeGoogleModal() {
    this.showGoogleModal = false;
    // Remove query param from URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      queryParamsHandling: 'merge'
    });
  }
  
  confirmGoogleLogin() {
    this.showGoogleModal = false;
    this.loginWithGoogle();
  }
  
  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
