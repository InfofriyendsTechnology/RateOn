# ResponseHandler Usage Guide

## ✅ Correct Usage (Use these methods)

### Success Responses

```js
// 200 OK - Default success
responseHandler.success(res, 'Message', data)

// 201 Created - For new resources
responseHandler.success(res, 'Created successfully', data, 201)

// 204 No Content
responseHandler.noContent(res)
```

### Error Responses

```js
// 400 Bad Request - Validation errors
responseHandler.error(res, 'Invalid input')
// OR
responseHandler.badRequest(res, error)

// 401 Unauthorized - Not authenticated
responseHandler.unauthorized(res, 'Please login')

// 403 Forbidden - Not authorized
responseHandler.forbidden(res, 'Access denied')

// 404 Not Found - Resource not found
responseHandler.notFound(res, 'Item not found')

// 409 Conflict - Duplicate entry
responseHandler.conflict(res, 'Email already exists')

// 422 Validation Error
responseHandler.validationError(res, error)

// 500 Internal Server Error
responseHandler.internalServerError(res, error)
```

## ❌ Avoid These (Hard-coded status codes)

```js
// DON'T DO THIS
responseHandler.error(res, 'Item not found', 404)
responseHandler.error(res, 'Forbidden', 403)
responseHandler.success(res, 'Created', data, 201)

// DO THIS INSTEAD
responseHandler.notFound(res, 'Item not found')
responseHandler.forbidden(res, 'Forbidden')
responseHandler.success(res, 'Created', data, 201) // This is OK
```

## 📋 Common Patterns

### Creating Resources
```js
const item = await Item.create(data);
return responseHandler.success(res, 'Item created', item, 201);
```

### Not Found
```js
const item = await Item.findById(id);
if (!item) {
    return responseHandler.notFound(res, 'Item not found');
}
```

### Unauthorized Access
```js
if (item.owner.toString() !== userId) {
    return responseHandler.forbidden(res, 'You do not own this item');
}
```

### Validation Errors
```js
if (!name || !price) {
    return responseHandler.error(res, 'Name and price are required');
}
```

### Server Errors
```js
catch (error) {
    console.error('Error:', error);
    return responseHandler.error(res, error?.message || 'Something went wrong');
}
```

## 🎯 Quick Reference

| Status | Method | Use Case |
|--------|--------|----------|
| 200 | `success()` | Default success |
| 201 | `success(..., 201)` | Resource created |
| 204 | `noContent()` | Deleted/No content |
| 400 | `error()` or `badRequest()` | Bad input |
| 401 | `unauthorized()` | Not logged in |
| 403 | `forbidden()` | No permission |
| 404 | `notFound()` | Resource missing |
| 409 | `conflict()` | Duplicate |
| 422 | `validationError()` | Validation failed |
| 500 | `error()` | Server error |
