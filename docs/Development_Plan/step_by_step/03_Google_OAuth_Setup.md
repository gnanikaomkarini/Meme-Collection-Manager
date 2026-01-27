# Guide: 03 - Setting Up Google OAuth Credentials

This document provides step-by-step instructions on how to obtain your Google Client ID and Client Secret from the Google Cloud Console. These credentials are essential for enabling Google OAuth authentication in your backend application.

---

### **Prerequisites**

*   A Google Account.
*   Your `FRONTEND_URL` and `BACKEND_URL` (as defined in your `.env` files) for both development and production environments.

---

### **Step 1: Access Google Cloud Console**

Open your web browser and navigate to the [Google Cloud Console](https://console.cloud.google.com/). You will need to log in with your Google Account.

### **Step 2: Create a New Project**

If you don't already have a project, you'll need to create one.

1.  In the Google Cloud Console, click on the project selector dropdown (usually at the top left, next to "Google Cloud").
2.  Click "New Project".
3.  Give your project a meaningful name, e.g., "Meme Collection Manager".
4.  Click "Create".

### **Step 3: Enable the Google People API**

Your application will need access to basic user profile information (like email and display name) from Google.

1.  From your new project's dashboard, use the search bar at the top of the console and search for "People API".
2.  Select "Google People API" from the results.
3.  Click the "Enable" button.

### **Step 4: Configure the OAuth Consent Screen**

This is the screen users will see when your application requests permission to access their Google Account.

1.  In the left-hand navigation menu, go to **APIs & Services > OAuth consent screen**.
2.  **User type:** Choose "External" and click "Create". (This allows any Google Account user to use your app).
3.  **App information:**
    *   **App name:** Provide a user-friendly name, e.g., "Meme Collection Manager".
    *   **User support email:** Select your email address.
    *   **App logo:** (Optional)
    *   **App domain:** (Optional)
4.  **Scopes:** These define the user data your application requests access to.
    *   Click "ADD OR REMOVE SCOPES".
    *   Select `.../auth/userinfo.email` and `.../auth/userinfo.profile`. These correspond to the email, display name, and profile image.
    *   Click "Update".
5.  **Test users:** (Crucial for development). Add your own Google Account as a test user, and any other accounts you'll use for testing.
6.  Click "SAVE AND CONTINUE" through the remaining steps. You don't need to "Publish" your app for development; leaving it in "Testing" status is fine.

### **Step 5: Create OAuth Client ID Credentials**

Now, you'll create the actual credentials your application will use.

1.  In the left-hand navigation menu, go to **APIs & Services > Credentials**.
2.  Click "+ CREATE CREDENTIALS" at the top and select "OAuth client ID".
3.  **Application type:** Select "Web application".
4.  **Name:** Give it a descriptive name, e.g., "Meme Manager Web Client".
5.  **Authorized JavaScript origins:** These are the domains from which your frontend will initiate the OAuth flow.
    *   Click "ADD URI".
    *   Add your local frontend URL: `http://localhost:4200`
    *   If you plan to deploy, also add your production frontend URL: `https://your-frontend-production-domain.com`
6.  **Authorized redirect URIs:** These are the endpoints on your backend where Google will send the user after they grant permission. This **must** match the `callbackURL` configured in your Passport.js strategy and in your backend's `.env` for `BACKEND_URL`.
    *   Click "ADD URI".
    *   Add your local backend callback URL: `http://localhost:3000/api/auth/google/callback`
    *   If you plan to deploy, also add your production backend callback URL: `https://your-backend-production-domain.com/api/auth/google/callback`
7.  Click "CREATE".

### **Step 6: Retrieve Your Client ID and Client Secret**

After clicking "CREATE", a dialog box will appear showing your **Client ID** and **Client Secret**.

1.  Copy both the **Client ID** and the **Client Secret**.

### **Step 7: Update Your Backend `.env` File**

Paste these copied values into your `backend/.env` file.

```ini
# ... other variables ...
GOOGLE_CLIENT_ID=YOUR_GENERATED_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GENERATED_CLIENT_SECRET
# ... other variables ...
```

Congratulations! You have successfully configured your Google OAuth credentials. Your backend is now ready to use these values to authenticate users.
