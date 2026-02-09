import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { businessOwnerGuard } from './core/guards/role-guard';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { CallbackComponent } from './features/auth/callback/callback';
import { LandingComponent } from './features/home/landing/landing';
import { HomeComponent } from './features/user/home/home';
import { ProfileComponent } from './features/user/profile/profile';
import { BusinessDashboardComponent } from './features/business/dashboard/dashboard';
import { BusinessesComponent } from './features/business/businesses/businesses';
import { ItemManagementComponent } from './features/business/item-management/item-management';
import { EditBusinessComponent } from './features/business/edit-business/edit-business';
import { BusinessDetail as BusinessOwnerDetail } from './features/business/business-detail/business-detail';
import { AccountSettingsComponent } from './features/business/account-settings/account-settings';
import { WriteReview } from './features/review/write-review/write-review';
import { AdminLoginComponent } from './features/admin/login/admin-login.component';
import { AdminDashboardComponent } from './features/admin/dashboard/admin-dashboard.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  
  // Auth routes (unified)
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'auth/callback', component: CallbackComponent },
  
  // Admin routes
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent },
  
  // User home (all authenticated users)
  { 
    path: 'home', 
    component: HomeComponent,
    canActivate: [authGuard]
  },
  // Redirect old profile route to owner profile
  { path: 'profile', redirectTo: 'owner/profile', pathMatch: 'full' },
  
  // Business owner dashboard (requires business_owner role)
  { 
    path: 'owner', 
    component: BusinessDashboardComponent,
    canActivate: [businessOwnerGuard],
    children: [
      { path: '', redirectTo: 'businesses', pathMatch: 'full' },
      { path: 'businesses', component: BusinessesComponent },
      { path: 'businesses/:id', component: BusinessOwnerDetail },
      { path: 'businesses/:businessId/items', component: ItemManagementComponent },
      { path: 'businesses/:id/edit', component: EditBusinessComponent },
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
  
  // Fallback
  { path: '**', redirectTo: '' }
];
