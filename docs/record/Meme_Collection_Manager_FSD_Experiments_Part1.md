# Meme Collection Manager - Full Stack Development Experiments (Part 1)

**Roll No:** 23WH1A0532  
**Date:** April 13, 2026  
**Project:** Meme Collection Manager - Meme Sharing and Management Platform

---

## Experiment 1: Set up the Node.js environment for the Meme Collection Manager backend and display a basic server response

### AIM
Set up the Node.js environment for the Meme Collection Manager backend and display a basic server response.

### Description
This experiment demonstrates the basic setup of a Node.js environment using the Meme Collection Manager backend application. The Express server is initialized and a simple root route is created to verify successful configuration. When the server runs, it returns a basic text response confirming that the backend environment is installed, connected, and ready for further development.

### Source Code

**File: `backend/server.js`**

```javascript
const dotenv = require('dotenv').config();
const express = require('express');
const passport = require('passport');
require('./config/passport');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const path = require('path');
const authRoutes = require('./routes/auth.routes');
const memeRoutes = require('./routes/meme.routes');
const uploadRoutes = require('./routes/upload.routes');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: process.env.DATABASE_NAME
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
}

connectDB();

const app = express();
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next(); 
});
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(session({
    secret: process.env.COOKIE_KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ 
        mongoUrl: process.env.MONGO_URI,
        dbName: process.env.DATABASE_NAME,
        touchAfter: 24 * 3600
    }),
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        httpOnly: true
    }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/memes', memeRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ code: "INTERNAL_SERVER_ERROR", message: err.message || "Something went wrong" });
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Gnanika's is running on port ${process.env.PORT || 3000}. Adios Amigos!`);
});
```

### OUTPUT
```
Gnanika's is running on port 3000. Adios Amigos!
MongoDB connected
```

Server is running successfully on port 3000 and MongoDB is connected.

---

## Experiment 2: Develop a Node.js based user login system for the Meme Collection Manager application

### AIM
Develop a Node.js based user login system for the Meme Collection Manager application using Google OAuth 2.0.

### Description
This experiment implements a secure Google OAuth 2.0 authentication system using Node.js, Express, and Passport.js. It validates user credentials through Google's authentication service, creates or retrieves user records from MongoDB, and generates session tokens after successful login. The Meme Collection Manager project uses this module for secure authentication of users. It shows how backend login logic with OAuth can be used to control access to protected application features.

### Source Code

**File: `backend/routes/auth.routes.js`**

```javascript
const express = require('express');
const passport = require('passport');
const router = express.Router();

//GET /auth/google
router.get('/google' , passport.authenticate('google', {
    scope: ['profile', 'email']
}));

//GET /auth/google/callback
router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: process.env.FRONTEND_URL + '/login'
}), (req, res) => {
    // Redirect to frontend callback route which will verify auth was successful
    res.redirect(process.env.FRONTEND_URL + '/auth/callback');
});

//GET /auth/current_user
router.get('/current_user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.status(401).json({ code: "UNAUTHORIZED", message: "User is not authenticated." });
    }
});

//GET /auth/logout
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.status(200).json({ message: "Logged out successfully" });
    });
});

module.exports = router;
```

**File: `backend/config/passport.js`**

```javascript
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.model');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
    proxy: true
}, async (accessToken, refreshToken, profile, done) => {
    try{
        const alreadyExists = await User.findOne({googleId : profile.id});
        if(alreadyExists){
            done(null, alreadyExists);
        } else {
            const newUser = await new User({
                googleId: profile.id,
                displayName: profile.displayName,
                email: profile.emails[0].value.toLowerCase(),
                profileImage: profile.photos[0].value
            }).save();
            done(null, newUser);
        }
    } catch(error){
        console.error("Error authenticating with Google:", error);
        done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});
```

**File: `backend/models/user.model.js`**

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true
    },
    displayName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    profileImage: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
```

### OUTPUT
```json
{
    "token": "Session established via Google OAuth",
    "user": {
        "_id": "507f1f77bcf86cd799439011",
        "googleId": "118234567890",
        "displayName": "John Doe",
        "email": "john@example.com",
        "profileImage": "https://lh3.googleusercontent.com/...",
        "createdAt": "2026-04-13T10:00:00.000Z"
    }
}
```

---

## Experiment 3: Write a Node.js program to insert and remove Meme Collection Manager project data using backend scripts

### AIM
Write a Node.js program to insert and remove Meme Collection Manager project data using backend scripts.

### Description
This experiment focuses on performing data operations similar to read, write, and delete actions in Node.js. In Meme Collection Manager, these actions are handled through MongoDB scripts rather than traditional file system operations. The seed and reset scripts insert sample records and remove existing records from the database. It demonstrates programmatic data management for application setup and testing.

### Source Code

**File: `backend/seed.js`**

```javascript
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');
const Meme = require('./models/meme.model');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: process.env.DATABASE_NAME
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
}

async function seed() {
    await connectDB();

    // Clear existing data
    await Meme.deleteMany({});
    await User.deleteMany({});

    // Create sample users
    const users = await User.create([
        {
            googleId: "118234567890",
            displayName: "Admin User",
            email: "admin@memes.com",
            profileImage: "https://lh3.googleusercontent.com/a/default-user"
        },
        {
            googleId: "118234567891",
            displayName: "John Memes",
            email: "john@memes.com",
            profileImage: "https://lh3.googleusercontent.com/a/default-user"
        }
    ]);

    // Create sample memes
    await Meme.create([
        {
            title: "When you understand MongoDB",
            caption: "Finally, it all makes sense!",
            imageUrl: "http://localhost:3000/uploads/meme1.webp",
            category: "funny",
            owner: users[0]._id,
            isPublic: true,
            likes: [users[1]._id],
            comments: [{
                author: users[1]._id,
                text: "This is hilarious!"
            }]
        },
        {
            title: "Debugging at 3 AM",
            caption: "Why is nothing working?",
            imageUrl: "http://localhost:3000/uploads/meme2.webp",
            category: "funny",
            owner: users[1]._id,
            isPublic: true,
            likes: [users[0]._id],
            comments: []
        }
    ]);

    console.log("Seed data inserted successfully");
    console.log("Sample users created");
    console.log("Sample memes created");
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
```

**File: `backend/resetData.js`**

```javascript
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');
const Meme = require('./models/meme.model');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: process.env.DATABASE_NAME
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
}

async function resetData() {
    await connectDB();
    
    await Meme.deleteMany({});
    await User.deleteMany({});
    
    console.log("All memes and users have been removed.");
    process.exit(0);
}

resetData().catch(err => {
    console.error(err);
    process.exit(1);
});
```

### OUTPUT
```
MongoDB connected
Seed data inserted successfully
Sample users created
Sample memes created
```

Reset output:
```
MongoDB connected
All memes and users have been removed.
```

---

## Experiment 4: Implement HTTP request and response handling for the Meme Collection Manager REST API

### AIM
Implement HTTP request and response handling for the Meme Collection Manager meme management API.

### Description
This experiment shows how Node.js handles HTTP requests and responses through backend routes. In Meme Collection Manager, meme operations are submitted through API endpoints created with Express. The server receives request data, validates it, processes it, and returns a JSON response. It highlights the request-response cycle used in modern web application backends.

### Source Code

**File: `backend/routes/meme.routes.js`**

```javascript
const express = require('express');
const router = express.Router();
const Meme = require('../models/meme.model');

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).json({ code: "UNAUTHORIZED", message: "User is not authenticated." });
    }
};

// GET /api/memes - Get all public memes
router.get('/', async (req, res) => {
    try {
        const memes = await Meme.find({ isPublic: true })
            .populate('owner', 'displayName profileImage email')
            .populate('likes', 'displayName')
            .populate('comments.author', 'displayName profileImage')
            .sort({ createdAt: -1 });
        
        res.status(200).json(memes);
    } catch (error) {
        res.status(500).json({ code: "SERVER_ERROR", message: error.message });
    }
});

// POST /api/memes - Create meme
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { title, caption, imageUrl, category, isPublic } = req.body;

        if (!title || !caption || !imageUrl) {
            return res.status(400).json({ code: "MISSING_FIELDS", message: "Title, caption, and image are required" });
        }

        const meme = await Meme.create({
            title: title.trim(),
            caption: caption.trim(),
            imageUrl,
            category: category || 'funny',
            owner: req.user._id,
            isPublic: isPublic !== false
        });

        const populatedMeme = await Meme.findById(meme._id)
            .populate('owner', 'displayName profileImage email');

        res.status(201).json(populatedMeme);
    } catch (error) {
        res.status(400).json({ code: "CREATE_ERROR", message: error.message });
    }
});

// GET /api/memes/:id - Get meme by ID
router.get('/:id', async (req, res) => {
    try {
        const meme = await Meme.findById(req.params.id)
            .populate('owner', 'displayName profileImage email')
            .populate('likes', 'displayName profileImage')
            .populate('comments.author', 'displayName profileImage');
        
        if (!meme) {
            return res.status(404).json({ code: "NOT_FOUND", message: "Meme not found" });
        }
        
        res.status(200).json(meme);
    } catch (error) {
        res.status(500).json({ code: "SERVER_ERROR", message: error.message });
    }
});

// PUT /api/memes/:id - Update meme
router.put('/:id', isAuthenticated, async (req, res) => {
    try {
        const meme = await Meme.findById(req.params.id);
        
        if (!meme) {
            return res.status(404).json({ code: "NOT_FOUND", message: "Meme not found" });
        }

        if (meme.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ code: "FORBIDDEN", message: "Not authorized to update this meme" });
        }

        const { title, caption, imageUrl, category, isPublic } = req.body;
        
        if (title) meme.title = title.trim();
        if (caption) meme.caption = caption.trim();
        if (imageUrl) meme.imageUrl = imageUrl;
        if (category) meme.category = category;
        if (isPublic !== undefined) meme.isPublic = isPublic;

        await meme.save();

        const updated = await Meme.findById(meme._id)
            .populate('owner', 'displayName profileImage email');

        res.status(200).json(updated);
    } catch (error) {
        res.status(400).json({ code: "UPDATE_ERROR", message: error.message });
    }
});

// DELETE /api/memes/:id - Delete meme
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const meme = await Meme.findById(req.params.id);
        
        if (!meme) {
            return res.status(404).json({ code: "NOT_FOUND", message: "Meme not found" });
        }

        if (meme.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ code: "FORBIDDEN", message: "Not authorized to delete this meme" });
        }

        await Meme.findByIdAndDelete(req.params.id);
        
        res.status(200).json({ code: "SUCCESS", message: "Meme deleted successfully" });
    } catch (error) {
        res.status(500).json({ code: "SERVER_ERROR", message: error.message });
    }
});

module.exports = router;
```

### OUTPUT
Creating a meme (POST /api/memes):
```json
{
    "_id": "507f1f77bcf86cd799439013",
    "title": "When you finally understand the code",
    "caption": "After hours of debugging",
    "imageUrl": "http://localhost:3000/uploads/image-1776086308513-69dce8e3.webp",
    "category": "funny",
    "owner": {
        "_id": "507f1f77bcf86cd799439011",
        "displayName": "John Doe",
        "email": "john@example.com",
        "profileImage": "https://lh3.googleusercontent.com/..."
    },
    "likes": [],
    "comments": [],
    "isPublic": true,
    "createdAt": "2026-04-13T10:00:00.000Z",
    "updatedAt": "2026-04-13T10:00:00.000Z"
}
```

Getting all memes (GET /api/memes):
```json
[
    {
        "_id": "507f1f77bcf86cd799439013",
        "title": "When you finally understand the code",
        "caption": "After hours of debugging",
        "imageUrl": "http://localhost:3000/uploads/image-1776086308513-69dce8e3.webp",
        "category": "funny",
        "owner": {
            "_id": "507f1f77bcf86cd799439011",
            "displayName": "John Doe"
        },
        "likes": [],
        "comments": [],
        "isPublic": true,
        "createdAt": "2026-04-13T10:00:00.000Z"
    }
]
```

---

## Experiment 5: Connect the Meme Collection Manager project to MongoDB and define the required database collections

### AIM
Connect the Meme Collection Manager project to MongoDB and define the required database collections and schemas.

### Description
This experiment demonstrates the use of MongoDB databases and collections in the Meme Collection Manager project. The application connects to MongoDB and defines schemas for users and memes using Mongoose. These schemas represent structured collections that store authentication and meme information. It explains how database connection and collection design support the project's data layer.

### Source Code

**File: `backend/config/db.js`**

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: process.env.DATABASE_NAME
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('DB Connection Failed:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
```

**File: `backend/models/user.model.js`**

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true
    },
    displayName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    profileImage: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
```

**File: `backend/models/meme.model.js`**

```javascript
const mongoose = require('mongoose');

const memeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    caption: {
        type: String,
        required: true,
        trim: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['funny', 'political', 'reaction', 'motivational', 'other'],
        default: 'funny'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        text: {
            type: String,
            required: true,
            trim: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    isPublic: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

memeSchema.index({ owner: 1, createdAt: -1 });
memeSchema.index({ isPublic: 1, createdAt: -1 });

module.exports = mongoose.model('Meme', memeSchema);
```

### OUTPUT
```
MongoDB connected
```

Database collections created:
- users (stores user information from Google OAuth)
- memes (stores meme posts with title, caption, image, likes, comments)
- sessions (manages user sessions via express-session)

Schema design includes:
- User collection with googleId, displayName, email, profileImage
- Meme collection with owner reference, likes array, comments array
- Proper indexing for efficient queries

---

**End of Part 1**

*Continue to Part 2 for Experiments 6-10*
