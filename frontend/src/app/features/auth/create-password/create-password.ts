import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';
import { ThemeService } from '../../../core/services/theme';

@Component({
  selector: 'app-create-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-password.html',
  styleUrls: ['./create-password.scss']
})
export class CreatePasswordComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    public themeService: ThemeService
  ) {
    this.form = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
    }
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { password, confirmPassword } = this.form.value;

    this.authService.setPassword(password, confirmPassword).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          const redirectUrl =
            sessionStorage.getItem('password_setup_return_url') || '/';
          sessionStorage.removeItem('password_setup_return_url');
          this.router.navigateByUrl(redirectUrl, { replaceUrl: true });
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          error.error?.message || 'Failed to set password. Please try again.';
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  get passwordInvalid(): boolean {
    const ctrl = this.form.get('password');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  get confirmInvalid(): boolean {
    const ctrl = this.form.get('confirmPassword');
    const mismatch = this.form.errors?.['mismatch'] && ctrl?.touched;
    return !!(ctrl?.invalid && ctrl?.touched) || !!mismatch;
  }
}
