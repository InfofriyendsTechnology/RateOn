import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton-loader.component.html',
  styleUrl: './skeleton-loader.component.scss'
})
export class SkeletonLoaderComponent {
  @Input() type: 'card' | 'list' | 'text' | 'avatar' | 'review' = 'card';
  @Input() count: number = 1;
  @Input() height: string = '';
  @Input() width: string = '';

  get items(): number[] {
    return Array(this.count).fill(0).map((_, i) => i);
  }
}
