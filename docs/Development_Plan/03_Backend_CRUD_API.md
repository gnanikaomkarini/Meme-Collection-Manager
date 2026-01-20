# Development Plan: 03 - Backend CRUD API, Validation, and DRY Principles

This guide covers building the API for memes, adding a validation layer, and refactoring to follow the Don't Repeat Yourself (DRY) principle by using shared constants.

---

### **Step 1 & 2: Auth Middleware and Meme Model**

(Steps 1 and 2 for creating `auth.middleware.js` and the basic `meme.model.js` remain the same as the previous version of this guide, but we will modify the Meme Model in the next step to use a constant).

---

### **Step 3: Create a Single Source of Truth with Constants**

To avoid repeating the list of meme categories in our code (in the model and validator), we will define it once in a constants file. This makes the code more maintainable.

1.  **Create `constants.js` in `backend/config`:**
    ```javascript
    // backend/config/constants.js
    exports.MEME_CATEGORIES = ['Funny', 'Relatable', 'Dark', 'Wholesome'];
    ```

2.  **Update the Meme Model to use the constant:**
    Now, modify `backend/models/meme.model.js` to import and use this array.
    ```javascript
    // backend/models/meme.model.js
    const mongoose = require('mongoose');
    const { MEME_CATEGORIES } = require('../config/constants'); // Import the constant

    const memeSchema = new mongoose.Schema({
      user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
      caption: { type: String, required: true },
      imageUrl: { type: String, required: true },
      category: {
        type: String,
        enum: MEME_CATEGORIES, // Use the constant here
        required: true
      }
    }, { timestamps: true });

    module.exports = mongoose.model('Meme', memeSchema);
    ```

---

### **Step 4: Create the Input Validation Middleware**

This middleware will now also use the shared constant.

1.  **Create `validation.js` in `backend/middleware`:**
    ```javascript
    // backend/middleware/validation.js
    const { body } = require('express-validator');
    const { MEME_CATEGORIES } = require('../config/constants'); // Import the constant

    exports.validateMeme = [
      body('caption').not().isEmpty().withMessage('Caption is required.').trim().escape(),
      body('imageUrl').isURL().withMessage('A valid Image URL is required.'),
      body('category')
        .isIn(MEME_CATEGORIES) // Use the constant here
        .withMessage('Invalid category specified.')
    ];
    ```

---

### **Step 5: Create the Meme Controller**

(The `meme.controller.js` code remains the same as the previous version of this guide, with its `validationResult` checks).

---

### **Step 6: Define and Protect the API Routes**

(The `meme.routes.js` code remains the same, applying the `protect` and `validateMeme` middleware).

---

### **Step 7: Implement Centralized Error Handling**

(The `errorHandler.js` and the final `server.js` setup remain the same as the previous version of this guide).

By abstracting the categories list into a single constant, the application is now more robust and easier to update. If you need to add a new category, you only have to change it in one place.
