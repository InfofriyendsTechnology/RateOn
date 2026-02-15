# EMPLOYEE 5: ADMIN ANALYTICS BACKEND
**Duration:** 2 weeks
**Status:** NOT STARTED

## YOUR RESPONSIBILITY
Build complete admin analytics backend APIs providing statistics, metrics, and data for the admin dashboard.

---

## PROJECT STANDARDS - MUST FOLLOW
Follow existing backend structure exactly. Test after each file creation with Postman. If errors occur, try solving (3 attempts), then ask senior. Never commit broken code.

---

## FILES TO CREATE

### Backend (8 files)
1. `backend/src/controllers/admin/getUserStatistics.js`
2. `backend/src/controllers/admin/getReviewStatistics.js`
3. `backend/src/controllers/admin/getBusinessStatistics.js`
4. `backend/src/controllers/admin/getLocationData.js`
5. `backend/src/controllers/admin/getRealTimeMetrics.js`
6. `backend/src/controllers/admin/getTopBusinesses.js`
7. `backend/src/controllers/admin/index.js`
8. `backend/src/routes/adminAnalyticsRoutes.js`
9. Update `backend/src/routes/index.js`

---

## API ENDPOINTS

```
GET /api/admin/stats/users          - User statistics by registration method, gender, country
GET /api/admin/stats/reviews        - Review statistics (total, by rating, by business)
GET /api/admin/stats/businesses/top - Top businesses (week/month)
GET /api/admin/stats/locations      - User locations for map
GET /api/admin/stats/realtime       - Real-time metrics (new users today, reviews today)
```

---

## TECHNICAL REQUIREMENTS

### 1. User Statistics
```javascript
// Return:
{
  totalUsers: 1500,
  byRegistrationMethod: {
    email: 800,
    google: 450,
    facebook: 200,
    phone: 50
  },
  byGender: {
    male: 700,
    female: 600,
    other: 50,
    prefer_not_to_say: 150
  },
  byCountry: [
    { country: 'USA', count: 500 },
    { country: 'UK', count: 300 }
  ]
}
```

### 2. Review Statistics
```javascript
// Return:
{
  totalReviews: 5000,
  averageRating: 4.2,
  byRating: {
    1: 100,
    2: 200,
    3: 500,
    4: 1500,
    5: 2700
  },
  totalReactions: 8000,
  totalReplies: 3000
}
```

### 3. Top Businesses
```javascript
// Parameters: period ('week' | 'month')
// Return:
[
  {
    businessId: '...',
    businessName: 'ABC Restaurant',
    reviewCount: 150,
    averageRating: 4.8,
    reactionCount: 500
  }
]
```

### 4. Location Data (for map)
```javascript
// Return array of user locations:
[
  {
    userId: '...',
    coordinates: { type: 'Point', coordinates: [lng, lat] },
    city: 'New York',
    country: 'USA'
  }
]
```

### 5. Real-Time Metrics
```javascript
// Return:
{
  usersToday: 25,
  reviewsToday: 80,
  reactionsToday: 150,
  activeUsersNow: 45  // Users active in last 15 minutes
}
```

---

## CRITICAL: USE PROJECT STRUCTURE ONLY

**DO NOT USE GENERIC CODE EXAMPLES**

**MANDATORY:**
1. Open existing controllers in `backend/src/controllers/`
2. Study EXACTLY how they work:
   - Import statements
   - Response handling (utility or direct?)
   - Error handling pattern
   - Authentication checks
   - Data formatting

3. **REPLICATE THAT STRUCTURE** exactly
4. Check if admin middleware exists - use it instead of inline checks
5. Use project's response handler if it exists
6. Follow project's aggregation patterns if any exist

**Logic:** MongoDB aggregations for statistics
**Structure:** MUST match existing project patterns 100%

---

## TESTING CHECKLIST

- [ ] User statistics API works
- [ ] Review statistics API works
- [ ] Top businesses API works (week and month)
- [ ] Location data API returns valid coordinates
- [ ] Real-time metrics API works
- [ ] Admin authentication required
- [ ] Non-admin users blocked
- [ ] All aggregations optimized with indexes

---

## INTEGRATION

**You provide to Employee 6:**
- All analytics APIs
- Data format specifications

**Employee 6 will:**
- Call your APIs from frontend
- Display data in charts and maps

---

## DEADLINE & MILESTONES

- **Day 3**: User & Review statistics APIs
- **Day 7**: Top businesses & location APIs
- **Day 10**: Real-time metrics API
- **Day 14**: All APIs tested, optimized, documented

---

## START HERE
1. Create admin middleware (check super_admin role)
2. Create getUserStatistics.js with aggregations
3. Test with Postman (use admin token)
4. Create remaining statistics endpoints
5. Optimize queries with proper indexes