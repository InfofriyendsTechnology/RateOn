import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-account-conflict',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-conflict.html',
  styleUrl: './account-conflict.scss',
})
export class AccountConflictComponent implements OnInit {
  conflictData: any = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private notification: NotificationService
  ) {}

  ngOnInit() {
    this.loadConflictData();
  }

  loadConflictData() {
    // First try to get from URL params
    this.route.queryParams.subscribe(params => {
      if (params['existingEmail']) {
        // Build conflict data from URL params
        this.conflictData = {
          existingUser: {
            id: params['existingId'],
            email: params['existingEmail'],
            username: params['existingUsername'],
            role: params['existingRole']
          },
          googleData: {
            googleId: params['googleId'],
            email: params['googleEmail'],
            firstName: params['googleFirstName'],
            lastName: params['googleLastName'],
            avatar: params['googleAvatar']
          }
        };
      } else {
        // Fallback: try to get from API (session-based)
        this.http.get(`${environment.apiUrl}/auth/business/conflict-data`, { withCredentials: true }).subscribe({
          next: (response: any) => {
            if (response.success && response.data) {
              this.conflictData = response.data;
            } else {
              this.errorMessage = 'No conflict data found';
              setTimeout(() => this.router.navigate(['/business/register']), 2000);
            }
          },
          error: (error) => {
            this.errorMessage = 'Failed to load conflict data';
            setTimeout(() => this.router.navigate(['/business/register']), 2000);
          }
        });
      }
    });
  }

  loginToUserAccount() {
    this.router.navigate(['/auth/login']);
  }

  deleteAndContinue() {
    this.notification.confirm(
      'Delete User Account?',
      'Are you sure you want to delete your User account? This action cannot be undone.',
      () => this.performDelete()
    );
  }

  private performDelete() {
    this.isLoading = true;
    this.errorMessage = '';

    const payload = {
      userId: this.conflictData.existingUser.id,
      googleData: this.conflictData.googleData
    };

    this.http.post(`${environment.apiUrl}/auth/business/delete-and-continue`, payload, { withCredentials: true }).subscribe({
      next: (response: any) => {
        if (response.success) {
          // Navigate to complete registration with Google data
          const googleData = response.data.googleData;
          const params = new URLSearchParams({
            googleId: googleData.googleId,
            email: googleData.email,
            firstName: googleData.firstName,
            lastName: googleData.lastName,
            avatar: googleData.avatar || ''
          });
          
          this.router.navigate(['/business/complete-registration'], {
            queryParams: Object.fromEntries(params)
          });
        } else {
          this.errorMessage = response.message || 'Failed to delete account';
          this.isLoading = false;
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to delete account';
        this.isLoading = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/business/register']);
  }
}
