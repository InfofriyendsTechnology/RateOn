import { Component, OnInit } from '@angular/core';
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
  LogOut
} from 'lucide-angular';
import { ThemeService } from '../../../core/services/theme';
import { StorageService } from '../../../core/services/storage';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, LucideAngularModule, CommonModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss'],
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
  
  isLoggedIn = false;
  user: any = null;
  showUserMenu = false;
  showLogoutModal = false;
  greeting = '';
  
  constructor(
    public themeService: ThemeService,
    private router: Router,
    private storage: StorageService
  ) {}
  
  ngOnInit() {
    // Check if user is logged in
    const storedUser = this.storage.getUser();
    if (storedUser) {
      this.isLoggedIn = true;
      this.user = {
        username: storedUser.username || 'User',
        avatar: storedUser.profile?.avatar || null
      };
      this.setTimeBasedGreeting();
    }
  }
  
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
}
