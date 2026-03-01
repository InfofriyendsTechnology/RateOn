import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { businessOwnerGuard } from './core/guards/role-guard';
import { adminGuard } from './core/guards/admin.guard';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { CallbackComponent } from './features/auth/callback/callback';
import { LandingComponent } from './features/home/landing/landing';
import { ProfileComponent } from './features/user/profile/profile';
import { BusinessDashboardComponent } from './features/business/dashboard/dashboard';
import { BusinessesComponent } from './features/business/businesses/businesses';
import { ItemManagementComponent } from './features/business/item-management/item-management';
import { EditBusinessComponent } from './features/business/edit-business/edit-business';
import { AddBusinessComponent } from './features/business/add-business/add-business';
import { BusinessDetail as BusinessOwnerDetail } from './features/business/business-detail/business-detail';
import { AccountSettingsComponent } from './features/business/account-settings/account-settings';
import { NotificationsPageComponent } from './features/business/notifications/notifications';
import { ReviewsManagementComponent } from './features/business/reviews/reviews';
import { WriteReview } from './features/review/write-review/write-review';
import { BusinessPublicView } from './features/business/public-view/business-public-view';
import { ItemPublicView } from './features/item/item-public-view/item-public-view';
import { SearchResultsComponent } from './features/search/search-results/search-results.component';
import { MyReviewsComponent } from './features/user/my-reviews/my-reviews';
import { UserPublicProfile } from './features/social/user-public-profile/user-public-profile';
import { UserNotificationsPageComponent } from './features/user/notifications/notifications';
import { AdminLoginComponent } from './features/admin/login/admin-login.component';
import { AdminShellComponent } from './features/admin/shell/admin-shell.component';
import { AdminDashboardComponent } from './features/admin/dashboard/admin-dashboard.component';
import { SeedComponent } from './features/admin/seed/seed.component';
import { AdminUsersComponent } from './features/admin/users/admin-users.component';
import { AdminAnalyticsComponent } from './features/admin/analytics/admin-analytics.component';
import { AdminSettingsComponent } from './features/admin/settings/admin-settings.component';
import { BusinessAnalyticsComponent } from './features/business/analytics/business-analytics.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  
  // Auth routes (unified)
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'auth/callback', component: CallbackComponent },
  
  // Admin routes
  { path: 'admin/login', component: AdminLoginComponent },
  { 
    path: 'admin', 
    component: AdminShellComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'analytics', component: AdminAnalyticsComponent },
      { path: 'seed', component: SeedComponent },
      { path: 'settings', component: AdminSettingsComponent }
    ]
  },
  
  // Redirect old /home to / (now handled by landing with auth dashboard)
  { path: 'home', redirectTo: '', pathMatch: 'full' },
  // User profile (all authenticated users)
  { 
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [authGuard]
  },
  // My reviews page
  {
    path: 'my-reviews',
    component: MyReviewsComponent,
    canActivate: [authGuard]
  },
  // User notifications page
  {
    path: 'notifications',
    component: UserNotificationsPageComponent,
    canActivate: [authGuard]
  },
  // Settings redirect to profile (for regular users)
  { path: 'settings', redirectTo: 'profile', pathMatch: 'full' },
  
  // Business owner dashboard (requires business_owner role)
  { 
    path: 'owner', 
    component: BusinessDashboardComponent,
    canActivate: [businessOwnerGuard],
    children: [
      { path: 'businesses', component: BusinessesComponent },
      { path: 'businesses/new', component: AddBusinessComponent },
      { path: 'businesses/:id', component: BusinessOwnerDetail },
      { path: 'businesses/:businessId/items', component: ItemManagementComponent },
      { path: 'businesses/:id/edit', component: EditBusinessComponent },
      { path: 'reviews', component: ReviewsManagementComponent },
      { path: 'analytics', component: BusinessAnalyticsComponent },
      { path: 'notifications', component: NotificationsPageComponent },
      { path: 'settings', component: AccountSettingsComponent },
      { path: 'profile', component: ProfileComponent }
    ]
  },
  // Redirect old routes to new /owner routes
  { path: 'business/dashboard', redirectTo: 'owner', pathMatch: 'full' },
  { path: 'business/dashboard/businesses', redirectTo: 'owner/businesses', pathMatch: 'full' },
  { path: 'business/dashboard/view/:id', redirectTo: 'owner/businesses/:id', pathMatch: 'full' },
  { path: 'business/dashboard/items/:businessId', redirectTo: 'owner/businesses/:businessId/items', pathMatch: 'full' },
  { path: 'business/dashboard/edit/:id', redirectTo: 'owner/businesses/:id/edit', pathMatch: 'full' },
  { path: 'business/dashboard/settings', redirectTo: 'owner/settings', pathMatch: 'full' },
  
  // Write review (no auth guard - handle in component)
  { path: 'write-review', component: WriteReview },
  
  // Public views (no auth required)
  { path: 'business/:id', component: BusinessPublicView },
  { path: 'item/:id', component: ItemPublicView },
  { path: 'user/:id', component: UserPublicProfile },
  { path: 'search', component: SearchResultsComponent },
  
  // Fallback
  { path: '**', redirectTo: '' }
];
