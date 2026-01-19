# Development Plan: 01 - Project Setup

This guide covers the complete setup for the Meme Collection Manager project, including folder structure and initialization of the Node.js backend and Angular frontend.

---

### **Step 1: Create the Root Directory Structure**

These two folders will keep the backend and frontend code completely separate.

```bash
# In your project's root directory
mkdir backend
mkdir frontend
```

---

### **Step 2: Initialize the Backend (Express.js)**

This section walks you through setting up a complete Node.js server.

1.  **Navigate into the `backend` directory:**
    ```bash
    cd backend
    ```

2.  **Initialize a Node.js project:**
    This command creates a `package.json` file, which tracks your project's metadata and dependencies. The `-y` flag accepts all the default settings.
    ```bash
    npm init -y
    ```

3.  **Install Production Dependencies:**
    *   `express`: The core web server framework.
    *   `mongoose`: The library for connecting to and interacting with your MongoDB database.
    *   `cors`: Middleware to enable Cross-Origin Resource Sharing, allowing your Angular frontend (on a different port) to securely make requests to this backend.
    *   `dotenv`: A utility to load environment variables from a `.env` file into `process.env`.
    *   `bcryptjs`: A library to hash user passwords before storing them in the database.
    *   `jsonwebtoken`: A library to generate and verify JSON Web Tokens (JWT) for user authentication.

    ```bash
    npm install express mongoose cors dotenv bcryptjs jsonwebtoken
    ```

4.  **Install Development Dependencies:**
    *   `nodemon`: A development tool that automatically restarts your server whenever you make a file change, speeding up development.

    ```bash
    npm install --save-dev nodemon
    ```

5.  **Configure `package.json` for easy startup:**
    Open `backend/package.json` and add a `start` script. This allows you to run `npm start` to launch the server using `nodemon`.

    ```json
    // In backend/package.json
    "scripts": {
      "start": "nodemon server.js",
      "test": "echo \"Error: no test specified\" && exit 1"
    },
    ```

6.  **Create initial backend folder structure:**
    For excellent modularity, create the following folders inside the `backend` directory.
    ```bash
    mkdir config controllers middleware models routes
    ```
    *   `config`: For configuration files (e.g., database connection).
    *   `controllers`: For the logic that handles incoming requests (e.g., creating a user, getting memes).
    *   `middleware`: For functions that run between the request and the controller (e.g., checking if a user is authenticated).
    *   `models`: For your Mongoose database schemas (e.g., User schema, Meme schema).
    *   `routes`: For defining the API endpoints (URLs) and linking them to controller functions.

---

### **Step 3: Initialize the Frontend (Angular)**

This section sets up the Angular client application.

1.  **Navigate into the `frontend` directory:**
    ```bash
    cd ../frontend
    ```

2.  **Generate the Angular application:**
    Use the Angular CLI to create a new, pre-configured application.
    *   `ng new meme-app`: Creates the project in a new `meme-app` folder.
    *   `--routing`: Generates a separate module for handling navigation between pages.
    *   `--style=css`: Sets the default stylesheet format to plain CSS.
    *   `--skip-tests`: Skips generating test files for a simpler initial setup.

    ```bash
    ng new meme-app --routing --style=css --skip-tests
    ```
    **Note:** When prompted "Do you want to enable Server-Side Rendering (SSR) and Static Site Generation (SSG)?", answer **No**.

3.  **Navigate into your new Angular app:**
    All subsequent frontend commands will be run from this directory.
    ```bash
    cd meme-app
    ```

4.  **Create initial frontend folder structure:**
    The Angular CLI has already created a great structure. We will add a few folders for organization as we build the features. For now, the base structure is complete.

Your project is now fully set up and ready for the next phase: implementing user authentication.
