# Guide: 01 - Initializing the Node.js Backend

This document provides a step-by-step guide for initializing the complete Node.js project for the Meme Collection Manager backend. Following these steps will result in a structured, dependency-ready project.

---

### **Prerequisites**

*   Node.js and npm installed on your system.
*   You should be in the root directory of your project (e.g., `Meme-Collection-Manager/`).

---

### **Step 1: Create Project Directories**

First, create the separate directories for the backend and frontend code to keep them isolated.

```bash
mkdir backend
mkdir frontend
```

This guide will focus only on the `backend` setup.

### **Step 2: Initialize the Node.js Project**

Navigate into the `backend` directory and initialize it as a new npm project. The `-y` flag accepts all the default settings.

```bash
cd backend
npm init -y
```
This will create a `package.json` file in your `backend` directory.

### **Step 3: Install Dependencies**

We will install two sets of dependencies: production dependencies required for the app to run, and development dependencies used for building and testing.

1.  **Install Production Dependencies:**
    These are the core libraries for the server, database connection, authentication, and session management.

    ```bash
    npm install express mongoose cors dotenv passport passport-google-oauth20 cookie-session
    ```

2.  **Install Development Dependencies:**
    `nodemon` is used to automatically restart the server during development whenever file changes are detected.

    ```bash
    npm install --save-dev nodemon
    ```

### **Step 4: Configure Environment Variables**

Sensitive information and environment-specific settings are stored in a `.env` file.

1.  **Create the environment files:**
    *   `.env`: For your local secret values. This file should NOT be committed to Git.
    *   `.env.example`: A template file that will be committed to Git to show other developers what variables are needed.

    ```bash
touch .env .env.example
```

2.  **Add content to `.env.example` (The Template):**
    ```ini
PORT=3000
MONGO_URI=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
COOKIE_KEY=
```

3.  **Add content to `.env` (Your Local Secrets):**
    Copy the content from the `.env.example` file and fill in your actual secret values. You will need to get your Google Client ID and Secret from the Google Cloud Console.

    ```ini
PORT=3000
MONGO_URI=mongodb://localhost:27017/memesDB
GOOGLE_CLIENT_ID=your-google-client-id-from-google-cloud
GOOGLE_CLIENT_SECRET=your-google-client-secret-from-google-cloud
COOKIE_KEY=a-long-random-string-for-cookie-encryption
```

### **Step 5: Create Backend Folder Structure**

A well-organized folder structure is key for a maintainable project.

```bash
mkdir config controllers middleware models routes
```

*   `config`: For configuration files, like the Passport.js strategy setup.
*   `controllers`: For the logic that handles requests (e.g., `createMeme`).
*   `middleware`: For middleware functions (e.g., authentication checks).
*   `models`: For your Mongoose database schemas.
*   `routes`: For defining the API routes (e.g., `/api/memes`).

### **Step 6: Add npm Scripts for Running the Server**

To make it easy to start the server, add `start` and `dev` scripts to your `package.json` file.

1.  **Open `package.json`** and find the `"scripts"` section.
2.  **Add the following scripts:**

    ```json
    "scripts": {
      "start": "node server.js",
      "dev": "nodemon server.js",
      "test": "echo \"Error: no test specified\" && exit 1"
    },
    ```

Your `package.json`'s scripts section should now look similar to this. Now you can run `npm run dev` to start your development server.

```