import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { userGuard, businessGuard } from './core/guards/role-guard';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { CallbackComponent } from './features/auth/callback/callback';
import { LandingComponent } from './features/home/landing/landing';
import { DashboardComponent } from './features/user/dashboard/dashboard';
import { ProfileComponent } from './features/user/profile/profile';
import { BusinessRegisterComponent } from './features/business-auth/register/register';
import { AccountConflictComponent } from './features/business-auth/account-conflict/account-conflict';
import { BusinessAuthCallbackComponent } from './features/business/auth-callback/auth-callback';
import { BusinessDashboardComponent } from './features/business/dashboard/dashboard';
import { ItemManagementComponent } from './features/business/item-management/item-management';
import { EditBusinessComponent } from './features/business/edit-business/edit-business';
import { AccountSettingsComponent } from './features/business/account-settings/account-settings';
import { BusinessList } from './features/explore/business-list/business-list';
import { BusinessDetail } from './features/explore/business-detail/business-detail';
import { ItemSearchComponent } from './features/explore/item-search/item-search';
import { WriteReview } from './features/review/write-review/write-review';
import { Leaderboard } from './features/social/leaderboard/leaderboard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  
  // Auth routes
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'auth/callback', component: CallbackComponent },
  
  // Business auth and specific routes (BEFORE :id route)
  { path: 'business/register', component: BusinessRegisterComponent },
  { path: 'business/complete-registration', component: BusinessRegisterComponent },
  { path: 'business/account-conflict', component: AccountConflictComponent },
  { path: 'business/auth-callback', component: BusinessAuthCallbackComponent },
  { 
    path: 'business/dashboard', 
    component: BusinessDashboardComponent,
    canActivate: [businessGuard],
    children: [
      { path: 'items', component: ItemManagementComponent },
      { path: 'edit/:id', component: EditBusinessComponent },
      { path: 'settings', component: AccountSettingsComponent }
    ]
  },
  
  // User routes
  { 
    path: 'user/dashboard', 
    component: DashboardComponent,
    canActivate: [userGuard]
  },
  { 
    path: 'user/profile', 
    component: ProfileComponent,
    canActivate: [userGuard]
  },
  
  // Public explore pages
  { path: 'explore', component: BusinessList },
  { path: 'search/items', component: ItemSearchComponent },
  { path: 'leaderboard', component: Leaderboard },
  { 
    path: 'write-review', 
    component: WriteReview,
    canActivate: [authGuard]
  },
  
  // Parameterized routes (MUST BE LAST)
  { path: 'business/:id', component: BusinessDetail },
  
  // Redirects and fallback
  { path: 'dashboard', redirectTo: 'user/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];
