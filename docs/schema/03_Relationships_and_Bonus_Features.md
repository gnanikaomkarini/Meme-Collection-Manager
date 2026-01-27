# Schema: 03 - Relationships & Bonus Feature Design

This document explains how the `User` and `Meme` models are connected and explores different schema design strategies for implementing the "Like" system, a key bonus feature.

---

### **1. Core Relationship: User-to-Meme**

The fundamental relationship in this application is the **one-to-many** connection between a user and their memes.

*   **One User has Many Memes.**
*   **One Meme belongs to exactly One User.**

This is implemented in the `meme.model.js` schema via the `user` field:

```javascript
// from meme.model.js
user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User', // This creates the link
  required: true,
  index: true
}
```

This "reference" approach is highly scalable and is the standard way to model one-to-many relationships in MongoDB. It keeps the documents small and manageable. When you need to get the user's information for a specific meme, you can use Mongoose's `.populate('user')` method.

---

### **2. Bonus Feature Design: The "Like" System**

The requirement is to allow users to "like" a meme, and a user can only like a specific meme once. There are two excellent ways to model this, each with its own trade-offs.

#### **Option A: Embedded Array (Simple & Pragmatic)**

This approach, suggested in the original feature document, involves embedding an array of user IDs directly within the `Meme` document.

**Schema Modification (`meme.model.js`):**

```javascript
// Add this to memeSchema
likedBy: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
}]
```

**How it Works:**
*   **To Like:** Add the user's `_id` to the `likedBy` array. Using `$addToSet` in MongoDB ensures no duplicates.
*   **To Unlike:** Remove the user's `_id` from the `likedBy` array using `$pull`.
*   **To Get Like Count:** Use the `.length` of the `likedBy` array.

**Pros:**
*   **Simple:** Very easy to implement and understand.
*   **Fast Reads:** All information about a meme (including its likes) is contained in a single document, making queries very fast.

**Cons:**
*   **Bounded Scalability:** MongoDB documents have a maximum size (16MB). While unlikely for this project, a meme with millions of likes could theoretically hit this limit. This is not a "modular" approach.

**Verdict:** **Excellent for this learning project.** It's pragmatic, efficient for the expected scale, and easy to reason about.

---

#### **Option B: Separate `Like` Collection (Modular & Scalable)**

This approach, often called a "join table" or "linking collection" in relational databases, is more modular and formally correct for a many-to-many relationship (many users can like many memes).

**New Schema File (`backend/models/like.model.js`):**

```javascript
const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  // The user who performed the like.
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // The meme that was liked.
  meme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meme',
    required: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false } // Only care when it was created.
});

// A compound unique index ensures a user can only like a meme ONCE.
// The database will reject any attempt to create a duplicate user-meme pair.
likeSchema.index({ user: 1, meme: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);
```

**How it Works:**
*   **To Like:** Create a new document in the `likes` collection: `{ user: userId, meme: memeId }`.
*   **To Unlike:** Find and delete the corresponding document from the `likes` collection.
*   **To Get Like Count:** Perform a `.countDocuments({ meme: memeId })` on the `likes` collection.

**Pros:**
*   **Infinitely Scalable:** The size of the `Meme` and `User` documents never grows. You can have trillions of likes.
*   **Highly Modular:** The concept of a "Like" is its own distinct entity in the database, which is a very clean and robust design.
*   **Rich Data:** You can store more information about the "like" itself, such as *when* it occurred (thanks to `timestamps`).

**Cons:**
*   **More Complex Queries:** Getting the like count requires a separate database query instead of just reading a property from the meme document.

**Verdict:** **The professional, "at-scale" solution.** For a learning project, implementing this would teach you a great deal about modeling many-to-many relationships, creating compound indexes, and performing more complex queries. It perfectly fulfills the "as modular as possible" requirement.
