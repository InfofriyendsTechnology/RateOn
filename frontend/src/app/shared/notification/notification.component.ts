import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from '../../core/services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: (Notification & { id: number; show: boolean })[] = [];
  private subscription?: Subscription;
  private idCounter = 0;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.subscription = this.notificationService.notification$.subscribe(notification => {
      this.showNotification(notification);
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  showNotification(notification: Notification) {
    const id = ++this.idCounter;
    const notificationWithId = { ...notification, id, show: false };
    
    this.notifications.push(notificationWithId);
    
    // Trigger animation
    setTimeout(() => {
      const index = this.notifications.findIndex(n => n.id === id);
      if (index !== -1) {
        this.notifications[index].show = true;
      }
    }, 10);

    // Auto dismiss (except confirm)
    if (notification.type !== 'confirm' && notification.duration) {
      setTimeout(() => this.removeNotification(id), notification.duration);
    }
  }

  removeNotification(id: number) {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications[index].show = false;
      setTimeout(() => {
        this.notifications = this.notifications.filter(n => n.id !== id);
      }, 300);
    }
  }

  onConfirm(notification: Notification & { id: number }) {
    notification.onConfirm?.();
    this.removeNotification(notification.id);
  }

  onCancel(notification: Notification & { id: number }) {
    notification.onCancel?.();
    this.removeNotification(notification.id);
  }
}
