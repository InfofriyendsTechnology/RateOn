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

### Example
```
Jay's Cafe
  ├── Vadapav (4.5⭐, 45 reviews) - ₹20 - In Stock
  ├── Masala Pav (3.8⭐, 23 reviews) - ₹25 - Out of Stock
  └── Coffee (4.2⭐, 67 reviews) - ₹30 - Available
```

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
- Review specific items, not just businesses
- See real-time availability and prices
- Follow trusted reviewers
- Build trust score through quality reviews
- Permanent reviews that can't be deleted

### For Business Owners
- Manage item catalog with photos
- Update availability instantly
- Reply to reviews
- View analytics per item
- Cannot delete customer reviews

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

## 🤝 Contributing

This is a private project. For any questions or contributions, please contact the development team.

---

## 📄 License

Proprietary - All rights reserved

---

**Built with ❤️ using Angular 19 + Vite and Node.js**
