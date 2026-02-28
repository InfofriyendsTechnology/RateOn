import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/components/toast/toast';
import { NotificationComponent } from './shared/notification/notification.component';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Sun, Moon } from 'lucide-angular';
import { ThemeService } from './core/services/theme';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent, NotificationComponent, CommonModule, LucideAngularModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');
  readonly Sun = Sun;
  readonly Moon = Moon;

  constructor(public themeService: ThemeService) {}
}
