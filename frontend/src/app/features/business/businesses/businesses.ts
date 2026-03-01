import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { StorageService } from '../../../core/services/storage';
import { BusinessService } from '../../../core/services/business';
import { ToastService } from '../../../core/services/toast';
import { BusinessStateService } from '../../../core/services/business-state.service';
import { LucideAngularModule, ShoppingBag, MapPin, Phone, Star, Plus, Edit, X, ArrowLeft, Package, MessageSquare, Eye, Trash2, AlertTriangle, Image as ImageIcon } from 'lucide-angular';
import { BreadcrumbsComponent } from '../../../shared/components/breadcrumbs/breadcrumbs';

@Component({
  selector: 'app-businesses',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, BreadcrumbsComponent],
  templateUrl: './businesses.html',
  styleUrl: './businesses.scss'
})
export class BusinessesComponent implements OnInit, OnDestroy {
  private subs = new Subscription();
  // Lucide Icons
  readonly ShoppingBag = ShoppingBag;
  readonly MapPin = MapPin;
  readonly Phone = Phone;
  readonly Star = Star;
  readonly Plus = Plus;
  readonly Edit = Edit;
  readonly X = X;
  readonly ArrowLeft = ArrowLeft;
  readonly Package = Package;
  readonly MessageSquare = MessageSquare;
  readonly Eye = Eye;
  readonly Trash2 = Trash2;
  readonly AlertTriangle = AlertTriangle;
  readonly ImageIcon = ImageIcon;
  
  user: any = null;
  businesses: any[] = [];
  loadingBusinesses = false;
  
  // Delete modal
  showDeleteModal = false;
  businessToDelete: any = null;
  deleteConfirmationText = '';
  deletingBusiness = false;

  constructor(
    private storage: StorageService,
    private businessService: BusinessService,
    private toastService: ToastService,
    private businessStateService: BusinessStateService
  ) {}
  
  ngOnInit() {
    this.user = this.storage.getUser();
    this.loadBusinesses();

    // Instantly show business created from dashboard modal (works even when already on this route)
    this.subs.add(
      this.businessStateService.businessCreated$.subscribe(biz => {
        if (biz?._id && !this.businesses.find((b: any) => b._id === biz._id)) {
          this.businesses = [biz, ...this.businesses];
        }
      })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
  
  loadBusinesses() {
    // Only show spinner if list is empty (avoid flash when pre-populated)
    if (!this.businesses.length) {
      this.loadingBusinesses = true;
    }
    const userId = this.user?._id || this.user?.id;
    
    if (!userId) {
      this.loadingBusinesses = false;
      return;
    }
    
    this.businessService.getBusinesses({ owner: userId, _nocache: Date.now() }).subscribe({
      next: (response: any) => {
        const data = response.data || response;
        this.businesses = data.businesses || data || [];
        this.loadingBusinesses = false;
      },
      error: (err) => {
        this.loadingBusinesses = false;
      }
    });
  }
  
  openDeleteModal(business: any) {
    this.businessToDelete = business;
    this.deleteConfirmationText = '';
    this.showDeleteModal = true;
  }
  
  closeDeleteModal() {
    this.showDeleteModal = false;
    this.businessToDelete = null;
    this.deleteConfirmationText = '';
  }
  
  confirmDeleteBusiness() {
    if (!this.businessToDelete || this.deleteConfirmationText !== this.businessToDelete.name) {
      return;
    }
    
    this.deletingBusiness = true;
    
    this.businessService.deleteBusiness(this.businessToDelete._id).subscribe({
      next: () => {
        this.toastService.success(`${this.businessToDelete.name} has been deleted successfully`);
        this.closeDeleteModal();
        this.loadBusinesses();
      },
      error: (err) => {
        this.toastService.error('Failed to delete business. Please try again.');
        this.deletingBusiness = false;
      },
      complete: () => {
        this.deletingBusiness = false;
      }
    });
  }
}
