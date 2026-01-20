# Feature: 03 - Bonus Features (Potential Enhancements)

This document briefly describes potential bonus features that can be built on top of the core CRUD application. These are considered non-essential for the minimal viable product but can significantly enhance the user experience. All implementations must be scalable and secure.

---

### **1. Like/Favorite System**

A robust way for users to mark their favorite memes.

*   **Core Concept:** To prevent like-spamming, the system must track which users have liked a meme. Instead of a simple `likes` counter, each `Meme` document will contain a `likedBy` array storing the unique `userId` of every user who has liked it. The total like count is the length of this array.
*   **User Flow:**
    1.  Each meme in the gallery has a "Like" button (e.g., a heart icon).
    2.  When a user clicks the button, their `userId` is added to the `likedBy` array. If they click it again, their `userId` is removed (toggling the like). A user can only like a meme once.
    3.  The UI can display the like count and allow sorting by it.
*   **Technical Implementation:**
    *   Clicking "Like" will trigger a `POST` request to a RESTful endpoint, such as `/api/memes/:id/toggle-like`.
    *   The backend will idempotently add or remove the authenticated user's ID from the meme's `likedBy` array.

### **2. Random Meme Generator**

A fun feature to display a random meme from the user's collection.

*   **Core Concept:** This is an extension of the **Read** operation, implemented efficiently on the backend.
*   **User Flow:**
    1.  A "Random Meme" button is available in the main gallery.
    2.  Clicking it fetches and displays one random meme from the user's own collection.
*   **Technical Implementation:**
    *   This **must be implemented on the backend** to ensure performance. Fetching all memes on the client to select one randomly is not a scalable option and is forbidden.
    *   A dedicated backend endpoint, `/api/memes/random`, will perform an efficient database query (e.g., using MongoDB's `$sample` aggregation pipeline) to return a single random document from the authenticated user's collection.

### **3. Search & Filter**

Allows users to easily find specific memes in their collection.

*   **Core Concept:** This is an enhancement of the paginated main **Read** (gallery) view.
*   **User Flow:**
    1.  The gallery page includes a search bar and a dropdown for categories.
    2.  As the user types or selects a filter, the gallery updates to show the matching results.
*   **Technical Implementation:**
    *   This **must be handled by the backend** for performance and scalability. Frontend-based filtering is not acceptable.
    *   The frontend will send query parameters to the main paginated endpoint (e.g., `/api/memes?category=Funny&search=cat&page=1&limit=20`).
    *   The backend will build a specific database query based on these parameters. The `search` parameter should perform a case-insensitive, partial-text search on the `caption` field.
