import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Home, LogIn, UserPlus, LayoutDashboard, User, LogOut, Menu, X, Building2, Moon, Sun, Search, FileText, Compass } from 'lucide-angular';
import { StorageService } from '../../../core/services/storage';
import { ThemeService } from '../../../core/services/theme';
import { NotificationBellComponent } from '../notification-bell/notification-bell';
import { NotificationPanelComponent } from '../notification-panel/notification-panel';
import { UserNotificationsService } from '../../../core/services/user-notifications.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
imports: [RouterLink, RouterLinkActive, CommonModule, LucideAngularModule, NotificationBellComponent, NotificationPanelComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit, OnDestroy {
  // Lucide Icons
  readonly Home = Home;
  readonly Building2 = Building2;
  readonly LogIn = LogIn;
  readonly UserPlus = UserPlus;
  readonly LayoutDashboard = LayoutDashboard;
  readonly User = User;
  readonly LogOut = LogOut;
  readonly Menu = Menu;
  readonly X = X;
  readonly Moon = Moon;
  readonly Sun = Sun;
  readonly Search = Search;
  readonly FileText = FileText;
  readonly Compass = Compass;
  isMenuOpen = false;
  avatarFailed = false;
  showLogoutModal = false;
  showProfileDropdown = false;
  private routerSub?: Subscription;

  @HostListener('document:click')
  onDocumentClick(): void {
    this.showProfileDropdown = false;
    this.isMenuOpen = false;
    this.panelOpen = false;
  }

  // Notifications UI state
  unreadCount = 0;
  panelOpen = false;

  constructor(
    private storage: StorageService,
    private router: Router,
public themeService: ThemeService,
    private userNotifications: UserNotificationsService
  ) {}

  ngOnInit(): void {
    if (this.isLoggedIn) {
      this.userNotifications.connect();
      this.userNotifications.seedUnreadCount();
      this.userNotifications.onUnreadCount().subscribe((c) => (this.unreadCount = c || 0));
    }
    // Auto-close mobile menu on every navigation
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.isMenuOpen = false;
        this.panelOpen = false;
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  get isLoggedIn(): boolean {
    return this.storage.isAuthenticated();
  }

  get currentUser(): any {
    return this.storage.getUser();
  }
  
  get isBusinessOwner(): boolean {
    const user = this.currentUser;
    return user?.role === 'business_owner';
  }
  
  getDashboardLink(): string {
    return '/owner';
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) this.showProfileDropdown = false;
  }

  toggleProfileDropdown() {
    this.showProfileDropdown = !this.showProfileDropdown;
    if (this.showProfileDropdown) this.isMenuOpen = false;
  }

  openLogoutModal() {
    this.showLogoutModal = true;
  }

  closeLogoutModal() {
    this.showLogoutModal = false;
  }

  confirmLogout() {
    try { (this as any).userNotifications?.disconnect?.(); } catch {}
    this.storage.clearAuth();
    window.location.href = '/auth/login';
  }
  
  getUserAvatar(): string | null {
    const user = this.currentUser;
    if (!user) return null;
    
    // Try multiple possible avatar locations
    return user.profile?.avatar || user.avatar || user.googleProfile?.picture || null;
  }
  
  getUserInitial(): string {
    const user = this.currentUser;
    if (!user) return '?';
    
    // Try to get initial from firstName, lastName, or username
    if (user.profile?.firstName) {
      return user.profile.firstName.charAt(0).toUpperCase();
    }
    if (user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return '?';
  }
  
  onAvatarError(event: any) {
    this.avatarFailed = true;
  }
}
