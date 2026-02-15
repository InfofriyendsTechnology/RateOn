# Reply System API Testing Guide

**Created by:** Employee 7 (EMP7)  
**Date:** February 10, 2026

---

## Prerequisites

1. Backend server running on `http://localhost:1126`
2. Valid JWT token (login as a user first)
3. At least one review exists in the database

---

## API Endpoints

### 1. Create Reply

**Endpoint:** `POST /api/v1/replies`  
**Auth:** Required (JWT token in Authorization header)

**Request Body:**
```json
{
  "reviewId": "65a1b2c3d4e5f6789abcdef0",
  "comment": "This is a reply to the review",
  "parentReplyId": null
}
```

**For Nested Reply (replying to another reply):**
```json
{
  "reviewId": "65a1b2c3d4e5f6789abcdef0",
  "comment": "This is a nested reply",
  "parentReplyId": "65a1b2c3d4e5f6789abcdef1"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Reply created successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789abcdef2",
    "reviewId": "65a1b2c3d4e5f6789abcdef0",
    "userId": {
      "_id": "65a1b2c3d4e5f6789abcdef3",
      "username": "john_doe",
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "https://..."
      }
    },
    "comment": "This is a reply to the review",
    "parentReplyId": null,
    "isEdited": false,
    "isActive": true,
    "createdAt": "2026-02-10T07:00:00.000Z",
    "updatedAt": "2026-02-10T07:00:00.000Z"
  }
}
```

**Validation Errors:**
- Missing reviewId or comment: 400 Bad Request
- Comment empty or > 1000 chars: 400 Bad Request
- Review not found: 404 Not Found
- Parent reply not found: 404 Not Found
- Parent reply doesn't belong to review: 400 Bad Request

---

### 2. Get Replies for Review

**Endpoint:** `GET /api/v1/replies/review/:reviewId`  
**Auth:** Not required (public)

**Query Parameters (optional):**
- `limit`: Number of replies to return (default: 50, max: 100)
- `skip`: Number of replies to skip for pagination (default: 0)

**Example:**
```
GET /api/v1/replies/review/65a1b2c3d4e5f6789abcdef0?limit=20&skip=0
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Replies retrieved successfully",
  "data": {
    "replies": [
      {
        "_id": "65a1b2c3d4e5f6789abcdef2",
        "reviewId": "65a1b2c3d4e5f6789abcdef0",
        "userId": {
          "_id": "65a1b2c3d4e5f6789abcdef3",
          "username": "john_doe",
          "profile": {
            "firstName": "John",
            "lastName": "Doe",
            "avatar": "https://..."
          }
        },
        "comment": "This is a reply",
        "parentReplyId": null,
        "isEdited": false,
        "isActive": true,
        "createdAt": "2026-02-10T07:00:00.000Z",
        "updatedAt": "2026-02-10T07:00:00.000Z",
        "children": [
          {
            "_id": "65a1b2c3d4e5f6789abcdef4",
            "comment": "This is a nested reply",
            "userId": {...},
            "parentReplyId": "65a1b2c3d4e5f6789abcdef2",
            "children": []
          }
        ]
      }
    ],
    "pagination": {
      "total": 5,
      "limit": 20,
      "skip": 0,
      "hasMore": false
    }
  }
}
```

**Note:** The response includes a **threaded structure** where nested replies appear in the `children` array of their parent reply.

---

### 3. Update Reply

**Endpoint:** `PUT /api/v1/replies/:id`  
**Auth:** Required (JWT token, must be reply owner)

**Request Body:**
```json
{
  "comment": "This is the updated reply text"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Reply updated successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789abcdef2",
    "comment": "This is the updated reply text",
    "isEdited": true,
    "editedAt": "2026-02-10T07:05:00.000Z",
    ...
  }
}
```

**Error Responses:**
- 400: Comment empty or > 1000 chars
- 403: User is not the reply owner
- 404: Reply not found or deleted

---

### 4. Delete Reply

**Endpoint:** `DELETE /api/v1/replies/:id`  
**Auth:** Required (JWT token, must be reply owner)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Reply deleted successfully",
  "data": null
}
```

**Error Responses:**
- 403: User is not the reply owner
- 404: Reply not found or already deleted

**Note:** This is a **soft delete**. The reply's `isActive` flag is set to false, and it won't appear in GET requests, but it remains in the database.

---

## Testing Workflow

### Step 1: Get Authentication Token

1. Login as a user:
```
POST /api/v1/auth/login
Body: { "email": "user@example.com", "password": "password123" }
```

2. Copy the JWT token from response

3. Add to all authenticated requests:
```
Authorization: Bearer <your_jwt_token>
```

### Step 2: Get Review ID

1. List reviews:
```
GET /api/v1/reviews
```

2. Copy a review `_id` for testing

### Step 3: Create a Reply

```
POST /api/v1/replies
Authorization: Bearer <token>
Body: {
  "reviewId": "<review_id>",
  "comment": "Great review! I agree with your points."
}
```

### Step 4: Create a Nested Reply

```
POST /api/v1/replies
Authorization: Bearer <token>
Body: {
  "reviewId": "<review_id>",
  "comment": "I have a question about your reply...",
  "parentReplyId": "<reply_id_from_step_3>"
}
```

### Step 5: Get All Replies (Threaded)

```
GET /api/v1/replies/review/<review_id>
```

Verify that nested reply appears in parent's `children` array.

### Step 6: Update Reply

```
PUT /api/v1/replies/<reply_id>
Authorization: Bearer <token>
Body: {
  "comment": "Updated comment text"
}
```

Verify `isEdited: true` and `editedAt` is set.

### Step 7: Delete Reply

```
DELETE /api/v1/replies/<reply_id>
Authorization: Bearer <token>
```

Then try to get replies again and verify deleted reply doesn't appear.

---

## Expected Side Effects

### When a Reply is Created:
1. ✅ Review's `stats.replyCount` increments by 1
2. ✅ Notification is sent to review owner (if replying to review)
3. ✅ Notification is sent to parent reply owner (if nested reply)
4. ✅ Activity is logged for trust score calculation

### When a Reply is Updated:
1. ✅ `isEdited` flag set to true
2. ✅ `editedAt` timestamp updated

### When a Reply is Deleted:
1. ✅ Reply's `isActive` flag set to false
2. ✅ Review's `stats.replyCount` decrements by 1
3. ✅ Reply still exists in database but hidden from GET requests

---

## Error Testing

Test these scenarios to verify validation:

1. **Empty comment:**
```json
{ "reviewId": "...", "comment": "" }
// Expected: 400 Bad Request
```

2. **Comment too long:**
```json
{ "reviewId": "...", "comment": "<1001+ characters>" }
// Expected: 400 Bad Request
```

3. **Invalid review ID:**
```json
{ "reviewId": "invalid_id", "comment": "test" }
// Expected: 404 Not Found
```

4. **Parent reply from different review:**
```json
{
  "reviewId": "review_1_id",
  "comment": "test",
  "parentReplyId": "reply_from_review_2_id"
}
// Expected: 400 Bad Request
```

5. **Update without auth:**
```
PUT /api/v1/replies/<id>
// No Authorization header
// Expected: 401 Unauthorized
```

6. **Delete someone else's reply:**
```
DELETE /api/v1/replies/<someone_else_reply_id>
Authorization: Bearer <your_token>
// Expected: 403 Forbidden
```

---

## Postman Collection

You can create a Postman collection with these endpoints:

**Folder Structure:**
```
Reply System/
  ├── Create Reply
  ├── Create Nested Reply
  ├── Get Replies (with pagination)
  ├── Update Reply
  └── Delete Reply
```

**Environment Variables:**
- `base_url`: `http://localhost:1126`
- `auth_token`: `<your_jwt_token>`
- `review_id`: `<test_review_id>`
- `reply_id`: `<test_reply_id>`

---

## Integration with Frontend

Frontend developers should use these endpoints in the Reply Service:

```typescript
// reply.service.ts
createReply(reviewId: string, comment: string, parentReplyId?: string)
getReplies(reviewId: string, limit = 50, skip = 0)
updateReply(replyId: string, comment: string)
deleteReply(replyId: string)
```

---

## Troubleshooting

### Issue: "Reply not found" after creation
**Solution:** Check MongoDB connection and verify reply was actually created

### Issue: Nested replies not appearing in tree structure
**Solution:** Verify `parentReplyId` matches an existing reply's `_id` for the same review

### Issue: 403 Forbidden when updating own reply
**Solution:** Check JWT token is valid and `req.user.id` matches reply's `userId`

### Issue: Review reply count not updating
**Solution:** Verify Review model has `stats.replyCount` field and MongoDB update is successful

---

## Next Steps

1. Test all 4 endpoints manually
2. Verify notification triggers
3. Check threaded reply structure
4. Test permission checks
5. Frontend integration (Reply Service + Reply Thread Component)

---

**Status:** Ready for testing  
**Documentation:** Complete  
**Implementation:** 100% following project patterns
