import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { 
  LucideAngularModule, 
  LogIn,
  UserPlus,
  Star, 
  Building2, 
  Award,
  Target,
  Shield,
  Users,
  Image,
  MessageSquare,
  TrendingUp,
  Search,
  Package,
  Bell,
  BarChart3,
  CheckCircle2,
  Sun,
  Moon,
  Home,
  Compass,
  User,
  LogOut,
  Edit,
  FileText,
  ThumbsUp,
  Settings
} from 'lucide-angular';
import { ThemeService } from '../../../core/services/theme';
import { StorageService } from '../../../core/services/storage';
import { AuthService } from '../../../core/services/auth';
import { BusinessService } from '../../../core/services/business';
import { ItemService } from '../../../core/services/item';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { BusinessCard } from '../../../shared/components/business-card/business-card';
import { ItemCard } from '../../../shared/components/item-card/item-card';
import { Navbar } from '../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, LucideAngularModule, CommonModule, SearchBarComponent, BusinessCard, ItemCard, Navbar],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss']
})
export class LandingComponent implements OnInit {
  // Lucide Icons
  readonly LogIn = LogIn;
  readonly UserPlus = UserPlus;
  readonly Star = Star;
  readonly Building2 = Building2;
  readonly Award = Award;
  readonly Target = Target;
  readonly Shield = Shield;
  readonly Users = Users;
  readonly Image = Image;
  readonly MessageSquare = MessageSquare;
  readonly TrendingUp = TrendingUp;
  readonly Search = Search;
  readonly Package = Package;
  readonly Bell = Bell;
  readonly BarChart3 = BarChart3;
  readonly CheckCircle2 = CheckCircle2;
  readonly Sun = Sun;
  readonly Moon = Moon;
  readonly Home = Home;
  readonly Compass = Compass;
  readonly User = User;
  readonly LogOut = LogOut;
  readonly Edit = Edit;
  readonly FileText = FileText;
  readonly ThumbsUp = ThumbsUp;
  readonly Settings = Settings;
  
  isLoggedIn = false;
  user: any = null;
  showUserMenu = false;
  showLogoutModal = false;
  greeting = '';
  avatarFailed = false;
  
  // Public content - visible to all users
  featuredBusinesses: any[] = [];
  featuredItems: any[] = [];
  totalBusinesses = 0;
  totalItems = 0;
  totalReviews = 0;
  loadingBusinesses = true;
  loadingItems = true;
  
  constructor(
    public themeService: ThemeService,
    public router: Router,
    private storage: StorageService,
    private authService: AuthService,
    private businessService: BusinessService,
    private itemService: ItemService,
    private http: HttpClient
  ) {}
  
  ngOnInit() {
    // Check if user is logged in — check BOTH token + user, same as AuthService
    const storedUser = this.storage.getUser();
    const token = this.storage.getToken();
    if (storedUser && token) {
      // Redirect business owners to their dashboard
      if (storedUser.role === 'business_owner') {
        this.router.navigate(['/owner']);
        return;
      }
      this.isLoggedIn = true;
      this.user = {
        id: storedUser.id || storedUser._id,
        username: storedUser.username || 'User',
        email: storedUser.email || '',
        trustScore: storedUser.trustScore || 50,
        level: this.getLevelName(storedUser.level || 1),
        totalReviews: storedUser.stats?.totalReviews || 0,
        totalFollowers: storedUser.stats?.totalFollowers || 0,
        totalFollowing: storedUser.stats?.totalFollowing || 0,
        helpfulReactions: storedUser.stats?.helpfulReactions || 0,
        avatar: storedUser.profile?.avatar || null,
        firstName: storedUser.profile?.firstName || '',
        lastName: storedUser.profile?.lastName || '',
      };
      this.setTimeBasedGreeting();
    }
    
    // Load public content for everyone
    this.loadPlatformStats();
    this.loadFeaturedBusinesses();
    this.loadFeaturedItems();
  }
  
  getLevelName(level: number): string {
    const levels = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
    return levels[Math.min(level - 1, levels.length - 1)] || 'Bronze';
  }

  getLevelClass(level: string): string {
    const map: any = { 'Bronze': 'level-bronze', 'Silver': 'level-silver', 'Gold': 'level-gold', 'Platinum': 'level-platinum', 'Diamond': 'level-diamond' };
    return map[level] || 'level-bronze';
  }

  getNextLevel(): string {
    const levels = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
    const idx = levels.indexOf(this.user?.level || 'Bronze');
    return levels[Math.min(idx + 1, levels.length - 1)] || 'Diamond';
  }

  getTrustScoreCircumference(): number { return 2 * Math.PI * 70; }

  getTrustScoreOffset(): number {
    const c = this.getTrustScoreCircumference();
    return c - ((this.user?.trustScore || 0) / 100) * c;
  }

  getTrustColor(): string {
    const s = this.user?.trustScore || 0;
    if (s >= 80) return '#10b981';
    if (s >= 60) return '#3b82f6';
    if (s >= 40) return '#fbbf24';
    return '#f59e0b';
  }

  getTrustLabel(): string {
    const s = this.user?.trustScore || 0;
    if (s >= 80) return 'Expert';
    if (s >= 60) return 'Trusted';
    if (s >= 40) return 'Active';
    return 'Beginner';
  }

  onAvatarError() { this.avatarFailed = true; }

  getInitial(): string {
    if (this.user?.firstName) return this.user.firstName.charAt(0).toUpperCase();
    if (this.user?.username)  return this.user.username.charAt(0).toUpperCase();
    return '?';
  }

  writeReview() { this.router.navigate(['/search']); }

  setTimeBasedGreeting() {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      this.greeting = 'Good morning';
    } else if (hour >= 12 && hour < 17) {
      this.greeting = 'Good afternoon';
    } else if (hour >= 17 && hour < 21) {
      this.greeting = 'Good evening';
    } else {
      this.greeting = 'Good night';
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  onLogoClick() {
    this.router.navigate(['/admin/login']);
  }
  
  navigateToDashboard() {
    this.router.navigate(['/home']);
  }
  
  navigateToExplore() {
    this.router.navigate(['/explore']);
  }
  
  navigateToProfile() {
    this.router.navigate(['/profile']);
  }
  
  openLogoutModal() {
    this.showLogoutModal = true;
  }
  
  closeLogoutModal() {
    this.showLogoutModal = false;
  }
  
  confirmLogout() {
    this.storage.clearAuth();
    this.isLoggedIn = false;
    this.user = null;
    this.showUserMenu = false;
    this.showLogoutModal = false;
    this.router.navigate(['/']);
  }
  
  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }
  
  loadFeaturedBusinesses() {
    this.loadingBusinesses = true;
    this.businessService.getBusinesses().subscribe({
      next: (response: any) => {
        const data = response.data || response;
        const businesses = data.businesses || data || [];
        // Get top 6 businesses by rating
        this.featuredBusinesses = businesses
          .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 6)
          .map((b: any) => ({
            _id: b._id,
            name: b.name,
            category: b.category || b.type || 'Business',
            description: b.description || '',
            averageRating: Number(b.rating) || 0,
            reviewCount: Number(b.stats?.totalReviews) || 0,
            itemsCount: Number(b.stats?.totalItems) || 0,
            address: {
              street: b.location?.address || '',
              city: b.location?.city || '',
              state: b.location?.state || ''
            },
            images: b.logo ? [b.logo] : b.coverImages || [],
            claimed: false
          }));
        this.loadingBusinesses = false;
      },
      error: () => {
        this.loadingBusinesses = false;
      }
    });
  }
  
  loadFeaturedItems() {
    this.loadingItems = true;
    this.itemService.searchItems('').subscribe({
      next: (response: any) => {
        const data = response.data || response;
        const items = data.items || data || [];
        // Get total count from pagination
        this.totalItems = data.pagination?.total || items.length;
        // Get top 6 items by rating
        this.featuredItems = items
          .sort((a: any, b: any) => {
            const ratingA = Number(a.stats?.averageRating || a.averageRating) || 0;
            const ratingB = Number(b.stats?.averageRating || b.averageRating) || 0;
            return ratingB - ratingA;
          })
          .slice(0, 6)
          .map((item: any) => ({
            _id: item._id,
            name: item.name,
            description: item.description || '',
            category: item.category || 'Item',
            price: Number(item.price) || 0,
            images: item.images || [],
            averageRating: Number(item.stats?.averageRating || item.averageRating) || 0,
            reviewCount: Number(item.stats?.totalReviews || item.reviewCount) || 0,
            businessId: typeof item.businessId === 'string' ? item.businessId : item.businessId?._id,
            availability: item.availability || { status: 'available' },
            stats: {
              averageRating: Number(item.stats?.averageRating || item.averageRating) || 0,
              totalReviews: Number(item.stats?.totalReviews || item.reviewCount) || 0
            }
          }));
        this.loadingItems = false;
      },
      error: () => {
        this.loadingItems = false;
      }
    });
  }
  
  onSearch(query: string) {
    // Search bar component handles navigation
  }
  
  viewAllBusinesses() {
    this.router.navigate(['/search'], { queryParams: { tab: 'businesses' } });
  }
  
  viewAllItems() {
    this.router.navigate(['/search'], { queryParams: { tab: 'items' } });
  }
  
  loadPlatformStats() {
    // Get accurate total counts from database
    this.http.get(`${environment.apiUrl}/stats/platform`).subscribe({
      next: (response: any) => {
        const data = response.data || response;
        this.totalBusinesses = data.totalBusinesses || 0;
        this.totalItems = data.totalItems || 0;
        this.totalReviews = data.totalReviews || 0;
      },
      error: () => {
        // Fallback to 0 if stats endpoint fails
        this.totalBusinesses = 0;
        this.totalItems = 0;
        this.totalReviews = 0;
      }
    });
  }
}
