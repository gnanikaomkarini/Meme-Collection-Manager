# Meme Collection Manager: A Secure and Scalable Development Plan

This document provides a single, coherent, step-by-step plan for building the Meme Collection Manager. It is designed to produce a secure, maintainable, and scalable application by adhering to modern development best practices.

---

## Core Principles

This plan is built on the following principles:

*   **Security First:** The application will use a robust, modern authentication strategy. All user data will be protected, and common vulnerabilities (like XSS) will be mitigated.
*   **Test-Driven Mentality:** Quality is not an afterthought. The project will be configured for testing from day one. Writing tests is a core part of the development workflow, ensuring reliability and maintainability.
*   **Strong Typing:** The codebase will leverage TypeScript to its full potential, avoiding the `any` type to ensure type safety, improve code readability, and prevent runtime errors.
*   **Configuration Management:** The application will be designed for easy deployment to different environments (development, staging, production) by externalizing all configuration, such as API URLs and secrets.

---

## Part 1: Project Setup

### **Step 1.1: Create Project Folders**

```bash
mkdir backend
mkdir frontend
```

### **Step 1.2: Initialize the Backend (Node.js & Express)**

1.  **Navigate to `backend` and initialize the project:**
    ```bash
    cd backend
    npm init -y
    ```
2.  **Install Production Dependencies:**
    *   `cookie-parser`: Essential for the new secure authentication strategy.
    ```bash
    npm install express mongoose cors dotenv bcryptjs jsonwebtoken cookie-parser
    ```
3.  **Install Development Dependencies:**
    *   `nodemon` is correctly installed as a dev dependency.
    ```bash
    npm install --save-dev nodemon
    ```
4.  **Create `.env` and `.env.example` files:**
    In the `backend` folder, create both files. This is crucial for configuration management.
    *   **`.env` (will not be committed to Git)**
        ```
        PORT=3000
        MONGO_URI=mongodb://localhost:27017/memesDB
        ACCESS_TOKEN_SECRET=your-super-secret-access-token-string
        REFRESH_TOKEN_SECRET=your-even-more-secret-refresh-token-string
        ```
    *   **`.env.example` (will be committed)**
        ```
        PORT=3000
        MONGO_URI=
        ACCESS_TOKEN_SECRET=
        REFRESH_TOKEN_SECRET=
        ```
5.  **Create initial backend folder structure:**
    ```bash
    mkdir config controllers middleware models routes
    ```

### **Step 1.3: Initialize the Frontend (Angular)**

1.  **Navigate to `frontend` and generate the app:**
    *   We are **not** using `--skip-tests` or `--minimal`. A real project needs a testing framework.
    ```bash
    cd ../frontend
    ng new meme-app --routing --style=css
    ```
    *   When prompted "Do you want to enable Server-Side Rendering (SSR)?", answer **No**.

2.  **Configure Environment Files for API URL:**
    *   Angular provides `environment.ts` files for configuration.
    *   **`frontend/meme-app/src/environments/environment.ts` (for development)**
        ```typescript
        export const environment = {
          production: false,
          apiUrl: 'http://localhost:3000/api'
        };
        ```
    *   **`frontend/meme-app/src/environments/environment.prod.ts` (for production)**
        ```typescript
        export const environment = {
          production: true,
          apiUrl: 'https://your-production-api-domain.com/api'
        };
        ```
### **Step 1.4: A Note on Testing**
This plan creates a project ready for testing.
*   **Backend:** A full testing suite can be added with frameworks like Jest or Mocha.
*   **Frontend:** The Angular CLI has already set up Karma and Jasmine. You can run unit tests at any time with:
    ```bash
    # From frontend/meme-app
    ng test
    ```
---
## Part 2: Backend Development
### **Step 2.1: Implement Centralized Error Handling**
1. **Create `errorHandler.js` in `backend/middleware`:**
    ```javascript
    const errorHandler = (err, req, res, next) => {
      const statusCode = res.statusCode ? res.statusCode : 500;
      res.status(statusCode);
      res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
      });
    };
    module.exports = { errorHandler };
    ```
### **Step 2.2: Rewrite Authentication (Secure `httpOnly` Cookies)**
1.  **Update `user.model.js`:** The previous model with bcrypt hashing is correct and can be reused.

2.  **Create `auth.controller.js`:** This is completely rewritten to use `httpOnly` cookies.
    ```javascript
    // backend/controllers/auth.controller.js
    const User = require('../models/user.model');
    const jwt = require('jsonwebtoken');

    const generateTokens = (res, userId) => {
      const accessToken = jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
      const refreshToken = jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
    };

    exports.register = async (req, res, next) => {
      // ... (register logic is similar, but on success, call generateTokens)
      // On success:
      // generateTokens(res, user._id);
      // res.status(201).json({ _id: user._id, username: user.username });
    };

    exports.login = async (req, res, next) => {
      // ... (login logic is similar)
      // On success:
      // generateTokens(res, user._id);
      // res.status(200).json({ _id: user._id, username: user.username });
    };

    exports.refreshToken = (req, res) => {
        const token = req.cookies.refreshToken;
        if (!token) return res.status(401).json({ message: 'No refresh token' });

        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) return res.status(403).json({ message: 'Invalid refresh token' });
            generateTokens(res, user.id);
            res.status(200).json({ message: 'Tokens refreshed' });
        });
    };

    exports.logout = (req, res) => {
      res.cookie('accessToken', '', { httpOnly: true, expires: new Date(0) });
      res.cookie('refreshToken', '', { httpOnly: true, expires: new Date(0) });
      res.status(200).json({ message: 'Logged out successfully' });
    };
    ```
3.  **Create `auth.routes.js` with new endpoints:**
    ```javascript
    // backend/routes/auth.routes.js
    const { register, login, refreshToken, logout } = require('../controllers/auth.controller');
    router.post('/register', register);
    router.post('/login', login);
    router.post('/refresh-token', refreshToken);
    router.post('/logout', logout);
    ```
### **Step 2.3: Create `protect` Middleware**
This middleware now reads the token from the cookie, not the header.
```javascript
// backend/middleware/auth.middleware.js
exports.protect = async (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return next(new Error('Not authorized, no token'));
  // ... (verify token logic is similar)
};
```
### **Step 2.4: Build the Meme CRUD API**
This remains largely the same as in the previous plan (`03_Backend_CRUD_API.md`), as the logic for associating a meme with a user and checking ownership is still valid. The routes will be protected by the new `protect` middleware.

### **Step 2.5: Wire Everything in `server.js`**
```javascript
// backend/server.js
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
app.use(cors({ credentials: true, origin: 'http://localhost:4200' })); // IMPORTANT for cookies
app.use(cookieParser());
app.use(express.json());

// ... (DB Connection) ...

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/memes', require('./routes/meme.routes'));

// Central Error Handler - MUST BE LAST
app.use(errorHandler);

// ... (app.listen) ...
```
---
## Part 3: Frontend Development
### **Step 3.1: Update `AuthService`**
The service no longer handles tokens. It just makes API calls and can hold the user's authentication state.
```typescript
// frontend/meme-app/src/app/services/auth.service.ts
import { environment } from '../../environments/environment';
// ...
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private userSubject = new BehaviorSubject<any | null>(null);
  // ...
  // login/register methods now return user data, not a token
  // logout method calls the /logout endpoint
}
```
### **Step 3.2: Create a Form Model Interface**
Instead of `any`, create a strong type for forms.
```typescript
// In a new file, e.g., src/app/models/forms.ts
export interface LoginForm {
  username: string;
  password?: string;
}
```
Update components to use this: `credentials: LoginForm = { username: '', password: '' };`
### **Step 3.3: Implement an HTTP Interceptor for Error Handling & Token Refresh**
This is the new, critical role for the interceptor.
```typescript
// frontend/meme-app/src/app/interceptors/error.interceptor.ts
// ...
intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Handle unauthorized errors, potentially by trying to refresh the token
          // Or redirecting to login
        }
        // ... display UI error to user
        return throwError(() => error);
      })
    );
}
```
### **Step 3.4: Build Meme Components with UI Error Handling**
Update the components to handle errors from the services.
```typescript
// In meme-list.component.ts
error: string | null = null;
loadMemes(): void {
  this.memeService.getMemes().subscribe({
    next: data => this.memes = data,
    error: err => this.error = 'Failed to load memes. Please try again later.'
  });
}
```
Then, in the HTML, you can display this error:
`<div *ngIf="error" class="error-message">{{ error }}</div>`

---
This revised plan provides a single source of truth for building a secure and robust application, directly addressing the issues raised in the critique.