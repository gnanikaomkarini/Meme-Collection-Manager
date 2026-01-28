# Guide: 05 - Testing the Backend API and Authentication

This guide provides a step-by-step process to test the entire backend, including the Google OAuth2 authentication and other protected API endpoints, using the new standard response format.

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
3.  You should see output confirming that the server is running and the database is connected.

### **Step 2: Initiate the Authentication Flow (Login)**

1.  Open your web browser (e.g., Chrome, Firefox).
2.  In the address bar, navigate to your backend's Google login route:
    ```
    http://localhost:3000/auth/google
    ```
3.  Log in with your Google account and grant consent if prompted. After a few quick redirects, you should land on your frontend's URL (e.g., `http://localhost:4200/`).

### **Step 3: Confirm Successful Authentication**

This is the most important step to verify that you are truly logged in.

1.  **In the same browser tab** (to ensure the session cookie is sent), navigate to the `current_user` endpoint:
    ```
    http://localhost:3000/auth/current_user
    ```
2.  **Expected Result**: If authentication was successful, the browser will display a JSON object in the standard envelope format, with your user details in the `data` field. It should look something like this:
    ```json
    {
      "status": { "success": true, "error": null },
      "data": {
        "_id": "60c7c8f9b9f9f9f9f9f9f9f9",
        "googleId": "123456789012345678901",
        "displayName": "Gnanika",
        "email": "gnanika@example.com",
        "profileImage": "https://lh3.googleusercontent.com/a-/AOh14Gg....",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      }
    }
    ```
    If you were not authenticated, you would receive a `401 Unauthorized` response with an error envelope:
    ```json
    {
      "status": {
        "success": false,
        "error": {
          "code": "UNAUTHORIZED",
          "message": "User is not authenticated."
        }
      },
      "data": null
    }
    ```

---

### **Step 4: Test Protected API Endpoints**

Now that you are logged in, you can test other APIs that are protected by authentication, such as your Meme API.

#### **Method 1: Using the Browser (for GET requests)**

You can easily test `GET` endpoints by simply navigating to them in your browser. Because you are already logged in, the browser will automatically send your session cookie.

*   **Example: Get all memes**
    Assuming you have an endpoint at `/api/memes` to fetch all memes, navigate to:
    ```
    http://localhost:3000/api/memes
    ```
    If it works, you should see a JSON array of memes wrapped in the standard success envelope. If you were logged out, this endpoint would likely give you an "Unauthorized" error.

#### **Method 2: Using cURL (for POST, PUT, DELETE requests)**

You cannot make `POST` requests directly from a browser's address bar. For this, you need an API testing tool. `cURL` is a powerful command-line tool for this purpose.

**Part A: Find Your Session Cookie**

`cURL` does not store cookies like a browser, so you need to find your session cookie and provide it manually.

1.  In your browser, go to the tab where you are logged in to your application.
2.  Open the Developer Tools (`F12` or `Cmd+Option+I`).
3.  Go to the **Application** tab (in Chrome) or **Storage** tab (in Firefox).
4.  On the left side, under "Storage", expand "Cookies" and select your backend URL (`http://localhost:3000`).
5.  You will see a list of cookies. Find the one named **`session`**.
6.  Copy the long string of characters from the **"Value"** column. This is your session cookie value.

**Part B: Make Authenticated API Calls with cURL**

Now you can use the copied cookie value to make authenticated requests from your terminal.

*   **Example: Create a new meme (POST)**

    Assuming you have an endpoint at `POST /api/memes` to create a meme, run the following command in your terminal. Replace `YOUR_COOKIE_VALUE` with the value you copied.

    ```bash
    # Replace the placeholder with your actual cookie value
    curl -X POST http://localhost:3000/api/memes \
    -H "Content-Type: application/json" \
    -d '{"title": "My Hilarious New Meme", "imageUrl": "http://example.com/new-meme.jpg"}' \
    --cookie "session=YOUR_COOKIE_VALUE"
    ```
    If successful, you should see the newly created meme object as a JSON response wrapped in the standard success envelope in your terminal.

*   **Example: Delete a meme (DELETE)**

    Assuming you have an endpoint like `DELETE /api/memes/:id`, you can test it like this:

    ```bash
    # Replace :id with a real meme ID and the placeholder with your cookie value
    curl -X DELETE http://localhost:3000/api/memes/60c7c8f9b9f9f9f9f9f9f9f9 \
    --cookie "session=YOUR_COOKIE_VALUE"
    ```
    If successful, you should receive a response indicating success in the standard envelope.

### **Step 5: Test the Logout Functionality**

1.  In the same browser tab, navigate to the logout endpoint:
    ```
    http://localhost:3000/auth/logout
    ```
2.  The server will clear your session and redirect you. To confirm you are logged out, try accessing a protected endpoint again, like `/auth/current_user`. You should receive a `401 Unauthorized` response with the error envelope as shown in Step 3.

---

### **Common Troubleshooting**

*   **`redirect_uri_mismatch` Error**: This error from Google means the "Authorized redirect URIs" in your Google Cloud Console do not exactly match `${process.env.BACKEND_URL}/auth/google/callback`. Check for typos, http vs https, or trailing slashes.
*   **401 Unauthorized Error**: If you are sure you are logged in but still get this error, double-check that you are copying the cookie value correctly and that you are including the full `--cookie "session=YOUR_COOKIE_VALUE"` flag in your `cURL` command. Also ensure `credentials: true` is set in your CORS configuration in `server.js`.
*   **Server Crashes**: Check your backend terminal for any error messages. It could be a database connection issue or a problem within your API logic.