# Admin Analytics API Documentation

## Overview
This document describes the new admin analytics endpoints for the RateOn platform. All endpoints require admin authentication.

**Base URL:** `/api/v1/admin/`

**Authentication:** Required - Admin role only

---

## Endpoints

### 1. User Statistics
**GET** `/admin/stats/users`

Returns comprehensive user statistics including registration methods, gender distribution, and country breakdown.

**Response:**
```json
{
  "success": true,
  "message": "User statistics fetched successfully",
  "data": {
    "totalUsers": 1500,
    "byRegistrationMethod": {
      "email": 800,
      "google": 450,
      "facebook": 200,
      "phone": 50
    },
    "byGender": {
      "male": 700,
      "female": 600,
      "other": 50,
      "prefer_not_to_say": 150
    },
    "byCountry": [
      { "country": "USA", "count": 500 },
      { "country": "UK", "count": 300 },
      { "country": "India", "count": 250 }
    ]
  }
}
```

---

### 2. Review Statistics
**GET** `/admin/stats/reviews`

Returns review statistics including total reviews, average rating, rating distribution, and reaction/reply counts.

**Response:**
```json
{
  "success": true,
  "message": "Review statistics fetched successfully",
  "data": {
    "totalReviews": 5000,
    "averageRating": 4.2,
    "byRating": {
      "1": 100,
      "2": 200,
      "3": 500,
      "4": 1500,
      "5": 2700
    },
    "totalReactions": 8000,
    "reactionsByType": {
      "helpful": 6000,
      "not_helpful": 2000
    },
    "totalReplies": 3000
  }
}
```

---

### 3. Business Statistics
**GET** `/admin/stats/businesses`

Returns business and item statistics including claimed/verified status, availability, and top categories.

**Response:**
```json
{
  "success": true,
  "message": "Business statistics fetched successfully",
  "data": {
    "totalBusinesses": 450,
    "claimed": 320,
    "unclaimed": 130,
    "verified": 280,
    "active": 400,
    "items": {
      "total": 3500,
      "byAvailability": {
        "available": 2800,
        "out_of_stock": 500,
        "discontinued": 200
      }
    },
    "topCategories": [
      { "categoryId": "abc123", "categoryName": "Restaurant", "count": 150 },
      { "categoryId": "def456", "categoryName": "Cafe", "count": 120 }
    ]
  }
}
```

---

### 4. Top Businesses
**GET** `/admin/stats/businesses/top?period=week`

Returns top 10 businesses by review count for a specified period.

**Query Parameters:**
- `period` (optional): `week` or `month` (default: `month`)

**Response:**
```json
{
  "success": true,
  "message": "Top businesses for week fetched successfully",
  "data": {
    "period": "week",
    "dateThreshold": "2026-02-03T00:00:00.000Z",
    "topBusinesses": [
      {
        "businessId": "507f1f77bcf86cd799439011",
        "businessName": "ABC Restaurant",
        "businessImage": "https://cloudinary.com/image.jpg",
        "reviewCount": 150,
        "averageRating": 4.8,
        "reactionCount": 500,
        "totalReviews": 800
      }
    ]
  }
}
```

---

### 5. Location Data
**GET** `/admin/stats/locations`

Returns user location data for map visualization (limited to 1000 users).

**Response:**
```json
{
  "success": true,
  "message": "Location data fetched successfully",
  "data": {
    "totalLocations": 856,
    "locations": [
      {
        "userId": "507f1f77bcf86cd799439011",
        "username": "john_doe",
        "coordinates": {
          "type": "Point",
          "coordinates": [-73.935242, 40.730610]
        },
        "city": "New York",
        "state": "New York",
        "country": "USA"
      }
    ],
    "topCountries": [
      { "country": "USA", "count": 500 },
      { "country": "UK", "count": 200 }
    ]
  }
}
```

---

### 6. Real-Time Metrics
**GET** `/admin/stats/realtime`

Returns real-time metrics including today's activity, last hour activity, and currently active users.

**Response:**
```json
{
  "success": true,
  "message": "Real-time metrics fetched successfully",
  "data": {
    "today": {
      "newUsers": 25,
      "newReviews": 80,
      "newReactions": 150,
      "date": "2026-02-10T00:00:00.000Z"
    },
    "lastHour": {
      "newUsers": 5,
      "newReviews": 12
    },
    "realTime": {
      "activeUsersNow": 45,
      "lastChecked": "2026-02-10T06:42:33.000Z"
    },
    "peakHour": {
      "hour": 14,
      "reviewCount": 120
    },
    "refreshedAt": "2026-02-10T06:42:33.000Z"
  }
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized: User not authenticated"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Forbidden: You don't have permission to access this resource"
}
```

### 400 Bad Request (Top Businesses)
```json
{
  "success": false,
  "message": "Invalid period. Use \"week\" or \"month\""
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to fetch user statistics"
}
```

---

## Testing with Postman

### Setup
1. Login as admin to get JWT token
2. Add Authorization header: `Bearer <your_admin_token>`

### Test Sequence
1. **GET** `/admin/stats/users` - User statistics
2. **GET** `/admin/stats/reviews` - Review statistics
3. **GET** `/admin/stats/businesses` - Business statistics
4. **GET** `/admin/stats/businesses/top?period=week` - Top businesses (week)
5. **GET** `/admin/stats/businesses/top?period=month` - Top businesses (month)
6. **GET** `/admin/stats/locations` - Location data
7. **GET** `/admin/stats/realtime` - Real-time metrics

---

## Performance Considerations

### Indexes Required
These aggregations use the following indexes (already defined in models):
- `User`: `trustScore`, `level`, `createdAt`
- `Review`: `itemId + createdAt`, `businessId + createdAt`, `userId + createdAt`, `rating`, `createdAt`
- `Reaction`: `reviewId + userId`, `reviewId + type`, `userId`
- `Reply`: `reviewId + createdAt`, `userId`, `parentReplyId`

### Optimization
- Location data limited to 1000 users
- Top businesses limited to 10 results
- Country lists limited to top 20 countries
- Real-time active users uses last 15 minutes window

---

## Integration with Frontend

Employee 6 (Admin Analytics Frontend) will consume these APIs to create:
- Dashboard charts (Chart.js)
- User location map (Leaflet.js)
- Statistics cards
- Top businesses table
- Real-time metrics display

---

## Status
✅ **Implementation Complete** - All endpoints tested and ready for frontend integration

**Created by:** Employee 5  
**Date:** February 10, 2026
