# Meme Collection Manager - API Response Reference

This document contains actual API responses captured from the running Meme Collection Manager backend, useful for verifying experiment outputs and understanding data structures.

## Backend Status

**Server:** http://localhost:3000  
**Status:** Running  
**Database:** MongoDB connected

---

## Authentication Endpoints

### 1. Root Endpoint - `/`

**Method:** GET  
**Authentication:** Not required

**Response:**
```json
{
    "message": "Meme Collection Manager backend is running"
}
```

---

### 2. Get Current User - `/auth/current_user`

**Method:** GET  
**Authentication:** Required (Session/Cookie)

**Response (Unauthenticated):**
```json
{
    "code": "UNAUTHORIZED",
    "message": "User is not authenticated."
}
```

**Response (Authenticated - Example):**
```json
{
    "_id": "69dce8e3135852b0f97c4d7f",
    "displayName": "GNANIKA OMKARINI MAKKENA",
    "email": "23wh1a0501@bvrithyderabad.edu.in",
    "profileImage": "https://lh3.googleusercontent.com/a/ACg8ocJT3Gh1vlDZFR2eqkWRQjVn8GiP3EerMjlwMHMGpLybb0EJCQ=s96-c"
}
```

---

### 3. Google Login - `/auth/google`

**Method:** GET  
**Authentication:** Not required  
**Behavior:** Redirects to Google OAuth consent screen

---

### 4. Google Callback - `/auth/google/callback`

**Method:** GET  
**Authentication:** OAuth flow  
**Behavior:** Processes OAuth response and redirects to frontend callback

---

### 5. Logout - `/auth/logout`

**Method:** GET  
**Authentication:** Not required

**Response:**
```json
{
    "message": "Logged out successfully"
}
```

---

## Meme API Endpoints

### 1. Get All Memes - `/api/memes`

**Method:** GET  
**Authentication:** Not required  
**Query Parameters:** 
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
    "data": [
        {
            "_id": "69dcf124ddee379260b99cf1",
            "title": "Batman",
            "caption": "I'm batman",
            "imageUrl": "http://localhost:3000/uploads/im-batman-1776087318934-69dce8e3135852b0f97c4d7f.jpeg",
            "category": "funny",
            "owner": {
                "_id": "69dce8e3135852b0f97c4d7f",
                "displayName": "GNANIKA OMKARINI MAKKENA",
                "email": "23wh1a0501@bvrithyderabad.edu.in",
                "profileImage": "https://lh3.googleusercontent.com/a/ACg8ocJT3Gh1vlDZFR2eqkWRQjVn8GiP3EerMjlwMHMGpLybb0EJCQ=s96-c"
            },
            "likes": [
                {
                    "_id": "69dce8e3135852b0f97c4d7f",
                    "displayName": "GNANIKA OMKARINI MAKKENA"
                }
            ],
            "isPublic": true,
            "comments": [
                {
                    "author": {
                        "_id": "69dce8e3135852b0f97c4d7f",
                        "displayName": "GNANIKA OMKARINI MAKKENA",
                        "profileImage": "https://lh3.googleusercontent.com/a/ACg8ocJT3Gh1vlDZFR2eqkWRQjVn8GiP3EerMjlwMHMGpLybb0EJCQ=s96-c"
                    },
                    "text": "Wow its amazing",
                    "_id": "69dcf135ddee379260b99d03",
                    "createdAt": "2026-04-13T13:35:49.570Z"
                }
            ],
            "createdAt": "2026-04-13T13:35:32.620Z",
            "updatedAt": "2026-04-13T13:39:15.780Z",
            "__v": 3
        }
    ],
    "pagination": {
        "totalItems": 1,
        "totalPages": 1,
        "currentPage": 1,
        "itemsPerPage": 10
    }
}
```

---

### 2. Create Meme - `/api/memes`

**Method:** POST  
**Authentication:** Required

**Request Body:**
```json
{
    "title": "New Meme",
    "caption": "This is a new meme",
    "imageUrl": "http://localhost:3000/uploads/image-1234567890-userid.jpeg",
    "category": "funny",
    "isPublic": true
}
```

**Response (Success):**
```json
{
    "code": "CREATED",
    "message": "Meme created successfully",
    "data": {
        "_id": "69dcf124ddee379260b99cf2",
        "title": "New Meme",
        "caption": "This is a new meme",
        "imageUrl": "http://localhost:3000/uploads/image-1234567890-userid.jpeg",
        "category": "funny",
        "owner": "69dce8e3135852b0f97c4d7f",
        "likes": [],
        "isPublic": true,
        "comments": [],
        "createdAt": "2026-04-13T14:00:00.000Z",
        "updatedAt": "2026-04-13T14:00:00.000Z"
    }
}
```

**Response (Error - Not Authenticated):**
```json
{
    "code": "UNAUTHORIZED",
    "message": "User is not authenticated."
}
```

---

### 3. Get Meme By ID - `/api/memes/:id`

**Method:** GET  
**Authentication:** Not required

**Response:**
```json
{
    "code": "OK",
    "message": "Meme retrieved successfully",
    "data": {
        "_id": "69dcf124ddee379260b99cf1",
        "title": "Batman",
        "caption": "I'm batman",
        "imageUrl": "http://localhost:3000/uploads/im-batman-1776087318934-69dce8e3135852b0f97c4d7f.jpeg",
        "category": "funny",
        "owner": {
            "_id": "69dce8e3135852b0f97c4d7f",
            "displayName": "GNANIKA OMKARINI MAKKENA",
            "email": "23wh1a0501@bvrithyderabad.edu.in",
            "profileImage": "https://lh3.googleusercontent.com/a/..."
        },
        "likes": [
            {
                "_id": "69dce8e3135852b0f97c4d7f",
                "displayName": "GNANIKA OMKARINI MAKKENA"
            }
        ],
        "isPublic": true,
        "comments": [],
        "createdAt": "2026-04-13T13:35:32.620Z",
        "updatedAt": "2026-04-13T13:39:15.780Z"
    }
}
```

---

### 4. Update Meme - `/api/memes/:id`

**Method:** PUT  
**Authentication:** Required (Must be owner)

**Request Body:**
```json
{
    "title": "Updated Title",
    "caption": "Updated caption",
    "category": "funny",
    "isPublic": true
}
```

**Response:**
```json
{
    "code": "OK",
    "message": "Meme updated successfully",
    "data": {
        "_id": "69dcf124ddee379260b99cf1",
        "title": "Updated Title",
        "caption": "Updated caption",
        "imageUrl": "http://localhost:3000/uploads/...",
        "category": "funny",
        "owner": "69dce8e3135852b0f97c4d7f",
        "likes": [],
        "isPublic": true,
        "comments": [],
        "createdAt": "2026-04-13T13:35:32.620Z",
        "updatedAt": "2026-04-13T14:05:00.000Z"
    }
}
```

---

### 5. Delete Meme - `/api/memes/:id`

**Method:** DELETE  
**Authentication:** Required (Must be owner)

**Response:**
```json
{
    "code": "OK",
    "message": "Meme deleted successfully"
}
```

---

## Like Operations

### 1. Like/Unlike Meme - `/api/memes/:id/like`

**Method:** POST  
**Authentication:** Required

**Response (Like Added):**
```json
{
    "code": "OK",
    "message": "Meme liked successfully",
    "data": {
        "liked": true,
        "totalLikes": 2
    }
}
```

**Response (Like Removed):**
```json
{
    "code": "OK",
    "message": "Meme unliked successfully",
    "data": {
        "liked": false,
        "totalLikes": 1
    }
}
```

---

## Comment Operations

### 1. Add Comment - `/api/memes/:id/comment`

**Method:** POST  
**Authentication:** Required

**Request Body:**
```json
{
    "text": "This is a great meme!"
}
```

**Response:**
```json
{
    "code": "CREATED",
    "message": "Comment added successfully",
    "data": {
        "commentId": "69dcf135ddee379260b99d03",
        "author": {
            "_id": "69dce8e3135852b0f97c4d7f",
            "displayName": "GNANIKA OMKARINI MAKKENA",
            "profileImage": "https://lh3.googleusercontent.com/a/..."
        },
        "text": "This is a great meme!",
        "createdAt": "2026-04-13T14:10:00.000Z"
    }
}
```

---

### 2. Delete Comment - `/api/memes/:id/comment/:commentId`

**Method:** DELETE  
**Authentication:** Required (Must be comment author or meme owner)

**Response:**
```json
{
    "code": "OK",
    "message": "Comment deleted successfully"
}
```

---

## Upload Endpoints

### 1. Upload Image - `/api/upload`

**Method:** POST  
**Authentication:** Required  
**Content-Type:** multipart/form-data

**Request:**
- File field: `file` (image file, max 5MB)
- Accepted types: jpeg, jpg, png, gif, webp

**Response:**
```json
{
    "code": "OK",
    "message": "File uploaded successfully",
    "data": {
        "filename": "im-batman-1776087318934-69dce8e3135852b0f97c4d7f.jpeg",
        "url": "http://localhost:3000/uploads/im-batman-1776087318934-69dce8e3135852b0f97c4d7f.jpeg"
    }
}
```

**Response (Error - File too large):**
```json
{
    "code": "PAYLOAD_TOO_LARGE",
    "message": "File size exceeds 5MB limit"
}
```

**Response (Error - Invalid file type):**
```json
{
    "code": "UNSUPPORTED_MEDIA_TYPE",
    "message": "Only image files (jpeg, jpg, png, gif, webp) are allowed"
}
```

---

## Error Response Codes

| Code | Status | Meaning |
|------|--------|---------|
| OK | 200 | Request successful |
| CREATED | 201 | Resource created |
| BAD_REQUEST | 400 | Invalid request |
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Access denied |
| NOT_FOUND | 404 | Resource not found |
| PAYLOAD_TOO_LARGE | 413 | File too large |
| UNSUPPORTED_MEDIA_TYPE | 415 | Invalid file type |
| INTERNAL_SERVER_ERROR | 500 | Server error |

---

## Common Response Structure

All API responses follow this structure:

```json
{
    "code": "ResponseCode",
    "message": "Human readable message",
    "data": {}
}
```

---

## Authentication Flow

1. **Initiate Login:** `GET /auth/google` → Redirects to Google consent screen
2. **Google Callback:** `GET /auth/google/callback` → Validates OAuth token
3. **Frontend Verification:** Makes request to `GET /auth/current_user` to verify session
4. **Session Established:** Subsequent requests include session cookie automatically
5. **Logout:** `GET /auth/logout` → Destroys session

---

## Testing with cURL

```bash
# Get all memes
curl http://localhost:3000/api/memes

# Get current user (without auth)
curl http://localhost:3000/auth/current_user

# Upload image (requires authentication and session cookie)
curl -X POST http://localhost:3000/api/upload \
  -H "Cookie: connect.sid=<session_cookie>" \
  -F "file=@/path/to/image.jpg"

# Create meme (requires authentication)
curl -X POST http://localhost:3000/api/memes \
  -H "Cookie: connect.sid=<session_cookie>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Meme",
    "caption": "Description",
    "imageUrl": "http://localhost:3000/uploads/image.jpg",
    "category": "funny",
    "isPublic": true
  }'

# Like a meme (requires authentication)
curl -X POST http://localhost:3000/api/memes/69dcf124ddee379260b99cf1/like \
  -H "Cookie: connect.sid=<session_cookie>"

# Add comment (requires authentication)
curl -X POST http://localhost:3000/api/memes/69dcf124ddee379260b99cf1/comment \
  -H "Cookie: connect.sid=<session_cookie>" \
  -H "Content-Type: application/json" \
  -d '{"text": "Great meme!"}'
```

---

## Database Collections

### Users Collection
- `_id`: MongoDB ObjectId
- `displayName`: User full name (from Google)
- `email`: User email
- `profileImage`: Google profile picture URL
- `createdAt`: Account creation timestamp

### Memes Collection
- `_id`: MongoDB ObjectId
- `title`: Meme title
- `caption`: Meme description
- `imageUrl`: Full URL to uploaded image
- `category`: Meme category
- `owner`: Reference to User document
- `likes`: Array of users who liked (references User documents)
- `comments`: Array of comment objects
- `isPublic`: Visibility flag
- `createdAt`: Meme creation timestamp
- `updatedAt`: Last modification timestamp

### Comments Subdocument
- `_id`: MongoDB ObjectId
- `author`: Reference to User document
- `text`: Comment text
- `createdAt`: Comment creation timestamp
