# EMPLOYEE 4: ENHANCED REVIEW SYSTEM
**Duration:** 2 weeks (Start AFTER Employees 1, 2, 3 complete)
**Status:** NOT STARTED

## YOUR RESPONSIBILITY
Integrate Reply, Reaction, and Notification systems into the Review feature. Build complete review detail pages and enhanced review components.

---

## PROJECT STANDARDS - MUST FOLLOW
Follow existing backend/frontend structure exactly. Test after each file creation. If errors occur, try solving (3 attempts), then ask senior. Never commit broken code.

---

## FILES TO CREATE

### Backend (4 files)
1. `backend/src/controllers/review/getReviewWithReplies.js` - Get review + all replies threaded
2. `backend/src/controllers/review/getReviewStatistics.js` - Get review stats (reply count, reaction counts)
3. `backend/src/controllers/review/reportReview.js` - Report inappropriate review
4. Update `backend/src/routes/reviewRoutes.js` - Add new routes

### Frontend (6 files)
5. `frontend/src/app/features/review/review-detail/review-detail.component.ts`
6. `frontend/src/app/features/review/review-detail/review-detail.component.html`
7. `frontend/src/app/features/review/review-detail/review-detail.component.scss`
8. Update `frontend/src/app/core/services/review.service.ts` - Add integration methods
9. `frontend/src/app/features/review/review-form/review-form.component.ts` (Edit review)
10. `frontend/src/app/features/review/review-list/review-list.component.ts` (Display list)

---

## API ENDPOINTS

```
GET    /api/reviews/:id/with-replies   - Get review with threaded replies
GET    /api/reviews/:id/statistics      - Get review statistics
POST   /api/reviews/:id/report          - Report review
```

---

## TECHNICAL REQUIREMENTS

### You INTEGRATE these (built by other employees):
- **Reply System** (Employee 1): Use Reply API and reply-thread component
- **Reaction System** (Employee 2): Use Reaction API and reaction-buttons component
- **Notification System** (Employee 3): Notifications auto-triggered

### Review Detail Page Features:
1. Display review (rating, content, images, user info, timestamp)
2. Show reaction buttons (from Employee 2's component)
3. Show reply thread (from Employee 1's component)
4. Show "Edit" button (if owner)
5. Show "Report" button (if not owner)
6. Real-time updates for new replies/reactions

### Review List Features:
1. Display all reviews for a business/item
2. Sort by: newest, oldest, highest rated, most helpful
3. Filter by: rating (1-5 stars)
4. Pagination
5. Click review to open detail page

### Review Form (Edit):
1. Load existing review data
2. Allow editing rating, comment, images
3. Mark as edited on save
4. Validate before submit

---

## CRITICAL: MATCH EXISTING CODE STRUCTURE

**BEFORE WRITING ANY CODE:**

1. Study existing Review controllers in `backend/src/controllers/review/`
2. See how they:
   - Import models and utilities
   - Structure async functions
   - Handle responses (helper functions? direct res.json?)
   - Do pagination
   - Handle errors
   - Apply authentication

3. **COPY THAT EXACT STRUCTURE** - Do not create your own style

**Your code must be indistinguishable in structure from existing controllers**

Logic: Build threaded replies
Structure: MUST match project patterns exactly

---

## TESTING CHECKLIST

- [ ] Review detail page displays correctly
- [ ] Reaction buttons work (Employee 2's component)
- [ ] Reply thread works (Employee 1's component)
- [ ] Edit review works (owner only)
- [ ] Report review works
- [ ] Review list shows all reviews
- [ ] Sorting and filtering work
- [ ] Real-time updates appear
- [ ] Navigation between list and detail works

---

## INTEGRATION DEPENDENCIES

**WAIT FOR:**
- Employee 1: Reply API + components
- Employee 2: Reaction API + components
- Employee 3: Notification system (auto-works)

**YOU PROVIDE:**
- Complete review pages that others can link to

---

## DEADLINE & MILESTONES

- **Day 3**: Backend integration APIs complete
- **Day 7**: Review Detail page with integrated components
- **Day 10**: Review List with sorting/filtering
- **Day 14**: Review Form (edit) and all features polished

---

## START HERE
1. Wait for Employees 1, 2, 3 to finish their APIs
2. Study their components and services
3. Create getReviewWithReplies.js
4. Build Review Detail page
5. Import and embed reply-thread component
6. Import and embed reaction-buttons component
7. Test integration thoroughly