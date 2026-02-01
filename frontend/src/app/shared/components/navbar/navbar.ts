import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Home, Compass, Trophy, LogIn, UserPlus, LayoutDashboard, User, LogOut, Menu, X, Building2 } from 'lucide-angular';
import { StorageService } from '../../../core/services/storage';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, LucideAngularModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  // Lucide Icons
  readonly Home = Home;
  readonly Compass = Compass;
  readonly Trophy = Trophy;
  readonly Building2 = Building2;
  readonly LogIn = LogIn;
  readonly UserPlus = UserPlus;
  readonly LayoutDashboard = LayoutDashboard;
  readonly User = User;
  readonly LogOut = LogOut;
  readonly Menu = Menu;
  readonly X = X;
  isMenuOpen = false;
  avatarFailed = false;

  constructor(
    private storage: StorageService,
    private router: Router
  ) {}

  get isLoggedIn(): boolean {
    return this.storage.isAuthenticated();
  }

  get currentUser(): any {
    return this.storage.getUser();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    this.storage.clearAuth();
    window.location.href = '/auth/login';
  }
  
  getUserAvatar(): string | null {
    const user = this.currentUser;
    if (!user) return null;
    
    // Try multiple possible avatar locations
    return user.profile?.avatar || user.avatar || user.googleProfile?.picture || null;
  }
  
  onAvatarError(event: any) {
    this.avatarFailed = true;
    event.target.style.display = 'none';
  }
}
