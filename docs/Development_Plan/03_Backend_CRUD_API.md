# Development Plan: 03 - Backend CRUD API with Simplified Auth

This guide covers building the API for memes, protected by our new, simpler Google OAuth session middleware.

---

### **Step 1: Create the Authentication Middleware**

With Passport.js managing the session, our route protection middleware becomes trivial. It just needs to check for the existence of `req.user`, which Passport automatically populates from the session cookie.

1.  **Create `auth.middleware.js` in `backend/middleware`:**
    ```javascript
    // backend/middleware/auth.middleware.js
    module.exports = {
      ensureAuth: function (req, res, next) {
        if (req.isAuthenticated()) { // isAuthenticated() is a Passport.js function
          return next();
        } else {
          res.status(401).json({ message: 'Not Authorized' });
        }
      }
    };
    ```

---

### **Step 2: Define Constants**

(This step remains unchanged).

1.  **Create `constants.js` in `backend/config`:**
    ```javascript
    // backend/config/constants.js
    exports.MEME_CATEGORIES = ['Funny', 'Relatable', 'Dark', 'Wholesome', 'OC'];
    ```

---

### **Step 3: Create the Meme Model**

(This step remains unchanged).

1.  **Create `meme.model.js` in `backend/models`:**
    ```javascript
    // backend/models/meme.model.js
    const mongoose = require('mongoose');
    const { MEME_CATEGORIES } = require('../config/constants');

    const memeSchema = new mongoose.Schema({
      user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
      caption: { type: String, required: true },
      imageUrl: { type: String, required: true },
      category: {
        type: String,
        enum: MEME_CATEGORIES,
        required: true
      }
    }, { timestamps: true });

    module.exports = mongoose.model('Meme', memeSchema);
    ```

---

### **Step 4: Create the Meme Controller and Routes**

The controller logic remains the same, but the routes will now use our new `ensureAuth` middleware. The `express-validator` middleware is removed for simplicity. Basic validation can be handled inside the controller if needed.

1.  **Create `meme.controller.js` in `backend/controllers`:** (Code remains the same as previous guides, focusing on mongoose queries).

2.  **Create `meme.routes.js` in `backend/routes`:**
    This file now applies the `ensureAuth` middleware to all routes.
    ```javascript
    // backend/routes/meme.routes.js
    const express = require('express');
    const router = express.Router();
    const { getMemes, createMeme, getMemeById, updateMeme, deleteMeme } = require('../controllers/meme.controller');
    const { ensureAuth } = require('../middleware/auth.middleware');

    // Apply the 'ensureAuth' middleware to all routes in this file
    router.use(ensureAuth);

    router.route('/')
      .get(getMemes)
      .post(createMeme);

    router.route('/:id')
      .get(getMemeById)
      .put(updateMeme)
      .delete(deleteMeme);

    module.exports = router;
    ```

---

### **Step 5: Implement Centralized Error Handling**

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

    // ... (CORS, passport, sessions, etc.)

    app.use('/api/auth', require('./routes/auth.routes'));
    app.use('/api/memes', require('./routes/meme.routes'));

    // Use Central Error Handler
    app.use(errorHandler);

    // ... (app.listen) ...
    ```

With these changes, the CRUD API is now correctly protected by the Passport.js session, and the code is simplified by the removal of the now-unnecessary validation middleware.
