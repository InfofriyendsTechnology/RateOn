import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BusinessService } from '../../../core/services/business';
import { ToastService } from '../../../core/services/toast';
import { LucideAngularModule, ArrowLeft, Save, Building, MapPin, Phone, Globe, Clock, Image, X, Plus } from 'lucide-angular';
import { BreadcrumbsComponent } from '../../../shared/components/breadcrumbs/breadcrumbs';

@Component({
  selector: 'app-edit-business',
  standalone: true,
imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule, BreadcrumbsComponent],
  templateUrl: './edit-business.html',
  styleUrl: './edit-business.scss'
})
export class EditBusinessComponent implements OnInit {
  businessForm!: FormGroup;
  businessId: string = '';
  loading = false;
  submitting = false;
  error = '';
  existingCoordinates: any = null; // Store existing coordinates to preserve them
  
  // Image handling
  logoPreview: string | null = null;
  logoFile: File | null = null;
  coverImagePreviews: string[] = [];
  coverImageFiles: File[] = [];
  
  // Days of the week for operating hours
  daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];
  
  // Time options for dropdowns (9 AM - 10 PM)
  timeOptions: string[] = [];
  
  // Icons
  readonly ArrowLeft = ArrowLeft;
  readonly Save = Save;
  readonly Building = Building;
  readonly MapPin = MapPin;
  readonly Phone = Phone;
  readonly Globe = Globe;
  readonly Clock = Clock;
  readonly Image = Image;
  readonly X = X;
  readonly Plus = Plus;
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private businessService: BusinessService,
    private toast: ToastService
  ) {
    // Generate 12-hour time options with AM/PM
    for (let hour = 0; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const m = min.toString().padStart(2, '0');
        this.timeOptions.push(`${displayHour}:${m} ${period}`);
      }
    }
  }
  
  ngOnInit() {
    this.businessId = this.route.snapshot.paramMap.get('id') || '';
    this.initForm();
    
    if (this.businessId) {
      this.loadBusinessData();
    }
  }
  
  initForm() {
    // Create default business hours (9 AM - 6 PM, Monday-Friday)
    const defaultHours = this.daysOfWeek.map(day => ({
      day: day.value,
      open: day.value === 'saturday' || day.value === 'sunday' ? '' : '9:00 AM',
      close: day.value === 'saturday' || day.value === 'sunday' ? '' : '6:00 PM',
      isClosed: day.value === 'saturday' || day.value === 'sunday'
    }));
    
    this.businessForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      subcategory: [''],
      description: ['', [Validators.maxLength(2000)]],
      logo: [''],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['India'],
      pincode: [''],
      phone: [''],
      whatsapp: [''],
      email: [''],
      website: [''],
      businessHours: this.fb.array(defaultHours.map(hour => this.fb.group({
        day: [hour.day],
        open: [hour.open],
        close: [hour.close],
        isClosed: [hour.isClosed]
      })))
    });
  }
  
  loadBusinessData() {
    this.loading = true;
    this.businessService.getBusinessById(this.businessId).subscribe({
      next: (response: any) => {
        const data = response.data || response;
        const business = data.business || data;
        
        // Preserve existing coordinates
        if (business.location?.coordinates) {
          this.existingCoordinates = business.location.coordinates;
        }
        
        this.businessForm.patchValue({
          name: business.name,
          category: business.category,
          subcategory: business.subcategory,
          description: business.description,
          logo: business.logo,
          address: business.location?.address,
          city: business.location?.city,
          state: business.location?.state,
          country: business.location?.country || 'India',
          pincode: business.location?.pincode,
          phone: business.contact?.phone,
          whatsapp: business.contact?.whatsapp,
          email: business.contact?.email,
          website: business.contact?.website
        });
        
        // Load existing images
        if (business.logo) {
          this.logoPreview = business.logo;
        }
        if (business.coverImages && business.coverImages.length > 0) {
          this.coverImagePreviews = [...business.coverImages];
        }
        
        // Load business hours if they exist
        if (business.businessHours && business.businessHours.length > 0) {
          // Convert 24-hour format from backend to 12-hour AM/PM
          const hoursWithAmPm = business.businessHours.map((h: any) => ({
            ...h,
            open: this.convert24to12(h.open),
            close: this.convert24to12(h.close)
          }));
          this.setBusinessHours(hoursWithAmPm);
        }
        
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load business details';
        this.loading = false;
        this.toast.error('Failed to load business details');
      }
    });
  }
  
  onSubmit() {
    // Validate required fields
    if (!this.canSave()) {
      this.markFormGroupTouched(this.businessForm);
      this.toast.error('Please fill all required fields: Name, Category, Address, City, and State');
      return;
    }
    
    // Validate optional fields format if they have values
    const email = this.businessForm.get('email')?.value;
    
    if (email && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.toast.error('Please enter a valid email address');
      return;
    }
    
    this.submitting = true;
    const formValue = this.businessForm.value;
    
    // Create FormData for file upload
    const formData = new FormData();
    
    // Add text fields
    formData.append('name', formValue.name);
    formData.append('category', formValue.category);
    if (formValue.subcategory) formData.append('subcategory', formValue.subcategory);
    if (formValue.description) formData.append('description', formValue.description);
    
    // Add logo file if new file selected
    if (this.logoFile) {
      formData.append('logo', this.logoFile);
    }
    
    // Add cover image files if new files selected
    if (this.coverImageFiles.length > 0) {
      this.coverImageFiles.forEach(file => {
        formData.append('coverImages', file);
      });
    }
    
    // Add location data
    formData.append('location[address]', formValue.address);
    formData.append('location[city]', formValue.city);
    formData.append('location[state]', formValue.state);
    formData.append('location[country]', formValue.country);
    if (formValue.pincode) formData.append('location[pincode]', formValue.pincode);
    
    // Preserve existing coordinates
    if (this.existingCoordinates) {
      formData.append('location[coordinates][type]', this.existingCoordinates.type || 'Point');
      formData.append('location[coordinates][coordinates][0]', this.existingCoordinates.coordinates[0].toString());
      formData.append('location[coordinates][coordinates][1]', this.existingCoordinates.coordinates[1].toString());
    }
    
    // Add contact data
    if (formValue.phone) formData.append('contact[phone]', formValue.phone);
    if (formValue.whatsapp) formData.append('contact[whatsapp]', formValue.whatsapp);
    if (formValue.email) formData.append('contact[email]', formValue.email);
    if (formValue.website) formData.append('contact[website]', formValue.website);
    
    // Add business hours (only open days)
    const businessHours = formValue.businessHours
      .filter((h: any) => !h.isClosed)
      .map((h: any) => ({
        day: h.day,
        open: this.convert12to24(h.open),
        close: this.convert12to24(h.close),
        isClosed: false
      }));
    
    // Add each business hour as separate FormData entries
    businessHours.forEach((hour: any, index: number) => {
      formData.append(`businessHours[${index}][day]`, hour.day);
      formData.append(`businessHours[${index}][open]`, hour.open);
      formData.append(`businessHours[${index}][close]`, hour.close);
      formData.append(`businessHours[${index}][isClosed]`, hour.isClosed.toString());
    });
    
    this.businessService.updateBusinessWithFiles(this.businessId, formData).subscribe({
      next: () => {
        this.toast.success('Business details updated successfully!');
        this.submitting = false;
        this.router.navigate(['/business/dashboard/businesses']);
      },
      error: (err: any) => {
        this.submitting = false;
        this.toast.error(err.error?.message || 'Failed to update business details');
      }
    });
  }
  
  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
  
  goBack() {
    this.router.navigate(['/business/dashboard/businesses']);
  }
  
  isFieldInvalid(fieldName: string): boolean {
    const field = this.businessForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
  
  getFieldError(fieldName: string): string {
    const field = this.businessForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} characters required`;
      if (field.errors['maxlength']) return `Maximum ${field.errors['maxlength'].requiredLength} characters allowed`;
      if (field.errors['pattern']) return 'Invalid format';
      if (field.errors['email']) return 'Invalid email format';
    }
    return '';
  }
  
  get businessHoursArray() {
    return this.businessForm.get('businessHours') as any;
  }
  
  setBusinessHours(hours: any[]) {
    const hoursArray = this.businessForm.get('businessHours') as any;
    hoursArray.clear();
    
    this.daysOfWeek.forEach(day => {
      const existingHour = hours.find(h => h.day === day.value);
      hoursArray.push(this.fb.group({
        day: [day.value],
        open: [existingHour?.open || '9:00 AM'],
        close: [existingHour?.close || '6:00 PM'],
        isClosed: [existingHour?.isClosed || false]
      }));
    });
  }
  
  // Convert 24-hour format (09:00) to 12-hour format (9:00 AM)
  convert24to12(time24: string): string {
    if (!time24) return '';
    const [hourStr, minute] = time24.split(':');
    const hour = parseInt(hourStr, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute} ${period}`;
  }
  
  // Convert 12-hour format (9:00 AM) to 24-hour format (09:00)
  convert12to24(time12: string): string {
    if (!time12) return '';
    const [time, period] = time12.split(' ');
    const [hourStr, minute] = time.split(':');
    let hour = parseInt(hourStr, 10);
    
    if (period === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period === 'AM' && hour === 12) {
      hour = 0;
    }
    
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  }
  
  toggleDayClosed(index: number) {
    const dayControl = this.businessHoursArray.at(index);
    const isClosed = dayControl.get('isClosed')?.value;
    dayControl.patchValue({ isClosed: !isClosed });
  }
  
  getDayLabel(day: string): string {
    return this.daysOfWeek.find(d => d.value === day)?.label || day;
  }
  
  canSave(): boolean {
    const name = this.businessForm.get('name')?.value;
    const category = this.businessForm.get('category')?.value;
    const address = this.businessForm.get('address')?.value;
    const city = this.businessForm.get('city')?.value;
    const state = this.businessForm.get('state')?.value;
    
    // Check if all required fields have values
    return !!(name && category && address && city && state);
  }
  
  // Image upload handlers
  onLogoSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.toast.error('Logo size must be less than 5MB');
        return;
      }
      
      this.logoFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
  
  removeLogo(): void {
    this.logoPreview = null;
    this.logoFile = null;
    this.businessForm.patchValue({ logo: '' });
  }
  
  onCoverImagesSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      // Process all selected files
      Array.from(input.files).forEach(file => {
        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          this.toast.error(`${file.name} is too large. Maximum size is 5MB`);
          return;
        }
        
        // Add to files array
        this.coverImageFiles.push(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.coverImagePreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
      
      // Reset input to allow re-uploading same file
      input.value = '';
    }
  }
  
  removeCoverImage(index: number): void {
    this.coverImagePreviews.splice(index, 1);
    this.coverImageFiles.splice(index, 1);
  }
}
