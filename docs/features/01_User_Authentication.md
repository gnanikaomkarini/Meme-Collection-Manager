# Feature: 01 - User Authentication via Google OAuth

This document describes the user authentication feature, which is the foundation of the application. To ensure a secure, reliable, and user-friendly experience, we will delegate authentication to Google using the OAuth 2.0 standard, managed by the Passport.js library. This approach eliminates the need to handle passwords, implement complex session management, or build email verification flows.

---

### **1. Core Functionality**

The authentication system is built around three primary actions:

*   **Login:** An unauthenticated user can initiate a login, which will redirect them to Google to authorize the application.
*   **Logout:** An authenticated user can securely terminate their session.
*   **Session Persistence:** A user's login state is maintained across page reloads and browser sessions.

### **2. User Model**

The `User` model will be simplified, as we no longer store sensitive password information.

*   The `User` model in MongoDB will store:
    *   `googleId` (string, unique): The unique identifier provided by Google.
    *   `displayName` (string): The user's full name from their Google profile.
    *   `email` (string, unique): The user's primary Google email address.
    *   `profileImage` (string): A URL to the user's Google profile picture.

### **3. Technical Implementation (High-Level)**

*   **Backend:**
    *   The backend will use **Passport.js** with the `passport-google-oauth20` strategy.
    *   Session management will be handled using `cookie-session`. When a user successfully authenticates via Google, Passport will create a session and store the user's ID in an encrypted, `httpOnly` cookie.
    *   On subsequent requests, the cookie is sent automatically, and Passport decodes it to restore the user's session and make the user object available on `req.user`.

*   **Frontend:**
    *   The UI will not contain any login or registration forms.
    *   A simple "Login with Google" button will link directly to the backend's Google authentication endpoint (e.g., `/api/auth/google`).

### **4. User Flow (OAuth Dance)**

1.  A new user visits the application and sees a "Login with Google" button.
2.  The user clicks the button, which navigates them to the backend endpoint `/api/auth/google`.
3.  The backend redirects the user to Google's consent screen, requesting permission to access their basic profile information.
4.  The user agrees and is redirected back to a callback endpoint on our backend (e.g., `/api/auth/google/callback`).
5.  The backend, using Passport.js, exchanges a one-time code from Google for the user's profile information.
6.  The backend looks up the user by their `googleId`. If they exist, they are logged in. If they don't exist, a new user is created in the database.
7.  A session is established via an encrypted cookie, and the user is redirected back to the main frontend application (e.g., `/memes`).
8.  The user is now logged in and can access all protected features.

### **5. Security**

*   **No Password Storage:** By delegating to Google, we completely avoid the risks associated with storing passwords and implementing our own authentication logic.
*   **CSRF Protection:** Standard practices for CSRF protection should be implemented in the backend framework.
*   **Secure Cookies:** All session cookies will be `httpOnly` and, in production, will be marked as `secure`.
