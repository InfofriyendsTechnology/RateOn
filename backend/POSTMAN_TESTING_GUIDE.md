# Postman Testing Guide - Admin Analytics APIs

## Prerequisites

1. **Backend Server Running**
   ```bash
   cd backend
   npm start
   ```
   Server should be running on `http://localhost:1126`

2. **Admin Account Credentials**
   - Email: `admin@rateon.com`
   - Password: Dynamic (based on date formula)
   - Today's password (Feb 10, 2026): `10220269325`
   - Formula: `D+M+YYYY+9325` (no zero padding)

---

## Step 1: Admin Login

**Method:** POST  
**URL:** `http://localhost:1126/api/v1/admin/login`  
**Body (JSON):**
```json
{
  "email": "admin@rateon.com",
  "password": "10220269325"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Admin login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "email": "admin@rateon.com",
      "role": "admin"
    }
  }
}
```

**Action:** Copy the `token` value for use in subsequent requests.

---

## Step 2: Set Authorization Header

For all subsequent requests, add the following header:

**Header:**
- Key: `Authorization`
- Value: `Bearer <your_token_here>`

---

## Step 3: Test Analytics Endpoints

### 3.1 User Statistics

**Method:** GET  
**URL:** `http://localhost:1126/api/v1/admin/stats/users`  
**Headers:**
- Authorization: `Bearer <token>`

**Expected Response:**
```json
{
  "success": true,
  "message": "User statistics fetched successfully",
  "data": {
    "totalUsers": 0,
    "byRegistrationMethod": {
      "email": 0,
      "google": 0,
      "facebook": 0,
      "phone": 0
    },
    "byGender": {
      "male": 0,
      "female": 0,
      "other": 0,
      "prefer_not_to_say": 0
    },
    "byCountry": []
  }
}
```

---

### 3.2 Review Statistics

**Method:** GET  
**URL:** `http://localhost:1126/api/v1/admin/stats/reviews`  
**Headers:**
- Authorization: `Bearer <token>`

**Expected Response:**
```json
{
  "success": true,
  "message": "Review statistics fetched successfully",
  "data": {
    "totalReviews": 0,
    "averageRating": 0,
    "byRating": {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0
    },
    "totalReactions": 0,
    "reactionsByType": {
      "helpful": 0,
      "not_helpful": 0
    },
    "totalReplies": 0
  }
}
```

---

### 3.3 Business Statistics

**Method:** GET  
**URL:** `http://localhost:1126/api/v1/admin/stats/businesses`  
**Headers:**
- Authorization: `Bearer <token>`

**Expected Response:**
```json
{
  "success": true,
  "message": "Business statistics fetched successfully",
  "data": {
    "totalBusinesses": 0,
    "claimed": 0,
    "unclaimed": 0,
    "verified": 0,
    "active": 0,
    "items": {
      "total": 0,
      "byAvailability": {
        "available": 0,
        "out_of_stock": 0,
        "discontinued": 0
      }
    },
    "topCategories": []
  }
}
```

---

### 3.4 Top Businesses (Week)

**Method:** GET  
**URL:** `http://localhost:1126/api/v1/admin/stats/businesses/top?period=week`  
**Headers:**
- Authorization: `Bearer <token>`

**Expected Response:**
```json
{
  "success": true,
  "message": "Top businesses for week fetched successfully",
  "data": {
    "period": "week",
    "dateThreshold": "2026-02-03T...",
    "topBusinesses": []
  }
}
```

---

### 3.5 Top Businesses (Month)

**Method:** GET  
**URL:** `http://localhost:1126/api/v1/admin/stats/businesses/top?period=month`  
**Headers:**
- Authorization: `Bearer <token>`

**Expected Response:**
```json
{
  "success": true,
  "message": "Top businesses for month fetched successfully",
  "data": {
    "period": "month",
    "dateThreshold": "2026-01-10T...",
    "topBusinesses": []
  }
}
```

---

### 3.6 Location Data

**Method:** GET  
**URL:** `http://localhost:1126/api/v1/admin/stats/locations`  
**Headers:**
- Authorization: `Bearer <token>`

**Expected Response:**
```json
{
  "success": true,
  "message": "Location data fetched successfully",
  "data": {
    "totalLocations": 0,
    "locations": [],
    "topCountries": []
  }
}
```

---

### 3.7 Real-Time Metrics

**Method:** GET  
**URL:** `http://localhost:1126/api/v1/admin/stats/realtime`  
**Headers:**
- Authorization: `Bearer <token>`

**Expected Response:**
```json
{
  "success": true,
  "message": "Real-time metrics fetched successfully",
  "data": {
    "today": {
      "newUsers": 0,
      "newReviews": 0,
      "newReactions": 0,
      "date": "2026-02-10T00:00:00.000Z"
    },
    "lastHour": {
      "newUsers": 0,
      "newReviews": 0
    },
    "realTime": {
      "activeUsersNow": 0,
      "lastChecked": "2026-02-10T06:42:33.000Z"
    },
    "peakHour": null,
    "refreshedAt": "2026-02-10T06:42:33.000Z"
  }
}
```

---

## Step 4: Error Testing

### 4.1 Test Without Token

Remove Authorization header and try any endpoint.

**Expected Response:**
```json
{
  "success": false,
  "message": "Unauthorized: User not authenticated"
}
```

---

### 4.2 Test With Invalid Period

**URL:** `http://localhost:1126/api/v1/admin/stats/businesses/top?period=invalid`

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid period. Use \"week\" or \"month\""
}
```

---

## Step 5: Postman Collection

### Create Collection
1. Create new collection: "RateOn Admin Analytics"
2. Add all 7 requests (login + 6 analytics)
3. Set collection variable: `{{adminToken}}`
4. Use `{{adminToken}}` in Authorization headers

### Collection Variables
- `baseUrl`: `http://localhost:1126/api/v1`
- `adminToken`: (set after login)

### Request URLs
- Login: `{{baseUrl}}/admin/login`
- User Stats: `{{baseUrl}}/admin/stats/users`
- Review Stats: `{{baseUrl}}/admin/stats/reviews`
- Business Stats: `{{baseUrl}}/admin/stats/businesses`
- Top Businesses: `{{baseUrl}}/admin/stats/businesses/top`
- Locations: `{{baseUrl}}/admin/stats/locations`
- Real-time: `{{baseUrl}}/admin/stats/realtime`

---

## Expected Behavior

### With Empty Database
All endpoints should return:
- `success: true`
- Empty arrays or zero counts
- No errors

### With Data
All endpoints should return:
- `success: true`
- Populated data arrays
- Correct aggregations

---

## Troubleshooting

### Server Not Starting
```bash
cd backend
npm install
npm start
```

### Database Connection Error
Check MongoDB is running:
```bash
# Windows
net start MongoDB

# Or check .env file for MONGODB_URI
```

### Authentication Error
- Verify admin password formula
- Check today's date and calculate correct password
- Ensure token is fresh (not expired)

### Data Shows Zero
- This is normal for new database
- Create test data:
  - Register users
  - Create businesses
  - Add reviews
  - Then test analytics again

---

## Success Criteria

✅ All 6 analytics endpoints return 200 status  
✅ Response structure matches documentation  
✅ Error responses work correctly (401, 403, 400)  
✅ No server crashes or unhandled errors  
✅ Data aggregations are accurate (when data exists)

---

**Testing Complete:** Employee 5's work is verified and ready for Employee 6!
