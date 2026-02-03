# RateOn - Item-Level Review Platform

> Revolutionary review platform where users review **specific items/products**, not just businesses.

## 🎯 What is RateOn?

**RateOn** is a modern review platform that lets users review individual items within businesses, with real-time availability tracking and permanent reviews.

### Core Innovation
Unlike Google Reviews (business-level only), RateOn enables:
- **Item-specific reviews** - Review "Vadapav" at Jay's Cafe (5⭐), not just the cafe
- **Real-time availability** - Business owners update item status instantly
- **Permanent reviews** - Business owners cannot delete reviews, only reply
- **Trust score system** - Automated gamification with 10 levels
- **Social features** - Follow users, activity feeds, leaderboards
- **Simplified auth flow** - Google-first with review-time authentication
- **Business owner roles** - Convert any user to business owner instantly

### Example
```
Jay's Cafe
  ├── Vadapav (4.5⭐, 45 reviews) - ₹20 - In Stock
  ├── Masala Pav (3.8⭐, 23 reviews) - ₹25 - Out of Stock
  └── Coffee (4.2⭐, 67 reviews) - ₹30 - Available
```

---

## 🔐 Authentication Flow (NEW - Simplified)

### User Authentication
**Public browsing** - No login required to browse businesses and read reviews

**Review-time authentication** - Users only need to log in when submitting a review:
1. User writes a review (no login required)
2. On submit, auth modal appears with Google OAuth (primary) or email/password (fallback)
3. After authentication, review is automatically submitted
4. Draft is saved in localStorage during auth process

**Login options:**
- Google OAuth (primary method)
- Email/Password (fallback)

### Business Owner System
**No separate business accounts** - Business owners are regular users with `business_owner` role:

1. Any user clicks "Become Business Owner" in their dashboard
2. User role instantly converts to `business_owner`
3. Business owner can:
   - Create unlimited businesses
   - Add unlimited products/items to each business
   - Reply to reviews
   - Update item availability

### Super Admin System
**Dynamic password authentication** - No database lookup required:

**Access:** Click RateOn logo in footer → Opens `/admin/login`

**Password formula:** `D+M+YYYY+9325` (no zero padding)
- Today (Feb 3, 2026): `3220269325`
- Dec 25, 2026: `251220269325`
- Jan 1, 2027: `1120279325`

**Email:** `admin@rateon.com`

**Dashboard:** `/admin/dashboard` shows:
- Total users (Google vs Email breakdown)
- Business owners count
- Total businesses, items, reviews
- Most reviewed business
- Analytics and insights

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB v6+
- npm v9+

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/write-on.git
cd write-on

# Install all dependencies (backend + frontend)
npm run install:all

# Configure backend environment
cd backend
cp .env.example .env
# Edit .env with your configuration
cd ..

# Run both backend and frontend together
npm run dev
# Backend runs on http://localhost:1126
# Frontend runs on http://localhost:5300
```

---

## 🏗️ Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  Angular 19     │ ──────> │  Express.js     │ ──────> │    MongoDB      │
│  (Frontend)     │ <────── │  (Backend)      │ <────── │   (Database)    │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                    │
                            ┌───────┴────────┐
                            │                │
                      ┌─────▼─────┐    ┌────▼─────┐
                      │ Cloudinary│    │  Google  │
                      │   (CDN)   │    │  OAuth   │
                      └───────────┘    └──────────┘
```

### Data Structure
```
Business (Jay's Cafe)
  └── Items (Vadapav, Masala Pav, Coffee)
        └── Reviews (specific to each item)
```

---

## 📝 Available Scripts

```bash
# Development (runs both backend and frontend)
npm run dev

# Install all dependencies
npm run install:all

# Build for production
npm run build

# Production mode
npm start

# Run backend only
npm run dev:backend

# Run frontend only
npm run dev:frontend
```

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + Google OAuth (Passport.js)
- **Storage**: Cloudinary (images with WebP conversion)
- **Validation**: Joi

### Frontend
- **Framework**: Angular 19 (with Vite)
- **Language**: TypeScript
- **Styling**: SCSS
- **State**: RxJS
- **Icons**: Lucide Angular

---

## 📊 Project Status

### ✅ Completed (Backend - 100%)
- Authentication & Authorization (JWT + Google OAuth)
- User & Business Management
- Item Management with availability tracking
- Review System (item-specific, permanent)
- Reactions & Replies
- Follow/Unfollow System
- Activity Tracking & Trust Score Automation
- Leaderboards
- Report System
- Admin Moderation Tools

**Total APIs: 58+**

### 🟡 In Progress (Frontend - 40%)
- ✅ Authentication pages
- ✅ User dashboard & profile
- ✅ Business owner dashboard
- ✅ All services created
- 🔄 Business listing & detail pages
- 🔄 Item detail modal
- 🔄 Write review page
- ⏳ Social features UI
- ⏳ Admin dashboard UI

---

## 🎯 Key Features

### For Users
- **Browse without login** - Explore all businesses and reviews publicly
- **Review-time auth** - Only log in when posting a review
- **Google-first** - Quick OAuth login or email/password fallback
- Review specific items, not just businesses
- See real-time availability and prices
- Follow trusted reviewers
- Build trust score through quality reviews
- **Upgrade to business owner** - One-click role conversion

### For Business Owners
- **No separate registration** - Upgrade from regular user account
- **Unlimited businesses** - Create and manage multiple locations
- **Unlimited items** - Add products/services with photos
- Update availability and prices instantly
- Reply to reviews
- View analytics per item
- Cannot delete customer reviews

### For Super Admin
- **Dynamic password** - Changes daily based on date formula
- **Analytics dashboard** - User, business, review statistics
- **No database dependency** - Token-based authentication
- View user breakdown (Google vs Email, Gmail vs other)
- Monitor platform growth and engagement
- Identify most reviewed businesses

### Platform Features
- Trust score system (0-100 points, 10 levels)
- Activity tracking and leaderboards
- Social following system
- Admin moderation tools
- Comprehensive reporting system

---

## 📁 Project Structure

```
RateOn/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── config/       # Database & environment
│   │   ├── controllers/  # API logic (10 modules)
│   │   ├── models/       # Database models (11 models)
│   │   ├── routes/       # API routes (14 files)
│   │   ├── middleware/   # Auth, validation, upload
│   │   ├── utils/        # Helpers & utilities
│   │   └── server.js     # Entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/             # Angular 19 application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/     # Services, guards, models
│   │   │   ├── features/ # Feature modules
│   │   │   └── shared/   # Shared components
│   │   ├── main.ts
│   │   └── styles.scss
│   ├── angular.json      # Vite configuration
│   └── package.json
│
└── README.md             # This file
```

---

## 🔐 Environment Setup

### Backend (.env)
Copy `backend/.env.example` to `backend/.env` and configure:

```env
PORT=1126
MONGODB_URI=mongodb://localhost:27017/rateon
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
FRONTEND_URL=http://localhost:5300
```

### Frontend (Environment Files)
- **Development**: Uses `localhost:1126` (configured in `environment.ts`)
- **Production**: Uses deployed backend URL (configured in `environment.prod.ts`)

---

## 📖 Documentation

- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)

---

## 🚧 Migration Notes (Gradual Cleanup)

### Old Flow Code to Remove
The following legacy code from the old business account system will be removed gradually:

**Backend:**
- `backend/src/routes/businessAuthRoutes.js` - Separate business auth (deprecated)
- Old business registration controllers (replaced by role conversion)

**Frontend:**
- `frontend/src/app/features/business-auth/` - Separate business auth pages
  - `business-auth/register/`
  - `business-auth/login/`
  - `business-auth/callback/`
  - `business-auth/account-conflict/`
- Legacy business guards (replaced by `businessOwnerGuard`)

**Status:** These files are marked for removal but kept temporarily for reference

### New Implementation
**Unified Auth:**
- Single `authRoutes.js` for all users
- `businessOwnerGuard` - Role-based guard (not auth-based)
- `POST /api/v1/user/become-business-owner` - Role conversion endpoint
- Review-time authentication via `AuthModalComponent`

---

## 🤝 Contributing

This is a private project. For any questions or contributions, please contact the development team.

---

## 📄 License

Proprietary - All rights reserved

---

**Built with ❤️ using Angular 19 + Vite and Node.js**
