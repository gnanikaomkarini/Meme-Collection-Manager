# Development Plan: 03 - Backend CRUD API, Validation, and Error Handling

This guide covers building the API for memes, adding a robust validation layer, securing it with cookie-based authentication, and implementing a centralized error handler.

---

### **Step 1: Create the Secure Authentication Middleware**

This middleware acts as a gatekeeper for protected routes by verifying the `accessToken` from `httpOnly` cookies.

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

This schema associates a meme with a user and automatically adds timestamps.

1.  **Create `meme.model.js` in `backend/models`:**
    ```javascript
    // backend/models/meme.model.js
    const mongoose = require('mongoose');
    const memeSchema = new mongoose.Schema({
      user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
      caption: { type: String, required: true },
      imageUrl: { type: String, required: true },
      category: { type: String, enum: ['Funny', 'Relatable', 'Dark', 'Wholesome'], required: true }
    }, { timestamps: true });
    module.exports = mongoose.model('Meme', memeSchema);
    ```

---

### **Step 3: Create the Meme Controller with Validation Checks**

The controller logic is updated to check for validation results *before* running any business logic.

1.  **Create `meme.controller.js` in `backend/controllers`:**
    ```javascript
    // backend/controllers/meme.controller.js
    const { validationResult } = require('express-validator');
    const Meme = require('../models/meme.model');

    exports.createMeme = async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      try {
        const { caption, imageUrl, category } = req.body;
        const meme = await Meme.create({ caption, imageUrl, category, user: req.user.id });
        res.status(201).json(meme);
      } catch (error) {
        next(error);
      }
    };
    
    // ... (getMemes, updateMeme, deleteMeme with similar validation checks where applicable) ...
    ```
    *Note: Remember to add the `validationResult` check to the `updateMeme` function as well.*

---

### **Step 4: Create the Input Validation Middleware**

This layer validates incoming data *before* it reaches your controllers.

1.  **Create `validation.js` in `backend/middleware`:**
    ```javascript
    // backend/middleware/validation.js
    const { body } = require('express-validator');

    exports.validateMeme = [
      body('caption')
        .not().isEmpty().withMessage('Caption is required.')
        .trim()
        .escape(),
      body('imageUrl')
        .isURL().withMessage('A valid Image URL is required.'),
      body('category')
        .isIn(['Funny', 'Relatable', 'Dark', 'Wholesome'])
        .withMessage('Invalid category specified.')
    ];
    ```

---

### **Step 5: Define and Protect the API Routes**

Apply both the `protect` middleware and the new `validateMeme` middleware to the routes.

1.  **Create `meme.routes.js` in `backend/routes`:**
    ```javascript
    // backend/routes/meme.routes.js
    const express = require('express');
    const router = express.Router();
    const { createMeme, getMemes, updateMeme, deleteMeme } = require('../controllers/meme.controller');
    const { protect } = require('../middleware/auth.middleware');
    const { validateMeme } = require('../middleware/validation');

    // Protect all routes in this file
    router.use(protect);

    router.route('/')
      .get(getMemes)
      .post(validateMeme, createMeme); // Add validation middleware here

    router.route('/:id')
      .put(validateMeme, updateMeme) // And here
      .delete(deleteMeme);

    module.exports = router;
    ```

---

### **Step 6: Implement Centralized Error Handling in `server.js`**

This provides consistent JSON error responses for any errors passed through `next()`.

1.  **Create `errorHandler.js` in `backend/middleware`:**
    ```javascript
    // backend/middleware/errorHandler.js
    const errorHandler = (err, req, res, next) => {
      const statusCode = res.statusCode >= 400 ? res.statusCode : 500;
      res.status(statusCode);
      res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
      });
    };
    module.exports = { errorHandler };
    ```
2.  **Update `server.js` to use the handler:**
    The error handler must be the **last piece of middleware**.
    ```javascript
    // backend/server.js
    // ... (imports and other app.use statements)
    const { errorHandler } = require('./middleware/errorHandler');

    // ... (CORS, cookieParser, etc.)

    app.use('/api/auth', require('./routes/auth.routes'));
    app.use('/api/memes', require('./routes/meme.routes'));

    // Use Central Error Handler
    app.use(errorHandler);

    // ... (app.listen) ...
    ```
The backend API now includes a robust validation layer, ensuring data integrity before it hits your business logic.