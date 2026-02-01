import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { StorageService } from '../../../core/services/storage';
import { AuthService } from '../../../core/services/auth';
import { BusinessService } from '../../../core/services/business';
import { LucideAngularModule, LayoutDashboard, Compass, Trophy, ShoppingBag, MessageSquare, BarChart3, Settings, Edit, LogOut, Menu } from 'lucide-angular';
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
  readonly MessageSquare = MessageSquare;
  readonly BarChart3 = BarChart3;
  readonly Settings = Settings;
  readonly Edit = Edit;
  readonly LogOut = LogOut;
  readonly Menu = Menu;
  
  user: any = null;
  business: any = null;

  stats = {
    totalReviews: 0,
    averageRating: 0,
    totalViews: 0,
    totalItems: 0,
    monthlyViews: 0,
    responseRate: 0
  };

  recentReviews: any[] = [];
  popularItems: any[] = [];
  viewsData: any[] = [];
  sidebarOpen = true;
  isChildRoute = false;
  avatarFailed = false;

  constructor(
    private storage: StorageService,
    private router: Router,
    private authService: AuthService,
    private businessService: BusinessService
  ) {}
  
  ngOnInit() {
    this.user = this.storage.getUser();
    
    // Load business data
    this.loadBusinessData();
    
    // TODO: Load actual stats from API
    this.loadStats();
    
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
    // Try to get business ID from ALL possible locations
    let businessId = null;
    
    // Check various possible locations in user object
    if (this.user?.business?._id) {
      businessId = this.user.business._id;
    } else if (this.user?.business?.id) {
      businessId = this.user.business.id;
    } else if (typeof this.user?.business === 'string') {
      businessId = this.user.business;
    } else if (typeof this.user?.business === 'object' && this.user.business) {
      // If business is an object, try to extract ID from it
      businessId = this.user.business._id || this.user.business.id || null;
    } else if (this.user?.claimedBusiness?._id) {
      businessId = this.user.claimedBusiness._id;
    } else if (this.user?.claimedBusiness?.id) {
      businessId = this.user.claimedBusiness.id;
    } else if (typeof this.user?.claimedBusiness === 'string') {
      businessId = this.user.claimedBusiness;
    } else if (this.user?.businessId) {
      businessId = this.user.businessId;
    }
    
    // Convert to string if it's still an object
    if (businessId && typeof businessId === 'object') {
      businessId = businessId._id || businessId.id || String(businessId);
    }
    
    // Ensure businessId is a valid string
    if (businessId) {
      businessId = String(businessId);
      this.businessService.getBusinessById(businessId).subscribe({
        next: (response: any) => {
          const data = response.data || response;
          this.business = data.business || data;
        },
        error: (err) => {
          console.error('Failed to load business:', err);
          // Fallback: Try to fetch businesses owned by this user
          this.fetchUserBusinesses();
        }
      });
    } else {
      // No business ID found, try to fetch from API
      this.fetchUserBusinesses();
    }
  }
  
  fetchUserBusinesses() {
    // Fetch businesses owned by current user using owner filter
    const userId = this.user?._id || this.user?.id;
    if (!userId) {
      console.error('No user ID found');
      return;
    }
    
    this.businessService.getBusinesses({ owner: userId, limit: 1 }).subscribe({
      next: (response: any) => {
        const data = response.data || response;
        const businesses = data.businesses || data || [];
        
        if (businesses.length > 0) {
          this.business = businesses[0];
        }
      },
      error: (err) => {
        console.error('Failed to fetch businesses:', err);
      }
    });
  }

  loadStats() {
    // Realistic mock data
    this.stats = {
      totalReviews: 247,
      averageRating: 4.6,
      totalViews: 8429,
      totalItems: 32,
      monthlyViews: 2841,
      responseRate: 94
    };

    this.recentReviews = [
      {
        id: 1,
        userName: 'Priya Patel',
        rating: 5,
        comment: 'Excellent food quality and service! Highly recommend.',
        itemName: 'Paneer Tikka',
        time: '2 hours ago'
      },
      {
        id: 2,
        userName: 'Rajesh Kumar',
        rating: 4,
        comment: 'Good taste but delivery was slightly delayed.',
        itemName: 'Butter Chicken',
        time: '5 hours ago'
      },
      {
        id: 3,
        userName: 'Sneha Sharma',
        rating: 5,
        comment: 'Amazing! Will order again for sure.',
        itemName: 'Dal Makhani',
        time: '1 day ago'
      }
    ];

    this.popularItems = [
      { name: 'Paneer Tikka', orders: 156, rating: 4.8, change: '+12%' },
      { name: 'Butter Chicken', orders: 143, rating: 4.7, change: '+8%' },
      { name: 'Dal Makhani', orders: 98, rating: 4.6, change: '+15%' },
      { name: 'Naan', orders: 87, rating: 4.5, change: '+5%' }
    ];

    this.viewsData = [
      { day: 'Mon', views: 420 },
      { day: 'Tue', views: 380 },
      { day: 'Wed', views: 510 },
      { day: 'Thu', views: 445 },
      { day: 'Fri', views: 590 },
      { day: 'Sat', views: 680 },
      { day: 'Sun', views: 560 }
    ];
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
