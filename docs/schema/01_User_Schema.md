# Schema: 01 - The User Model

This document defines the schema for the `users` collection. Since authentication is handled entirely by Google OAuth, this schema is simplified to store profile information provided by Google, rather than sensitive data like passwords.

---

### **Mongoose Schema Definition**

Filename: `backend/models/user.model.js`

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // The unique ID provided by Google for the user. This is the primary
  // identifier for linking a user to their authentication provider.
  googleId: {
    type: String,
    required: true,
    unique: true,
    index: true // Indexed for fast lookups.
  },

  // The user's full display name from their Google account.
  displayName: {
    type: String,
    required: true
  },

  // The user's primary email address from their Google account.
  // Marked as unique to prevent multiple application profiles being
  // associated with the same email, even if different Google accounts were used.
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, // Store emails in a consistent format.
    trim: true
  },

  // The URL for the user's profile picture from their Google account.
  profileImage: {
    type: String
  }
}, {
  // Automatically adds `createdAt` and `updatedAt` fields to the document.
  // This is a best practice for tracking when records are created and modified.
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
```

### **Schema Design Notes:**

*   **No Passwords:** The most significant feature of this schema is the complete absence of a `password` field. This is a direct benefit of delegating authentication, improving the application's security posture by not storing sensitive credentials.
*   **Indexing:** An index is explicitly placed on `googleId`. Because Passport.js will use this ID to find a user on every login (`findOne({ googleId: ... })`), an index is critical for fast and efficient authentication lookups.
*   **Data Consistency:** The `email` field includes `lowercase: true` and `trim: true`. This ensures that email addresses are stored in a consistent, standardized format, which is crucial for enforcing uniqueness and preventing subtle bugs.
