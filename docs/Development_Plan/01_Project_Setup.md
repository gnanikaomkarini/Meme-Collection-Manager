# Development Plan: 01 - Project Setup (Secure & Scalable)

This guide covers the complete and correct setup for the Meme Collection Manager project. It establishes a secure, maintainable, and test-ready foundation.

---

### **Step 1: Create the Root Directory Structure**

These folders will keep the backend and frontend code completely separate.

```bash
# In your project's root directory
mkdir backend
mkdir frontend
```

---

### **Step 2: Initialize the Backend (Express.js)**

1.  **Navigate into the `backend` directory and initialize the project:**
    ```bash
    cd backend
    npm init -y
    ```

2.  **Install Production Dependencies:**
    *   `cookie-parser` is added to securely handle `httpOnly` cookies for authentication.
    ```bash
    npm install express mongoose cors dotenv bcryptjs jsonwebtoken cookie-parser
    ```

3.  **Install Development Dependencies:**
    *   `nodemon` is installed as a `--save-dev` dependency, as it's only used for development.
    ```bash
    npm install --save-dev nodemon
    ```

4.  **Create `.env` and `.env.example` Files:**
    This is a critical step for configuration management. The `.env` file will be ignored by Git and hold your local secrets. The `.env.example` file will be committed as a template for other developers.

    *   **Create the files:**
        ```bash
        touch .env .env.example
        ```
    *   **Add content to `.env` (Your Local Secrets):**
        ```
        PORT=3000
        MONGO_URI=mongodb://localhost:27017/memesDB
        ACCESS_TOKEN_SECRET=your-super-secret-access-token-string
        REFRESH_TOKEN_SECRET=your-even-more-secret-refresh-token-string
        ```
    *   **Add content to `.env.example` (Template for others):**
        ```
        PORT=3000
        MONGO_URI=
        ACCESS_TOKEN_SECRET=
        REFRESH_TOKEN_SECRET=
        ```

5.  **Create the initial backend folder structure:**
    ```bash
    mkdir config controllers middleware models routes
    ```

---

### **Step 3: Initialize the Frontend (Angular)**

1.  **Navigate into the `frontend` directory and generate the app:**
    *   We will **not** use `--skip-tests` or `--minimal`. A professional project requires a testing framework from the start.
    ```bash
    cd ../frontend
    ng new meme-app --routing --style=css
    ```
    *   When prompted "Do you want to enable Server-Side Rendering (SSR) and Static Site Generation (SSG)?", answer **No**.

2.  **Configure Environment Files for API URL:**
    Hardcoding URLs is not a scalable practice. Use Angular's built-in environment files.

    *   **`frontend/meme-app/src/environments/environment.ts` (for local development):**
        ```typescript
        export const environment = {
          production: false,
          apiUrl: 'http://localhost:3000/api'
        };
        ```
    *   **`frontend/meme-app/src/environments/environment.prod.ts` (for production):**
        ```typescript
        export const environment = {
          production: true,
          apiUrl: 'https://your-production-api-domain.com/api'
        };
        ```

---

### **Step 4: The Importance of a Testing Strategy**

This project is now configured for testing, which is essential for quality and long-term maintainability.

*   **Running Frontend Unit Tests:**
    The Angular CLI has set up a testing environment with Karma and Jasmine. You can run the initial tests to ensure everything is working correctly.
    ```bash
    # From the frontend/meme-app directory
    ng test
    ```
    This command will open a browser window and automatically re-run tests whenever you save a file. As you build components and services, you should be writing corresponding `.spec.ts` files to test your logic.

*   **Backend Testing:**
    While not configured by default, you can add a testing framework like **Jest** to your backend to test your API endpoints, controllers, and models. This is highly recommended for any real-world application.
