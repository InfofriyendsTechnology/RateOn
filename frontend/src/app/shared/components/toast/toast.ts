import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toasts" 
           class="toast" 
           [ngClass]="[toast.minimal ? 'toast-minimal' : ('toast-' + toast.type)]"
           [@slideIn]>
        <div class="toast-icon">
          <!-- Success Icon -->
          <svg *ngIf="toast.type === 'success'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          
          <!-- Error Icon -->
          <svg *ngIf="toast.type === 'error'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          
          <!-- Warning Icon -->
          <svg *ngIf="toast.type === 'warning'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          
          <!-- Info Icon -->
          <svg *ngIf="toast.type === 'info'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </div>
        
        <div class="toast-content">
          <div class="toast-title">{{ toast.title }}</div>
          <div *ngIf="!toast.minimal && toast.message" class="toast-message">{{ toast.message }}</div>
        </div>
        
        <button class="toast-close" (click)="remove(toast.id)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
    }

.toast {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 14px;
      background: var(--bg-secondary);
      border-radius: 10px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
      border: 1px solid var(--border-color);
      animation: slideIn 0.25s ease-out;
      min-width: 280px;
    }

    .toast-minimal {
      border-left: none;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .toast-success {
      border-left-color: #10b981;
      
      .toast-icon {
        color: #10b981;
      }
    }

    .toast-error {
      border-left-color: #ef4444;
      
      .toast-icon {
        color: #ef4444;
      }
    }

    .toast-warning {
      border-left-color: #f59e0b;
      
      .toast-icon {
        color: #f59e0b;
      }
    }

    .toast-info {
      border-left-color: #3b82f6;
      
      .toast-icon {
        color: #3b82f6;
      }
    }

    .toast-icon {
      flex-shrink: 0;
      margin-top: 2px;
    }

    .toast-content {
      flex: 1;
      min-width: 0;
    }

.toast-title {
      font-weight: 600;
      font-size: 0.925rem;
      color: var(--text-primary);
      margin: 0;
    }

.toast-message {
      font-size: 0.85rem;
      color: var(--text-secondary);
      line-height: 1.4;
      margin-top: 2px;
    }

    .toast-close {
      flex-shrink: 0;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      color: #9ca3af;
      transition: all 0.2s ease;

      &:hover {
        background-color: #f3f4f6;
        color: #111827;
      }
    }

    @media (max-width: 768px) {
      .toast-container {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
      }

      .toast {
        min-width: auto;
      }
    }
  `]
})
export class ToastContainerComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  remove(id: string): void {
    this.toastService.remove(id);
  }
}
