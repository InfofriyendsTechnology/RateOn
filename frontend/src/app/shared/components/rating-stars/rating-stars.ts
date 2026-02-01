import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type RatingSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-rating-stars',
  imports: [CommonModule],
  templateUrl: './rating-stars.html',
  styleUrl: './rating-stars.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RatingStars),
      multi: true
    }
  ]
})
export class RatingStars implements ControlValueAccessor {
  @Input() rating: number = 0;
  @Input() size: RatingSize = 'medium';
  @Input() readonly: boolean = false;
  @Input() showCount: boolean = false;
  @Input() reviewCount: number = 0;
  @Output() ratingChange = new EventEmitter<number>();
  
  hoveredRating: number = 0;
  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};
  
  // ControlValueAccessor implementation
  writeValue(value: number): void {
    this.rating = value || 0;
  }
  
  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    this.readonly = isDisabled;
  }
  
  // Rating display
  getStars(): number[] {
    return [1, 2, 3, 4, 5];
  }
  
  getStarClass(star: number): string {
    const effectiveRating = this.readonly ? this.rating : (this.hoveredRating || this.rating);
    
    if (effectiveRating >= star) {
      return 'filled';
    } else if (effectiveRating >= star - 0.5) {
      return 'half';
    } else {
      return 'empty';
    }
  }
  
  // Interaction handlers
  onStarClick(star: number): void {
    if (this.readonly) return;
    
    this.rating = star;
    this.ratingChange.emit(star);
    this.onChange(star);
    this.onTouched();
  }
  
  onStarHover(star: number): void {
    if (this.readonly) return;
    this.hoveredRating = star;
  }
  
  onMouseLeave(): void {
    if (this.readonly) return;
    this.hoveredRating = 0;
  }
  
  // Utility
  getRatingText(): string {
    const formatted = this.rating.toFixed(1);
    return this.reviewCount > 0 
      ? `${formatted} (${this.reviewCount} ${this.reviewCount === 1 ? 'review' : 'reviews'})`
      : formatted;
  }
}
