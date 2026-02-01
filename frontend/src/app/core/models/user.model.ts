export interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  userType?: 'user' | 'admin';
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
    location?: string;
    dateOfBirth?: Date;
  };
  trustScore?: number;
  level?: number;
  stats?: {
    totalReviews: number;
    totalReactions: number;
    totalFollowers: number;
    totalFollowing: number;
  };
  isActive?: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  isVerified?: boolean;
  isLoggedIn?: boolean;
  googleId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  dateOfBirth?: Date;
}
