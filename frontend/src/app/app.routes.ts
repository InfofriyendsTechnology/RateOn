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
import { AccountSettingsComponent } from './features/business/account-settings/account-settings';
import { BusinessList } from './features/explore/business-list/business-list';
import { BusinessDetail } from './features/explore/business-detail/business-detail';
import { ItemSearchComponent } from './features/explore/item-search/item-search';
import { WriteReview } from './features/review/write-review/write-review';
import { Leaderboard } from './features/social/leaderboard/leaderboard';
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
  { 
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [authGuard]
  },
  
  // Business owner dashboard (requires business_owner role)
  { 
    path: 'business/dashboard', 
    component: BusinessDashboardComponent,
    canActivate: [businessOwnerGuard],
    children: [
      { path: 'businesses', component: BusinessesComponent },
      { path: 'items/:businessId', component: ItemManagementComponent },
      { path: 'edit/:id', component: EditBusinessComponent },
      { path: 'settings', component: AccountSettingsComponent }
    ]
  },
  
  // Public explore pages (no auth required)
  { path: 'explore', component: BusinessList },
  { path: 'search/items', component: ItemSearchComponent },
  { path: 'leaderboard', component: Leaderboard },
  { path: 'business/:id', component: BusinessDetail },
  
  // Write review (no auth guard - handle in component)
  { path: 'write-review', component: WriteReview },
  
  // Fallback
  { path: '**', redirectTo: '' }
];
