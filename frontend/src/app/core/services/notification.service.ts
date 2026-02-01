import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

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

  success(title: string, message: string, duration = 3000) {
    this.show({ type: 'success', title, message, duration });
  }

  error(title: string, message: string, duration = 4000) {
    this.show({ type: 'error', title, message, duration });
  }

  warning(title: string, message: string, duration = 3500) {
    this.show({ type: 'warning', title, message, duration });
  }

  info(title: string, message: string, duration = 3000) {
    this.show({ type: 'info', title, message, duration });
  }

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

  // Helper methods for simple messages
  showSuccess(message: string, duration = 3000) {
    this.success('Success', message, duration);
  }

  showError(message: string, duration = 4000) {
    this.error('Error', message, duration);
  }

  showWarning(message: string, duration = 3500) {
    this.warning('Warning', message, duration);
  }

  showInfo(message: string, duration = 3000) {
    this.info('Info', message, duration);
  }
}
