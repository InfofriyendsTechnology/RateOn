import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type RatingSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-rating-stars',
  standalone: true,
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
  
  // Get fill percentage for half stars
  getStarFillPercentage(star: number): number {
    const effectiveRating = this.readonly ? this.rating : (this.hoveredRating || this.rating);
    const diff = effectiveRating - (star - 1);
    
    // Debug logging
    if (star === 1 && effectiveRating > 0 && effectiveRating < 5) {
      console.log('Rating:', effectiveRating, 'Star:', star, 'Diff:', diff, 'Fill %:', diff * 100);
    }
    
    if (diff >= 1) return 100; // Fully filled
    if (diff <= 0) return 0;   // Empty
    return diff * 100;         // Partial fill (0-100%)
  }
  
  // Interaction handlers - support half stars on click
  onStarClick(star: number, event?: MouseEvent): void {
    if (this.readonly) return;
    
    // Allow half star selection by clicking left half of star
    let rating = star;
    if (event && !this.readonly) {
      const target = event.target as HTMLElement;
      const rect = target.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const starWidth = rect.width;
      
      // If clicked on left half, give half star
      if (clickX < starWidth / 2) {
        rating = star - 0.5;
      }
    }
    
    this.rating = rating;
    this.ratingChange.emit(rating);
    this.onChange(rating);
    this.onTouched();
  }
  
  onStarHover(star: number, event?: MouseEvent): void {
    if (this.readonly) return;
    
    // Show half star hover on left half
    let hoverRating = star;
    if (event) {
      const target = event.target as HTMLElement;
      const rect = target.getBoundingClientRect();
      const hoverX = event.clientX - rect.left;
      const starWidth = rect.width;
      
      if (hoverX < starWidth / 2) {
        hoverRating = star - 0.5;
      }
    }
    
    this.hoveredRating = hoverRating;
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
