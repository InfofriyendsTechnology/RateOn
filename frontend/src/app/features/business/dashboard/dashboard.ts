import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { StorageService } from '../../../core/services/storage';
import { AuthService } from '../../../core/services/auth';
import { BusinessService } from '../../../core/services/business';
import { ToastService } from '../../../core/services/toast';
import { ThemeService } from '../../../core/services/theme';
import { LucideAngularModule, LayoutDashboard, Compass, Trophy, ShoppingBag, Settings, Edit, LogOut, Menu, User, Plus, ArrowLeft, X, Star, Sun, Moon } from 'lucide-angular';
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
  
  user: any = null;
  businesses: any[] = [];
  selectedBusiness: any = null;
  sidebarOpen = typeof window !== 'undefined' ? window.innerWidth > 768 : true;
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
  
  // Business creation modal
  showBusinessModal = false;
  currentBusinessStep = 1;
  totalBusinessSteps = 3;
  addingBusiness = false;
  businessForm = {
    name: '',
    type: '',
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
    private themeService: ThemeService
  ) {}
  
  ngOnInit() {
    this.user = this.storage.getUser();
    this.loadBusinessData();
    this.setGreeting();
    this.loadTheme();
    
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
    this.loadingBusinesses = true;
    const userId = this.user?._id || this.user?.id;
    
    if (!userId) {
      this.loadingBusinesses = false;
      return;
    }
    
    // Load all businesses owned by this user
    this.businessService.getBusinesses({ owner: userId }).subscribe({
      next: (response: any) => {
        const data = response.data || response;
        this.businesses = data.businesses || data || [];
        
        // Select first business by default if available
        if (this.businesses.length > 0 && !this.selectedBusiness) {
          this.selectedBusiness = this.businesses[0];
        }
        
        // Calculate statistics
        this.calculateStatistics();
        
        this.loadingBusinesses = false;
      },
      error: (err) => {
        console.error('Failed to load businesses:', err);
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
      return sum + (business.reviewCount || 0);
    }, 0);
    
    // Calculate average rating across all businesses
    const businessesWithRating = this.businesses.filter(b => b.rating && b.rating > 0);
    if (businessesWithRating.length > 0) {
      const totalRating = businessesWithRating.reduce((sum, business) => sum + business.rating, 0);
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
    
    if (url.includes('/businesses')) {
      return 'Businesses';
    } else if (url.includes('/items/')) {
      return 'Item Management';
    } else if (url.includes('/edit/')) {
      return 'Edit Business';
    } else if (url.includes('/settings')) {
      return 'Settings';
    } else if (url === '/business/dashboard') {
      return 'Dashboard';
    }
    
    return 'Dashboard';
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
  
  nextBusinessStep() {
    if (this.currentBusinessStep === 1) {
      if (!this.businessForm.name || !this.businessForm.type) {
        this.toastService.error('Please fill in all required fields');
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
    
    this.addingBusiness = true;
    
    const businessData = {
      name: this.businessForm.name,
      type: this.businessForm.type,
      category: this.businessForm.category || this.businessForm.type, // Use type as category if not provided
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
        console.error('Failed to create business:', err);
        this.toastService.error('Failed to create business. Please try again.');
        this.addingBusiness = false;
      },
      complete: () => {
        this.addingBusiness = false;
      }
    });
  }
}
