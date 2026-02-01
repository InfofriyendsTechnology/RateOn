import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Eye, EyeOff } from 'lucide-angular';
import { BusinessAuthService } from '../../../core/services/business-auth';
import { StorageService } from '../../../core/services/storage';

@Component({
  selector: 'app-business-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class BusinessRegisterComponent implements OnInit {
  // Lucide Icons
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  
  currentStep = 1;
  totalSteps = 3;
  isGoogleAuth = false;
  googleData: any = null;
  
  // Forms for each step
  ownerForm: FormGroup;
  businessForm: FormGroup;
  locationForm: FormGroup;
  
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  
  businessTypes = [
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'cafe', label: 'Cafe' },
    { value: 'shop', label: 'Shop/Retail' },
    { value: 'service', label: 'Service' },
    { value: 'other', label: 'Other' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private businessAuthService: BusinessAuthService,
    private storage: StorageService
  ) {
    // Step 1: Owner Information
    this.ownerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: [''],
      phoneNumber: ['']
    });

    // Step 2: Business Details
    this.businessForm = this.fb.group({
      businessName: ['', [Validators.required]],
      businessType: ['', [Validators.required]],
      category: ['', [Validators.required]],
      subcategory: [''],
      description: ['']
    });

    // Step 3: Location & Contact
    this.locationForm = this.fb.group({
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      country: ['India'],
      pincode: [''],
      lng: ['', [Validators.required]],
      lat: ['', [Validators.required]],
      businessPhone: [''],
      businessWhatsapp: [''],
      businessEmail: ['', [Validators.email]],
      businessWebsite: ['']
    });
  }

  ngOnInit() {
    // Check for Google OAuth data in query params
    this.route.queryParams.subscribe(params => {
      // Check for googleData JSON string
      if (params['googleData']) {
        try {
          this.googleData = JSON.parse(decodeURIComponent(params['googleData']));
          this.isGoogleAuth = true;
          
          // Pre-fill owner form with Google data
          this.ownerForm.patchValue({
            email: this.googleData.email,
            firstName: this.googleData.firstName,
            lastName: this.googleData.lastName,
            username: this.googleData.email.split('@')[0]
          });
          
          // Disable fields that come from Google
          this.ownerForm.get('email')?.disable();
          this.ownerForm.get('firstName')?.disable();
          this.ownerForm.get('lastName')?.disable();
          
          // Remove password validators for Google auth
          this.ownerForm.get('password')?.clearValidators();
          this.ownerForm.get('confirmPassword')?.clearValidators();
          this.ownerForm.get('password')?.updateValueAndValidity();
          this.ownerForm.get('confirmPassword')?.updateValueAndValidity();
          
          // Skip to step 2 (Business Details)
          this.currentStep = 2;
        } catch (error) {
          console.error('Failed to parse googleData:', error);
        }
      }
      // Also check for individual params (backward compatibility)
      else if (params['googleId'] && params['email']) {
        this.isGoogleAuth = true;
        this.googleData = {
          googleId: params['googleId'],
          email: params['email'],
          firstName: params['firstName'] || '',
          lastName: params['lastName'] || '',
          avatar: params['avatar'] || ''
        };
        
        // Pre-fill owner form with Google data
        this.ownerForm.patchValue({
          email: this.googleData.email,
          firstName: this.googleData.firstName,
          lastName: this.googleData.lastName,
          username: this.googleData.email.split('@')[0]
        });
        
        // Disable fields that come from Google
        this.ownerForm.get('email')?.disable();
        this.ownerForm.get('firstName')?.disable();
        this.ownerForm.get('lastName')?.disable();
        
        // Remove password validators for Google auth
        this.ownerForm.get('password')?.clearValidators();
        this.ownerForm.get('confirmPassword')?.clearValidators();
        this.ownerForm.get('password')?.updateValueAndValidity();
        this.ownerForm.get('confirmPassword')?.updateValueAndValidity();
        
        // Skip to step 2 (Business Details)
        this.currentStep = 2;
      }
    });
  }

  nextStep() {
    if (this.currentStep === 1 && this.ownerForm.valid) {
      const { password, confirmPassword } = this.ownerForm.value;
      if (password !== confirmPassword) {
        this.errorMessage = 'Passwords do not match!';
        return;
      }
      this.errorMessage = '';
      this.currentStep++;
    } else if (this.currentStep === 2 && this.businessForm.valid) {
      this.errorMessage = '';
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.errorMessage = '';
    }
  }

  onSubmit() {
    if (this.locationForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      let ownerData;
      if (this.isGoogleAuth && this.googleData) {
        // For Google OAuth, use Google data
        const { lng, lat } = this.locationForm.value;
        ownerData = {
          googleId: this.googleData.googleId,
          email: this.googleData.email,
          firstName: this.googleData.firstName,
          lastName: this.googleData.lastName,
          avatar: this.googleData.avatar,
          username: this.ownerForm.get('username')?.value,
          phoneNumber: this.ownerForm.get('phoneNumber')?.value,
          ...this.businessForm.value,
          ...this.locationForm.value
        };
      } else {
        // For email/password registration
        const { confirmPassword, lng, lat, ...data } = {
          ...this.ownerForm.value,
          ...this.businessForm.value,
          ...this.locationForm.value
        };
        ownerData = data;
      }
      
      const { lng, lat } = this.locationForm.value;
      const registrationData = {
        ...ownerData,
        coordinates: { lng, lat }
      };

      // Use appropriate API based on auth type
      const apiCall = this.isGoogleAuth 
        ? this.businessAuthService.completeGoogleRegistration(registrationData)
        : this.businessAuthService.registerBusiness(registrationData);

      apiCall.subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.successMessage = 'Business registered successfully! Redirecting to dashboard...';
            setTimeout(() => {
              this.router.navigate(['/business/dashboard']);
            }, 2000);
          } else {
            this.errorMessage = response.message || 'Registration failed';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
          console.error('Business registration error:', error);
        }
      });
    }
  }

  signupWithGoogle() {
    this.storage.clearAuth();
    this.businessAuthService.initiateGoogleAuth();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  getProgressPercentage(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }

  // Helper to get current form based on step
  getCurrentForm(): FormGroup {
    switch (this.currentStep) {
      case 1: return this.ownerForm;
      case 2: return this.businessForm;
      case 3: return this.locationForm;
      default: return this.ownerForm;
    }
  }

  isCurrentStepValid(): boolean {
    return this.getCurrentForm().valid;
  }
}
