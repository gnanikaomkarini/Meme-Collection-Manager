# Feature: 02 - Meme CRUD Operations

This document outlines the core functionality of the Meme Collection Manager: the Create, Read, Update, and Delete (CRUD) operations that allow users to manage their personal meme gallery.

---

### **1. Create (Add and Organize Memes)**

This feature allows an authenticated user to add a new meme to their collection.

*   **User Flow:**
    1.  The user navigates to the "Add New Meme" page.
    2.  They are presented with a simple form containing fields for:
        *   Image URL
        *   Caption
        *   Category (chosen from a predefined list, e.g., "Funny", "Relatable", "Wholesome")
    3.  Upon submission, the new meme is saved to the database, associated with the logged-in user's account.
    4.  The user is redirected back to their main meme gallery, where the new meme is now visible.

*   **Technical Implementation:**
    *   The frontend sends a `POST` request to the `/api/memes` backend endpoint.
    *   The request body contains the new meme's data.
    *   The backend validates the user's JWT and, if valid, creates a new `Meme` document in the database, linking it to the user's ID. All data is validated before insertion (see "Data Validation" section).

### **2. Read (Meme Gallery Display)**

This feature is the main view of the application, where users can see all the memes they have collected.

*   **User Flow:**
    1.  After logging in, the user is directed to their paginated meme gallery.
    2.  Their memes are displayed in a simple grid or list layout, with controls to navigate between pages.
    3.  Each meme card shows the image and its caption.

*   **Technical Implementation:**
    *   The frontend sends a `GET` request to the `/api/memes` endpoint.
    *   **This endpoint is protected and requires authentication.** The backend will only return memes belonging to the authenticated user.
    *   **The API will be paginated to ensure scalability.** The request will include page and limit parameters (e.g., `/api/memes?page=1&limit=20`). The backend will return a structured response containing the memes for the requested page and total page count.

### **3. Update (Edit Existing Memes)**

This feature allows a user to modify the details of a meme they have already created.

*   **User Flow:**
    1.  From the meme gallery, the user clicks an "Edit" button on a specific meme.
    2.  They are taken to a form, pre-filled with the existing data for that meme (caption and category).
    3.  The user can change the details and save the form.
    4.  They are redirected back to the gallery, where the updated meme information is now displayed.

*   **Technical Implementation:**
    *   The frontend sends a `PUT` request to the `/api/memes/:id` endpoint, where `:id` is the ID of the meme being edited.
    *   The backend first verifies that the meme belongs to the logged-in user before applying the updates. All new data is validated before saving.

### **4. Delete (Remove Memes)**

This feature allows a user to permanently remove a meme from their collection.

*   **User Flow:**
    1.  In the meme gallery, the user clicks a "Delete" button on a specific meme.
    2.  A confirmation prompt appears to prevent accidental deletion.
    3.  If confirmed, the meme is removed from the gallery view.

*   **Technical Implementation:**
    *   The frontend sends a `DELETE` request to the `/api/memes/:id` endpoint.
    *   The backend verifies that the meme belongs to the logged-in user and, if so, removes the corresponding document from the database.

### **5. Data Validation and Integrity**

Robust backend validation is mandatory to ensure data integrity and prevent security issues.

*   **Image URL:** Must be a well-formed URL string. The backend will validate the format. Storing broken or malicious links should be prevented.
*   **Category:** Must be a value from a predefined list (enum) maintained on the backend. This prevents inconsistent or junk data.
*   **Caption:** Input will be sanitized to remove any potentially malicious script tags or markup before being stored.
