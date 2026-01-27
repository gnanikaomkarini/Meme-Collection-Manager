# API Specification: 02 - Memes

This document specifies the API for all Meme-related operations. All responses adhere to the standard envelope format.

**Standard Response Format:**
```json
{
  "status": { "success": boolean, "error": object | null },
  "data": object | null
}
```
**Standard Error Object:**
```json
{ "code": "ERROR_CODE", "message": "A descriptive error message." }
```
**Authorization Note:** All endpoints require a valid session. All operations targeting a specific resource must verify the resource belongs to the authenticated user. Unauthorized access attempts should result in a `404 Not Found` to prevent data leakage.

---
All endpoints are prefixed with `/api/memes`.
---

## Core CRUD API

### 1. `POST /`

*   **Purpose:** To create a new meme.
*   **Request Body:**
    ```json
    { "caption": "...", "imageUrl": "...", "category": "..." }
    ```
*   **Response (201 Created):**
    ```json
    {
      "status": { "success": true, "error": null },
      "data": {
        "_id": "615...",
        "user": "...",
        "caption": "A witty caption",
        "imageUrl": "...",
        "category": "Funny",
        "createdAt": "...",
        "updatedAt": "..."
      }
    }
    ```
*   **Response (400 Bad Request):**
    ```json
    {
      "status": {
        "success": false,
        "error": { "code": "INVALID_INPUT", "message": "Caption is a required field." }
      },
      "data": null
    }
    ```

### 2. `GET /`

*   **Purpose:** To retrieve a paginated list of the user's memes. Handles filtering and searching via query parameters (`?page=`, `?limit=`, `?category=`, `?search=`).
*   **Response (200 OK):**
    ```json
    {
      "status": { "success": true, "error": null },
      "data": {
        "items": [ /* array of meme documents */ ],
        "pagination": {
          "totalItems": 42,
          "totalPages": 3,
          "currentPage": 1
        }
      }
    }
    ```

### 3. `GET /:id`

*   **Purpose:** To retrieve a single meme by its ID.
*   **Response (200 OK):**
    ```json
    {
      "status": { "success": true, "error": null },
      "data": { /* the full meme document */ }
    }
    ```
*   **Response (404 Not Found):**
    ```json
    {
      "status": {
        "success": false,
        "error": { "code": "NOT_FOUND", "message": "Meme not found." }
      },
      "data": null
    }
    ```

### 4. `PUT /:id`

*   **Purpose:** To update a meme's details.
*   **Request Body:**
    ```json
    { "caption": "A new caption", "category": "OC" }
    ```
*   **Response (200 OK):**
    ```json
    {
      "status": { "success": true, "error": null },
      "data": { /* the complete, updated meme document */ }
    }
    ```

### 5. `DELETE /:id`

*   **Purpose:** To permanently delete a meme.
*   **Response (200 OK):**
    ```json
    {
      "status": { "success": true, "error": null },
      "data": { "message": "Meme deleted successfully." }
    }
    ```

---

## Bonus Feature API

### 6. `POST /:id/toggle-like`

*   **Purpose:** To add or remove a user's "like" from a meme.
*   **Response (200 OK):**
    ```json
    {
      "status": { "success": true, "error": null },
      "data": {
        "liked": true, // or false if the like was removed
        "likeCount": 15
      }
    }
    ```

### 7. `GET /random`

*   **Purpose:** To retrieve a single random meme from the user's collection.
*   **Response (200 OK):**
    ```json
    {
      "status": { "success": true, "error": null },
      "data": { /* a full meme document */ }
    }
    ```
*   **Response (404 Not Found - User has no memes):**
    ```json
    {
      "status": {
        "success": false,
        "error": { "code": "NO_MEMES_FOUND", "message": "No memes found in your collection." }
      },
      "data": null
    }
    ```
