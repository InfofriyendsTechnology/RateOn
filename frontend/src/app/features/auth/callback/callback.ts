import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../../core/services/storage';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-callback',
  standalone: true,
  template: `
    <div class="callback-container">
      <div class="callback-content">
        <div class="logo-container">
          <img src="/LOGO_WHITE_ICON.png" alt="RateOn" class="logo" />
        </div>
        <div class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p class="message">{{ message }}</p>
      </div>
    </div>
  `,
  styles: [`
    .callback-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-primary);
      font-family: 'Inter', sans-serif;
    }

    .callback-content {
      text-align: center;
      color: var(--text-primary);
      padding: 2rem;
    }

    .logo-container {
      position: relative;
      width: 100px;
      height: 100px;
      margin: 0 auto 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.875rem;
    }

    .logo {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .loading-dots {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 2rem;
    }

    .loading-dots span {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #fbbf24;
      animation: bounce 1.4s ease-in-out infinite;
    }

    .loading-dots span:nth-child(1) {
      animation-delay: -0.32s;
    }

    .loading-dots span:nth-child(2) {
      animation-delay: -0.16s;
    }

    @keyframes bounce {
      0%, 80%, 100% {
        transform: scale(0);
        opacity: 0.5;
      }
      40% {
        transform: scale(1);
        opacity: 1;
      }
    }

    .message {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      letter-spacing: 0.025em;
    }

    @media (max-width: 768px) {
      .logo-container {
        width: 90px;
        height: 90px;
        padding: 0.75rem;
      }

      .message {
        font-size: 1rem;
      }
    }
  `]
})
export class CallbackComponent implements OnInit {
  message = 'Processing authentication...';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storage: StorageService,
    private authService: AuthService
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
          
          // Update AuthService to sync the authentication state
          this.authService.updateCurrentUser(authData.user);

          this.message = 'Login successful! Redirecting...';
          
          // Check for return URL from auth data or sessionStorage
          let redirectUrl = authData.returnUrl || sessionStorage.getItem('auth_return_url');
          
          // Clear the stored return URL
          sessionStorage.removeItem('auth_return_url');
          
          // Decode the return URL if it exists
          if (redirectUrl) {
            try {
              redirectUrl = decodeURIComponent(redirectUrl);
            } catch (e) {
              // If decode fails, ignore and use default
              redirectUrl = null;
            }
          }
          
          // If no return URL, redirect based on user role
          if (!redirectUrl) {
            redirectUrl = authData.user.role === 'business_owner' 
              ? '/owner' 
              : '/home';
          }
          
          setTimeout(() => {
            // Use navigateByUrl with replaceUrl to prevent back button issues
            this.router.navigateByUrl(redirectUrl, { replaceUrl: true });
          }, 1000);
        } catch (error) {
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
