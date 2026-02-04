import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';
import { StorageService } from '../../../core/services/storage';
import { ThemeService } from '../../../core/services/theme';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  showGoogleModal = false;
  
  // Multi-step form state
  currentStep = 1;
  totalSteps = 3;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private storage: StorageService,
    public themeService: ThemeService
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }
  
  ngOnInit() {
    // Show Google modal if auto param exists
    const autoGoogle = this.route.snapshot.queryParams['auto'];
    if (autoGoogle === 'google') {
      this.showGoogleModal = true;
    }
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const { password, confirmPassword, ...rest } = this.registerForm.value;
      
      if (password !== confirmPassword) {
        this.errorMessage = 'Passwords do not match!';
        return;
      }

      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      const registerData = { ...rest, password };
      
      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.successMessage = 'Registration successful! Redirecting to login...';
            setTimeout(() => {
              this.router.navigate(['/auth/login']);
            }, 2000);
          } else {
            this.errorMessage = response.message || 'Registration failed';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
          console.error('Registration error:', error);
        }
      });
    }
  }

  signupWithGoogle() {
    // Clear any existing auth data before Google OAuth
    this.storage.clearAuth();
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${environment.apiUrl}/auth/google`;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  
  closeGoogleModal() {
    this.showGoogleModal = false;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      queryParamsHandling: 'merge'
    });
  }
  
  confirmGoogleSignup() {
    this.showGoogleModal = false;
    this.signupWithGoogle();
  }
  
  toggleTheme() {
    this.themeService.toggleTheme();
  }
  
  nextStep() {
    this.errorMessage = '';
    
    // Validate current step before proceeding
    if (this.currentStep === 1) {
      const email = this.registerForm.get('email');
      if (!email?.valid) {
        this.errorMessage = 'Please enter a valid email';
        return;
      }
    } else if (this.currentStep === 2) {
      const password = this.registerForm.get('password');
      const confirmPassword = this.registerForm.get('confirmPassword');
      if (!password?.valid) {
        this.errorMessage = 'Password must be at least 6 characters';
        return;
      }
      if (!confirmPassword?.valid) {
        this.errorMessage = 'Please confirm your password';
        return;
      }
      if (password?.value !== confirmPassword?.value) {
        this.errorMessage = 'Passwords do not match';
        return;
      }
    }
    
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }
  
  previousStep() {
    this.errorMessage = '';
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }
}
