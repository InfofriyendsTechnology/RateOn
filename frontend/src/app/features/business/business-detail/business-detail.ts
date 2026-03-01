import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule, MapPin, Phone, Globe, Star, ArrowLeft, Clock, Building, Edit, Package, ImageIcon, ChevronUp, Info, MessageSquare, Eye } from 'lucide-angular';
import { BreadcrumbsComponent } from '../../../shared/components/breadcrumbs/breadcrumbs';
import { BusinessService } from '../../../core/services/business';

@Component({
  selector: 'app-business-detail',
  standalone: true,
imports: [CommonModule, RouterLink, LucideAngularModule, BreadcrumbsComponent],
  templateUrl: './business-detail.html',
  styleUrl: './business-detail.scss',
})
export class BusinessDetail implements OnInit {
  loading = true;
  business: any = null;
  showAllPhotos = false;
  showAllHours = false;
  readonly MapPin = MapPin;
  readonly Phone = Phone;
  readonly Globe = Globe;
  readonly Star = Star;
  readonly ArrowLeft = ArrowLeft;
  readonly Clock = Clock;
  readonly Building = Building;
  readonly Edit = Edit;
  readonly Package = Package;
  readonly ImageIcon = ImageIcon;
  readonly ChevronUp = ChevronUp;
  readonly Info = Info;
  readonly MessageSquare = MessageSquare;
  readonly Eye = Eye;
  readonly Math = Math;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private businessService: BusinessService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') || '';
    if (id) {
      this.businessService.getBusinessById(id).subscribe({
        next: (resp: any) => {
          const data = resp.data || resp;
          this.business = data.business || data;
          this.loading = false;
        },
      error: () => { this.loading = false; }
      });
    } else {
      this.loading = false;
    }
  }
  
  goBack() {
    this.router.navigate(['/owner/businesses']);
  }
  
  getStarFill(starPosition: number, rating: number): string {
    if (starPosition <= rating) {
      return 'currentColor';
    }
    return 'none';
  }
  
  getStarColor(starPosition: number, rating: number): string {
    if (starPosition <= rating) {
      return '#f59e0b'; // Gold color for filled stars
    }
    return '#d1d5db'; // Gray color for empty stars
  }
  
  // Convert 24-hour time to 12-hour with AM/PM
  formatTime(time24: string): string {
    if (!time24) return '';
    
    const [hourStr, minute] = time24.split(':');
    const hour = parseInt(hourStr, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    
    return `${hour12}:${minute} ${period}`;
  }
}
