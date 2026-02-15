# 🎯 PHASE 2 - PENDING WORK (NO TIMELINE)

**Project:** RateOn  
**Status:** Backend 100% ✅ | Frontend 70% ⏳  
**Goal:** Complete remaining 30% frontend features

---

## 📊 CURRENT STATUS

### ✅ DONE (Phase 1):
- Backend: 100% (58+ APIs)
- Auth pages, User dashboard, Business owner dashboard
- Admin analytics dashboard
- Reply system, Reaction buttons, Notification bell
- Item management, Review detail page
- Location selector, Trust score backend

### ❌ PENDING (Phase 2):
**6 Critical Features + 6 Medium Features = 12 Total**

---

## 🔴 CRITICAL FEATURES (Must Build)

### **1. PUBLIC BUSINESS LISTING PAGE** → Employee 1

**What:** Page where users browse all businesses

**Files to Create:**
- `frontend/src/app/features/business/business-list/business-list.component.ts`
- `frontend/src/app/features/business/business-list/business-list.component.html`
- `frontend/src/app/features/business/business-list/business-list.component.scss`

**Features:**
- Grid of business cards
- Show: name, photo, category, rating, reviews count, location
- Pagination
- "View Details" button → goes to business detail page

**APIs:**
- `GET /api/v1/businesses` (already exists)

---

### **2. PUBLIC BUSINESS DETAIL PAGE** → Employee 1

**What:** Page showing one business with all its items

**Files to Create:**
- `frontend/src/app/features/business/public-business-detail/public-business-detail.component.ts`
- `frontend/src/app/features/business/public-business-detail/public-business-detail.component.html`
- `frontend/src/app/features/business/public-business-detail/public-business-detail.component.scss`

**Features:**
- Business header (name, photos, category, location, ratings)
- Grid of items (photo, name, price, rating, availability)
- Click item → open item detail modal (Employee 3's work)
- Reviews section
- Location map

**APIs:**
- `GET /api/v1/businesses/:id` (already exists)
- `GET /api/v1/items/business/:businessId` (already exists)

**Routes to Add:**
- `/businesses` (listing)
- `/business/:id` (detail)

---

### **3. WRITE REVIEW PAGE** → Employee 2

**What:** Page where users write reviews for items

**Files to Create:**
- `frontend/src/app/features/review/write-review/write-review.component.ts`
- `frontend/src/app/features/review/write-review/write-review.component.html`
- `frontend/src/app/features/review/write-review/write-review.component.scss`

**Features:**
- Select business (dropdown/search)
- Select item from that business
- Star rating input (1-5)
- Review title (input)
- Review text (textarea, min 10 chars)
- Photo upload (multiple, max 5)
- Submit button
- Show auth modal if not logged in
- Save draft in localStorage during auth

**APIs:**
- `POST /api/v1/reviews` (already exists)

---

### **4. ITEM DETAIL MODAL** → Employee 3

**What:** Popup modal showing item details when user clicks any item

**Files to Create:**
- `frontend/src/app/shared/components/item-detail-modal/item-detail-modal.component.ts`
- `frontend/src/app/shared/components/item-detail-modal/item-detail-modal.component.html`
- `frontend/src/app/shared/components/item-detail-modal/item-detail-modal.component.scss`

**Features:**
- Modal overlay (click outside to close)
- Large item photo(s)
- Item name, price, availability badge
- Average rating, total reviews
- List of reviews for this item
- "Write Review" button
- Close button (X)
- Responsive

**APIs:**
- `GET /api/v1/items/:id` (already exists)
- `GET /api/v1/reviews/item/:itemId` (already exists)

---

### **5. ACTIVITY FEED PAGE** → Employee 4

**What:** Page showing recent platform activity

**Files to Create:**
- `frontend/src/app/features/social/activity-feed/activity-feed.component.ts`
- `frontend/src/app/features/social/activity-feed/activity-feed.component.html`
- `frontend/src/app/features/social/activity-feed/activity-feed.component.scss`

**Features:**
- Two tabs: "All Activity" & "Following"
- Activity cards showing:
  - User avatar & name
  - Action (reviewed, replied, followed)
  - Target (business/item/user name)
  - Timestamp ("2 hours ago")
  - Preview text
  - Click → navigate to detail
- Filter by activity type
- Load more / pagination

**APIs:**
- `GET /api/v1/activity/following` (already exists)
- `GET /api/v1/activity/user/:userId` (already exists)

---

### **6. LEADERBOARD PAGE** → Employee 5

**What:** Page showing top users by trust score

**Files to Create:**
- `frontend/src/app/features/social/leaderboard/leaderboard.component.ts`
- `frontend/src/app/features/social/leaderboard/leaderboard.component.html`
- `frontend/src/app/features/social/leaderboard/leaderboard.component.scss`

**Features:**
- Period selector: Week / Month / All Time
- Top 10 users table
- Show: rank, avatar, name, trust score, level, reviews count
- Highlight top 3 with special badges
- Highlight current user

**APIs:**
- `GET /api/v1/leaderboard?period=week|month|all` (already exists)

---

## 🟡 MEDIUM FEATURES (Should Build)

### **7. SEARCH BAR COMPONENT** → Employee 6

**What:** Search bar with suggestions

**Files to Create:**
- `frontend/src/app/shared/components/search-bar/search-bar.component.ts`
- `frontend/src/app/shared/components/search-bar/search-bar.component.html`
- `frontend/src/app/shared/components/search-bar/search-bar.component.scss`

**Features:**
- Search input with icon
- Dropdown suggestions as user types
- Search businesses, items, categories
- Recent searches (localStorage)
- Clear button

---

### **8. FILTER SIDEBAR** → Employee 6

**What:** Filters for business/item search

**Files to Create:**
- `frontend/src/app/shared/components/filter-sidebar/filter-sidebar.component.ts`
- `frontend/src/app/shared/components/filter-sidebar/filter-sidebar.component.html`
- `frontend/src/app/shared/components/filter-sidebar/filter-sidebar.component.scss`

**Features:**
- Category checkboxes
- Rating filter (stars)
- Price range (slider)
- Availability toggle
- Location dropdown
- Apply / Clear All buttons
- Mobile: slide-in drawer

---

### **9. SEARCH RESULTS PAGE** → Employee 6

**What:** Page showing search results

**Files to Create:**
- `frontend/src/app/features/search/search-results/search-results.component.ts`
- `frontend/src/app/features/search/search-results/search-results.component.html`
- `frontend/src/app/features/search/search-results/search-results.component.scss`

**Features:**
- Tabs: All / Businesses / Items
- Result count
- Sort by: relevance, rating, newest
- Pagination

**APIs:**
- `GET /api/v1/businesses?search=...` (already exists)
- `GET /api/v1/items?search=...` (already exists)

---

### **10. FOLLOW BUTTON COMPONENT** → Employee 7

**What:** Reusable follow/unfollow button

**Files to Create:**
- `frontend/src/app/shared/components/follow-button/follow-button.component.ts`
- `frontend/src/app/shared/components/follow-button/follow-button.component.html`
- `frontend/src/app/shared/components/follow-button/follow-button.component.scss`

**Features:**
- Button states: "Follow" / "Following" / "Unfollow"
- Loading state
- Follower count display
- Reusable component

**APIs:**
- `POST /api/v1/follow/:userId` (already exists)
- `DELETE /api/v1/follow/:userId` (already exists)

---

### **11. FOLLOWERS/FOLLOWING LISTS** → Employee 7

**What:** Pages showing followers and following

**Files to Create:**
- `frontend/src/app/features/social/followers-list/followers-list.component.ts`
- `frontend/src/app/features/social/followers-list/followers-list.component.html`
- `frontend/src/app/features/social/followers-list/followers-list.component.scss`

**Features:**
- List of users
- User cards: avatar, name, trust score, follow button
- Search within list
- Pagination

**APIs:**
- `GET /api/v1/follow/:userId/followers` (already exists)
- `GET /api/v1/follow/:userId/following` (already exists)

---

### **12. TRUST SCORE BADGE** → Employee 5

**What:** Reusable component showing trust score

**Files to Create:**
- `frontend/src/app/shared/components/trust-score-badge/trust-score-badge.component.ts`
- `frontend/src/app/shared/components/trust-score-badge/trust-score-badge.component.html`
- `frontend/src/app/shared/components/trust-score-badge/trust-score-badge.component.scss`

**Features:**
- Display level (1-10)
- Progress bar to next level
- Points (current / needed)
- Tooltip explaining levels

---

## ⚠️ CRITICAL RULES

### For ALL Employees:

**1. Import Paths:**
```typescript
// ❌ WRONG
import { X } from '@app/core/services/review.ts';

// ✅ CORRECT
import { X } from '../../../core/services/review';
```

**2. TypeScript Types:**
```typescript
// ❌ WRONG
.subscribe((data) => { ... })

// ✅ CORRECT
.subscribe((data: any) => { ... })
```

**3. Before Completing:**
- ✅ Run `npm run build` - must pass
- ✅ Test in browser
- ✅ Check console for errors
- ✅ Test on mobile size

**4. Component Structure:**
- ✅ Standalone components
- ✅ Import CommonModule
- ✅ Add loading states
- ✅ Add error states
- ✅ Add empty states

---

## 📋 QUICK SUMMARY

**Total Pending:** 12 features

**By Priority:**
- 🔴 Critical: 6 features (business listing, business detail, write review, item modal, activity feed, leaderboard)
- 🟡 Medium: 6 features (search bar, filters, search results, follow button, followers list, trust score badge)

**By Employee:**
- Employee 1: 2 features (business pages)
- Employee 2: 1 feature (write review)
- Employee 3: 1 feature (item modal)
- Employee 4: 1 feature (activity feed)
- Employee 5: 2 features (leaderboard, trust score badge)
- Employee 6: 3 features (search bar, filters, search results)
- Employee 7: 2 features (follow button, followers list)

**Total Files to Create:** ~36 files

---

## ✅ DEFINITION OF DONE

A feature is complete when:
- ✅ All files created
- ✅ Build passes (0 errors)
- ✅ Works in browser
- ✅ Responsive design
- ✅ Loading/error states
- ✅ No console errors

---

## 🚀 START WORKING

**All employees:** Pick your task and start building now!

**Questions?** Check existing components for examples.

**Stuck?** Ask senior employee after 3 attempts.

---

**STATUS:** Phase 2 Ready to Start  
**CONCEPT:** 70% Complete  
**REMAINING:** 30% (these 12 features)
