import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Bell } from 'lucide-angular';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './notification-bell.html',
  styleUrl: './notification-bell.scss'
})
export class NotificationBellComponent {
  readonly Bell = Bell;

  @Input() count = 0;
  @Input() disabled = false;
  @Output() openPanel = new EventEmitter<void>();

  onClick() {
    if (!this.disabled) this.openPanel.emit();
  }
}
