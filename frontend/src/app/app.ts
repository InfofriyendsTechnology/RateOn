import { Component, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { ToastContainerComponent } from './shared/components/toast/toast';
import { NotificationComponent } from './shared/notification/notification.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, ToastContainerComponent, NotificationComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');
  showNavbar = true;

  constructor(private router: Router) {
    // Hide navbar on auth pages, business auth pages, and business dashboard pages
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Hide navbar for these routes (they have their own navigation)
        const hideNavbarRoutes = [
          '/auth',
          '/business/register',
          '/business/complete-registration',
          '/business/account-conflict',
          '/business/auth-callback',
          '/business/dashboard',
          '/business/items',
          '/business/reviews',
          '/business/analytics',
          '/business/settings'
        ];
        this.showNavbar = !hideNavbarRoutes.some(route => event.url.startsWith(route));
      });
  }
}
