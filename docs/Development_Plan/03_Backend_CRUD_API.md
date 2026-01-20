# Development Plan: 03 - Backend CRUD API and Error Handling

This guide covers building the API for memes, securing it with our new cookie-based authentication middleware, and implementing a centralized error handler.

---

### **Step 1: Create the Secure Authentication Middleware**

This middleware function acts as a gatekeeper for protected routes. It is rewritten to get the token from `httpOnly` cookies.

1.  **Create `auth.middleware.js` in `backend/middleware`:**

    ```javascript
    // backend/middleware/auth.middleware.js
    const jwt = require('jsonwebtoken');
    const User = require('../models/user.model');

    exports.protect = async (req, res, next) => {
      const token = req.cookies.accessToken;

      if (!token) {
        res.status(401);
        return next(new Error('Not authorized, no token'));
      }

      try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        next();
      } catch (error) {
        res.status(401);
        next(new Error('Not authorized, token failed'));
      }
    };
    ```

---

### **Step 2: Define the Meme Model**

This schema correctly associates a meme with a user and automatically adds timestamps.

1.  **Create `meme.model.js` in `backend/models`:**

    ```javascript
    // backend/models/meme.model.js
    const mongoose = require('mongoose');

    const memeSchema = new mongoose.Schema({
      user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
      },
      caption: {
        type: String,
        required: true,
      },
      imageUrl: {
        type: String,
        required: true,
      },
      category: {
        type: String,
        enum: ['Funny', 'Relatable', 'Dark', 'Wholesome'],
        required: true
      }
    }, {
      timestamps: true
    });

    module.exports = mongoose.model('Meme', memeSchema);
    ```

---

### **Step 3: Create the Meme Controller with Proper Error Handling**

The controller logic is updated to pass any errors to the central error handler using `next(error)`.

1.  **Create `meme.controller.js` in `backend/controllers`:**

    ```javascript
    // backend/controllers/meme.controller.js
    const Meme = require('../models/meme.model');

    // CREATE a new meme
    exports.createMeme = async (req, res, next) => {
      try {
        const { caption, imageUrl, category } = req.body;
        const meme = await Meme.create({ caption, imageUrl, category, user: req.user.id });
        res.status(201).json(meme);
      } catch (error) {
        next(error);
      }
    };

    // READ all memes
    exports.getMemes = async (req, res, next) => {
      try {
        // Example: To get memes only for the logged-in user
        const memes = await Meme.find({ user: req.user.id }).populate('user', 'username');
        res.status(200).json(memes);
      } catch (error) {
        next(error);
      }
    };

    // UPDATE a meme
    exports.updateMeme = async (req, res, next) => {
      try {
        const meme = await Meme.findById(req.params.id);
        if (!meme) {
          res.status(404);
          throw new Error('Meme not found');
        }
        if (meme.user.toString() !== req.user.id) {
          res.status(401);
          throw new Error('User not authorized');
        }
        const updatedMeme = await Meme.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedMeme);
      } catch (error) {
        next(error);
      }
    };

    // DELETE a meme
    exports.deleteMeme = async (req, res, next) => {
      try {
        const meme = await Meme.findById(req.params.id);
        if (!meme) {
          res.status(404);
          throw new Error('Meme not found');
        }
        if (meme.user.toString() !== req.user.id) {
          res.status(401);
          throw new Error('User not authorized');
        }
        await meme.remove();
        res.status(200).json({ message: 'Meme successfully deleted' });
      } catch (error) {
        next(error);
      }
    };
    ```

---

### **Step 4: Define and Protect the API Routes**

Apply the `protect` middleware to all meme routes to ensure only authenticated users can access them.

1.  **Create `meme.routes.js` in `backend/routes`:**

    ```javascript
    // backend/routes/meme.routes.js
    const express = require('express');
    const router = express.Router();
    const { createMeme, getMemes, updateMeme, deleteMeme } = require('../controllers/meme.controller');
    const { protect } = require('../middleware/auth.middleware');

    // Protect all routes in this file
    router.use(protect);

    router.route('/')
      .get(getMemes)
      .post(createMeme);

    router.route('/:id')
      .put(updateMeme)
      .delete(deleteMeme);

    module.exports = router;
    ```

---

### **Step 5: Implement Centralized Error Handling in `server.js`**

A custom error handler provides consistent JSON error responses, preventing HTML error pages and raw stack traces from being sent to the client in production.

1.  **Create `errorHandler.js` in `backend/middleware`:**
    ```javascript
    // backend/middleware/errorHandler.js
    const errorHandler = (err, req, res, next) => {
      const statusCode = res.statusCode ? res.statusCode : 500;
      res.status(statusCode);
      res.json({
        message: err.message,
        // Show stack trace only in development environment
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
      });
    };

    module.exports = { errorHandler };
    ```
2.  **Update `server.js` to use the handler:**
    The error handler must be the **last piece of middleware** added to the app.

    ```javascript
    // backend/server.js
    // ... (imports and other app.use statements)
    const { errorHandler } = require('./middleware/errorHandler');

    // ... (CORS, cookieParser, etc.)

    // API Routes
    app.use('/api/auth', require('./routes/auth.routes'));
    app.use('/api/memes', require('./routes/meme.routes'));

    // Use Central Error Handler
    app.use(errorHandler);

    // ... (app.listen) ...
    ```
The backend API is now complete and secure. All meme-related operations require authentication, and all errors are handled cleanly and consistently.