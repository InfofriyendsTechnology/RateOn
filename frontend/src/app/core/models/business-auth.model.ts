export interface BusinessRegisterRequest {
  // Owner details
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  phoneNumber?: string;
  
  // Business details
  businessName: string;
  businessType: 'restaurant' | 'cafe' | 'shop' | 'service' | 'other';
  category: string;
  subcategory?: string;
  description?: string;
  
  // Business location
  address: string;
  city: string;
  state: string;
  country?: string;
  pincode?: string;
  coordinates: {
    lng: number;
    lat: number;
  };
  
  // Business contact
  businessPhone?: string;
  businessWhatsapp?: string;
  businessEmail?: string;
  businessWebsite?: string;
}

export interface BusinessAuthResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    username: string;
    email: string;
    role: string;
    profile: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    business: {
      id: string;
      name: string;
      type: string;
    };
    token: string;
  };
}
