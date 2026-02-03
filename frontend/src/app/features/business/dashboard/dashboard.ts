import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { StorageService } from '../../../core/services/storage';
import { AuthService } from '../../../core/services/auth';
import { BusinessService } from '../../../core/services/business';
import { LucideAngularModule, LayoutDashboard, Compass, Trophy, ShoppingBag, Settings, Edit, LogOut, Menu } from 'lucide-angular';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-business-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, LucideAngularModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class BusinessDashboardComponent implements OnInit {
  // Lucide Icons
  readonly LayoutDashboard = LayoutDashboard;
  readonly Compass = Compass;
  readonly Trophy = Trophy;
  readonly ShoppingBag = ShoppingBag;
  readonly Settings = Settings;
  readonly Edit = Edit;
  readonly LogOut = LogOut;
  readonly Menu = Menu;
  
  user: any = null;
  business: any = null;
  sidebarOpen = true;
  isChildRoute = false;
  avatarFailed = false;
  loadingBusiness = false;

  constructor(
    private storage: StorageService,
    private router: Router,
    private authService: AuthService,
    private businessService: BusinessService
  ) {}
  
  ngOnInit() {
    this.user = this.storage.getUser();
    this.loadBusinessData();
    
    // Track child route activation
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isChildRoute = event.url !== '/business/dashboard';
      });
    
    // Set initial state
    this.isChildRoute = this.router.url !== '/business/dashboard';
  }
  
  loadBusinessData() {
    this.loadingBusiness = true;
    const userId = this.user?._id || this.user?.id;
    
    if (!userId) {
      this.loadingBusiness = false;
      return;
    }
    
    this.businessService.getBusinesses({ owner: userId, limit: 1 }).subscribe({
      next: (response: any) => {
        const data = response.data || response;
        const businesses = data.businesses || data || [];
        
        if (businesses.length > 0) {
          this.business = businesses[0];
        }
        this.loadingBusiness = false;
      },
      error: (err) => {
        console.error('Failed to load business:', err);
        this.loadingBusiness = false;
      }
    });
  }
  

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
  
  isChildRouteActive(): boolean {
    return this.isChildRoute;
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.storage.clearAuth();
        this.router.navigate(['/']);
      },
      error: () => {
        // Logout anyway on error
        this.storage.clearAuth();
        this.router.navigate(['/']);
      }
    });
  }
  
  getUserAvatar(): string | null {
    if (this.user?.profile?.avatar) {
      return this.user.profile.avatar;
    }
    if (this.user?.avatar) {
      return this.user.avatar;
    }
    if (this.user?.googleProfile?.picture) {
      return this.user.googleProfile.picture;
    }
    return null;
  }
  
  onAvatarError(event: any) {
    this.avatarFailed = true;
    event.target.style.display = 'none';
  }
}
