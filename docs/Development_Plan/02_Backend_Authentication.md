# Development Plan: 02 - Backend User Authentication

This guide covers how to implement user registration and login functionality for the backend using JSON Web Tokens (JWT). This ensures that only authenticated users can access, create, or modify memes.

---

### **Step 1: Create the User Model**

First, define the schema for a `User` in your database.

1.  **Create `user.model.js`:**
    Inside `backend/models`, create a new file named `user.model.js`.

2.  **Define the User Schema:**
    This schema will include a username and a password. We will add a special function (`pre-save`) that automatically hashes the password *before* it gets saved to the database. This is a critical security practice.

    ```javascript
    // backend/models/user.model.js
    const mongoose = require('mongoose');
    const bcrypt = require('bcryptjs');

    const userSchema = new mongoose.Schema({
      username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },
      password: {
        type: String,
        required: true,
      },
    });

    // Hash password before saving
    userSchema.pre('save', async function (next) {
      if (!this.isModified('password')) {
        return next();
      }
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    });

    // Method to compare entered password with hashed password
    userSchema.methods.comparePassword = async function (enteredPassword) {
      return await bcrypt.compare(enteredPassword, this.password);
    };

    module.exports = mongoose.model('User', userSchema);
    ```

---

### **Step 2: Create the Authentication Controller**

The controller will house the logic for registering a new user and logging in an existing user.

1.  **Create `auth.controller.js`:**
    Inside `backend/controllers`, create a new file.

2.  **Implement the `register` and `login` functions:**
    *   **`register`**: Creates a new user, hashes their password (handled by the model), and saves them to the database.
    *   **`login`**: Finds a user by their username, compares the provided password with the stored hash, and if they match, generates a JWT.

    ```javascript
    // backend/controllers/auth.controller.js
    const User = require('../models/user.model');
    const jwt = require('jsonwebtoken');

    // Function to generate a JWT
    const generateToken = (id) => {
      return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token expires in 30 days
      });
    };

    // @desc    Register a new user
    // @route   POST /api/auth/register
    exports.register = async (req, res) => {
      const { username, password } = req.body;

      try {
        const userExists = await User.findOne({ username });

        if (userExists) {
          return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
          username,
          password,
        });

        if (user) {
          res.status(201).json({
            _id: user._id,
            username: user.username,
            token: generateToken(user._id),
          });
        } else {
          res.status(400).json({ message: 'Invalid user data' });
        }
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    };

    // @desc    Authenticate user & get token
    // @route   POST /api/auth/login
    exports.login = async (req, res) => {
      const { username, password } = req.body;

      try {
        const user = await User.findOne({ username });

        if (user && (await user.comparePassword(password))) {
          res.json({
            _id: user._id,
            username: user.username,
            token: generateToken(user._id),
          });
        } else {
          res.status(401).json({ message: 'Invalid username or password' });
        }
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    };
    ```

3.  **Add `JWT_SECRET` to your `.env` file:**
    Open `backend/.env` and add a secret key for signing the JWT. This can be any random, long string.
    ```
    # backend/.env
    MONGO_URI=mongodb://localhost:27017/memesDB
    JWT_SECRET=yourlongrandomjwtsecretstring
    ```

---

### **Step 3: Create the Authentication Routes**

Define the API endpoints for registration and login.

1.  **Create `auth.routes.js`:**
    Inside `backend/routes`, create this new file.

2.  **Define the routes:**
    This file links the `/register` and `/login` paths to the controller functions you just wrote.

    ```javascript
    // backend/routes/auth.routes.js
    const express = require('express');
    const router = express.Router();
    const { register, login } = require('../controllers/auth.controller');

    router.post('/register', register);
    router.post('/login', login);

    module.exports = router;
    ```

---

### **Step 4: Wire up Auth Routes in `server.js`**

Finally, tell your main server file to use these new authentication routes.

1.  **Update `server.js`:**
    In `backend/server.js`, require the new auth routes and tell Express to use them.

    ```javascript
    // backend/server.js
    // ... (other require statements)

    const app = express();
    // ... (middleware)

    // ... (database connection)

    // API Routes
    const authRoutes = require('./routes/auth.routes');
    // const memeRoutes = require('./routes/meme.routes'); // Will be added in the next guide

    app.use('/api/auth', authRoutes);
    // app.use('/api', memeRoutes);

    // ... (app.listen)
    ```

Your backend now has a fully functional, token-based authentication system. You can use a tool like Postman to test the `/api/auth/register` and `/api/auth/login` endpoints. The next guide will show you how to create middleware to protect your meme-related API routes using the token generated on login.
