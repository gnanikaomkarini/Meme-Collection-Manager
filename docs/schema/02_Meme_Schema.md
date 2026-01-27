# Schema: 02 - The Meme Model

This document defines the schema for the core `memes` collection. Each document represents a single meme uploaded by a user.

---

### **Mongoose Schema Definition**

Filename: `backend/models/meme.model.js`

```javascript
const mongoose = require('mongoose');
const { MEME_CATEGORIES } = require('../config/constants');

const memeSchema = new mongoose.Schema({
  // A direct reference to the user who owns this meme. This is the cornerstone
  // of the application's multi-user functionality and security model.
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Establishes a relationship with the User model.
    required: true,
    index: true // Indexed for fast retrieval of all memes for a specific user.
  },

  // The user-provided text or title for the meme.
  caption: {
    type: String,
    required: true,
    trim: true
  },

  // The URL where the meme image is hosted.
  // Note: The pros and cons of this approach (linking vs. hosting) are discussed
  // in the feature critiques. For a prototype, linking is acceptable.
  imageUrl: {
    type: String,
    required: true
  },

  // The category of the meme, constrained to a predefined list to ensure
  // data consistency and enable reliable filtering.
  category: {
    type: String,
    required: true,
    enum: {
      values: MEME_CATEGORIES,
      message: '{VALUE} is not a supported category.'
    }
  }
}, {
  // Automatically adds `createdAt` and `updatedAt` timestamps.
  // Useful for sorting memes by "newest" or "recently updated."
  timestamps: true
});

// To support the "Search" bonus feature, a text index is created on the
// `caption` field. This allows for efficient, case-insensitive text searches.
memeSchema.index({ caption: 'text' });

module.exports = mongoose.model('Meme', memeSchema);
```

### **Schema Design Notes:**

*   **Ownership and Relationships:** The `user` field is the most important part of this schema. By using `type: ObjectId` and `ref: 'User'`, we create a formal link to a document in the `users` collection. This allows us to easily populate user information when needed (e.g., showing the creator's name next to a meme) and is essential for the authorization logic (i.e., "can this user edit *this* meme?").
*   **Data Integrity:** Using an `enum` for the `category` field acts as a database-level validation rule. It guarantees that no meme can be saved with a category that isn't in the predefined list from `constants.js`.
*   **Performance and Indexing:**
    *   An index is placed on the `user` field. This is critical for performance, as the primary "read" operation of the application will be "get all memes for the logged-in user." This index makes that query extremely fast.
    *   A `text` index is placed on `caption`. This is not for regular lookups but is a special type of index optimized for MongoDB's `$text` search operator, which is the ideal way to implement the search bar functionality.
