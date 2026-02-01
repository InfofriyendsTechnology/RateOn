import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../../core/services/storage';

@Component({
  selector: 'app-callback',
  standalone: true,
  template: `
    <div class="callback-container">
      <div class="callback-content">
        <div class="spinner"></div>
        <p>{{ message }}</p>
      </div>
    </div>
  `,
  styles: [`
    .callback-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #082052 0%, #1e40af 100%);
    }

    .callback-content {
      text-align: center;
      color: white;
    }

    .spinner {
      width: 50px;
      height: 50px;
      margin: 0 auto 20px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    p {
      font-size: 1.2rem;
      font-weight: 500;
    }
  `]
})
export class CallbackComponent implements OnInit {
  message = 'Processing authentication...';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storage: StorageService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const data = params['data'];
      const error = params['error'];

      if (error) {
        this.message = 'Authentication failed. Redirecting...';
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
        return;
      }

      if (data) {
        try {
          const authData = JSON.parse(decodeURIComponent(data));
          
          // Clear any existing auth data first
          this.storage.clearAuth();
          
          // Store new token and user
          this.storage.saveToken(authData.token);
          this.storage.saveUser(authData.user);

          this.message = 'Login successful! Redirecting...';
          
          setTimeout(() => {
            this.router.navigate(['/user/dashboard']);
          }, 1000);
        } catch (error) {
          console.error('Error parsing auth data:', error);
          this.message = 'Authentication failed. Redirecting...';
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        }
      } else {
        this.router.navigate(['/auth/login']);
      }
    });
  }
}
