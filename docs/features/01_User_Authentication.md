# Feature: 01 - User Authentication

This document describes the user authentication feature, which is the foundation of the application, ensuring that users have a personal and secure space for their meme collection.

---

### **1. Core Functionality**

The authentication system is built around two primary actions: **Registration** and **Login**.

*   **Registration:** A new user can create an account using a unique username and a password.
*   **Login:** An existing user can sign in to access their meme collection.

This system is designed to be minimal, focusing only on verifying a user's identity before granting them access to the application's core CRUD features.

### **2. Technical Implementation (High-Level)**

*   **Backend:**
    *   A `User` model stores the `username` and a hashed `password` in the MongoDB database. Passwords are never stored in plain text.
    *   When a user logs in successfully, the backend generates a **JSON Web Token (JWT)**. This token is a secure, digitally signed credential that the user's browser can save.

*   **Frontend:**
    *   Simple forms are provided for registration and login.
    *   Upon login, the frontend stores the received JWT in the browser's local storage.
    *   For every subsequent request to a protected API endpoint (like creating or deleting a meme), the frontend automatically includes this JWT in the request header. The backend then validates the token to confirm the user's identity.

### **3. User Flow**

1.  A new user visits the application and is presented with a login page.
2.  They click a "Register" link, which takes them to the registration form.
3.  After submitting their new username and password, they are redirected back to the login page.
4.  The user logs in with their new credentials.
5.  Upon successful login, they are granted access to their meme gallery and can begin managing their collection. The application will show a "Logout" button, and protected links like "My Memes" will become visible.
