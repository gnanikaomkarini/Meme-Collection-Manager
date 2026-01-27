# API Specification: 01 - Authentication

This document specifies the API endpoints for authentication. It adheres to the standardized JSON response format where applicable.

**Standard Response Format:**
All JSON responses from the API will follow this structure:
```json
{
  "status": {
    "success": true, // boolean
    "error": null    // null on success, error object on failure
  },
  "data": { ... }  // The response payload, or null
}
```
**Note:** Endpoints that trigger a `302 Redirect` do not return a JSON body and are exceptions to this rule.

---
All endpoints are prefixed with `/api/auth`.
---

### 1. `GET /google`

*   **Purpose:** To initiate the Google OAuth login process.
*   **Response:**
    *   **Type:** `302 Redirect`
    *   **Body:** None. The browser is redirected to Google's consent screen.

---

### 2. `GET /google/callback`

*   **Purpose:** The server-only callback URL used by Google to complete the OAuth flow.
*   **Response:**
    *   **Type:** `302 Redirect`
    *   **Body:** None. The browser is redirected to the frontend application (e.g., `/memes` on success or `/` on failure).

---

### 3. `GET /current_user`

*   **Purpose:** To check if a user has an active session. This is called on application startup.
*   **Request:**
    *   Method: `GET`
*   **Response (Success - Authenticated):**
    *   **Status:** `200 OK`
    *   **Body:**
        ```json
        {
          "status": { "success": true, "error": null },
          "data": {
            "_id": "6151f38...a1",
            "googleId": "10987...",
            "displayName": "Alex Doe",
            "email": "alex.doe@example.com",
            "profileImage": "https://.../photo.jpg"
          }
        }
        ```
*   **Response (Success - Not Authenticated):**
    *   **Status:** `200 OK`
    *   **Body:**
        ```json
        {
          "status": { "success": true, "error": null },
          "data": null
        }
        ```

---

### 4. `GET /logout`

*   **Purpose:** To terminate the user's session.
*   **Response:**
    *   **Type:** `302 Redirect`
    *   **Body:** None. The browser is redirected to the frontend's public landing page.