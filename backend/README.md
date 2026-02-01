# RateOn Backend API

> Node.js + Express REST API for RateOn platform

## 🚀 Quick Start

```bash
npm install
cp .env.example .env  # Configure environment variables
npm start             # Runs on http://localhost:5000
```

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES6 modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + Passport.js (Google OAuth)
- **File Upload**: Multer + Cloudinary (WebP conversion)
- **Validation**: Joi
- **Password**: Bcrypt

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── config.js           # Environment variables
│   │   └── mongodb.js          # Database connection
│   ├── controllers/            # 10 controller modules
│   │   ├── authController/     # Authentication (6 files)
│   │   ├── userController/     # User management (4 files)
│   │   ├── businessController/ # Business CRUD (6 files)
│   │   ├── itemController/     # Item management (6 files)
│   │   ├── categoryController/ # Categories (2 files)
│   │   ├── reviewController/   # Reviews (7 files)
│   │   ├── reactionController/ # Reactions (3 files)
│   │   ├── replyController/    # Business replies (2 files)
│   │   ├── followController/   # Follow system (5 files)
│   │   ├── activityController/ # Activity tracking (2 files)
│   │   ├── leaderboardController/ # Leaderboards (3 files)
│   │   ├── reportController/   # Reports (6 files)
│   │   └── adminController/    # Admin tools (6 files)
│   ├── models/                 # 11 Mongoose models
│   │   ├── UserModel.js
│   │   ├── AdminModel.js
│   │   ├── BusinessModel.js
│   │   ├── ItemModel.js
│   │   ├── CategoryModel.js
│   │   ├── ReviewModel.js
│   │   ├── ReactionModel.js
│   │   ├── ReplyModel.js
│   │   ├── FollowModel.js
│   │   ├── ActivityLogModel.js
│   │   └── ReportModel.js
│   ├── routes/                 # 14 route files
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   ├── authorize.js       # Role-based access
│   │   └── upload.js          # File upload handler
│   ├── utils/
│   │   ├── responseHandler.js # Standardized API responses
│   │   ├── validator.js       # Joi validation middleware
│   │   └── activityTracker.js # Trust score & activity logging
│   └── server.js              # Entry point
├── .env.example
└── package.json
```

---

## 🔐 Environment Variables

Create `.env` file in backend root:

```env
# Server
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/rateon
# Or MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/rateon

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5300
```

---

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication (6 endpoints)
```
POST   /auth/register           # Register new user
POST   /auth/login              # Login with credentials
GET    /auth/google             # Google OAuth (User)
GET    /auth/google/business    # Google OAuth (Business Owner)
GET    /auth/google/callback    # OAuth callback
POST   /auth/logout             # Logout
```

### Users (4 endpoints)
```
GET    /user/profile            # Get own profile
PUT    /user/profile            # Update profile
POST   /user/avatar             # Upload avatar
GET    /user/:userId            # Get public profile
```

### Businesses (6 endpoints)
```
GET    /businesses              # List all businesses
POST   /businesses              # Create business
GET    /businesses/:id          # Get business details
PUT    /businesses/:id          # Update business (owner only)
POST   /businesses/:id/claim    # Claim business
GET    /businesses/nearby       # Geospatial search
```

### Items (6 endpoints)
```
GET    /items/business/:businessId        # Get items by business
POST   /items/business/:businessId        # Create item (owner)
GET    /items/:id                         # Get item details
PUT    /items/:id                         # Update item (owner)
PATCH  /items/:id/availability            # Update availability
GET    /items/search                      # Search items
```

### Categories (2 endpoints)
```
GET    /categories              # Get all categories
POST   /categories              # Create category (admin)
```

### Reviews (7 endpoints)
```
POST   /reviews                 # Create review
GET    /reviews/:id             # Get review details
PUT    /reviews/:id             # Update review (author)
DELETE /reviews/:id             # Delete review (author)
GET    /reviews/item/:itemId    # Get reviews by item
GET    /reviews/business/:businessId  # Get reviews by business
GET    /reviews/user/:userId    # Get reviews by user
```

### Reactions (3 endpoints)
```
POST   /reactions               # Add/update reaction
DELETE /reactions/review/:reviewId     # Remove reaction
GET    /reactions/review/:reviewId     # Get review reactions
```

### Replies (2 endpoints)
```
POST   /replies/review/:reviewId       # Add owner response
PUT    /replies/review/:reviewId       # Update response
```

### Follow (5 endpoints)
```
POST   /follow/:userId          # Follow user
DELETE /follow/:userId          # Unfollow user
GET    /follow/followers/:userId        # Get followers
GET    /follow/following/:userId        # Get following
GET    /follow/status/:userId           # Check follow status
```

### Activity (2 endpoints)
```
GET    /activity/user/:userId   # Get user activity
GET    /activity/feed           # Get following feed
```

### Leaderboard (3 endpoints)
```
GET    /leaderboard/top-reviewers       # Top by trust score
GET    /leaderboard/most-active         # Most active (30 days)
GET    /leaderboard/category/:category  # Top by category
```

### Reports (6 endpoints)
```
POST   /reports                 # Create report
GET    /reports                 # Get all reports (admin)
GET    /reports/:id             # Get report details (admin)
PUT    /reports/:id/resolve     # Resolve report (admin)
PUT    /reports/:id/reject      # Reject report (admin)
GET    /reports/stats           # Report statistics (admin)
```

### Admin (6 endpoints)
```
GET    /admin/stats             # Platform statistics
GET    /admin/users             # List all users
GET    /admin/users/:id         # Get user details
PUT    /admin/users/:id/suspend # Suspend user
PUT    /admin/users/:id/unsuspend   # Unsuspend user
PUT    /admin/users/:id/ban     # Ban user permanently
```

**Total: 58+ Endpoints**

---

## 🎯 Key Features

### Trust Score System
Automated points system:
- Base score: 50 points
- Review: +10 points (+15 with photos)
- Reaction: +1 point
- Helpful reaction received: +5 bonus
- Follow: +2 points
- Reply: +3 points
- Business claimed: +20 points
- Item added: +5 points
- Consistency bonus: up to +10 points
- **Max: 100 points**

### User Levels (10 levels)
- Level 1: Starter (default)
- Level 2-3: Bronze (55-60+ score)
- Level 4-5: Silver (60-70+ score)
- Level 6-7: Gold (70-80+ score)
- Level 8-9: Platinum (80-90+ score)
- Level 10: Diamond (90+ score, 100+ reviews)

### Activity Tracking
All user actions are automatically logged:
- Reviews, reactions, replies
- Follow/unfollow
- Business claimed
- Items added
- Trust score updated in real-time

---

## 🔒 Authentication

### JWT Token
Protected routes require Bearer token:
```
Authorization: Bearer <JWT_TOKEN>
```

### Google OAuth
Separate flows for:
- Regular users: `/auth/google`
- Business owners: `/auth/google/business`

---

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ...result }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

### Pagination
```json
{
  "success": true,
  "data": [...items],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

## 🧪 Testing

Use Postman or similar tool to test APIs.

Example: Register user
```bash
POST http://localhost:5000/api/v1/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "firstName": "Test",
  "lastName": "User"
}
```

---

## 📊 Database Models

### Core Models
1. **User** - User accounts with trust score & levels
2. **Admin** - Platform administrators
3. **Business** - Places/shops with geospatial data
4. **Item** - Products/menu items with availability
5. **Category** - Item and business categories

### Review System
6. **Review** - Item-specific reviews (permanent)
7. **Reaction** - Helpful/not helpful reactions
8. **Reply** - Business owner responses

### Social Features
9. **Follow** - User following relationships
10. **ActivityLog** - All user actions with points
11. **Report** - Content moderation

---

## 🚀 Deployment

### Production Build
```bash
# Set NODE_ENV=production in .env
npm start
```

### MongoDB Atlas
Use MongoDB Atlas connection string:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/rateon
```

---

## 📖 Additional Documentation

See `RESPONSE_HANDLER_GUIDE.md` for API response standards.

---

**Status:** ✅ Complete - 58+ APIs ready for production
