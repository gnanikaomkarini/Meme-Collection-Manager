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
app.use(cors(
    {
        origin: process.env.FRONTEND_URL,
        credentials: true
    }
));
app.use(session({
    secret: process.env.COOKIE_KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ 
        mongoUrl: process.env.MONGO_URI,
        dbName: process.env.DATABASE_NAME,
        touchAfter: 24 * 3600 // lazy session update every 24 hours
    }),
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === 'production', // only send over HTTPS in production
        sameSite: 'lax', // allows OAuth redirect to work
        httpOnly: true
    }
}));
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from uploads directory
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