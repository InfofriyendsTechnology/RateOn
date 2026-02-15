import { Component, Input, OnInit, AfterViewInit, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

export interface UserLocation {
  userId: string;
  username: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
}

@Component({
  selector: 'app-user-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-map.component.html',
  styleUrl: './user-map.component.scss'
})
export class UserMapComponent implements AfterViewInit, OnChanges {
  @Input() locations: UserLocation[] = [];
  @Input() loading: boolean = false;
  @Input() height: string = '500px';
  
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef<HTMLDivElement>;
  
  private map?: L.Map;
  private markers: L.Marker[] = [];

  ngAfterViewInit(): void {
    if (!this.loading && this.locations.length > 0) {
      this.initializeMap();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.map && !this.loading && this.locations.length > 0) {
      this.updateMarkers();
    } else if (this.map && this.locations.length === 0) {
      this.clearMarkers();
    } else if (!this.loading && this.locations.length > 0 && !this.map) {
      this.initializeMap();
    }
  }

  private initializeMap(): void {
    if (!this.mapContainer || this.map) return;

    // Initialize map centered on world
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [20, 0],
      zoom: 2,
      scrollWheelZoom: false
    });

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    // Add markers
    this.updateMarkers();
  }

  private updateMarkers(): void {
    if (!this.map) return;

    // Clear existing markers
    this.clearMarkers();

    // Create custom icon
    const customIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Add markers for each location
    this.locations.forEach(location => {
      if (location.latitude && location.longitude) {
        const marker = L.marker([location.latitude, location.longitude], { icon: customIcon })
          .bindPopup(`
            <div class="map-popup">
              <strong>${location.username}</strong><br>
              ${location.city ? location.city + ', ' : ''}
              ${location.state ? location.state + ', ' : ''}
              ${location.country || ''}
            </div>
          `);

        if (this.map) {
          marker.addTo(this.map);
          this.markers.push(marker);
        }
      }
    });

    // Fit bounds to show all markers
    if (this.markers.length > 0) {
      const group = L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
  }

  private clearMarkers(): void {
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }
}
