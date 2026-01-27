# API Specification: 01 - Authentication

This document specifies the API endpoints for authentication.

### Standard Response Format

All JSON responses from the API will follow this standard envelope structure. Endpoints that result in a `302 Redirect` are exceptions and do not have a JSON body.

**Success Response Envelope:**
```json
{
  "status": { "success": true, "error": null },
  "data": { ... } // The response payload, or null
}
```

**Error Response Envelope:**
```json
{
  "status": {
    "success": false,
    "error": {
      "code": "ERROR_CODE",
      "message": "A descriptive error message."
    }
  },
  "data": null
}
```
---
All endpoints are prefixed with `/api/auth`.
---

### 1. `GET /google`

*   **Purpose:** To initiate the Google OAuth login process.
*   **Responses:**
    *   **`302 Found`:** Redirects the browser to Google's OAuth consent screen. (No response body).

---

### 2. `GET /google/callback`

*   **Purpose:** The server-only callback URL used by Google to complete the OAuth flow.
*   **Responses:**
    *   **`302 Found` (Success):** Redirects the browser to the frontend application (e.g., `/memes`) with a session cookie set. (No response body).
    *   **`302 Found` (Failure):** Redirects the browser to the frontend root (e.g., `/?error=access_denied`) if the user denies consent or an error occurs. (No response body).

---

### 3. `GET /current_user`

*   **Purpose:** To check if a user has an active session. Called on application startup.
*   **Responses:**
    *   **`200 OK` (Authenticated):**
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
    *   **`200 OK` (Not Authenticated):**
        ```json
        {
          "status": { "success": true, "error": null },
          "data": null
        }
        ```

---

### 4. `GET /logout`

*   **Purpose:** To terminate the user's session.
*   **Responses:**
    *   **`302 Found`:** Redirects the browser to the public landing page (e.g., `/`). (No response body).
