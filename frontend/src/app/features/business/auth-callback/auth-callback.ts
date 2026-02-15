import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../../core/services/storage';

@Component({
  selector: 'app-business-auth-callback',
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
        <p class="message">Logging you in...</p>
        <p class="sub-message">Please wait</p>
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
      margin-bottom: 1.5rem;
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
      margin: 0 0 0.5rem 0;
      letter-spacing: 0.025em;
    }

    .sub-message {
      font-size: 0.9375rem;
      color: var(--text-secondary);
      margin: 0;
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

      .sub-message {
        font-size: 0.875rem;
      }
    }
  `]
})
export class BusinessAuthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storage: StorageService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['loginData']) {
        try {
          const data = JSON.parse(decodeURIComponent(params['loginData']));
          this.storage.saveToken(data.token);
          this.storage.saveUser(data.user);
          this.router.navigate(['/owner'], { replaceUrl: true });
        } catch (error) {
          this.router.navigate(['/auth/login'], { replaceUrl: true });
        }
      } else {
        // No login data, redirect to login
        this.router.navigate(['/auth/login'], { replaceUrl: true });
      }
    });
  }
}
