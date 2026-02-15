import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { StorageService } from '../../../core/services/storage';
import { AuthService } from '../../../core/services/auth';
import { BusinessService } from '../../../core/services/business';
import { ToastService } from '../../../core/services/toast';
import { ThemeService } from '../../../core/services/theme';
import { UserNotificationsService, AppNotification } from '../../../core/services/user-notifications.service';
import { LucideAngularModule, LayoutDashboard, Compass, Trophy, ShoppingBag, Settings, Edit, LogOut, Menu, User, Plus, ArrowLeft, X, Star, Sun, Moon, Bell, MessageSquare } from 'lucide-angular';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-business-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, RouterOutlet, LucideAngularModule],
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
  readonly User = User;
  readonly Plus = Plus;
  readonly ArrowLeft = ArrowLeft;
  readonly X = X;
  readonly Star = Star;
  readonly Sun = Sun;
  readonly Moon = Moon;
  readonly Bell = Bell;
  readonly MessageSquare = MessageSquare;
  
  user: any = null;
  businesses: any[] = [];
  selectedBusiness: any = null;
  sidebarOpen = true; // Always start open
  isChildRoute = false;
  avatarFailed = false;
  loadingBusinesses = false;
  
  // Statistics
  totalItems = 0;
  totalReviews = 0;
  averageRating = 0;
  
  // Theme and greeting
  greeting = '';
  isDarkMode = true;
  
  // Notifications
  unreadNotificationsCount = 0;
  
  // Business creation modal
  showBusinessModal = false;
  currentBusinessStep = 1;
  totalBusinessSteps = 3;
  addingBusiness = false;
  businessForm = {
    name: '',
    type: '',
    customType: '',
    category: '',
    city: '',
    state: '',
    address: '',
    phone: '',
    website: '',
    description: ''
  };

  constructor(
    private storage: StorageService,
    private router: Router,
    private authService: AuthService,
    private businessService: BusinessService,
    private toastService: ToastService,
    private themeService: ThemeService,
    private notificationService: UserNotificationsService
  ) {}
  
  ngOnInit() {
    this.user = this.storage.getUser();
    this.loadBusinessData();
    this.setGreeting();
    this.loadTheme();
    this.setupNotifications();
    
    // Set initial sidebar state - closed on mobile, open on desktop
    if (typeof window !== 'undefined') {
      this.sidebarOpen = window.innerWidth > 768;
    }
    
    // Track child route activation and reload data when returning to dashboard
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isChildRoute = event.url !== '/owner' && !event.url.endsWith('/owner');
        
        // Reload business data when navigating back to main dashboard
        if (event.url === '/owner' || event.url.endsWith('/owner')) {
          this.loadBusinessData();
        }
      });
    
    // Set initial state
    this.isChildRoute = this.router.url !== '/owner' && !this.router.url.endsWith('/owner');
  }
  
  loadBusinessData(forceRefresh: boolean = true) {
    this.loadingBusinesses = true;
    const userId = this.user?._id || this.user?.id;
    
    if (!userId) {
      this.loadingBusinesses = false;
      return;
    }
    
    // Add timestamp to bypass cache
    const filters: any = { owner: userId };
    if (forceRefresh) {
      filters._nocache = Date.now();
    }
    
    // Load all businesses owned by this user
    this.businessService.getBusinesses(filters).subscribe({
      next: (response: any) => {
        const data = response.data || response;
        this.businesses = data.businesses || data || [];
        
        // Force update selected business if it exists
        if (this.selectedBusiness) {
          const updated = this.businesses.find(b => b._id === this.selectedBusiness._id);
          if (updated) {
            this.selectedBusiness = updated;
          }
        } else if (this.businesses.length > 0) {
          this.selectedBusiness = this.businesses[0];
        }
        
        // Calculate statistics
        this.calculateStatistics();
        
        this.loadingBusinesses = false;
      },
      error: (err) => {
        this.loadingBusinesses = false;
      }
    });
  }
  
  calculateStatistics() {
    // Calculate total items across all businesses
    this.totalItems = this.businesses.reduce((sum, business) => {
      return sum + (business.itemCount || 0);
    }, 0);
    
    // Calculate total reviews across all businesses
    this.totalReviews = this.businesses.reduce((sum, business) => {
      return sum + (business.rating?.count || business.reviewCount || 0);
    }, 0);
    
    // Calculate average rating across all businesses
    const businessesWithRating = this.businesses.filter(b => {
      const rating = b.rating?.average || b.rating || 0;
      return rating > 0;
    });
    if (businessesWithRating.length > 0) {
      const totalRating = businessesWithRating.reduce((sum, business) => {
        return sum + (business.rating?.average || business.rating || 0);
      }, 0);
      this.averageRating = totalRating / businessesWithRating.length;
    } else {
      this.averageRating = 0;
    }
  }
  
  selectBusiness(business: any) {
    this.selectedBusiness = business;
  }
  
  setGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting = 'Good Morning';
    } else if (hour < 18) {
      this.greeting = 'Good Afternoon';
    } else {
      this.greeting = 'Good Evening';
    }
  }
  
  loadTheme() {
    this.isDarkMode = this.themeService.isDarkMode();
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }
  
  toggleTheme() {
    this.themeService.toggleTheme();
  }
  
  setupNotifications() {
    // Connect to WebSocket
    this.notificationService.connect();
    
    // Seed unread count
    this.notificationService.seedUnreadCount();
    
    // Subscribe to unread count updates
    this.notificationService.onUnreadCount().subscribe(count => {
      this.unreadNotificationsCount = count;
    });
    
    // Listen for new notifications and reload business data to update counts
    this.notificationService.onNewNotification().subscribe(notification => {
      if (notification.type === 'new_review') {
        // Reload business data to get updated review counts
        this.loadBusinessData();
      }
    });
  }
  
  

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
  
  closeSidebarOnMobile() {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      this.sidebarOpen = false;
    }
  }
  
  isChildRouteActive(): boolean {
    return this.isChildRoute;
  }
  
  getPageTitle(): string {
    const url = this.router.url;
    
    // Check for specific routes first (more specific to less specific)
    if (url.includes('/businesses/') && url.includes('/edit')) {
      return 'Edit Business';
    } else if (url.includes('/businesses/') && url.includes('/items')) {
      return 'Manage Items';
    } else if (url.match(/\/businesses\/[^\/]+$/)) {
      // Matches /owner/businesses/:id (business detail page)
      return 'Business Details';
    } else if (url.includes('/businesses')) {
      return 'My Businesses';
    } else if (url.includes('/reviews')) {
      return 'Reviews';
    } else if (url.includes('/notifications')) {
      return 'Notifications';
    } else if (url.includes('/settings')) {
      return 'Settings';
    } else if (url.includes('/profile')) {
      return 'Profile';
    } else if (url === '/owner' || url.endsWith('/owner')) {
      return 'Dashboard';
    }
    
    return 'Dashboard';
  }
  
  isOnBusinessesPage(): boolean {
    return this.router.url.includes('/businesses');
  }

  isOnItemsPage(): boolean {
    return this.router.url.includes('/items');
  }

  openAddItem() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-add-item'));
    }
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
  
  // Business creation methods
  openBusinessModal() {
    this.showBusinessModal = true;
    this.currentBusinessStep = 1;
    this.resetBusinessForm();
  }
  
  closeBusinessModal() {
    this.showBusinessModal = false;
    this.resetBusinessForm();
  }
  
  resetBusinessForm() {
    this.businessForm = {
      name: '',
      type: '',
      customType: '',
      category: '',
      city: '',
      state: '',
      address: '',
      phone: '',
      website: '',
      description: ''
    };
    this.currentBusinessStep = 1;
  }
  
  onBusinessTypeChange() {
    // Clear custom type when switching away from 'other'
    if (this.businessForm.type !== 'other') {
      this.businessForm.customType = '';
    }
  }
  
  nextBusinessStep() {
    if (this.currentBusinessStep === 1) {
      if (!this.businessForm.name || !this.businessForm.type) {
        this.toastService.error('Please fill in all required fields');
        return;
      }
      // Validate custom type when 'other' is selected
      if (this.businessForm.type === 'other' && !this.businessForm.customType?.trim()) {
        this.toastService.error('Please specify your business type');
        return;
      }
    }
    
    if (this.currentBusinessStep === 2) {
      if (!this.businessForm.city || !this.businessForm.state || !this.businessForm.address) {
        this.toastService.error('Please fill in all required location fields');
        return;
      }
    }
    
    if (this.currentBusinessStep < this.totalBusinessSteps) {
      this.currentBusinessStep++;
    }
  }
  
  previousBusinessStep() {
    if (this.currentBusinessStep > 1) {
      this.currentBusinessStep--;
    }
  }
  
  addBusiness() {
    if (!this.businessForm.name || !this.businessForm.type || !this.businessForm.city || !this.businessForm.state || !this.businessForm.address) {
      this.toastService.error('Please fill in all required fields');
      return;
    }
    
    // Validate custom type when 'other' is selected
    if (this.businessForm.type === 'other' && !this.businessForm.customType?.trim()) {
      this.toastService.error('Please specify your business type');
      return;
    }
    
    this.addingBusiness = true;
    
    // Use customType as type if 'other' is selected
    const businessType = this.businessForm.type === 'other' ? this.businessForm.customType : this.businessForm.type;
    
    const businessData = {
      name: this.businessForm.name,
      type: businessType,
      category: this.businessForm.category || businessType, // Use type as category if not provided
      location: {
        address: this.businessForm.address,
        city: this.businessForm.city,
        state: this.businessForm.state,
        country: 'India',
        coordinates: {
          coordinates: [0, 0] // Default coordinates, can be updated later
        }
      },
      contact: {
        phone: this.businessForm.phone || '',
        website: this.businessForm.website || ''
      },
      description: this.businessForm.description || ''
    };
    
    this.businessService.createBusiness(businessData).subscribe({
      next: (response: any) => {
        this.toastService.success('Business created successfully!');
        this.closeBusinessModal();
        this.loadBusinessData(); // Reload all businesses
      },
      error: (err) => {
        this.toastService.error('Failed to create business. Please try again.');
        this.addingBusiness = false;
      },
      complete: () => {
        this.addingBusiness = false;
      }
    });
  }
}
