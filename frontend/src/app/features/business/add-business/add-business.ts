import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { StorageService } from '../../../core/services/storage';
import { BusinessService } from '../../../core/services/business';
import { ToastService } from '../../../core/services/toast';
import { UserService } from '../../../core/services/user';
import { BusinessStateService } from '../../../core/services/business-state.service';
import {
  LucideAngularModule,
  ArrowLeft, ArrowRight, Building2, MapPin, Phone,
  Image, X, Plus, Camera, Check, Clock, Globe, Mail
} from 'lucide-angular';
import { BreadcrumbsComponent } from '../../../shared/components/breadcrumbs/breadcrumbs';

@Component({
  selector: 'app-add-business',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, BreadcrumbsComponent],
  templateUrl: './add-business.html',
  styleUrl: './add-business.scss'
})
export class AddBusinessComponent implements OnInit {
  // Icons
  readonly ArrowLeft  = ArrowLeft;
  readonly ArrowRight = ArrowRight;
  readonly Building2  = Building2;
  readonly MapPin     = MapPin;
  readonly Phone      = Phone;
  readonly Image      = Image;
  readonly X          = X;
  readonly Plus       = Plus;
  readonly Camera     = Camera;
  readonly Check      = Check;
  readonly Clock      = Clock;
  readonly Globe      = Globe;
  readonly Mail       = Mail;

  currentStep = 1;
  totalSteps  = 4;

  steps = [
    { number: 1, label: 'Business Info' },
    { number: 2, label: 'Location'      },
    { number: 3, label: 'Contact'       },
    { number: 4, label: 'Photos'        }
  ];

  categories = [
    'Restaurant', 'Café / Coffee Shop', 'Fast Food', 'Bakery',
    'Sweet Shop / Mithai', 'Street Food', 'Juice Bar', 'Ice Cream Parlour',
    'Grocery Store', 'Supermarket', 'General Store',
    'Clothing / Fashion', 'Electronics', 'Furniture / Home Decor',
    'Pharmacy / Medical', 'Hospital / Clinic', 'Dental Clinic',
    'Salon / Beauty Parlour', 'Spa & Wellness', 'Gym / Fitness Center',
    'Hotel / Lodge', 'Travel Agency',
    'Bank / Finance', 'School / Coaching', 'Book Store',
    'Automobile / Garage', 'Hardware Store', 'Stationery',
    'Other'
  ];

  daysOfWeek = [
    { value: 'monday',    label: 'Monday'    },
    { value: 'tuesday',   label: 'Tuesday'   },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday',  label: 'Thursday'  },
    { value: 'friday',    label: 'Friday'    },
    { value: 'saturday',  label: 'Saturday'  },
    { value: 'sunday',    label: 'Sunday'    }
  ];

  timeOptions: string[] = [];
  businessForm!: FormGroup;

  logoPreview:   string | null = null;
  logoFile:      File   | null = null;
  photoFiles:    File[]        = [];
  photoPreviews: string[]      = [];

  submitting    = false;
  user: any     = null;
  stepTouched: Record<number, boolean> = {};

  constructor(
    private fb:                   FormBuilder,
    private router:               Router,
    private storage:              StorageService,
    private businessService:      BusinessService,
    private toastService:         ToastService,
    private userService:          UserService,
    private businessStateService: BusinessStateService
  ) {
    // Build 30-min interval time list
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const period = h >= 12 ? 'PM' : 'AM';
        const dh = h === 0 ? 12 : h > 12 ? h - 12 : h;
        this.timeOptions.push(`${dh}:${m.toString().padStart(2, '0')} ${period}`);
      }
    }
  }

  ngOnInit(): void {
    this.user = this.storage.getUser();
    this.initForm();
  }

  private initForm(): void {
    const isWeekend = (d: string) => d === 'saturday' || d === 'sunday';
    this.businessForm = this.fb.group({
      // Step 1
      name:           ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      category:       ['', Validators.required],
      customCategory: [''],
      subcategory:    [''],
      description:    ['', Validators.maxLength(2000)],
      // Step 2
      address: ['', Validators.required],
      city:    ['', Validators.required],
      state:   ['', Validators.required],
      country: ['India'],
      pincode: [''],
      // Step 3
      phone:    [''],
      whatsapp: [''],
      email:    [''],
      website:  [''],
      businessHours: this.fb.array(
        this.daysOfWeek.map(d => this.fb.group({
          day:      [d.value],
          open:     [isWeekend(d.value) ? '10:00 AM' : '9:00 AM'],
          close:    [isWeekend(d.value) ? '2:00 PM'  : '6:00 PM'],
          isClosed: [d.value === 'sunday']
        }))
      )
    });
  }

  // ─── Getters ──────────────────────────────────────────────────────────────

  get businessHoursArray(): FormArray {
    return this.businessForm.get('businessHours') as FormArray;
  }

  get effectiveCategory(): string {
    const cat = this.businessForm.get('category')?.value;
    return cat === 'Other'
      ? (this.businessForm.get('customCategory')?.value?.trim() || '')
      : cat;
  }

  get descriptionLength(): number {
    return this.businessForm.get('description')?.value?.length ?? 0;
  }

  // ─── Step logic ───────────────────────────────────────────────────────────

  canProceed(step: number): boolean {
    if (step === 1) {
      return !!(
        this.businessForm.get('name')?.value?.trim() &&
        this.effectiveCategory
      );
    }
    if (step === 2) {
      return !!(
        this.businessForm.get('address')?.value?.trim() &&
        this.businessForm.get('city')?.value?.trim()    &&
        this.businessForm.get('state')?.value?.trim()
      );
    }
    if (step === 3) return true; // all optional
    if (step === 4) return this.photoPreviews.length > 0 && this.logoFile !== null;
    return false;
  }

  nextStep(): void {
    this.stepTouched[this.currentStep] = true;
    if (!this.canProceed(this.currentStep)) {
      const msgs: Record<number, string> = {
        1: 'Enter a business name and select a category',
        2: 'Fill in the required location fields below',
        4: 'Upload a logo and at least 1 cover photo'
      };
      this.toastService.error(msgs[this.currentStep] ?? 'Please fill in required fields');
      return;
    }
    this.stepTouched[this.currentStep] = false;
    if (this.currentStep < this.totalSteps) this.currentStep++;
  }

  prevStep(): void {
    if (this.currentStep > 1) this.currentStep--;
  }

  goToStep(n: number): void {
    if (n < this.currentStep) this.currentStep = n;
  }

  goBack(): void {
    this.router.navigate(['/owner/businesses']);
  }

  // ─── Business hours ───────────────────────────────────────────────────────

  toggleDayClosed(index: number): void {
    const ctrl = this.businessHoursArray.at(index);
    ctrl.patchValue({ isClosed: !ctrl.get('isClosed')?.value });
  }

  private convert12to24(time12: string): string {
    if (!time12) return '';
    const [time, period] = time12.split(' ');
    const [hourStr, minute] = time.split(':');
    let hour = parseInt(hourStr, 10);
    if (period === 'PM' && hour !== 12) hour += 12;
    else if (period === 'AM' && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  }

  // ─── Logo ─────────────────────────────────────────────────────────────────

  onLogoSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.[0]) return;
    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) { this.toastService.error('Logo must be under 5 MB'); return; }
    this.logoFile = file;
    const r = new FileReader();
    r.onload = (e: any) => { this.logoPreview = e.target.result; };
    r.readAsDataURL(file);
  }

  removeLogo(): void { this.logoPreview = null; this.logoFile = null; }

  // ─── Cover photos ─────────────────────────────────────────────────────────

  onPhotosSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const remaining = 5 - this.photoFiles.length;
    if (remaining <= 0) { this.toastService.error('Maximum 5 photos allowed'); return; }
    Array.from(input.files).slice(0, remaining).forEach(file => {
      if (file.size > 5 * 1024 * 1024) { this.toastService.error(`${file.name} exceeds 5 MB`); return; }
      this.photoFiles.push(file);
      const r = new FileReader();
      r.onload = (e: any) => { this.photoPreviews.push(e.target.result); };
      r.readAsDataURL(file);
    });
    input.value = '';
  }

  removePhoto(i: number): void {
    this.photoFiles.splice(i, 1);
    this.photoPreviews.splice(i, 1);
  }

  // ─── Submit ───────────────────────────────────────────────────────────────

  onSubmit(): void {
    this.stepTouched[4] = true;
    if (!this.canProceed(4)) {
      this.toastService.error('Upload a logo and at least 1 cover photo');
      return;
    }
    this.submitting = true;
    if (this.user?.role !== 'business_owner') {
      this.userService.becomeBusinessOwner().subscribe({
        next: (res: any) => {
          this.user.role = 'business_owner';
          this.storage.saveUser(res.data.user);
          if (res.data.token) this.storage.saveToken(res.data.token);
          this.createBusiness();
        },
        error: () => {
          this.toastService.error('Failed to upgrade account. Please try again.');
          this.submitting = false;
        }
      });
    } else {
      this.createBusiness();
    }
  }

  private createBusiness(): void {
    const v  = this.businessForm.value;
    const fd = new FormData();

    fd.append('name',     v.name.trim());
    fd.append('type',     this.effectiveCategory);
    fd.append('category', this.effectiveCategory);
    if (v.subcategory?.trim()) fd.append('subcategory',  v.subcategory.trim());
    if (v.description?.trim()) fd.append('description',  v.description.trim());

    fd.append('location[address]', v.address.trim());
    fd.append('location[city]',    v.city.trim());
    fd.append('location[state]',   v.state.trim());
    fd.append('location[country]', v.country || 'India');
    if (v.pincode?.trim()) fd.append('location[pincode]', v.pincode.trim());
    fd.append('location[coordinates][type]',           'Point');
    fd.append('location[coordinates][coordinates][0]', '0');
    fd.append('location[coordinates][coordinates][1]', '0');

    if (v.phone?.trim())    fd.append('contact[phone]',    v.phone.trim());
    if (v.whatsapp?.trim()) fd.append('contact[whatsapp]', v.whatsapp.trim());
    if (v.email?.trim())    fd.append('contact[email]',    v.email.trim());
    if (v.website?.trim())  fd.append('contact[website]',  v.website.trim());

    const hours = v.businessHours
      .filter((h: any) => !h.isClosed && h.open && h.close)
      .map((h: any) => ({
        day:      h.day,
        open:     this.convert12to24(h.open),
        close:    this.convert12to24(h.close),
        isClosed: false
      }));
    hours.forEach((h: any, i: number) => {
      fd.append(`businessHours[${i}][day]`,      h.day);
      fd.append(`businessHours[${i}][open]`,     h.open);
      fd.append(`businessHours[${i}][close]`,    h.close);
      fd.append(`businessHours[${i}][isClosed]`, 'false');
    });

    if (this.logoFile) fd.append('logo', this.logoFile);
    this.photoFiles.forEach(f => fd.append('coverImages', f));

    this.businessService.createBusiness(fd).subscribe({
      next: (res: any) => {
        const newBusiness = res.data || res;
        this.toastService.success('Business created successfully!');
        this.businessStateService.emitBusinessCreated(newBusiness);
        this.router.navigate(['/owner/businesses']);
      },
      error: (err: any) => {
        this.toastService.error(err?.error?.message || 'Failed to create business');
        this.submitting = false;
      },
      complete: () => { this.submitting = false; }
    });
  }
}
