# Development Plan: 01 - Project Setup (Google OAuth Edition)

This guide covers the complete project setup for the Meme Collection Manager, now using Google OAuth for authentication. This simplifies the backend significantly.

---

### **Step 1: Create the Root Directory Structure**

(This step remains unchanged).
```bash
# In your project's root directory
mkdir backend
mkdir frontend
```

---

### **Step 2: Initialize the Backend (Express.js with Passport)**

1.  **Navigate into the `backend` directory and initialize the project:**
    ```bash
    cd backend
    npm init -y
    ```

2.  **Install Production Dependencies:**
    *   `passport`, `passport-google-oauth20`, and `cookie-session` are the core libraries for authentication.
    ```bash
    npm install express mongoose cors dotenv passport passport-google-oauth20 cookie-session
    ```

3.  **Install Development Dependencies:**
    ```bash
    npm install --save-dev nodemon
    ```

4.  **Create `.env` and `.env.example` Files:**
    The environment variables are now focused on Google's API keys and a key for encrypting the session cookie.

    *   **Create the files:**
        ```bash
        touch .env .env.example
        ```
    *   **Add content to `.env` (Your Local Secrets):**
        *You must get your Client ID and Secret from the Google Cloud Console.*
        ```
        PORT=3000
        MONGO_URI=mongodb://localhost:27017/memesDB
        GOOGLE_CLIENT_ID=your-google-client-id
        GOOGLE_CLIENT_SECRET=your-google-client-secret
        COOKIE_KEY=your-super-secret-cookie-encryption-key
        ```
    *   **Add content to `.env.example` (Template for others):**
        ```
        PORT=3000
        MONGO_URI=
        GOOGLE_CLIENT_ID=
        GOOGLE_CLIENT_SECRET=
        COOKIE_KEY=
        ```

5.  **Create the initial backend folder structure:**
    ```bash
    mkdir config controllers middleware models routes
    ```
    *The `config` folder will be particularly important for configuring Passport.*

---

### **Step 3: Initialize the Frontend (Angular)**

(This step remains unchanged, as the frontend setup is independent of the backend's authentication strategy at this stage).

1.  **Navigate into the `frontend` directory and generate the app:**
    ```bash
    cd ../frontend
    ng new meme-app --routing --style=css
    ```
    *   When prompted "Do you want to enable Server-Side Rendering (SSR) and Static Site Generation (SSG)?", answer **No**.

2.  **Configure Environment Files for API URL:**
    *   **`frontend/meme-app/src/environments/environment.ts`:**
        ```typescript
        export const environment = {
          production: false,
          apiUrl: 'http://localhost:3000/api'
        };
        ```
    *   **`frontend/meme-app/src/environments/environment.prod.ts`:**
        ```typescript
        export const environment = {
          production: true,
          apiUrl: 'https://your-production-api-domain.com/api'
        };
        ```

---

### **Step 4: The Importance of a Testing Strategy**

The switch to OAuth changes *how* we test, but not the need for it.

*   **Frontend Testing:** The Angular CLI setup is ready to go. We will no longer need to test login/registration forms, but we will test the components that display user information.
*   **Backend Testing:** We will still use Jest and Supertest. However, instead of testing registration endpoints, we will need to mock the Passport.js authentication flow to simulate a logged-in user for testing protected API endpoints.
