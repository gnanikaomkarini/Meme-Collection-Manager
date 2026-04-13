const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const path = require('path');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).json({ code: "UNAUTHORIZED", message: "User is not authenticated." });
    }
};

// POST /uploads - Upload image file
router.post('/', isAuthenticated, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                code: "NO_FILE",
                message: "No image file was uploaded"
            });
        }

        // Return the full image URL so it works from the frontend
        const imageUrl = `${process.env.BACKEND_URL}/uploads/${req.file.filename}`;
        
        res.status(201).json({
            imageUrl: imageUrl,
            filename: req.file.filename,
            size: req.file.size
        });
    } catch (error) {
        res.status(500).json({
            code: "UPLOAD_ERROR",
            message: error.message
        });
    }
});

module.exports = router;
