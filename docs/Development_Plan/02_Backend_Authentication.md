# Development Plan: 02 - Backend Authentication (Secure Cookies)

This guide covers the implementation of a secure user authentication system for the backend. It uses `httpOnly` cookies to store tokens, which is a critical security measure to protect against XSS attacks.

---

### **Step 1: Create the User Model**

This model defines the `User` schema. The logic for hashing the password before saving remains a best practice and does not need to be changed.

1.  **Create `user.model.js` in `backend/models`:**

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

### **Step 2: Create the Secure Authentication Controller**

This controller is completely rewritten to handle a secure cookie-based session.

1.  **Create `auth.controller.js` in `backend/controllers`:**

    ```javascript
    // backend/controllers/auth.controller.js
    const User = require('../models/user.model');
    const jwt = require('jsonwebtoken');

    // Reusable function to generate and set cookies
    const generateAndSetTokens = (res, userId) => {
      const accessToken = jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
      const refreshToken = jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

      // Set cookies on the response
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
    };

    exports.register = async (req, res, next) => {
      const { username, password } = req.body;
      try {
        const user = await User.create({ username, password });
        generateAndSetTokens(res, user._id);
        res.status(201).json({ _id: user._id, username: user.username });
      } catch (error) {
        next(error); // Pass error to central handler
      }
    };

    exports.login = async (req, res, next) => {
      const { username, password } = req.body;
      try {
        const user = await User.findOne({ username });
        if (user && (await user.comparePassword(password))) {
          generateAndSetTokens(res, user._id);
          res.status(200).json({ _id: user._id, username: user.username });
        } else {
          res.status(401);
          throw new Error('Invalid username or password');
        }
      } catch (error) {
        next(error);
      }
    };

    exports.refreshToken = (req, res, next) => {
        const token = req.cookies.refreshToken;
        if (!token) {
            res.status(401);
            return next(new Error('Not authenticated, no refresh token'));
        }
        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                res.status(403);
                return next(new Error('Forbidden, invalid refresh token'));
            }
            generateAndSetTokens(res, decoded.id);
            res.status(200).json({ message: 'Tokens refreshed successfully' });
        });
    };

    exports.logout = (req, res) => {
      res.cookie('accessToken', '', { httpOnly: true, expires: new Date(0) });
      res.cookie('refreshToken', '', { httpOnly: true, expires: new Date(0) });
      res.status(200).json({ message: 'Logged out successfully' });
    };
    ```

---

### **Step 3: Define the Authentication Routes**

Update the routes to include the new `refreshToken` and `logout` endpoints.

1.  **Create `auth.routes.js` in `backend/routes`:**

    ```javascript
    // backend/routes/auth.routes.js
    const express = require('express');
    const router = express.Router();
    const { register, login, refreshToken, logout } = require('../controllers/auth.controller');

    router.post('/register', register);
    router.post('/login', login);
    router.post('/refresh-token', refreshToken);
    router.post('/logout', logout);

    module.exports = router;
    ```

---

### **Step 4: Update `server.js` to Use Cookies and CORS**

For `httpOnly` cookies to work correctly with a separate frontend, you must enable `cookieParser` and properly configure CORS (Cross-Origin Resource Sharing).

1.  **Modify `server.js` in the `backend` root:**

    ```javascript
    // backend/server.js
    require('dotenv').config();
    const express = require('express');
    const cors = require('cors');
    const cookieParser = require('cookie-parser'); // Import cookie-parser

    const app = express();

    // CORS configuration for credentials
    app.use(cors({
      credentials: true,
      origin: 'http://localhost:4200' // Your Angular app's origin
    }));

    app.use(cookieParser()); // Use cookie-parser middleware
    app.use(express.json());

    // ... (Database connection logic) ...

    // API Routes (will be wired up in the next guides)
    app.use('/api/auth', require('./routes/auth.routes'));
    // app.use('/api/memes', require('./routes/meme.routes'));

    // ... (Central Error Handler - will be added later) ...
    
    // ... (app.listen) ...
    ```

Your backend is now equipped with a secure, cookie-based authentication system. It no longer sends tokens in the response body, relying instead on `httpOnly` cookies to manage the session, which is a significant security improvement.
