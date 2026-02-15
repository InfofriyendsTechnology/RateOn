import { Component, OnInit, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { LocationService, Country, State, City } from '../../../core/services/location.service';

export interface LocationData {
  country: string;
  countryCode: string;
  state: string;
  stateCode: string;
  city: string;
  latitude?: number;
  longitude?: number;
}

@Component({
  selector: 'app-location-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './location-selector.component.html',
  styleUrls: ['./location-selector.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LocationSelectorComponent),
      multi: true
    }
  ]
})
export class LocationSelectorComponent implements OnInit, ControlValueAccessor {
  @Input() autoDetect = true;
  @Input() required = false;
  @Output() locationChange = new EventEmitter<LocationData>();

  countries: Country[] = [];
  states: State[] = [];
  cities: City[] = [];

  selectedCountry: string = '';
  selectedState: string = '';
  selectedCity: string = '';

  loadingCountries = false;
  loadingStates = false;
  loadingCities = false;
  detectingLocation = false;

  disabled = false;

  private onChange: (value: LocationData | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private locationService: LocationService) {}

  ngOnInit(): void {
    this.loadCountries();
    
    if (this.autoDetect) {
      this.detectLocation();
    }
  }

  /**
   * Load all countries
   */
  loadCountries(): void {
    this.loadingCountries = true;
    this.locationService.getCountries().subscribe({
      next: (response) => {
        if (response.success) {
          this.countries = response.data;
        }
        this.loadingCountries = false;
      },
      error: (error) => {
        this.loadingCountries = false;
      }
    });
  }

  /**
   * Handle country selection change
   */
  onCountryChange(): void {
    // Reset dependent fields
    this.selectedState = '';
    this.selectedCity = '';
    this.states = [];
    this.cities = [];

    if (this.selectedCountry) {
      this.loadStates(this.selectedCountry);
    }

    this.emitLocationChange();
  }

  /**
   * Load states for selected country
   */
  loadStates(countryCode: string): void {
    this.loadingStates = true;
    this.locationService.getStatesByCountry(countryCode).subscribe({
      next: (response) => {
        if (response.success) {
          this.states = response.data;
        }
        this.loadingStates = false;
      },
      error: (error) => {
        this.loadingStates = false;
      }
    });
  }

  /**
   * Handle state selection change
   */
  onStateChange(): void {
    // Reset dependent fields
    this.selectedCity = '';
    this.cities = [];

    if (this.selectedState && this.selectedCountry) {
      this.loadCities(this.selectedCountry, this.selectedState);
    }

    this.emitLocationChange();
  }

  /**
   * Load cities for selected state
   */
  loadCities(countryCode: string, stateCode: string): void {
    this.loadingCities = true;
    this.locationService.getCitiesByState(countryCode, stateCode).subscribe({
      next: (response) => {
        if (response.success) {
          this.cities = response.data;
        }
        this.loadingCities = false;
      },
      error: (error) => {
        this.loadingCities = false;
      }
    });
  }

  /**
   * Handle city selection change
   */
  onCityChange(): void {
    this.emitLocationChange();
  }

  /**
   * Auto-detect location from IP
   */
  detectLocation(): void {
    this.detectingLocation = true;
    this.locationService.detectLocationFromIP().subscribe({
      next: (response) => {
        if (response.success && response.data.success) {
          const locationData = response.data;
          
          // Set country
          this.selectedCountry = locationData.countryCode;
          
          // Load states and set detected state
          this.locationService.getStatesByCountry(locationData.countryCode).subscribe({
            next: (statesResponse) => {
              if (statesResponse.success) {
                this.states = statesResponse.data;
                this.selectedState = locationData.stateCode;
                
                // Load cities and set detected city
                this.locationService.getCitiesByState(locationData.countryCode, locationData.stateCode).subscribe({
                  next: (citiesResponse) => {
                    if (citiesResponse.success) {
                      this.cities = citiesResponse.data;
                      this.selectedCity = locationData.city;
                      this.emitLocationChange();
                    }
                  }
                });
              }
            }
          });
        }
        this.detectingLocation = false;
      },
      error: (error) => {
        this.detectingLocation = false;
      }
    });
  }

  /**
   * Emit location change event
   */
  private emitLocationChange(): void {
    const country = this.countries.find(c => c.isoCode === this.selectedCountry);
    const state = this.states.find(s => s.isoCode === this.selectedState);
    const city = this.cities.find(c => c.name === this.selectedCity);

    if (this.selectedCountry && country) {
      const locationData: LocationData = {
        country: country.name,
        countryCode: country.isoCode,
        state: state?.name || '',
        stateCode: state?.isoCode || '',
        city: this.selectedCity,
        latitude: city ? parseFloat(city.latitude) : undefined,
        longitude: city ? parseFloat(city.longitude) : undefined
      };

      this.locationChange.emit(locationData);
      this.onChange(locationData);
    } else {
      this.onChange(null);
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: LocationData | null): void {
    if (value) {
      this.selectedCountry = value.countryCode || '';
      this.selectedState = value.stateCode || '';
      this.selectedCity = value.city || '';

      if (this.selectedCountry) {
        this.loadStates(this.selectedCountry);
      }

      if (this.selectedCountry && this.selectedState) {
        this.loadCities(this.selectedCountry, this.selectedState);
      }
    }
  }

  registerOnChange(fn: (value: LocationData | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
