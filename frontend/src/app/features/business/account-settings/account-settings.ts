import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth';
import { BusinessService } from '../../../core/services/business';
import { ToastService } from '../../../core/services/toast';
import { environment } from '../../../../environments/environment';
import { LucideAngularModule, User, Mail, Shield, CheckCircle, XCircle, Building, Edit, X, Save, Camera, MapPin, Phone, Globe, Clock, MessageCircle, AlertTriangle, Trash2 } from 'lucide-angular';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './account-settings.html',
  styleUrl: './account-settings.scss'
})
export class AccountSettingsComponent implements OnInit {
  user: any = null;
  business: any = null;
  loading = true;
  avatarFailed = false;
  
  // Profile edit mode
  isEditingProfile = false;
  editedProfile: any = {};
  avatarFile: File | null = null;
  avatarPreview: string | null = null;
  savingProfile = false;
  
  // Business edit mode
  isEditingBusiness = false;
  editedBusiness: any = {};
  logoFile: File | null = null;
  logoPreview: string | null = null;
  coverFiles: File[] = [];
  coverPreviews: string[] = [];
  savingBusiness = false;
  
  // Delete account
  showDeleteModal = false;
  deleteConfirmationText = '';
  deletingAccount = false;
  
  // Icons
  readonly User = User;
  readonly Mail = Mail;
  readonly Shield = Shield;
  readonly CheckCircle = CheckCircle;
  readonly XCircle = XCircle;
  readonly Building = Building;
  readonly Edit = Edit;
  readonly X = X;
  readonly Save = Save;
  readonly Camera = Camera;
  readonly MapPin = MapPin;
  readonly Phone = Phone;
  readonly Globe = Globe;
  readonly Clock = Clock;
  readonly MessageCircle = MessageCircle;
  readonly AlertTriangle = AlertTriangle;
  readonly Trash2 = Trash2;
  
  constructor(
    private authService: AuthService,
    private businessService: BusinessService,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService
  ) {}
  
  ngOnInit() {
    this.loadUserData();
  }
  
  loadUserData() {
    this.loading = true;
    // Get current user from auth service
    this.user = this.authService.getCurrentUser();
    
    if (this.user) {
      this.loadBusinessData();
    } else {
      console.error('No user found');
      this.loading = false;
    }
  }
  
  loadBusinessData() {
    // Try to get business ID from user object
    const businessId = this.user?.business?._id || 
                      this.user?.claimedBusiness?._id || 
                      this.user?.businessId ||
                      this.user?.business;
    
    if (businessId) {
      this.businessService.getBusinessById(businessId).subscribe({
        next: (response: any) => {
          const data = response.data || response;
          this.business = data.business || data;
          this.loading = false;
        },
        error: (err: any) => {
          console.error('Error loading business:', err);
          this.fetchUserBusinesses();
        }
      });
    } else {
      this.fetchUserBusinesses();
    }
  }
  
  fetchUserBusinesses() {
    this.businessService.getBusinesses({ owner: this.user._id }).subscribe({
      next: (response: any) => {
        const businesses = response.data?.businesses || response.businesses || [];
        if (businesses.length > 0) {
          this.business = businesses[0];
        }
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error fetching businesses:', err);
        this.loading = false;
      }
    });
  }
  
  startEditBusiness() {
    console.log('Edit business clicked!');
    this.isEditingBusiness = true;
    this.editedBusiness = {
      name: this.business?.name || '',
      type: this.business?.type || '',
      category: this.business?.category || '',
      subcategory: this.business?.subcategory || '',
      description: this.business?.description || '',
      location: {
        address: this.business?.location?.address || '',
        city: this.business?.location?.city || '',
        state: this.business?.location?.state || '',
        country: this.business?.location?.country || 'India',
        pincode: this.business?.location?.pincode || '',
        latitude: this.business?.location?.coordinates?.coordinates?.[1] || '',
        longitude: this.business?.location?.coordinates?.coordinates?.[0] || ''
      },
      contact: {
        phone: this.business?.contact?.phone || '',
        whatsapp: this.business?.contact?.whatsapp || '',
        email: this.business?.contact?.email || '',
        website: this.business?.contact?.website || ''
      },
      businessHours: this.business?.businessHours && this.business.businessHours.length > 0 
        ? JSON.parse(JSON.stringify(this.business.businessHours))
        : this.getDefaultBusinessHours()
    };
    this.logoPreview = this.business?.logo || null;
    this.coverPreviews = this.business?.coverImages ? [...this.business.coverImages] : [];
    this.logoFile = null;
    this.coverFiles = [];
  }
  
  cancelEditBusiness() {
    this.isEditingBusiness = false;
    this.editedBusiness = {};
    this.logoFile = null;
    this.logoPreview = null;
    this.coverFiles = [];
    this.coverPreviews = [];
  }
  
  getJoinedDate(): string {
    if (!this.user?.createdAt) return 'N/A';
    const date = new Date(this.user.createdAt);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  
  getOpenDaysCount(): number {
    if (!this.business?.businessHours) return 0;
    return this.business.businessHours.filter((h: any) => !h.isClosed).length;
  }
  
  // Convert 24-hour time to 12-hour AM/PM format for display
  formatTime12Hour(time24: string): string {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
  
  getDefaultBusinessHours() {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return days.map(day => ({
      day: day,
      open: '18:00',  // 6:00 PM
      close: '21:00', // 9:00 PM
      isClosed: false
    }));
  }
  
  getFullAddress(): string {
    if (!this.business?.location) return '';
    const loc = this.business.location;
    const parts = [
      loc.address,
      loc.city,
      loc.state,
      loc.pincode,
      loc.country
    ].filter(part => part); // Remove empty parts
    return parts.join(', ');
  }
  
  // Profile editing
  startEditProfile() {
    this.isEditingProfile = true;
    this.editedProfile = {
      firstName: this.user?.profile?.firstName || '',
      lastName: this.user?.profile?.lastName || ''
    };
    // Keep the current avatar visible in edit mode
    this.avatarPreview = this.user?.profile?.avatar || null;
    this.avatarFile = null;
  }
  
  cancelEditProfile() {
    this.isEditingProfile = false;
    this.editedProfile = {};
    this.avatarFile = null;
    this.avatarPreview = null;
  }
  
  onAvatarSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.toast.error('Avatar size must be less than 5MB');
        return;
      }
      
      this.avatarFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
  
  saveProfile() {
    this.savingProfile = true;
    
    const formData = new FormData();
    
    // Send flat field names as backend expects
    if (this.editedProfile.firstName !== undefined) {
      formData.append('firstName', this.editedProfile.firstName);
    }
    if (this.editedProfile.lastName !== undefined) {
      formData.append('lastName', this.editedProfile.lastName);
    }
    if (this.avatarFile) {
      formData.append('avatar', this.avatarFile);
    }
    
    this.http.put(`${environment.apiUrl}/user/profile`, formData).subscribe({
      next: (response: any) => {
        this.toast.success('Profile updated successfully!');
        // Update local user data from backend response
        const updatedUser = response.data?.user || response.user || response.data;
        if (updatedUser) {
          this.user = updatedUser;
          // Also update AuthService to persist across page reloads
          this.authService.updateCurrentUser(updatedUser);
        }
        this.isEditingProfile = false;
        this.avatarFile = null;
        this.avatarPreview = null;
        this.savingProfile = false;
      },
      error: (err: any) => {
        console.error('Profile update error:', err);
        const errorMessage = err.error?.message || err.message || 'Failed to update profile';
        this.toast.error(errorMessage);
        this.savingProfile = false;
      }
    });
  }
  
  // Business image uploads
  onLogoSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        this.toast.error('Logo size must be less than 5MB');
        return;
      }
      
      this.logoFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
  
  onCoverImagesSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      
      if (files.length > 5) {
        this.toast.error('Maximum 5 cover images allowed');
        return;
      }
      
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          this.toast.error('Each image must be less than 5MB');
          return;
        }
      }
      
      this.coverFiles = files;
      this.coverPreviews = [];
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.coverPreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }
  
  removeCoverPreview(index: number) {
    this.coverPreviews.splice(index, 1);
    if (this.coverFiles.length > 0) {
      const newFiles = Array.from(this.coverFiles);
      newFiles.splice(index, 1);
      this.coverFiles = newFiles;
    }
  }
  
  saveBusiness() {
    if (!this.business?._id) return;
    
    this.savingBusiness = true;
    
    // Prepare location object
    const location: any = {
      address: this.editedBusiness.location.address,
      city: this.editedBusiness.location.city,
      state: this.editedBusiness.location.state,
      country: this.editedBusiness.location.country,
      pincode: this.editedBusiness.location.pincode
    };
    
    // Add coordinates if both lat and long provided
    if (this.editedBusiness.location.latitude && this.editedBusiness.location.longitude) {
      location.coordinates = {
        type: 'Point',
        coordinates: [parseFloat(this.editedBusiness.location.longitude), parseFloat(this.editedBusiness.location.latitude)]
      };
    }
    
    // Check if we have files to upload
    const hasFiles = this.logoFile || this.coverFiles.length > 0;
    
    if (hasFiles) {
      // Use FormData for file uploads
      const formData = new FormData();
      
      // Add basic text fields
      if (this.editedBusiness.name) formData.append('name', this.editedBusiness.name);
      if (this.editedBusiness.type) formData.append('type', this.editedBusiness.type);
      if (this.editedBusiness.category) formData.append('category', this.editedBusiness.category);
      if (this.editedBusiness.subcategory) formData.append('subcategory', this.editedBusiness.subcategory);
      if (this.editedBusiness.description) formData.append('description', this.editedBusiness.description);
      
      // Add nested objects as individual fields (not JSON strings)
      if (location.address) formData.append('location[address]', location.address);
      if (location.city) formData.append('location[city]', location.city);
      if (location.state) formData.append('location[state]', location.state);
      if (location.country) formData.append('location[country]', location.country);
      if (location.pincode) formData.append('location[pincode]', location.pincode);
      if (location.coordinates) {
        formData.append('location[coordinates][type]', 'Point');
        formData.append('location[coordinates][coordinates][0]', location.coordinates.coordinates[0].toString());
        formData.append('location[coordinates][coordinates][1]', location.coordinates.coordinates[1].toString());
      }
      
      // Add contact fields
      if (this.editedBusiness.contact.phone) formData.append('contact[phone]', this.editedBusiness.contact.phone);
      if (this.editedBusiness.contact.whatsapp) formData.append('contact[whatsapp]', this.editedBusiness.contact.whatsapp);
      if (this.editedBusiness.contact.email) formData.append('contact[email]', this.editedBusiness.contact.email);
      if (this.editedBusiness.contact.website) formData.append('contact[website]', this.editedBusiness.contact.website);
      
      // Add business hours as JSON array (this is acceptable)
      if (this.editedBusiness.businessHours && this.editedBusiness.businessHours.length > 0) {
        this.editedBusiness.businessHours.forEach((hour: any, index: number) => {
          formData.append(`businessHours[${index}][day]`, hour.day);
          formData.append(`businessHours[${index}][open]`, hour.open);
          formData.append(`businessHours[${index}][close]`, hour.close);
          formData.append(`businessHours[${index}][isClosed]`, hour.isClosed);
        });
      }
      
      // Add logo if changed
      if (this.logoFile) {
        formData.append('logo', this.logoFile);
      }
      
      // Add cover images if changed
      if (this.coverFiles.length > 0) {
        this.coverFiles.forEach(file => {
          formData.append('coverImages', file);
        });
      }
      
      this.submitBusinessUpdate(formData);
    } else {
      // Use JSON for data-only updates
      const jsonData: any = {
        name: this.editedBusiness.name,
        type: this.editedBusiness.type,
        category: this.editedBusiness.category,
        subcategory: this.editedBusiness.subcategory,
        description: this.editedBusiness.description,
        location: location,
        contact: this.editedBusiness.contact,
        businessHours: this.editedBusiness.businessHours
      };
      
      this.submitBusinessUpdate(jsonData);
    }
  }
  
  private submitBusinessUpdate(data: FormData | any) {
    
    this.http.put(`${environment.apiUrl}/businesses/${this.business._id}`, data).subscribe({
      next: (response: any) => {
        this.toast.success('Business updated successfully!');
        const updatedBusiness = response.data?.business || response.business || response.data || response;
        if (updatedBusiness) {
          this.business = updatedBusiness;
        }
        this.isEditingBusiness = false;
        this.logoFile = null;
        this.logoPreview = null;
        this.coverFiles = [];
        this.coverPreviews = [];
        this.savingBusiness = false;
      },
      error: (err: any) => {
        console.error('Business update error:', err);
        const errorMessage = err.error?.message || err.message || 'Failed to update business';
        this.toast.error(errorMessage);
        this.savingBusiness = false;
      }
    });
  }
  
  onAvatarError(event: any) {
    this.avatarFailed = true;
    event.target.style.display = 'none';
  }
  
  // Delete account methods
  showDeleteConfirmation() {
    this.showDeleteModal = true;
    this.deleteConfirmationText = '';
  }
  
  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deleteConfirmationText = '';
  }
  
  confirmDeleteAccount() {
    if (this.deleteConfirmationText !== this.business?.name) {
      return;
    }
    
    this.deletingAccount = true;
    
    this.businessService.deleteBusiness(this.business._id).subscribe({
      next: (response: any) => {
        this.toast.success('Business account deleted successfully');
        // Log out the user and redirect to login
        this.authService.logout();
        this.router.navigate(['/auth/login']);
      },
      error: (err: any) => {
        console.error('Delete account error:', err);
        const errorMessage = err.error?.message || err.message || 'Failed to delete business account';
        this.toast.error(errorMessage);
        this.deletingAccount = false;
      }
    });
  }
}
