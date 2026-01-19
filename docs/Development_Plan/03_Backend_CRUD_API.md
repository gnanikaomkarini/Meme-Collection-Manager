# Development Plan: 03 - Backend CRUD API for Memes

This guide details how to build the CRUD (Create, Read, Update, Delete) API for memes and how to protect these endpoints using the authentication system we built in the previous guide.

---

### **Step 1: Create the Authentication Middleware**

This middleware function will act as a gatekeeper for our protected routes. It will check for a valid JSON Web Token (JWT) in the request and deny access if one isn't found.

1.  **Create `auth.middleware.js`:**
    Inside `backend/middleware`, create a new file.

2.  **Implement the `protect` function:**
    *   It looks for the token in the `Authorization` header (e.g., `Bearer <token>`).
    *   It verifies the token's authenticity using your `JWT_SECRET`.
    *   It fetches the user associated with the token from the database.
    *   It attaches the user's information to the `req` object, making it available to any subsequent controller.

    ```javascript
    // backend/middleware/auth.middleware.js
    const jwt = require('jsonwebtoken');
    const User = require('../models/user.model');

    exports.protect = async (req, res, next) => {
      let token;

      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
      ) {
        try {
          // Get token from header
          token = req.headers.authorization.split(' ')[1];

          // Verify token
          const decoded = jwt.verify(token, process.env.JWT_SECRET);

          // Get user from the token's payload (ID)
          req.user = await User.findById(decoded.id).select('-password');

          next(); // Proceed to the next middleware/controller
        } catch (error) {
          console.error(error);
          res.status(401).json({ message: 'Not authorized, token failed' });
        }
      }

      if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
      }
    };
    ```

---

### **Step 2: Define the Meme Model**

This is the Mongoose schema for a meme. We will add a `user` field to associate each meme with the user who created it.

1.  **Open `meme.model.js`:**
    If you haven't created it yet, create `backend/models/meme.model.js`.

2.  **Define the Meme Schema:**
    The `user` field is a reference (`ref`) to a `User` document. This is how Mongoose creates relationships between data.

    ```javascript
    // backend/models/meme.model.js
    const mongoose = require('mongoose');

    const memeSchema = new mongoose.Schema({
      user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // Creates a relationship with the User model
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
      },
      likes: {
        type: Number,
        default: 0
      }
    }, {
      timestamps: true // Automatically adds createdAt and updatedAt fields
    });

    module.exports = mongoose.model('Meme', memeSchema);
    ```

---

### **Step 3: Create the Meme Controller**

This controller handles the logic for meme-related operations.

1.  **Create `meme.controller.js`:**
    Inside `backend/controllers`, create this file.

2.  **Add the CRUD functions:**
    *   Notice that in `createMe me`, we now get the user's ID from `req.user.id`. This is only possible because our `protect` middleware runs first and adds the `user` object to the request.
    *   In `updateMeme` and `deleteMeme`, we check if the meme's user ID matches the currently logged-in user's ID to ensure users can only modify their own memes.

    ```javascript
    // backend/controllers/meme.controller.js
    const Meme = require('../models/meme.model');

    // @desc    CREATE a new meme
    // @route   POST /api/memes
    exports.createMeme = async (req, res) => {
      try {
        const { caption, imageUrl, category } = req.body;
        const newMeme = new Meme({
          caption,
          imageUrl,
          category,
          user: req.user.id // Associate meme with the logged-in user
        });
        const savedMeme = await newMeme.save();
        res.status(201).json(savedMeme);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    };

    // @desc    READ all memes (publicly available)
    // @route   GET /api/memes
    exports.getMemes = async (req, res) => {
      try {
        const memes = await Meme.find().populate('user', 'username'); // Also fetch username of creator
        res.status(200).json(memes);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    };

    // @desc    UPDATE a meme
    // @route   PUT /api/memes/:id
    exports.updateMeme = async (req, res) => {
      try {
        const meme = await Meme.findById(req.params.id);

        if (!meme) {
          return res.status(404).json({ message: 'Meme not found' });
        }

        // Check if the meme belongs to the logged-in user
        if (meme.user.toString() !== req.user.id) {
          return res.status(401).json({ message: 'User not authorized' });
        }

        const updatedMeme = await Meme.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedMeme);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    };

    // @desc    DELETE a meme
    // @route   DELETE /api/memes/:id
    exports.deleteMeme = async (req, res) => {
      try {
        const meme = await Meme.findById(req.params.id);

        if (!meme) {
            return res.status(404).json({ message: 'Meme not found' });
        }

        if (meme.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await meme.remove();
        res.status(200).json({ message: 'Meme successfully deleted' });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    };
    ```

---

### **Step 4: Define and Protect the API Routes**

Here we define the endpoints and apply our `protect` middleware to the routes that require authentication.

1.  **Create `meme.routes.js`:**
    Inside `backend/routes`, create this file.

2.  **Define the routes:**
    Import the `protect` middleware. Place it as an argument before the controller function on any route you want to secure.

    ```javascript
    // backend/routes/meme.routes.js
    const express = require('express');
    const router = express.Router();
    const { createMeme, getMemes, updateMeme, deleteMeme } = require('../controllers/meme.controller');
    const { protect } = require('../middleware/auth.middleware');

    // Public route - anyone can see the memes
    router.get('/memes', getMemes);

    // Protected routes - only logged-in users can access
    router.post('/memes', protect, createMeme);
    router.put('/memes/:id', protect, updateMeme);
    router.delete('/memes/:id', protect, deleteMeme);

    module.exports = router;
    ```

---

### **Step 5: Wire up Meme Routes in `server.js`**

Finally, update your main server file to use these new routes.

1.  **Update `server.js`:**
    Uncomment or add the `memeRoutes` line.

    ```javascript
    // backend/server.js
    // ...

    // API Routes
    const authRoutes = require('./routes/auth.routes');
    const memeRoutes = require('./routes/meme.routes'); // Add this line

    app.use('/api/auth', authRoutes);
    app.use('/api', memeRoutes); // Use the meme routes

    // ... (app.listen)
    ```

Your backend API is now complete and secure. Public users can view memes, but only authenticated users can create, update, or delete them. The next step is to build the frontend components to interact with this API.
