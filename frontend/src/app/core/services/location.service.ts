import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Country {
  isoCode: string;
  name: string;
  phonecode: string;
  flag: string;
  currency: string;
  latitude: string;
  longitude: string;
}

export interface State {
  isoCode: string;
  name: string;
  countryCode: string;
  latitude: string;
  longitude: string;
}

export interface City {
  name: string;
  stateCode: string;
  countryCode: string;
  latitude: string;
  longitude: string;
}

export interface LocationFromIP {
  success: boolean;
  country: string;
  countryCode: string;
  state: string;
  stateCode: string;
  city: string;
  latitude: number;
  longitude: number;
  ip?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = `${environment.apiUrl}/locations`;

  constructor(private http: HttpClient) {}

  /**
   * Get all countries
   */
  getCountries(): Observable<ApiResponse<Country[]>> {
    return this.http.get<ApiResponse<Country[]>>(`${this.apiUrl}/countries`);
  }

  /**
   * Get states by country code
   * @param countryCode ISO code of the country (e.g., 'US', 'IN')
   */
  getStatesByCountry(countryCode: string): Observable<ApiResponse<State[]>> {
    const params = new HttpParams().set('country', countryCode);
    return this.http.get<ApiResponse<State[]>>(`${this.apiUrl}/states`, { params });
  }

  /**
   * Get cities by country and state code
   * @param countryCode ISO code of the country (e.g., 'US', 'IN')
   * @param stateCode ISO code of the state (e.g., 'CA', 'MH')
   */
  getCitiesByState(countryCode: string, stateCode: string): Observable<ApiResponse<City[]>> {
    const params = new HttpParams()
      .set('country', countryCode)
      .set('state', stateCode);
    return this.http.get<ApiResponse<City[]>>(`${this.apiUrl}/cities`, { params });
  }

  /**
   * Detect location from user's IP address
   * @param ipAddress Optional IP address to detect (for testing). If not provided, uses user's actual IP
   */
  detectLocationFromIP(ipAddress?: string): Observable<ApiResponse<LocationFromIP>> {
    const body = ipAddress ? { ipAddress } : {};
    return this.http.post<ApiResponse<LocationFromIP>>(`${this.apiUrl}/detect-ip`, body);
  }
}
