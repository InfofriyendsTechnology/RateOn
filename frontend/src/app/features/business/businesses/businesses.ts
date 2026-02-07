import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StorageService } from '../../../core/services/storage';
import { BusinessService } from '../../../core/services/business';
import { ToastService } from '../../../core/services/toast';
import { LucideAngularModule, ShoppingBag, MapPin, Phone, Star, Plus, Edit, X, ArrowLeft, Package, MessageSquare, Eye, Trash2, AlertTriangle, Image as ImageIcon } from 'lucide-angular';
import { BreadcrumbsComponent } from '../../../shared/components/breadcrumbs/breadcrumbs';

@Component({
  selector: 'app-businesses',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, BreadcrumbsComponent],
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
  
  // Business modal
  showBusinessModal = false;
  currentBusinessStep = 1;
  totalBusinessSteps = 3;
  addingBusiness = false;
  businessForm = {
    name: '',
    type: '',
    category: '',
    city: '',
    state: '',
    address: '',
    phone: '',
    website: '',
    description: ''
  };
  
  // Delete modal
  showDeleteModal = false;
  businessToDelete: any = null;
  deleteConfirmationText = '';
  deletingBusiness = false;

  constructor(
    private storage: StorageService,
    private businessService: BusinessService,
    private toastService: ToastService
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
  
  openBusinessModal() {
    this.showBusinessModal = true;
    this.currentBusinessStep = 1;
    this.resetBusinessForm();
  }
  
  closeBusinessModal() {
    this.showBusinessModal = false;
    this.resetBusinessForm();
  }
  
  resetBusinessForm() {
    this.businessForm = {
      name: '',
      type: '',
      category: '',
      city: '',
      state: '',
      address: '',
      phone: '',
      website: '',
      description: ''
    };
    this.currentBusinessStep = 1;
  }
  
  nextBusinessStep() {
    if (this.currentBusinessStep === 1) {
      if (!this.businessForm.name || !this.businessForm.type) {
        this.toastService.error('Please fill in all required fields');
        return;
      }
    }
    
    if (this.currentBusinessStep === 2) {
      if (!this.businessForm.city || !this.businessForm.state || !this.businessForm.address) {
        this.toastService.error('Please fill in all required location fields');
        return;
      }
    }
    
    if (this.currentBusinessStep < this.totalBusinessSteps) {
      this.currentBusinessStep++;
    }
  }
  
  previousBusinessStep() {
    if (this.currentBusinessStep > 1) {
      this.currentBusinessStep--;
    }
  }
  
  addBusiness() {
    if (!this.businessForm.name || !this.businessForm.type || !this.businessForm.city || !this.businessForm.state || !this.businessForm.address) {
      this.toastService.error('Please fill in all required fields');
      return;
    }
    
    this.addingBusiness = true;
    
    const businessData = {
      name: this.businessForm.name,
      type: this.businessForm.type,
      category: this.businessForm.category || this.businessForm.type,
      location: {
        address: this.businessForm.address,
        city: this.businessForm.city,
        state: this.businessForm.state,
        country: 'India',
        coordinates: {
          coordinates: [0, 0]
        }
      },
      contact: {
        phone: this.businessForm.phone || '',
        website: this.businessForm.website || ''
      },
      description: this.businessForm.description || ''
    };
    
    this.businessService.createBusiness(businessData).subscribe({
      next: (response: any) => {
        this.toastService.success('Business created successfully!');
        this.closeBusinessModal();
        this.loadBusinesses();
      },
      error: (err) => {
        console.error('Failed to create business:', err);
        this.toastService.error('Failed to create business. Please try again.');
        this.addingBusiness = false;
      },
      complete: () => {
        this.addingBusiness = false;
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
        console.error('Failed to delete business:', err);
        this.toastService.error('Failed to delete business. Please try again.');
        this.deletingBusiness = false;
      },
      complete: () => {
        this.deletingBusiness = false;
      }
    });
  }
}
