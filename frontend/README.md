# RateOn Frontend

> Angular 19 + Vite application for RateOn platform

## 🚀 Quick Start

```bash
npm install
npm run dev       # Runs on http://localhost:5300
```

---

## 🛠️ Tech Stack

- **Framework**: Angular 19 (with Vite + esbuild)
- **Language**: TypeScript 5.9
- **Styling**: SCSS
- **State Management**: RxJS
- **HTTP Client**: Angular HttpClient
- **Forms**: Reactive Forms
- **Routing**: Angular Router with Guards
- **Icons**: Lucide Angular
- **UI**: Angular Material + Custom Components

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/                    # Core modules
│   │   │   ├── services/            # API services
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── user.service.ts
│   │   │   │   ├── business.service.ts
│   │   │   │   ├── item.service.ts
│   │   │   │   ├── review.service.ts
│   │   │   │   ├── follow.service.ts
│   │   │   │   ├── activity.service.ts
│   │   │   │   └── storage.service.ts
│   │   │   ├── guards/              # Route guards
│   │   │   │   └── auth.guard.ts
│   │   │   └── models/              # TypeScript interfaces
│   │   ├── features/                # Feature modules
│   │   │   ├── auth/                # Login, Register
│   │   │   ├── home/                # Landing page
│   │   │   ├── user/                # Dashboard, Profile
│   │   │   ├── business/            # Business owner dashboard
│   │   │   ├── explore/             # Browse businesses
│   │   │   └── review/              # Write reviews
│   │   └── shared/                  # Shared components
│   │       ├── components/
│   │       └── notification/
│   ├── main.ts                      # Entry point
│   └── styles.scss                  # Global styles
├── public/                          # Static assets
├── angular.json                     # Angular + Vite config
├── tsconfig.json                    # TypeScript config
└── package.json                     # Dependencies
```

---

## ⚙️ Configuration

### Angular + Vite
The project uses Angular 19's modern builder which is powered by Vite and esbuild internally.

**angular.json:**
```json
{
  "builder": "@angular/build:application",  // Uses Vite
  "options": {
    "port": 5300,
    "hmr": true,                           // Hot Module Replacement
    "assets": [{
      "glob": "**/*",
      "input": "public",
      "output": "/"
    }]
  }
}
```

### Environment Variables
Configure in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api/v1',
  googleOAuthClientId: 'YOUR_GOOGLE_CLIENT_ID'
};
```

---

## 📝 Scripts

```bash
npm run dev      # Start development server (Vite-powered)
npm run build    # Production build
npm run preview  # Preview production build locally
```

---

## 🎨 Features Implemented

### ✅ Completed
- **Authentication**
  - Login/Register pages
  - Google OAuth integration
  - JWT token management
  - Auth guard for protected routes

- **User Features**
  - User dashboard with stats
  - Profile management with avatar upload
  - Trust score visualization
  - Level display

- **Business Owner**
  - Business dashboard structure
  - Sidebar navigation
  - Account conflict resolution

- **Services (All Created)**
  - AuthService - Authentication & user management
  - BusinessService - Business CRUD operations
  - ItemService - Item management
  - ReviewService - Review CRUD with reactions
  - FollowService - Follow/unfollow operations
  - ActivityService - Activity tracking
  - StorageService - Local storage management

### 🔄 In Progress
- Business listing & detail pages
- Item detail modal
- Write review component
- Social features UI (leaderboard, activity feed)
- Admin dashboard

---

## 🔐 Authentication Flow

### JWT Token Storage
Tokens are stored in localStorage via StorageService:
```typescript
// After login
this.storageService.setToken(token);
this.storageService.setUser(user);

// Check auth
if (this.authService.isAuthenticated()) {
  // User is logged in
}
```

### Protected Routes
Use AuthGuard for authenticated routes:
```typescript
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [AuthGuard]
}
```

---

## 🎯 Services Overview

### AuthService
- `login(credentials)` - Login with email/password
- `register(userData)` - Create new account
- `googleAuth()` - Google OAuth login
- `logout()` - Clear session
- `isAuthenticated()` - Check if user is logged in
- `getCurrentUser()` - Get current user data

### BusinessService
- `getBusinesses(filters)` - List businesses
- `getBusinessById(id)` - Get business details
- `createBusiness(data)` - Create new business
- `updateBusiness(id, data)` - Update business
- `claimBusiness(id)` - Claim business ownership
- `getNearbyBusinesses(lat, lng, radius)` - Geospatial search

### ItemService
- `getItemsByBusiness(businessId)` - Get business items
- `getItemById(id)` - Get item details
- `createItem(businessId, data)` - Add new item
- `updateItem(id, data)` - Update item
- `updateAvailability(id, status)` - Update availability
- `searchItems(query, filters)` - Search items

### ReviewService
- `createReview(data)` - Write review
- `getReviewById(id)` - Get review details
- `updateReview(id, data)` - Edit review
- `deleteReview(id)` - Delete review
- `getReviewsByItem(itemId)` - Item reviews
- `getReviewsByBusiness(businessId)` - Business reviews
- `getReviewsByUser(userId)` - User reviews
- `addReaction(reviewId, type)` - React to review
- `removeReaction(reviewId)` - Remove reaction

### FollowService
- `followUser(userId)` - Follow user
- `unfollowUser(userId)` - Unfollow user
- `getFollowers(userId)` - Get followers list
- `getFollowing(userId)` - Get following list
- `checkFollowStatus(userId)` - Check if following

---

## 🎨 Styling

### SCSS Structure
- Global styles in `styles.scss`
- Component-specific styles in component files
- SCSS variables for consistent theming
- Responsive design with mobile-first approach

### Design System
- Primary color: `#082052`
- Accent color: `#3b82f6`
- Success: `#10b981`
- Warning: `#f59e0b`
- Danger: `#ef4444`

---

## 🔧 Development

### Generate Component
```bash
ng generate component features/explore/business-list --standalone
```

### Generate Service
```bash
ng generate service core/services/notification
```

### Hot Module Replacement
HMR is enabled by default. Changes are reflected instantly without full page reload.

### Performance
- Vite dev server starts in **2-3 seconds**
- HMR updates in **100-200ms**
- Production builds optimized with tree-shaking

---

## 📦 Key Dependencies

```json
{
  "@angular/core": "^21.0.0",
  "@angular/router": "^21.0.0",
  "@angular/forms": "^21.0.0",
  "@angular/material": "^21.0.5",
  "lucide-angular": "^0.562.0",
  "ngx-image-cropper": "^9.1.5",
  "rxjs": "~7.8.0"
}
```

---

## 🚀 Build for Production

```bash
npm run build
```

Output will be in `dist/frontend/browser/` directory.

### Deployment
- Copy contents of `dist/frontend/browser/` to your web server
- Configure server to redirect all routes to `index.html` (for Angular routing)
- Set `production: true` in environment file

---

## 📖 Additional Documentation

See `VITE_SETUP.md` for Angular + Vite configuration details.

---

**Status:** 🟡 40% Complete - Core infrastructure ready, UI in progress
