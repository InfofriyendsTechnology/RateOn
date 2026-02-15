# EMPLOYEE 2: REACTION SYSTEM
**Duration:** 2 weeks  
**Status:** ✅ COMPLETED

## YOUR RESPONSIBILITY
Build the complete Reaction System (Backend + Frontend) with one-reaction-per-user constraint and real-time notifications.

---

## PROJECT STANDARDS - MUST FOLLOW

### 1. Follow Existing Backend Structure
- **IMPORTANT**: Study how existing APIs are built in `backend/src/controllers/`
- Match the same file organization, naming conventions, and code patterns
- Import statements, error handling, response format MUST match existing controllers
- Check `backend/src/controllers/review/` or `backend/src/controllers/business/` for reference

### 2. Follow Existing Frontend Structure
- Study existing services in `frontend/src/app/core/services/`
- Study existing components in `frontend/src/app/shared/components/`
- Follow the same TypeScript patterns, interfaces, and Angular conventions
- Use existing HTTP interceptors, auth guards, and error handlers

### 3. How Previous Work Was Done
- Look at existing Review/Business controllers to understand:
  - Authentication middleware usage
  - Database query patterns
  - Population/projection methods
  - Error response structure
  - Success response structure
- Copy the working patterns, do NOT create your own style

### 4. Code Quality Rules
- ✅ Must validate ALL user inputs
- ✅ Must check user permissions (ownership, roles)
- ✅ Must handle all error cases with proper status codes
- ✅ Must use try-catch blocks
- ✅ Must log errors to console
- ✅ No console.log in production code (use proper logging)
- ✅ Follow ESLint/TSLint rules if configured

### 5. Testing Workflow (MANDATORY)
After creating each file:

**Backend:**
```bash
# 1. Check syntax
node backend/src/controllers/reaction/yourfile.js

# 2. Start server and test
cd backend
npm start

# 3. Test with Postman/Thunder Client
# Test all success cases
# Test all error cases (invalid data, unauthorized, not found)
```

**Frontend:**
```bash
# 1. Check compilation
cd frontend
ng build

# 2. Run linting
ng lint

# 3. Start dev server
ng serve

# 4. Test in browser manually
```

### 6. Error Resolution Process

IF ERROR OCCURS:

**Step 1:** Try to solve automatically
- Read error message carefully
- Check syntax, imports, typos
- Compare with working example files
- Fix and test again

**Step 2:** If still broken after 3 attempts:
- STOP and document the error
- Ask senior/manager with:
  - Exact error message
  - What you tried
  - Which file has the issue
  - Screenshots if UI issue

**Step 3:** DO NOT:
- ❌ Commit broken code
- ❌ Create your own solution that doesn't match project style
- ❌ Skip testing and assume it works
- ❌ Ignore warnings or errors

### 7. Code Review Before Completion
Before marking as DONE, verify:
- [ ] Follows existing backend controller patterns exactly
- [ ] Follows existing frontend service/component patterns exactly
- [ ] All APIs tested with Postman (success + error cases)
- [ ] Frontend tested in browser (all features work)
- [ ] No console errors in browser
- [ ] No server errors in terminal
- [ ] Code matches project formatting/style
- [ ] All imports resolve correctly
- [ ] Authentication/authorization works
- [ ] Notifications are triggered correctly

---

## FILES TO CREATE

### Backend (6 files)
1. `backend/src/controllers/reaction/toggleReaction.js` - Add/remove reaction
2. `backend/src/controllers/reaction/getUserReactions.js` - Get user's reactions
3. `backend/src/controllers/reaction/getReactionsByReview.js` - Get all reactions for review
4. `backend/src/controllers/reaction/index.js` - Export all controllers
5. `backend/src/routes/reactionRoutes.js` - Route definitions
6. Update `backend/src/routes/index.js` - Add reaction routes

### Frontend (4 files)
7. `frontend/src/app/core/services/reaction.service.ts`
8. `frontend/src/app/shared/components/reaction-buttons/reaction-buttons.component.ts`
9. `frontend/src/app/shared/components/reaction-buttons/reaction-buttons.component.html`
10. `frontend/src/app/shared/components/reaction-buttons/reaction-buttons.component.scss`

---

## API ENDPOINTS YOU MUST CREATE

```
POST   /api/reactions/toggle           - Toggle reaction (add/remove)
GET    /api/reactions/user/:userId     - Get all reactions by user
GET    /api/reactions/review/:reviewId - Get all reactions for a review
```

---

## TECHNICAL REQUIREMENTS

### Backend Logic:

1. **Toggle Reaction**
   - Check if user already reacted to this review
   - If exists: Remove reaction, update review.stats.helpfulCount (-1 or +1)
   - If not exists: Create reaction, update review.stats.helpfulCount
   - Trigger notification via NotificationService
   - Return new reaction state

2. **Get User Reactions**
   - Fetch all reactions by specific user
   - Populate review info
   - Sort by createdAt (newest first)

3. **Get Reactions by Review**
   - Fetch all reactions for a review
   - Populate user info (username, avatar)
   - Group by reaction type (helpful/not_helpful)
   - Return counts for each type

### Reaction Rules:
- ✅ One user can only have ONE reaction per review
- ✅ User can change reaction type (removes old, adds new)
- ✅ User cannot react to their own review
- ✅ Reactions can be: `helpful` or `not_helpful`

### Frontend Features:

1. **Reaction Buttons Component**
   - Show "Helpful" and "Not Helpful" buttons
   - Highlight active reaction (if user already reacted)
   - Show count for each reaction type
   - Disable if user owns the review
   - Click to toggle reaction

2. **Reaction Service**
   - toggleReaction(reviewId, type)
   - getUserReactions(userId)
   - getReactionsByReview(reviewId)
   - subscribeToReactionUpdates() - WebSocket

---

## IMPORTANT DEPENDENCIES

### You MUST use these (already created):
- **Models**: `Reaction`, `Review`, `User` from `models/index.js`
- **Service**: `NotificationService` from `utils/notificationService.js`
- **Middleware**: Authentication middleware (check existing controllers)

### Notification Triggers:
```javascript
// When user reacts to a review:
await NotificationService.notifyReviewReaction(reaction, reviewOwnerId);
```

---

## DATABASE SCHEMA (Reference)

```javascript
Reaction Schema:
{
  reviewId: ObjectId (ref: Review),
  replyId: ObjectId (ref: Reply) | null,  // null for review reactions
  userId: ObjectId (ref: User),
  type: String (enum: ['helpful', 'not_helpful']),
  createdAt: Date,
  updatedAt: Date
}

// Unique compound index: [reviewId, userId]
// One user can only react once per review
```

---

## CRITICAL: FOLLOW PROJECT STRUCTURE EXACTLY

**BEFORE WRITING ANY CODE:**

1. **Study existing controllers** in `backend/src/controllers/review/` or `backend/src/controllers/business/`
2. **Identify the patterns:**
   - Import structure (path aliases? relative imports?)
   - Response format (is there a responseHandler utility?)
   - Validation approach (manual? validator library? middleware?)
   - Error handling pattern
   - Authentication flow

3. **Check for utilities:**
   - Look in `backend/src/utils/` for helper functions
   - Response handlers
   - Validation helpers
   - Error classes

4. **Replicate EXACT structure** - Do NOT use generic examples

**If existing code uses:**
- `responseHandler.success(res, data)` → USE THAT
- `responseHandler.error(res, message, code)` → USE THAT
- `validateRequest(schema)` middleware → USE THAT
- Custom error classes → USE THOSE

**Your code MUST look identical in structure to existing controllers**

---

## TESTING CHECKLIST

- [ ] Add helpful reaction works
- [ ] Add not_helpful reaction works
- [ ] Toggle off reaction works (click again removes it)
- [ ] Change reaction type works
- [ ] Cannot react to own review
- [ ] One reaction per user per review (constraint enforced)
- [ ] Review counts update correctly
- [ ] Notifications are triggered
- [ ] Frontend buttons highlight active reaction
- [ ] Frontend counts display correctly
- [ ] Real-time updates work

---

## INTEGRATION WITH OTHER EMPLOYEES

**You provide to Employee 4:**
- Reaction API endpoints (they'll use in review detail page)
- Reaction Service (they'll import it)
- Reaction Buttons Component (they'll embed it)

**You coordinate with Employee 3:**
- Your API calls NotificationService (already created)
- Test that notifications appear when reactions are added

---

## DEADLINE & MILESTONES

- **Day 3**: Backend APIs complete (toggle, get user/review reactions)
- **Day 7**: Routes configured, tested with Postman
- **Day 10**: Frontend Reaction Service complete
- **Day 14**: Reaction Buttons Component complete with highlighting

---

## QUESTIONS?
Ask manager if you need clarification on:
1. More reaction types beyond helpful/not_helpful?
2. Reaction animations or visual effects?
3. Show list of users who reacted?
4. Reply reactions (separate from review reactions)?

---

## START HERE
1. Study existing Review controllers for patterns
2. Create `toggleReaction.js` (most complex logic)
3. Create `getUserReactions.js` and `getReactionsByReview.js`
4. Set up routes
5. Test with Postman (test toggle on/off, change type)
6. Move to Frontend
