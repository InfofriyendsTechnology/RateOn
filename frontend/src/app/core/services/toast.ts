import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string; // message text
  message?: string;
  duration?: number;
  minimal?: boolean; // if true, show message-only, no status labels/icons
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  show(toast: Omit<Toast, 'id'>): void {
    const id = this.generateId();
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 5000
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, newToast]);

    // Auto remove after duration
    setTimeout(() => {
      this.remove(id);
    }, newToast.duration);
  }

  // Message-only helpers (no status labels/icons). Use everywhere for short posts.
  success(title: string, message?: string, duration?: number): void {
    this.show({ type: 'success', title, message, duration, minimal: true });
  }

  error(title: string, message?: string, duration?: number): void {
    this.show({ type: 'error', title, message, duration, minimal: true });
  }

  warning(title: string, message?: string, duration?: number): void {
    this.show({ type: 'warning', title, message, duration, minimal: true });
  }

  info(title: string, message?: string, duration?: number): void {
    this.show({ type: 'info', title, message, duration, minimal: true });
  }

  // Generic short message
  message(text: string, duration: number = 2200): void {
    this.show({ type: 'info', title: text, duration, minimal: true });
  }

  remove(id: string): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(t => t.id !== id));
  }

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
