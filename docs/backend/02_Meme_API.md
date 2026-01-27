# API Specification: 02 - Memes

This document specifies the API for all Meme-related operations.

### Standard Response & Error Formats

All JSON responses adhere to a standard envelope.

**Success Response Envelope:**
```json
{
  "status": { "success": true, "error": null },
  "data": { ... } // The response payload
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

### Common Error Responses

The following error responses are common to most endpoints in this specification.

*   **`401 Unauthorized`**
    *   **Reason:** The request was made without a valid session cookie.
    *   **Body:**
        ```json
        {
          "status": {
            "success": false,
            "error": { "code": "UNAUTHORIZED", "message": "Authentication is required to access this resource." }
          },
          "data": null
        }
        ```

*   **`404 Not Found`**
    *   **Reason:** The resource specified by `:id` does not exist, or the user is not authorized to access it.
    *   **Body:**
        ```json
        {
          "status": {
            "success": false,
            "error": { "code": "NOT_FOUND", "message": "The requested resource was not found." }
          },
          "data": null
        }
        ```

---
All endpoints are prefixed with `/api/memes`.
---

## Core CRUD API

### 1. `POST /`
*   **Purpose:** To create a new meme.
*   **Responses:**
    *   **`201 Created`:** On successful creation.
        ```json
        {
          "status": { "success": true, "error": null },
          "data": { /* full meme document */ }
        }
        ```
    *   **`400 Bad Request`:** For invalid input. The error message will be specific.
        ```json
        {
          "status": {
            "success": false,
            "error": { "code": "INVALID_INPUT", "message": "A valid imageUrl is required." }
          },
          "data": null
        }
        ```
    *   **`401 Unauthorized`:** See Common Error Responses.

### 2. `GET /`
*   **Purpose:** To retrieve a paginated list of the user's memes.
*   **Responses:**
    *   **`200 OK`:** On success.
        ```json
        {
          "status": { "success": true, "error": null },
          "data": {
            "items": [ /* array of meme documents */ ],
            "pagination": { /* pagination details */ }
          }
        }
        ```
    *   **`401 Unauthorized`:** See Common Error Responses.

### 3. `GET /:id`
*   **Purpose:** To retrieve a single meme by its ID.
*   **Responses:**
    *   **`200 OK`:** On success.
        ```json
        {
          "status": { "success": true, "error": null },
          "data": { /* the full meme document */ }
        }
        ```
    *   **`401 Unauthorized`:** See Common Error Responses.
    *   **`404 Not Found`:** See Common Error Responses.

### 4. `PUT /:id`
*   **Purpose:** To update a meme's details.
*   **Responses:**
    *   **`200 OK`:** On successful update.
        ```json
        {
          "status": { "success": true, "error": null },
          "data": { /* the complete, updated meme document */ }
        }
        ```
    *   **`400 Bad Request`:** For invalid input.
    *   **`401 Unauthorized`:** See Common Error Responses.
    *   **`404 Not Found`:** See Common Error Responses.

### 5. `DELETE /:id`
*   **Purpose:** To permanently delete a meme.
*   **Responses:**
    *   **`200 OK`:** On successful deletion.
        ```json
        {
          "status": { "success": true, "error": null },
          "data": { "message": "Meme deleted successfully." }
        }
        ```
    *   **`401 Unauthorized`:** See Common Error Responses.
    *   **`404 Not Found`:** See Common Error Responses.

---

## Bonus Feature API

### 6. `POST /:id/toggle-like`



*   **Purpose:** To add or remove a user's "like" from a meme.

*   **Request:**

    *   Method: `POST`

    *   Body: None.
*   **Responses:**
    *   **`200 OK`:** On success.
        ```json
        {
          "status": { "success": true, "error": null },
          "data": {
            "liked": true,
            "likeCount": 15
          }
        }
        ```
    *   **`401 Unauthorized`:** See Common Error Responses.
    *   **`404 Not Found`:** If the meme ID does not exist.

### 7. `GET /random`
*   **Purpose:** To retrieve a single random meme from the user's collection.
*   **Responses:**
    *   **`200 OK`:** On success.
        ```json
        {
          "status": { "success": true, "error": null },
          "data": { /* a full meme document */ }
        }
        ```
    *   **`401 Unauthorized`:** See Common Error Responses.
    *   **`404 Not Found`:** If the user has no memes in their collection. The error message will be specific.
        ```json
        {
          "status": {
            "success": false,
            "error": { "code": "NO_MEMES_FOUND", "message": "No memes found in your collection to select a random one." }
          },
          "data": null
        }
        ```