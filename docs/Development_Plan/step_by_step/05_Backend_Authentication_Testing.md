# Guide: 05 - Testing the Backend Authentication Flow

This guide provides a step-by-step process to test and verify that the Google OAuth2 authentication system you implemented on the backend is working correctly from end to end.

---

### **Prerequisites**

*   All previous backend implementation guides have been completed.
*   Your `backend/.env` file is correctly populated with your `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `MONGO_URI`, and `COOKIE_KEY`.
*   The `BACKEND_URL` and `FRONTEND_URL` in your `.env` file are set correctly (e.g., `http://localhost:3000` and `http://localhost:4200`).

---

### **Step 1: Start the Backend Server**

Before you can test anything, your server must be running.

1.  Open your terminal and navigate to the `backend` directory.
2.  Run the development server script:
    ```bash
    npm run dev
    ```
3.  You should see output confirming that the server is running and the database is connected, for example:
    ```
    Gnanika's is running on port 3000. Adios Amigos!
    MongoDB connected
    ```

### **Step 2: Initiate the Authentication Flow in Your Browser**

1.  Open your web browser (e.g., Chrome, Firefox).
2.  In the address bar, navigate to your backend's Google login route:
    ```
    http://localhost:3000/auth/google
    ```
3.  The browser should immediately redirect you to a Google account sign-in page.

### **Step 3: Authenticate and Grant Consent**

1.  On the Google sign-in page, log in with one of the accounts you added as a "Test user" in the Google Cloud Console's OAuth consent screen setup.
2.  After logging in, Google will present the "consent screen" you configured, asking for permission for your application to access the user's profile and email.
3.  Click **Allow** or **Continue**.

### **Step 4: Verify the Redirects and Session Creation**

This step happens automatically and very quickly, but it's important to understand what's happening.

1.  After you grant consent, Google redirects your browser back to the `callbackURL` you specified: `http://localhost:3000/auth/google/callback`.
2.  Your backend server handles this request. The `passport.authenticate` middleware exchanges the code from Google for a user profile, finds or creates a user in your database, and establishes a session.
3.  The server then sends a session cookie to your browser.
4.  Finally, your backend redirects the browser to the `FRONTEND_URL` you defined in your `.env` file (e.g., `http://localhost:4200/`).

It is normal for this final page to show an error (like "This site can’t be reached") if your frontend application is not running. The crucial part is that the redirect happened.

### **Step 5: Confirm Successful Authentication**

This is the most important step to verify that you are truly logged in.

1.  **In the same browser tab** (to ensure the session cookie is sent with the request), navigate to the `current_user` endpoint:
    ```
    http://localhost:3000/auth/current_user
    ```
2.  **Expected Result**: If authentication was successful, the browser will display a JSON object with the details of the logged-in user, fetched from your database. It should look something like this:
    ```json
    {
        "_id": "60c7c8f9b9f9f9f9f9f9f9f9",
        "googleId": "123456789012345678901",
        "displayName": "Gnanika",
        "email": "gnanika@example.com",
        "profileImage": "https://lh3.googleusercontent.com/a-/AOh14Gg....",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
    }
    ```

If you see this JSON, your login system is working!

### **Step 6: Test the Logout Functionality**

1.  In the same browser tab, navigate to the logout endpoint:
    ```
    http://localhost:3000/auth/logout
    ```
2.  The server will clear your session and redirect you to the frontend login page (`http://localhost:4200/login`).
3.  To confirm you are logged out, navigate back to the `current_user` endpoint:
    ```
    http://localhost:3000/auth/current_user
    ```
4.  This time, you should see an "Unauthorized" message or an empty response, confirming the session was destroyed.

---

### **Common Troubleshooting**

*   **`redirect_uri_mismatch` Error**: This error from Google means the "Authorized redirect URIs" in your Google Cloud Console credentials do not exactly match the `callbackURL` your backend is using (`${process.env.BACKEND_URL}/auth/google/callback`). Check for typos, http vs https, or trailing slashes.
*   **401 Unauthorized at Step 5**: If you don't see the user JSON, it could be a cookie issue. Ensure `credentials: true` is set in your CORS configuration in `server.js` and that `cookieSession` is configured correctly with keys.
*   **Server Crashes**: Check your backend terminal for any error messages. It could be a database connection issue or a problem within the Passport strategy logic.
