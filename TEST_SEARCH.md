# 🔍 Search Functionality Test Guide

## Quick Test Steps

### **1. Backend Test (via Browser/Postman)**

Open browser and test these URLs:

```
# Test 1: Get all businesses (no search)
http://localhost:1126/api/v1/businesses

# Test 2: Search for "cafe"
http://localhost:1126/api/v1/businesses?search=cafe

# Test 3: Search for "burger"
http://localhost:1126/api/v1/businesses?search=burger

# Test 4: Get all items
http://localhost:1126/api/v1/items/search

# Test 5: Search items for "pizza"
http://localhost:1126/api/v1/items/search?search=pizza
```

**Expected Results:**
- Test 1: Should return ALL businesses
- Test 2-3: Should return filtered businesses matching search
- Test 4: Should return ALL items
- Test 5: Should return filtered items matching search

---

### **2. Frontend Test (Browser Console)**

Open DevTools (F12) and run:

```javascript
// Test search bar component
const searchBar = document.querySelector('app-search-bar');
console.log('Search bar found:', searchBar);

// Check if live search observable exists
// (This will be in console logs when you type)
```

---

### **3. Live Search Test**

1. **Go to landing page** (`/`)
   - Type "burger" in search
   - Press Enter
   - Should navigate to `/search?q=burger`

2. **On search results page** (`/search`)
   - Type "pizza"
   - Wait 500ms
   - Check console for logs:
     ```
     Live search triggered: pizza URL: /search
     Performing live search for: pizza
     performLiveSearch called with: pizza
     performSearch called with query: pizza
     ```

3. **Clear search**
   - Click X button
   - Check console for logs
   - Should show ALL results

---

## Common Issues & Fixes

### **Issue 1: MongoDB Text Index Missing**

**Symptoms:** Search returns no results

**Fix:**
```bash
# Connect to MongoDB
mongosh

# Use your database
use rateon

# Check if text index exists
db.businesses.getIndexes()

# If missing, create it manually
db.businesses.createIndex({ name: "text", description: "text", category: "text" })
db.items.createIndex({ name: "text", description: "text", category: "text" })
```

---

### **Issue 2: Backend Not Running**

**Symptoms:** Network error in console

**Fix:**
```bash
cd backend
npm start
```

---

### **Issue 3: Frontend Not Connected**

**Symptoms:** API calls to wrong URL

**Check:** `frontend/src/environments/environment.ts`
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:1126/api/v1'  // Should be this
};
```

---

### **Issue 4: CORS Error**

**Symptoms:** "Access-Control-Allow-Origin" error

**Fix:** Check `backend/src/server.js`
```javascript
app.use(cors({
  origin: 'http://localhost:5300',  // Frontend URL
  credentials: true
}));
```

---

## Debug Checklist

- [ ] Backend running on port 1126
- [ ] Frontend running on port 5300
- [ ] MongoDB running
- [ ] Text indexes created in MongoDB
- [ ] At least 1 business in database
- [ ] At least 1 item in database
- [ ] Browser console open (F12)
- [ ] Network tab open to see API calls

---

## Expected Console Logs

### **When typing in search bar:**
```
Live search triggered: b URL: /
Live search triggered: bu URL: /
Live search triggered: bur URL: /
Live search triggered: burg URL: /
Live search triggered: burge URL: /
Live search triggered: burger URL: /search
Performing live search for: burger
performLiveSearch called with: burger
performSearch called with query: burger
```

### **When clearing search:**
```
Live search triggered:  URL: /search
Performing live search for: 
performLiveSearch called with: 
Removing query param (empty search)
performSearch called with query: 
```

---

## Network Tab Check

Open Network tab in DevTools and search for "burger":

**Expected Requests:**
1. `GET /api/v1/businesses?search=burger&limit=5` (for suggestions)
2. `GET /api/v1/items/search?search=burger&limit=5` (for suggestions)
3. `GET /api/v1/businesses?search=burger` (for results page)

**Response should have:**
```json
{
  "success": true,
  "message": "Businesses retrieved successfully",
  "data": {
    "businesses": [...],
    "pagination": {...}
  }
}
```

---

## Quick Fix Commands

```bash
# Restart backend
cd backend
npm start

# Restart frontend
cd frontend
npm run dev

# Check MongoDB connection
mongosh
show dbs
use rateon
db.businesses.countDocuments()
db.items.countDocuments()
```

---

## Still Not Working?

Run this debug script in browser console:

```javascript
// Check environment
console.log('Current URL:', window.location.href);
console.log('Search query params:', new URLSearchParams(window.location.search).get('q'));

// Check if search bar exists
const searchBar = document.querySelector('input.search-input');
console.log('Search bar element:', searchBar);
console.log('Search bar value:', searchBar?.value);

// Test API manually
fetch('http://localhost:1126/api/v1/businesses?search=burger')
  .then(r => r.json())
  .then(data => console.log('API Response:', data))
  .catch(err => console.error('API Error:', err));
```

---

**If still having issues, check console logs and network tab!**
