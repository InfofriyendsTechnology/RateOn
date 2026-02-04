import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.scss'
})
export class AuthModalComponent {
  @Output() authSuccess = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  showEmailForm = false;
  isLoading = false;
  
  credentials = {
    email: '',
    password: ''
  };

  constructor(
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  continueWithGoogle() {
    this.isLoading = true;
    // Redirect to Google OAuth
    window.location.href = `${environment.apiUrl}/auth/google`;
  }

  showEmailLogin() {
    this.showEmailForm = true;
  }

  async loginWithEmail() {
    if (!this.credentials.email || !this.credentials.password) {
      this.toastService.error('Please enter email and password');
      return;
    }

    this.isLoading = true;
    
    this.authService.login({
      login: this.credentials.email,
      password: this.credentials.password
    }).subscribe({
      next: () => {
        this.toastService.success('Login successful!');
        this.authSuccess.emit();
        this.closeModal();
      },
      error: (error) => {
        this.toastService.error(error?.message || 'Login failed');
        this.isLoading = false;
      }
    });
  }

  closeModal() {
    this.close.emit();
  }

  backToGoogle() {
    this.showEmailForm = false;
  }
}
