# EMPLOYEE 1: REPLY SYSTEM
**Duration:** 2 weeks  
**Status:** IN PROGRESS

## YOUR RESPONSIBILITY
Build the complete Reply System (Backend + Frontend) with threaded replies and real-time notifications.

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
node backend/src/controllers/reply/yourfile.js

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

### Backend (7 files)
1. ✅ `backend/src/controllers/reply/createReply.js` - **DONE** (Example provided)
2. `backend/src/controllers/reply/updateReply.js`
3. `backend/src/controllers/reply/deleteReply.js`
4. `backend/src/controllers/reply/getRepliesByReview.js`
5. `backend/src/controllers/reply/index.js` - Export all controllers
6. `backend/src/routes/replyRoutes.js` - Route definitions
7. Update `backend/src/routes/index.js` - Add reply routes

### Frontend (3 components)
8. `frontend/src/app/core/services/reply.service.ts`
9. `frontend/src/app/shared/components/reply-thread/reply-thread.component.ts`
10. `frontend/src/app/shared/components/reply-thread/reply-thread.component.html`
11. `frontend/src/app/shared/components/reply-thread/reply-thread.component.scss`

---

## API ENDPOINTS YOU MUST CREATE

```
POST   /api/replies                    - Create new reply
PUT    /api/replies/:id                - Update reply (only owner)
DELETE /api/replies/:id                - Delete reply (only owner)
GET    /api/reviews/:reviewId/replies  - Get all replies for a review
```

---

## TECHNICAL REQUIREMENTS

### Backend Logic:
1. **Create Reply** (✅ DONE)
   - Validate: reviewId, comment (max 1000 chars)
   - Support parentReplyId for threaded replies
   - Update review.stats.replyCount (+1)
   - Trigger notifications via NotificationService
   - Return populated reply with user info

2. **Update Reply**
   - Check: User is reply owner
   - Update: comment field only
   - Set: isEdited = true, editedAt = now
   - Validation: comment not empty, max 1000 chars

3. **Delete Reply**
   - Check: User is reply owner
   - Set: isActive = false (soft delete)
   - Update review.stats.replyCount (-1)
   - If has child replies, keep parent visible but mark as deleted

4. **Get Replies**
   - Fetch all replies for a review
   - Build threaded structure (parent-child relationships)
   - Populate user info (username, avatar)
   - Sort by createdAt (oldest first for natural conversation flow)

### Frontend Features:
1. **Reply Thread Component**
   - Display nested replies (threaded view)
   - "Reply" button for each reply
   - Inline reply form
   - Edit/Delete for own replies
   - Real-time updates when new replies arrive

2. **Reply Service**
   - createReply(reviewId, comment, parentReplyId?)
   - updateReply(replyId, comment)
   - deleteReply(replyId)
   - getReplies(reviewId)
   - subscribeToReplyUpdates() - WebSocket

---

## IMPORTANT DEPENDENCIES

### You MUST use these (already created):
- **Models**: `Reply`, `Review`, `User` from `models/index.js`
- **Service**: `NotificationService` from `utils/notificationService.js`
- **Middleware**: Authentication middleware (check existing review controllers)

### Notification Triggers:
```javascript
// When replying to a review:
await NotificationService.notifyReviewReply(reply, reviewOwnerId);

// When replying to another reply:
await NotificationService.notifyReplyToReply(reply, parentReplyOwnerId);
```

---

## DATABASE SCHEMA (Reference)

```javascript
Reply Schema:
{
  reviewId: ObjectId (ref: Review),
  userId: ObjectId (ref: User),
  parentReplyId: ObjectId (ref: Reply) | null,  // null = direct reply to review
  comment: String (max 1000),
  isEdited: Boolean (default: false),
  editedAt: Date,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

---

## CRITICAL: DO NOT COPY GENERIC CODE

**YOU MUST:**
1. Open existing controllers in `backend/src/controllers/review/` or `backend/src/controllers/business/`
2. Study EXACTLY how they are structured:
   - How imports are done
   - How validation is handled
   - How response handlers are used (if any utility exists)
   - How errors are handled
   - How authentication middleware is applied
   - Export pattern used

3. **COPY THE EXACT PATTERN** from existing working controllers
4. Do NOT use generic examples - use THIS PROJECT'S structure
5. Check if project has:
   - Response handler utility (e.g., `utils/responseHandler.js`)
   - Validation helper functions
   - Custom error classes
   - Standard error format

**Example of what to look for in existing code:**
- Does it use `res.status(200).json()` directly?
- Or does it use `return successResponse(res, data)` helper?
- How are validation errors returned?
- What status codes are used for what errors?

---

## TESTING CHECKLIST

- [ ] Create reply to review works
- [ ] Create reply to reply works (threaded)
- [ ] Update own reply works
- [ ] Cannot update others' replies
- [ ] Delete reply works
- [ ] Reply count updates correctly
- [ ] Notifications are triggered
- [ ] Frontend displays threaded replies
- [ ] Frontend edit/delete buttons work
- [ ] Real-time updates work (new replies appear)

---

## INTEGRATION WITH OTHER EMPLOYEES

**You provide to Employee 4:**
- Reply API endpoints (they'll use them in review detail page)
- Reply Service (they'll import it)

**You coordinate with Employee 3:**
- Your API calls NotificationService (already created)
- Test that notifications appear when replies are created

---

## DEADLINE & MILESTONES

- **Day 3**: Backend APIs complete (create, update, delete, get)
- **Day 7**: Routes configured, tested with Postman
- **Day 10**: Frontend Reply Service complete
- **Day 14**: Reply Thread Component complete with threading UI

---

## QUESTIONS?
Ask manager if you need clarification on:
1. Threading depth limit (how many levels deep?)
2. Reply moderation/reporting system
3. Rich text formatting in replies
4. Reply reactions (separate from review reactions)

---

## START HERE
1. Read the example: `backend/src/controllers/reply/createReply.js`
2. Create `updateReply.js` following the same pattern
3. Create `deleteReply.js` 
4. Create `getRepliesByReview.js`
5. Set up routes
6. Test with Postman
7. Move to Frontend
