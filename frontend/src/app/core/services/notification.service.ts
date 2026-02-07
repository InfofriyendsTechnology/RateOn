import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ToastService } from './toast';

export interface Notification {
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  title: string;
  message: string;
  duration?: number;
  onConfirm?: () => void;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<Notification>();
  public notification$ = this.notificationSubject.asObservable();

  constructor(private toast: ToastService) {}

  // Route standard notices to minimal toast (message-only)
  success(title: string, message: string, duration = 2200) {
    this.toast.message(message || title, duration);
  }

  error(title: string, message: string, duration = 2200) {
    this.toast.message(message || title, duration);
  }

  warning(title: string, message: string, duration = 2200) {
    this.toast.message(message || title, duration);
  }

  info(title: string, message: string, duration = 2200) {
    this.toast.message(message || title, duration);
  }

  // Keep confirm dialog using NotificationComponent
  confirm(title: string, message: string, onConfirm: () => void, onCancel?: () => void) {
    this.show({
      type: 'confirm',
      title,
      message,
      onConfirm,
      onCancel
    });
  }

  private show(notification: Notification) {
    this.notificationSubject.next(notification);
  }

  // Helper shortcuts
  showSuccess(message: string, duration = 2200) {
    this.toast.message(message, duration);
  }

  showError(message: string, duration = 2200) {
    this.toast.message(message, duration);
  }

  showWarning(message: string, duration = 2200) {
    this.toast.message(message, duration);
  }

  showInfo(message: string, duration = 2200) {
    this.toast.message(message, duration);
  }
}
