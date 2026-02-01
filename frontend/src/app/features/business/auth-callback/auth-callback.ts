import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../../core/services/storage';

@Component({
  selector: 'app-business-auth-callback',
  standalone: true,
  template: `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: 'Poppins', sans-serif;">
      <div style="text-align: center;">
        <div style="font-size: 24px; margin-bottom: 16px;">Logging you in...</div>
        <div style="color: #666;">Please wait</div>
      </div>
    </div>
  `
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
          this.router.navigate(['/business/dashboard'], { replaceUrl: true });
        } catch (error) {
          console.error('Failed to parse login data:', error);
          this.router.navigate(['/auth/login'], { replaceUrl: true });
        }
      } else {
        // No login data, redirect to login
        this.router.navigate(['/auth/login'], { replaceUrl: true });
      }
    });
  }
}
