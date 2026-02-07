import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ItemService, Item } from '../../../core/services/item';
import { BusinessService } from '../../../core/services/business';
import { StorageService } from '../../../core/services/storage';
import { NotificationService } from '../../../core/services/notification.service';
import { LucideAngularModule, Plus, Edit2, Trash2, Star, MessageSquare, Upload, X, IndianRupee, ImageIcon, ArrowLeft, Package } from 'lucide-angular';
import { BreadcrumbsComponent, Crumb } from '../../../shared/components/breadcrumbs/breadcrumbs';

@Component({
  selector: 'app-item-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, BreadcrumbsComponent],
  templateUrl: './item-management.html',
  styleUrl: './item-management.scss'
})
export class ItemManagementComponent implements OnInit, OnDestroy {
  // Lucide icons
  readonly Plus = Plus;
  readonly Edit2 = Edit2;
  readonly Trash2 = Trash2;
  readonly Star = Star;
  readonly MessageSquare = MessageSquare;
  readonly Upload = Upload;
  readonly X = X;
  readonly IndianRupee = IndianRupee;
  readonly ImageIcon = ImageIcon;
  readonly ArrowLeft = ArrowLeft;
  readonly Package = Package;

  items: Item[] = [];
  business: any = null;
  loading = false;
  businessId = '';
  showModal = false;
  editMode = false;
  currentItem: any = null;
  
  itemForm = {
    name: '',
    description: '',
    price: 0,
    category: ''
  };
  
  selectedFiles: File[] = [];
  imagePreviewUrls: string[] = [];
  existingImageUrls: string[] = []; // Track existing images separately

  constructor(
    private itemService: ItemService,
    private businessService: BusinessService,
    private storage: StorageService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  private onOpenAddItem = () => this.openAddModal();

  ngOnInit() {
    // Get businessId from route parameter
    if (typeof window !== 'undefined') {
      window.addEventListener('open-add-item', this.onOpenAddItem);
    }

    this.route.params.subscribe(params => {
      this.businessId = params['businessId'];
      if (this.businessId) {
        this.loadBusiness();
        this.loadItems();
      } else {
        this.notificationService.showError('Business ID not found');
        this.router.navigate(['/business/dashboard/businesses']);
      }
    });
  }
  
  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('open-add-item', this.onOpenAddItem);
    }
  }
  
  loadBusiness() {
    this.businessService.getBusinessById(this.businessId).subscribe({
      next: (response: any) => {
        this.business = response.data || response;
      },
      error: (err) => {
        console.error('Error fetching business:', err);
        this.notificationService.showError('Failed to load business');
      }
    });
  }

  loadItems() {
    if (!this.businessId) {
      this.loading = false;
      return;
    }
    this.loading = true;
    this.itemService.getItemsByBusiness(this.businessId).subscribe({
      next: (response: any) => {
        console.log('Full API response:', response);
        const data = response.data || response;
        console.log('Extracted data:', data);
        this.items = data.items || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading items:', err);
        this.loading = false;
      }
    });
  }
  
  openAddModal() {
    if (!this.businessId) {
      this.notificationService.showError('Please create a business first');
      return;
    }
    this.editMode = false;
    this.resetForm();
    this.showModal = true;
  }
  
  openEditModal(item: Item) {
    this.editMode = true;
    this.currentItem = item;
    this.itemForm = {
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category
    };
    this.existingImageUrls = [...(item.images || [])];
    this.imagePreviewUrls = [...(item.images || [])];
    this.selectedFiles = [];
    this.showModal = true;
  }
  
  closeModal() {
    this.showModal = false;
    this.resetForm();
  }
  
  resetForm() {
    this.itemForm = { name: '', description: '', price: 0, category: '' };
    this.selectedFiles = [];
    this.imagePreviewUrls = [];
    this.existingImageUrls = [];
  }
  
  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.startsWith('image/')) {
        this.notificationService.showError(`${file.name} is not an image`);
        continue;
      }
      
      if (file.size > maxSize) {
        this.notificationService.showError(`${file.name} is too large (max 5MB)`);
        continue;
      }
      
      this.selectedFiles.push(file);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviewUrls.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }
  
  removeImage(index: number) {
    const removedUrl = this.imagePreviewUrls[index];
    
    // Check if it's an existing image URL or a new file preview
    const existingIndex = this.existingImageUrls.indexOf(removedUrl);
    if (existingIndex !== -1) {
      // Remove from existing images
      this.existingImageUrls.splice(existingIndex, 1);
    } else {
      // It's a new file, find and remove from selectedFiles
      // The new files are at the end of imagePreviewUrls array
      const newFileIndex = index - (this.imagePreviewUrls.length - this.selectedFiles.length);
      if (newFileIndex >= 0) {
        this.selectedFiles.splice(newFileIndex, 1);
      }
    }
    
    this.imagePreviewUrls.splice(index, 1);
  }
  
  goBack() {
    this.router.navigate(['/business/dashboard/businesses']);
  }

  getItemImage(item: Item): string {
    if (item.images && item.images.length > 0) {
      const imageUrl = item.images[0];
      // Add cache busting for updated items
      if (item.updatedAt) {
        const timestamp = new Date(item.updatedAt).getTime();
        return `${imageUrl}?t=${timestamp}`;
      }
      return imageUrl;
    }
    return '';
  }

  onItemImageError(event: any): void {
    event.target.src = this.getDefaultItemImage();
  }

  getDefaultItemImage(): string {
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#f97316;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#grad)"/>
        <g transform="translate(150, 90)">
          <path d="M 50 20 L 80 50 L 80 100 L 20 100 L 20 50 Z M 35 60 L 35 90 L 65 90 L 65 60 M 40 70 L 40 80 L 50 80 L 50 70 Z" 
                fill="white" opacity="0.9" stroke="white" stroke-width="2"/>
        </g>
        <text x="200" y="200" font-family="Arial, sans-serif" font-size="18" fill="white" text-anchor="middle" font-weight="600">No Image Available</text>
      </svg>
    `);
  }
  
  saveItem() {
    if (!this.businessId) {
      this.notificationService.showError('Please set business ID first');
      return;
    }
    if (!this.itemForm.name || !this.itemForm.price) {
      this.notificationService.showError('Name and price required');
      return;
    }
    
    // Check if we have new files to upload
    const hasNewFiles = this.selectedFiles.length > 0;
    
    let requestData: any;
    
    if (hasNewFiles) {
      // Use FormData when uploading new images
      const formData = new FormData();
      formData.append('name', this.itemForm.name);
      formData.append('description', this.itemForm.description || '');
      formData.append('price', this.itemForm.price.toString());
      formData.append('category', this.itemForm.category || '');
      
      // In edit mode, send existing image URLs that should be kept
      if (this.editMode && this.existingImageUrls.length > 0) {
        formData.append('existingImages', JSON.stringify(this.existingImageUrls));
      }
      
      // Append new image files
      this.selectedFiles.forEach(file => formData.append('images', file));
      
      requestData = formData;
    } else {
      // Use JSON when no new images (update text fields only)
      requestData = {
        name: this.itemForm.name,
        description: this.itemForm.description || '',
        price: this.itemForm.price,
        category: this.itemForm.category || '',
        images: this.existingImageUrls
      };
    }
    
    if (this.editMode && this.currentItem) {
      this.itemService.updateItem(this.currentItem._id, requestData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Item updated!');
          this.closeModal();
          this.loadItems();
        },
        error: (err) => {
          const message = err.error?.message || err.message || 'Update failed';
          this.notificationService.showError(message);
        }
      });
    } else {
      this.itemService.createItem(this.businessId, requestData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Item added!');
          this.closeModal();
          this.loadItems();
        },
        error: (err) => {
          const message = err.error?.message || err.message || 'Add failed';
          this.notificationService.showError(message);
        }
      });
    }
  }
}
