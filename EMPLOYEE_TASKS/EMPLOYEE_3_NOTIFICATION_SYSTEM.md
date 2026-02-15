# EMPLOYEE 3: NOTIFICATION SYSTEM
**Duration:** 2 weeks  
**Status:** NOT STARTED

## YOUR RESPONSIBILITY
Build the complete Notification System (Backend + Frontend) with real-time WebSocket delivery and notification management.

---

## PROJECT STANDARDS - MUST FOLLOW

### 1. Follow Existing Backend Structure
- **IMPORTANT**: Study how existing APIs are built in `backend/src/controllers/`
- Match the same file organization, naming conventions, and code patterns
- Import statements, error handling, response format MUST match existing controllers

### 2. Follow Existing Frontend Structure
- Study existing services in `frontend/src/app/core/services/`
- Study existing components in `frontend/src/app/shared/components/`
- Follow the same TypeScript patterns, interfaces, and Angular conventions

### 3. Testing Workflow (MANDATORY)
After creating each file, test with Postman, then test frontend in browser.

### 4. Error Resolution Process
**Step 1:** Try to solve automatically (3 attempts max)
**Step 2:** If still broken, ask senior with exact error details
**Step 3:** DO NOT commit broken code or skip testing

---

## FILES TO CREATE

### Backend (7 files)
1. `backend/src/controllers/notification/getNotifications.js` - Get user notifications
2. `backend/src/controllers/notification/markAsRead.js` - Mark single notification read
3. `backend/src/controllers/notification/markAllAsRead.js` - Mark all read
4. `backend/src/controllers/notification/deleteNotification.js` - Delete notification
5. `backend/src/controllers/notification/index.js` - Export controllers
6. `backend/src/routes/notificationRoutes.js` - Route definitions
7. Update `backend/src/routes/index.js` - Add notification routes

### WebSocket (2 files)
8. `backend/src/services/websocket/notificationSocket.js` - WebSocket handler
9. Update `backend/src/server.js` - Initialize WebSocket

### Frontend (4 files)
10. `frontend/src/app/core/services/notification.service.ts`
11. `frontend/src/app/shared/components/notification-bell/notification-bell.component.ts`
12. `frontend/src/app/shared/components/notification-bell/notification-bell.component.html`
13. `frontend/src/app/shared/components/notification-bell/notification-bell.component.scss`
14. `frontend/src/app/shared/components/notification-panel/notification-panel.component.ts`
15. `frontend/src/app/shared/components/notification-panel/notification-panel.component.html`
16. `frontend/src/app/shared/components/notification-panel/notification-panel.component.scss`

---

## API ENDPOINTS YOU MUST CREATE

```
GET    /api/notifications              - Get user notifications (paginated)
PUT    /api/notifications/:id/read     - Mark notification as read
PUT    /api/notifications/read-all     - Mark all notifications as read
DELETE /api/notifications/:id          - Delete notification

WebSocket: ws://localhost:PORT/notifications - Real-time notification delivery
```

---

## TECHNICAL REQUIREMENTS

### Backend Logic:

1. **Get Notifications**
   - Fetch notifications for authenticated user
   - Support pagination (limit, skip)
   - Support filtering (read/unread)
   - Sort by createdAt (newest first)
   - Populate related entities (triggeredBy user info)

2. **Mark As Read**
   - Find notification by ID
   - Check: notification belongs to authenticated user
   - Set: isRead = true, readAt = Date.now()
   - Return updated notification

3. **Mark All As Read**
   - Update all unread notifications for user
   - Set: isRead = true, readAt = Date.now()
   - Return count of updated notifications

4. **Delete Notification**
   - Find notification by ID
   - Check: notification belongs to authenticated user
   - Soft delete or hard delete (your choice)
   - Return success message

### WebSocket Implementation:

**MANDATORY:**
1. Check if project already uses Socket.io - look in `backend/src/server.js` or `backend/src/app.js`
2. If Socket.io exists, follow the EXACT pattern used
3. If not, study how the project structures services in `backend/src/services/`
4. Use project's authentication pattern for WebSocket (study existing auth middleware)
5. Follow project's module export pattern

**Your WebSocket code MUST:**
- Match existing service file structure
- Use project's JWT verification method (check auth middleware)
- Follow project's error handling pattern
- Use project's logging approach (not console.log if project has logger)
- Export functions the same way as other services

**Key logic:**
- Authenticate socket connections with JWT
- Join user to personal room
- Emit notifications to specific users
- Handle connection/disconnection

**Structure:** MUST match project's service/utility patterns

### Frontend Features:

1. **Notification Bell Component** (Navbar)
   - Show bell icon with unread count badge
   - Click to open notification panel
   - Real-time badge update via WebSocket

2. **Notification Panel Component** (Dropdown)
   - Display list of notifications
   - "Mark all as read" button
   - Individual "Mark as read" on click
   - Delete button for each notification
   - Click notification to navigate to related entity
   - Show notification type icon and message
   - Show time ago (e.g., "2 minutes ago")

3. **Notification Service**
   - getNotifications(page, limit, filter)
   - markAsRead(notificationId)
   - markAllAsRead()
   - deleteNotification(notificationId)
   - connectWebSocket(token) - Establish WS connection
   - listenForNotifications() - Observable for real-time updates

---

## IMPORTANT DEPENDENCIES

### You MUST use these:
- **Model**: `Notification` from `models/index.js`
- **Service**: `NotificationService` utility (already created)
- **Library**: `socket.io` (backend), `socket.io-client` (frontend)
- **Auth**: JWT token for WebSocket authentication

### Update NotificationService:

**IMPORTANT:**
1. Open existing `backend/src/utils/notificationService.js`
2. Study its current structure and patterns
3. Add WebSocket emission AFTER notification is created in database
4. Follow the EXACT coding style already in that file
5. Import your WebSocket helper using project's import conventions
6. Access Socket.io instance the way project does (might be different from examples)

---

## CRITICAL: NO GENERIC CODE ALLOWED

**MANDATORY STEPS BEFORE CODING:**

1. Open `backend/src/controllers/review/` - pick any controller
2. Study line-by-line:
   - How it imports models
   - How it structures try-catch
   - How it sends responses
   - How it handles pagination (if any)
   - How it uses authentication

3. **YOUR CODE MUST MATCH** that exact structure
4. If project uses response handler utility → YOU MUST USE IT
5. If project uses validation middleware → YOU MUST USE IT
6. If project has custom patterns → YOU MUST FOLLOW THEM

**DO NOT:**
- Write generic `res.status().json()` if project uses helper functions
- Use different import paths than existing code
- Use different error handling patterns
- Invent your own structure

**Copy the working pattern, adapt the logic**

---

## TESTING CHECKLIST

- [ ] Get notifications works (with pagination)
- [ ] Filter unread/read notifications works
- [ ] Mark single notification as read works
- [ ] Mark all as read works
- [ ] Delete notification works
- [ ] WebSocket connection establishes successfully
- [ ] Real-time notification delivery works
- [ ] Unread badge updates in real-time
- [ ] Click notification navigates to correct page
- [ ] Notification panel UI looks professional

---

## INTEGRATION WITH OTHER EMPLOYEES

**You receive from:**
- Employee 1: Reply notifications (already triggers NotificationService)
- Employee 2: Reaction notifications (already triggers NotificationService)

**Your job:** Build the delivery and management system for those notifications

---

## DEADLINE & MILESTONES

- **Day 3**: Backend REST APIs complete
- **Day 7**: WebSocket implementation complete
- **Day 10**: Frontend service with WebSocket client
- **Day 14**: Notification Bell & Panel UI complete

---

## START HERE
1. Create REST APIs first (get, mark read, delete)
2. Test REST APIs with Postman
3. Implement WebSocket server
4. Update NotificationService to emit via WebSocket
5. Build Frontend service with WebSocket client
6. Build UI components (bell + panel)
