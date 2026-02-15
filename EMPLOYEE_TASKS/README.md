# EMPLOYEE TASK DISTRIBUTION - RATEON PROJECT

**Project Manager:** Read this first to understand the work distribution.

---

## OVERVIEW

The project has been divided into **7 independent work tracks** for parallel development. Each employee has a dedicated task file with clear instructions, file lists, and API contracts.

---

## CRITICAL RULES FOR ALL EMPLOYEES

### ⚠️ MOST IMPORTANT RULE ⚠️

**NEVER COPY GENERIC CODE EXAMPLES**

Every employee MUST:
1. ✅ Study existing code in `backend/src/controllers/` and `frontend/src/app/`
2. ✅ Copy the EXACT structure, patterns, and conventions from existing files
3. ✅ Use project's response handlers, validators, and utilities
4. ✅ Match import paths, error handling, and coding style 100%
5. ❌ NEVER use generic `res.status().json()` if project has helper functions
6. ❌ NEVER invent their own patterns or structure

**If they don't follow project structure, their code will break the system.**

---

## WORK DISTRIBUTION

### **EMPLOYEE 1: Reply System** (2 weeks)
**File:** `EMPLOYEE_1_REPLY_SYSTEM.md`
**Status:** ✅ Example file created (`backend/src/controllers/reply/createReply.js`)

**Deliverables:**
- Backend: Reply CRUD APIs with threading (parentReplyId support)
- Frontend: Reply thread component, reply service
- Notifications: Auto-trigger when replies created

**Dependencies:** None (can start immediately)

---

### **EMPLOYEE 2: Reaction System** (2 weeks)
**File:** `EMPLOYEE_2_REACTION_SYSTEM.md`

**Deliverables:**
- Backend: Toggle reaction API (helpful/not_helpful)
- Frontend: Reaction buttons component with highlighting
- One-reaction-per-user constraint enforcement
- Notifications: Auto-trigger when reactions added

**Dependencies:** None (can start immediately)

---

### **EMPLOYEE 3: Notification System** (2 weeks)
**File:** `EMPLOYEE_3_NOTIFICATION_SYSTEM.md`

**Deliverables:**
- Backend: Notification CRUD APIs
- WebSocket: Real-time notification delivery (Socket.io)
- Frontend: Notification bell + panel components
- Mark as read, delete, pagination

**Dependencies:** None (can start immediately, but integrates with 1 & 2's outputs)

---

### **EMPLOYEE 4: Enhanced Review System** (2 weeks)
**File:** `EMPLOYEE_4_REVIEW_SYSTEM.md`
**⚠️ START AFTER Employees 1, 2, 3 complete**

**Deliverables:**
- Backend: Review detail with replies API, review stats, report review
- Frontend: Review detail page, review list with filters/sorting
- Integration: Embed reply-thread and reaction-buttons components

**Dependencies:** 
- Employee 1: Reply system
- Employee 2: Reaction system
- Employee 3: Notification system (auto-works)

---

### **EMPLOYEE 5: Admin Analytics Backend** (2 weeks)
**File:** `EMPLOYEE_5_ADMIN_ANALYTICS_BACKEND.md`

**Deliverables:**
- User statistics (by registration method, gender, country)
- Review statistics (total, by rating, avg rating)
- Top businesses (week/month)
- Location data (for map visualization)
- Real-time metrics (today's stats)

**Dependencies:** None (can start immediately)

---

### **EMPLOYEE 6: Admin Analytics Frontend** (2 weeks)
**File:** `EMPLOYEE_6_ADMIN_ANALYTICS_FRONTEND.md`
**⚠️ START AFTER Employee 5 completes**

**Deliverables:**
- Admin dashboard with charts (Chart.js)
- User location map (Leaflet.js)
- Top businesses table
- Admin guard (route protection)
- Stat cards, filters, real-time updates

**Dependencies:**
- Employee 5: Admin backend APIs

---

### **EMPLOYEE 7: Location System** (2 weeks)
**File:** `EMPLOYEE_7_LOCATION_SYSTEM.md`

**Deliverables:**
- Backend: Country/State/City APIs (using `country-state-city` npm package)
- IP-based location detection (ipapi.co)
- Frontend: Cascading location selector (Country→State→City)
- Google Places autocomplete integration
- Auto-detect and pre-fill user location

**Dependencies:** None (can start immediately)

---

## PARALLEL WORK SCHEDULE

### **Week 1-2: Initial Phase**
**Can work simultaneously:**
- Employee 1: Reply System
- Employee 2: Reaction System
- Employee 3: Notification System
- Employee 5: Admin Analytics Backend
- Employee 7: Location System

**Waiting:**
- Employee 4: Waits for 1, 2, 3
- Employee 6: Waits for 5

---

### **Week 3-4: Integration Phase**
- Employee 4: Starts after 1, 2, 3 complete
- Employee 6: Starts after 5 completes
- Others: Continue or polish

---

## TESTING REQUIREMENTS

Each employee MUST test their work:

### Backend Testing:
1. ✅ Test with Postman after each API creation
2. ✅ Test success cases
3. ✅ Test error cases (invalid data, unauthorized, not found)
4. ✅ Run backend server: `cd backend && npm start`

### Frontend Testing:
1. ✅ Compile: `cd frontend && ng build`
2. ✅ Lint: `ng lint`
3. ✅ Run dev server: `ng serve`
4. ✅ Manual testing in browser

---

## ERROR RESOLUTION PROCESS

All employees follow same process:

**Step 1:** Try to solve automatically (max 3 attempts)
- Read error message
- Check syntax, imports, typos
- Compare with working example files
- Fix and test again

**Step 2:** If still broken after 3 attempts
- STOP and document the error
- Ask senior/manager with:
  - Exact error message
  - What you tried
  - Which file has issue
  - Screenshots (if UI issue)

**Step 3:** DO NOT
- ❌ Commit broken code
- ❌ Create own solution that doesn't match project style
- ❌ Skip testing
- ❌ Ignore warnings or errors

---

## INTEGRATION POINTS

### Employee 1 (Reply) → Employee 4 (Review)
- Reply API endpoints
- Reply Service
- Reply Thread Component

### Employee 2 (Reaction) → Employee 4 (Review)
- Reaction API endpoints
- Reaction Service
- Reaction Buttons Component

### Employee 3 (Notification) → Employees 1, 2, 4
- NotificationService utility already created
- Their APIs call it automatically
- Real-time notifications work when integrated

### Employee 5 (Admin Backend) → Employee 6 (Admin Frontend)
- All analytics APIs
- Data format specifications

### Employee 7 (Location) → Multiple
- Used by registration form
- Used by profile edit form
- Used by Employee 5 (location data for map)

---

## FILES ALREADY CREATED

### ✅ Models (Already exist)
- `backend/src/models/UserModel.js` (enhanced with location fields)
- `backend/src/models/ReviewModel.js`
- `backend/src/models/ReplyModel.js`
- `backend/src/models/ReactionModel.js`
- `backend/src/models/NotificationModel.js`

### ✅ Utilities (Already exist)
- `backend/src/utils/notificationService.js` (with all notification methods)

### ✅ Example (For reference)
- `backend/src/controllers/reply/createReply.js` (shows full pattern)

---

## MANAGER CHECKLIST

Before assigning tasks:

1. ✅ All 7 employee task files created in `EMPLOYEE_TASKS/` folder
2. ✅ Models and utilities already in place
3. ✅ Example file created for reference
4. ✅ Each employee has clear file list, API contracts, testing checklist
5. ✅ Dependencies clearly marked (who waits for whom)

**To assign:**
1. Give Employee 1: `EMPLOYEE_1_REPLY_SYSTEM.md`
2. Give Employee 2: `EMPLOYEE_2_REACTION_SYSTEM.md`
3. Give Employee 3: `EMPLOYEE_3_NOTIFICATION_SYSTEM.md`
4. Give Employee 5: `EMPLOYEE_5_ADMIN_ANALYTICS_BACKEND.md`
5. Give Employee 7: `EMPLOYEE_7_LOCATION_SYSTEM.md`
6. **Wait 2 weeks**, then give Employee 4: `EMPLOYEE_4_REVIEW_SYSTEM.md`
7. **Wait for Employee 5**, then give Employee 6: `EMPLOYEE_6_ADMIN_ANALYTICS_FRONTEND.md`

---

## IMPORTANT NOTES

### Database Indexes
Make sure these indexes exist for performance:
- `Review`: `{ businessId: 1, createdAt: -1 }`
- `Reply`: `{ reviewId: 1, createdAt: 1 }`
- `Reaction`: `{ reviewId: 1, userId: 1 }` (unique)
- `Notification`: `{ userId: 1, isRead: 1, createdAt: -1 }`

### Environment Variables
Employees may need:
- `JWT_SECRET` (for WebSocket auth)
- `FRONTEND_URL` (for CORS)
- `GOOGLE_PLACES_API_KEY` (for Employee 7)

### NPM Packages to Install
- Backend: `socket.io`, `country-state-city`, `axios` (if not already)
- Frontend: `socket.io-client`, `chart.js`, `ng2-charts`, `leaflet`, `@types/leaflet`

---

## QUESTIONS?

If employees have questions:
1. First: Study existing code
2. Second: Check their task file's FAQ section
3. Third: Ask manager/senior

Do NOT let them:
- Work without studying existing code first
- Copy generic examples from internet
- Invent their own patterns
- Skip testing

---

**END OF README**
