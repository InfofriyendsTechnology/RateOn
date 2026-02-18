import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="user-avatar-wrapper" [style.width.px]="size" [style.height.px]="size">
      <img 
        *ngIf="avatarUrl && !hasError" 
        [src]="avatarUrl" 
        [alt]="userName || 'User'"
        class="avatar-image"
        crossorigin="anonymous"
        referrerpolicy="no-referrer"
        (error)="onImageError()"
        [style.width.px]="size"
        [style.height.px]="size" />
      <div 
        *ngIf="!avatarUrl || hasError" 
        class="avatar-fallback"
        [style.width.px]="size"
        [style.height.px]="size"
        [style.font-size.px]="size / 2.5">
        {{ getInitial() }}
      </div>
    </div>
  `,
  styles: [`
    .user-avatar-wrapper {
      position: relative;
      display: inline-block;
      flex-shrink: 0;
    }

    .avatar-image {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      display: block;
    }

    .avatar-fallback {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      text-transform: uppercase;
      user-select: none;
    }
  `]
})
export class UserAvatarComponent {
  @Input() avatarUrl: string | null = null;
  @Input() userName: string | null = null;
  @Input() size: number = 40;
  
  hasError = false;

  onImageError() {
    this.hasError = true;
  }

  getInitial(): string {
    if (!this.userName) return '?';
    const firstChar = this.userName.charAt(0).toUpperCase();
    return firstChar || '?';
  }
}
