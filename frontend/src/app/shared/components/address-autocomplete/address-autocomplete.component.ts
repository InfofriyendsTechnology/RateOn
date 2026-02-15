import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, forwardRef, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

declare const google: any;

export interface PlaceResult {
  address: string;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  formattedAddress?: string;
}

@Component({
  selector: 'app-address-autocomplete',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="address-autocomplete">
      <label *ngIf="label" [for]="inputId" class="form-label">
        {{ label }}
        <span class="required" *ngIf="required">*</span>
      </label>
      <input
        #addressInput
        [id]="inputId"
        type="text"
        class="form-control"
        [placeholder]="placeholder"
        [(ngModel)]="inputValue"
        (blur)="onTouched()"
        [disabled]="disabled"
        [required]="required"
        autocomplete="off"
      />
      <small *ngIf="helperText" class="helper-text">{{ helperText }}</small>
    </div>
  `,
  styles: [`
    .address-autocomplete {
      width: 100%;

      .form-label {
        display: block;
        margin-bottom: 0.375rem;
        font-weight: 500;
        font-size: 0.875rem;
        color: #374151;

        .required {
          color: #ef4444;
          margin-left: 0.125rem;
        }
      }

      .form-control {
        width: 100%;
        padding: 0.625rem 0.75rem;
        font-size: 0.875rem;
        line-height: 1.5;
        color: #1f2937;
        background-color: #ffffff;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

        &:focus {
          outline: 0;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        &:disabled {
          background-color: #f3f4f6;
          cursor: not-allowed;
          opacity: 0.6;
        }
      }

      .helper-text {
        display: block;
        margin-top: 0.25rem;
        font-size: 0.75rem;
        color: #6b7280;
      }
    }

    // Google Places dropdown styling
    :host ::ng-deep .pac-container {
      border-radius: 0.375rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      margin-top: 0.25rem;
      font-family: inherit;
    }

    :host ::ng-deep .pac-item {
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      cursor: pointer;
      border-top: none;

      &:hover {
        background-color: #f3f4f6;
      }
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AddressAutocompleteComponent),
      multi: true
    }
  ]
})
export class AddressAutocompleteComponent implements OnInit, ControlValueAccessor {
  @ViewChild('addressInput', { static: false }) addressInput!: ElementRef;

  @Input() label = '';
  @Input() placeholder = 'Enter address';
  @Input() helperText = '';
  @Input() required = false;
  @Input() inputId = 'address-input';
  
  @Output() placeSelected = new EventEmitter<PlaceResult>();

  inputValue = '';
  disabled = false;
  private autocomplete: any;
  private isBrowser: boolean;

  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    // Google Places Autocomplete will be initialized after view is ready
  }

  ngAfterViewInit(): void {
    if (this.isBrowser && this.addressInput) {
      this.initAutocomplete();
    }
  }

  /**
   * Initialize Google Places Autocomplete
   */
  private initAutocomplete(): void {
    // Check if Google Maps API is loaded
    if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
      return;
    }

    try {
      this.autocomplete = new google.maps.places.Autocomplete(
        this.addressInput.nativeElement,
        {
          types: ['address'],
          fields: ['address_components', 'formatted_address', 'geometry', 'name']
        }
      );

      this.autocomplete.addListener('place_changed', () => {
        const place = this.autocomplete.getPlace();
        
        if (!place.geometry) {
          return;
        }

        const result = this.extractPlaceData(place);
        this.inputValue = result.formattedAddress || '';
        this.onChange(this.inputValue);
        this.placeSelected.emit(result);
      });
    } catch (error) {
    }
  }

  /**
   * Extract relevant data from Google Places result
   */
  private extractPlaceData(place: any): PlaceResult {
    const result: PlaceResult = {
      address: place.formatted_address || '',
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      formattedAddress: place.formatted_address || ''
    };

    // Extract address components
    if (place.address_components) {
      for (const component of place.address_components) {
        const types = component.types;

        if (types.includes('locality')) {
          result.city = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
          result.state = component.long_name;
        }
        if (types.includes('country')) {
          result.country = component.long_name;
        }
        if (types.includes('postal_code')) {
          result.postalCode = component.long_name;
        }
      }
    }

    return result;
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.inputValue = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
