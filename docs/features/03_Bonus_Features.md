# Feature: 03 - Bonus Features (Potential Enhancements)

This document briefly describes potential bonus features that can be built on top of the core CRUD application. These are considered non-essential for the minimal viable product but can significantly enhance the user experience.

---

### **1. Like/Favorite System**

A simple way for users to mark their favorite memes.

*   **Core Concept:** This feature is an extension of the **Update** operation. Each meme document in the database can have a `likes` field (a number).
*   **User Flow:**
    1.  Each meme in the gallery has a "Like" button (e.g., a heart icon).
    2.  When a user clicks the button, the `likes` count on that meme is incremented.
    3.  The UI could potentially allow sorting memes by the number of likes.
*   **Technical Implementation:**
    *   Clicking "Like" would trigger a `PUT` request to a new endpoint like `/api/memes/:id/like`.
    *   The backend would increment the `likes` field for the specified meme.

### **2. Random Meme Generator**

A fun feature to display a random meme from the user's collection.

*   **Core Concept:** This is an extension of the **Read** operation.
*   **User Flow:**
    1.  A "Random Meme" button is available in the main gallery.
    2.  Clicking the button fetches one random meme from the user's collection and displays it, perhaps in a full-screen modal view.
*   **Technical Implementation:**
    *   This could be implemented on the frontend by fetching all memes and picking one at random.
    *   For better performance with large collections, a dedicated backend endpoint like `/api/memes/random` could be created to perform an aggregation query in MongoDB that efficiently returns a single random document.

### **3. Search & Filter**

Allows users to easily find specific memes in their collection.

*   **Core Concept:** This is an enhancement of the main **Read** (gallery) view.
*   **User Flow:**
    1.  The gallery page includes a search bar and/or a dropdown menu for categories.
    2.  As the user types in the search bar (to search captions) or selects a category, the list of memes automatically filters to show only the matching results.
*   **Technical Implementation:**
    *   **Frontend Filtering:** For a simple application, all memes can be fetched once, and Angular can perform the filtering directly on the client-side based on user input. This is fast and easy for small collections.
    *   **Backend Filtering:** For larger applications, the filtering logic would be handled by the backend. The frontend would send query parameters in the `GET` request (e.g., `/api/memes?category=Funny&search=cat`). The backend would then use these parameters to build a more specific database query.
