import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StorageService } from '../../../core/services/storage';
import { BusinessService } from '../../../core/services/business';
import { LucideAngularModule, ShoppingBag, MapPin, Phone, Star, Plus, Edit } from 'lucide-angular';

@Component({
  selector: 'app-businesses',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './businesses.html',
  styleUrl: './businesses.scss'
})
export class BusinessesComponent implements OnInit {
  // Lucide Icons
  readonly ShoppingBag = ShoppingBag;
  readonly MapPin = MapPin;
  readonly Phone = Phone;
  readonly Star = Star;
  readonly Plus = Plus;
  readonly Edit = Edit;
  
  user: any = null;
  businesses: any[] = [];
  loadingBusinesses = false;

  constructor(
    private storage: StorageService,
    private businessService: BusinessService
  ) {}
  
  ngOnInit() {
    this.user = this.storage.getUser();
    this.loadBusinesses();
  }
  
  loadBusinesses() {
    this.loadingBusinesses = true;
    const userId = this.user?._id || this.user?.id;
    
    if (!userId) {
      this.loadingBusinesses = false;
      return;
    }
    
    this.businessService.getBusinesses({ owner: userId }).subscribe({
      next: (response: any) => {
        const data = response.data || response;
        this.businesses = data.businesses || data || [];
        this.loadingBusinesses = false;
      },
      error: (err) => {
        console.error('Failed to load businesses:', err);
        this.loadingBusinesses = false;
      }
    });
  }
}
