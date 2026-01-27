# Development Plan: 02 - Backend Authentication (Google OAuth)

This guide details the implementation of a simple and secure authentication system using Passport.js and the Google OAuth 2.0 strategy. This completely replaces the manual, cookie-based JWT system.

---

### **Step 1: Create the Google-Ready User Model**

The User model is simplified, as we no longer store passwords.

1.  **Modify `user.model.js` in `backend/models`:**

    ```javascript
    // backend/models/user.model.js
    const mongoose = require('mongoose');

    const userSchema = new mongoose.Schema({
      googleId: { type: String, required: true, unique: true },
      displayName: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      profileImage: { type: String }
    });

    module.exports = mongoose.model('User', userSchema);
    ```

---

### **Step 2: Configure the Passport Strategy**

This is the core of our authentication logic. It tells Passport how to use Google for authentication and how to interact with our user database.

1.  **Create `passport.js` in `backend/config`:**

    ```javascript
    // backend/config/passport.js
    const passport = require('passport');
    const GoogleStrategy = require('passport-google-oauth20').Strategy;
    const mongoose = require('mongoose');
    const User = require('../models/user.model');

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback', // The full URL will be prefixed by the proxy
        proxy: true
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // 1. Check if user already exists
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // If they exist, pass them to the next step
            return done(null, user);
          } else {
            // If not, create a new user in our database
            const newUser = {
              googleId: profile.id,
              displayName: profile.displayName,
              email: profile.emails[0].value,
              profileImage: profile.photos[0].value
            };
            user = await User.create(newUser);
            return done(null, user);
          }
        } catch (err) {
          return done(err, null);
        }
      }
    ));

    // Store the user's ID in the session cookie
    passport.serializeUser((user, done) => {
      done(null, user.id);
    });

    // Retrieve the user from the session cookie
    passport.deserializeUser(async (id, done) => {
      try {
        const user = await User.findById(id);
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    });
    ```

---

### **Step 3: Define the Authentication Routes**

The routes are now much simpler, delegating all the complex logic to Passport.

1.  **Create `auth.routes.js` in `backend/routes`:**

    ```javascript
    // backend/routes/auth.routes.js
    const express = require('express');
    const router = express.Router();
    const passport = require('passport');

    // @desc    Auth with Google
    // @route   GET /api/auth/google
    router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

    // @desc    Google auth callback
    // @route   GET /api/auth/google/callback
    router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
      (req, res) => {
        // Successful authentication, redirect to the frontend app.
        res.redirect('http://localhost:4200/memes');
      }
    );

    // @desc    Get current logged in user
    // @route   GET /api/auth/current_user
    router.get('/current_user', (req, res) => {
      res.send(req.user); // req.user is populated by Passport if a session exists
    });

    // @desc    Logout user
    // @route   GET /api/auth/logout
    router.get('/logout', (req, res) => {
      req.logout(); // This function is attached by Passport
      res.redirect('http://localhost:4200/');
    });

    module.exports = router;
    ```

---

### **Step 4: Update `server.js` to Initialize Passport**

Integrate Passport and the session middleware into your Express application.

1.  **Modify `server.js` in the `backend` root:**

    ```javascript
    // backend/server.js
    require('dotenv').config();
    const express = require('express');
    const cors = require('cors');
    const passport = require('passport');
    const cookieSession = require('cookie-session');

    // Passport config (ensure this is required so the strategy is registered)
    require('./config/passport');

    const app = express();

    app.use(cors({
        credentials: true,
        origin: 'http://localhost:4200'
    }));

    app.use(express.json());

    // Session Middleware
    app.use(
      cookieSession({
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        keys: [process.env.COOKIE_KEY]
      })
    );

    // Passport Middleware
    app.use(passport.initialize());
    app.use(passport.session());

    // ... (Database connection logic) ...

    // API Routes
    app.use('/api/auth', require('./routes/auth.routes'));
    // app.use('/api/memes', require('./routes/meme.routes'));
    
    // ... (Error Handler) ...

    const PORT = process.env.PORT || 3000;
    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    }
    
    module.exports = app;
    ```

The backend is now fully configured for Google OAuth. The complexity of password hashing, token generation, and refresh logic has been replaced by a standard, secure, and maintainable Passport.js implementation.
