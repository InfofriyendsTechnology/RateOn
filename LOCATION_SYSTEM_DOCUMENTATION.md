# Location System Documentation

## Overview
The location system provides cascading location selectors (Country → State → City) with IP-based auto-detection and Google Places autocomplete functionality.

---

## Backend Implementation

### API Endpoints

All endpoints are prefixed with `/api/v1/locations`

#### 1. Get Countries
```
GET /api/v1/locations/countries
```
Returns all available countries with their ISO codes, flags, and coordinates.

**Response:**
```json
{
  "success": true,
  "message": "Countries retrieved successfully",
  "data": [
    {
      "isoCode": "US",
      "name": "United States",
      "phonecode": "+1",
      "flag": "🇺🇸",
      "currency": "USD",
      "latitude": "38.00000000",
      "longitude": "-97.00000000"
    }
  ]
}
```

#### 2. Get States by Country
```
GET /api/v1/locations/states?country=US
```
Returns all states for a given country.

**Query Parameters:**
- `country` (required): ISO code of the country (e.g., 'US', 'IN')

**Response:**
```json
{
  "success": true,
  "message": "States retrieved successfully",
  "data": [
    {
      "isoCode": "CA",
      "name": "California",
      "countryCode": "US",
      "latitude": "36.77826100",
      "longitude": "-119.41793240"
    }
  ]
}
```

#### 3. Get Cities by State
```
GET /api/v1/locations/cities?country=US&state=CA
```
Returns all cities for a given state.

**Query Parameters:**
- `country` (required): ISO code of the country
- `state` (required): ISO code of the state

**Response:**
```json
{
  "success": true,
  "message": "Cities retrieved successfully",
  "data": [
    {
      "name": "Los Angeles",
      "stateCode": "CA",
      "countryCode": "US",
      "latitude": "34.05223400",
      "longitude": "-118.24368490"
    }
  ]
}
```

#### 4. Detect Location from IP
```
POST /api/v1/locations/detect-ip
```
Automatically detects user's location based on their IP address.

**Request Body (optional):**
```json
{
  "ipAddress": "8.8.8.8"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Location detected successfully",
  "data": {
    "success": true,
    "country": "United States",
    "countryCode": "US",
    "state": "California",
    "stateCode": "CA",
    "city": "Mountain View",
    "latitude": 37.386,
    "longitude": -122.0838,
    "ip": "8.8.8.8"
  }
}
```

---

## Frontend Implementation

### 1. Location Service

**Path:** `frontend/src/app/core/services/location.service.ts`

The `LocationService` provides methods to interact with the location API.

**Usage:**
```typescript
import { LocationService } from './core/services/location.service';

constructor(private locationService: LocationService) {}

// Get all countries
this.locationService.getCountries().subscribe(response => {
  console.log(response.data);
});

// Get states by country
this.locationService.getStatesByCountry('US').subscribe(response => {
  console.log(response.data);
});

// Get cities by state
this.locationService.getCitiesByState('US', 'CA').subscribe(response => {
  console.log(response.data);
});

// Detect location from IP
this.locationService.detectLocationFromIP().subscribe(response => {
  console.log(response.data);
});
```

---

### 2. Location Selector Component

**Path:** `frontend/src/app/shared/components/location-selector/`

A reusable component with cascading dropdowns for Country → State → City selection.

#### Features:
- Automatic IP-based location detection
- Cascading dropdowns (selecting country loads states, selecting state loads cities)
- Form control integration (works with Angular Forms)
- Loading states for each dropdown
- Option to manually re-detect location

#### Usage:

**Standalone Usage:**
```typescript
import { LocationSelectorComponent } from './shared/components/location-selector/location-selector.component';

@Component({
  imports: [LocationSelectorComponent]
})
```

**Template:**
```html
<app-location-selector
  [autoDetect]="true"
  [required]="true"
  (locationChange)="onLocationChange($event)"
></app-location-selector>
```

**With Reactive Forms:**
```typescript
import { FormBuilder, FormGroup } from '@angular/forms';

form: FormGroup;

constructor(private fb: FormBuilder) {
  this.form = this.fb.group({
    location: [null]
  });
}
```

```html
<form [formGroup]="form">
  <app-location-selector
    formControlName="location"
    [autoDetect]="true"
    [required]="true"
  ></app-location-selector>
</form>
```

**Component Inputs:**
- `autoDetect: boolean` (default: `true`) - Auto-detect location on init
- `required: boolean` (default: `false`) - Mark fields as required

**Component Outputs:**
- `locationChange: EventEmitter<LocationData>` - Emits when location changes

**LocationData Interface:**
```typescript
interface LocationData {
  country: string;         // Full country name
  countryCode: string;     // ISO code (e.g., 'US')
  state: string;           // Full state name
  stateCode: string;       // ISO code (e.g., 'CA')
  city: string;            // City name
  latitude?: number;       // Optional coordinates
  longitude?: number;      // Optional coordinates
}
```

---

### 3. Address Autocomplete Component

**Path:** `frontend/src/app/shared/components/address-autocomplete/`

A component that integrates Google Places Autocomplete for address input.

#### Features:
- Google Places API integration
- Address suggestions as user types
- Extracts structured data (city, state, country, postal code, coordinates)
- Form control integration

#### Prerequisites:

Add Google Maps API script to `index.html`:
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>
```

#### Usage:

**Standalone Usage:**
```typescript
import { AddressAutocompleteComponent } from './shared/components/address-autocomplete/address-autocomplete.component';

@Component({
  imports: [AddressAutocompleteComponent]
})
```

**Template:**
```html
<app-address-autocomplete
  label="Business Address"
  placeholder="Start typing address..."
  helperText="Search for your business address"
  [required]="true"
  (placeSelected)="onPlaceSelected($event)"
></app-address-autocomplete>
```

**TypeScript:**
```typescript
onPlaceSelected(place: PlaceResult) {
  console.log('Selected address:', place.address);
  console.log('Coordinates:', place.lat, place.lng);
  console.log('City:', place.city);
  console.log('State:', place.state);
  console.log('Country:', place.country);
}
```

**Component Inputs:**
- `label: string` - Label text
- `placeholder: string` - Placeholder text
- `helperText: string` - Helper text below input
- `required: boolean` - Mark as required
- `inputId: string` - Custom input ID

**Component Outputs:**
- `placeSelected: EventEmitter<PlaceResult>` - Emits when place is selected

**PlaceResult Interface:**
```typescript
interface PlaceResult {
  address: string;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  formattedAddress?: string;
}
```

---

## Integration Examples

### User Registration Form

```typescript
export class RegistrationComponent {
  registrationForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.registrationForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      location: [null, Validators.required]
    });
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      const userData = this.registrationForm.value;
      console.log('User location:', userData.location);
      // Submit to API
    }
  }
}
```

```html
<form [formGroup]="registrationForm" (ngSubmit)="onSubmit()">
  <input type="text" formControlName="username" />
  <input type="email" formControlName="email" />
  
  <app-location-selector
    formControlName="location"
    [autoDetect]="true"
    [required]="true"
  ></app-location-selector>
  
  <button type="submit">Register</button>
</form>
```

### Business Registration Form

```typescript
export class BusinessRegistrationComponent {
  businessForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.businessForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      coordinates: this.fb.group({
        lat: [null],
        lng: [null]
      })
    });
  }

  onAddressSelected(place: PlaceResult) {
    this.businessForm.patchValue({
      address: place.formattedAddress,
      coordinates: {
        lat: place.lat,
        lng: place.lng
      }
    });
  }
}
```

```html
<form [formGroup]="businessForm">
  <input type="text" formControlName="name" placeholder="Business Name" />
  
  <app-address-autocomplete
    label="Business Address"
    placeholder="Search for address..."
    [required]="true"
    (placeSelected)="onAddressSelected($event)"
  ></app-address-autocomplete>
  
  <button type="submit">Register Business</button>
</form>
```

---

## Technical Details

### Backend Dependencies
- `country-state-city`: Provides country, state, and city data
- `fetch` API: Used for IP geolocation (built-in Node.js)

### IP Geolocation
- Uses **ip-api.com** (free tier: 45 requests/minute)
- Automatically detects user's IP from request headers
- Handles localhost (127.0.0.1) gracefully with fallback IP

### Frontend Dependencies
- Angular 19+
- RxJS for reactive programming
- Google Maps JavaScript API (for address autocomplete)

---

## Testing

### Backend Testing with Postman/cURL

**Test Countries Endpoint:**
```bash
curl http://localhost:1126/api/v1/locations/countries
```

**Test States Endpoint:**
```bash
curl "http://localhost:1126/api/v1/locations/states?country=US"
```

**Test Cities Endpoint:**
```bash
curl "http://localhost:1126/api/v1/locations/cities?country=US&state=CA"
```

**Test IP Detection:**
```bash
curl -X POST http://localhost:1126/api/v1/locations/detect-ip \
  -H "Content-Type: application/json" \
  -d '{"ipAddress": "8.8.8.8"}'
```

### Frontend Testing

1. **Location Selector:**
   - Verify auto-detection on component load
   - Test cascading behavior (country → state → city)
   - Test manual re-detection button
   - Verify form integration

2. **Address Autocomplete:**
   - Verify Google Places suggestions appear
   - Test place selection
   - Verify extracted data (coordinates, city, state)

---

## Troubleshooting

### Backend Issues

**Issue: Countries not loading**
- Ensure `country-state-city` package is installed
- Check backend console for errors

**Issue: IP detection not working**
- Verify internet connection to ip-api.com
- Check if IP is valid (not localhost)
- Ensure fetch API is available

### Frontend Issues

**Issue: Location selector not appearing**
- Verify component is imported correctly
- Check browser console for errors
- Ensure LocationService is provided

**Issue: Google Places not working**
- Verify Google Maps script is loaded in index.html
- Check API key is valid and has Places API enabled
- Look for console warnings about API loading

**Issue: Cascading not working**
- Check network tab for API calls
- Verify country/state codes are correct
- Ensure proper data binding

---

## Future Enhancements

- Add caching for country/state/city data (reduce API calls)
- Implement offline mode with local data storage
- Add map visualization for selected location
- Support for multiple languages
- Add distance calculation between locations
- Implement location-based search/filtering

---

## Support

For issues or questions:
1. Check browser console for errors
2. Verify API endpoints are accessible
3. Review this documentation
4. Contact development team

---

**Created by:** Employee 7
**Date:** February 10, 2026
**Version:** 1.0.0
