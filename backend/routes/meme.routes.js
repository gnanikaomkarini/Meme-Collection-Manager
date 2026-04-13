const express = require('express');
const router = express.Router();
const Meme = require('../models/meme.model');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).json({ code: "UNAUTHORIZED", message: "User is not authenticated." });
    }
};

// POST /memes - Create a new meme
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { title, caption, imageUrl, category, isPublic } = req.body;

        // Validate required fields
        if (!title || !caption || !imageUrl) {
            return res.status(400).json({
                code: "VALIDATION_ERROR",
                message: "title, caption, and imageUrl are required"
            });
        }

        const meme = new Meme({
            title,
            caption,
            imageUrl,
            category: category || 'funny',
            isPublic: isPublic !== false,
            owner: req.user._id
        });

        await meme.save();
        res.status(201).json(meme);
    } catch (error) {
        res.status(500).json({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
});

// GET /memes - List all public memes (paginated)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalItems = await Meme.countDocuments({ isPublic: true });
        const memes = await Meme.find({ isPublic: true })
            .populate('owner', 'displayName profileImage email')
            .populate('likes', 'displayName')
            .populate('comments.author', 'displayName profileImage')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            data: memes,
            pagination: {
                totalItems,
                currentPage: page,
                pageSize: limit,
                totalPages: Math.ceil(totalItems / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
});

// GET /memes/my-memes - List user's own memes
router.get('/my-memes', isAuthenticated, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalItems = await Meme.countDocuments({ owner: req.user._id });
        const memes = await Meme.find({ owner: req.user._id })
            .populate('owner', 'displayName profileImage email')
            .populate('likes', 'displayName')
            .populate('comments.author', 'displayName profileImage')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            data: memes,
            pagination: {
                totalItems,
                currentPage: page,
                pageSize: limit,
                totalPages: Math.ceil(totalItems / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
});

// GET /memes/:id - Get a specific meme
router.get('/:id', async (req, res) => {
    try {
        const meme = await Meme.findById(req.params.id)
            .populate('owner', 'displayName profileImage email')
            .populate('likes', 'displayName profileImage')
            .populate('comments.author', 'displayName profileImage');

        if (!meme) {
            return res.status(404).json({ code: "NOT_FOUND", message: "Meme not found" });
        }

        // Check authorization: if not public and not owner, return 404 (not 403)
        if (!meme.isPublic && (!req.isAuthenticated() || req.user._id.toString() !== meme.owner._id.toString())) {
            return res.status(404).json({ code: "NOT_FOUND", message: "Meme not found" });
        }

        res.json(meme);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ code: "NOT_FOUND", message: "Meme not found" });
        }
        res.status(500).json({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
});

// PATCH /memes/:id - Update a meme (partial update)
router.patch('/:id', isAuthenticated, async (req, res) => {
    try {
        const meme = await Meme.findById(req.params.id);

        if (!meme) {
            return res.status(404).json({ code: "NOT_FOUND", message: "Meme not found" });
        }

        // Check ownership - return 404 for unauthorized (not 403)
        if (req.user._id.toString() !== meme.owner.toString()) {
            return res.status(404).json({ code: "NOT_FOUND", message: "Meme not found" });
        }

        // Only allow updating these fields
        const { title, caption, imageUrl, category, isPublic } = req.body;
        if (title) meme.title = title;
        if (caption) meme.caption = caption;
        if (imageUrl) meme.imageUrl = imageUrl;
        if (category) meme.category = category;
        if (isPublic !== undefined) meme.isPublic = isPublic;

        await meme.save();
        res.json(meme);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ code: "NOT_FOUND", message: "Meme not found" });
        }
        res.status(500).json({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
});

// DELETE /memes/:id - Delete a meme
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const meme = await Meme.findById(req.params.id);

        if (!meme) {
            return res.status(404).json({ code: "NOT_FOUND", message: "Meme not found" });
        }

        // Check ownership - return 404 for unauthorized (not 403)
        if (req.user._id.toString() !== meme.owner.toString()) {
            return res.status(404).json({ code: "NOT_FOUND", message: "Meme not found" });
        }

        await Meme.deleteOne({ _id: req.params.id });
        res.status(204).send();
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ code: "NOT_FOUND", message: "Meme not found" });
        }
        res.status(500).json({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
});

// POST /memes/:id/like - Like a meme
router.post('/:id/like', isAuthenticated, async (req, res) => {
    try {
        const meme = await Meme.findById(req.params.id);

        if (!meme) {
            return res.status(404).json({ code: "NOT_FOUND", message: "Meme not found" });
        }

        // Check authorization: if not public and not owner, return 404
        if (!meme.isPublic && req.user._id.toString() !== meme.owner.toString()) {
            return res.status(404).json({ code: "NOT_FOUND", message: "Meme not found" });
        }

        // Check if already liked
        if (meme.likes.includes(req.user._id)) {
            return res.status(400).json({ code: "ALREADY_LIKED", message: "You already liked this meme" });
        }

        meme.likes.push(req.user._id);
        await meme.save();
        res.json({ likeCount: meme.likes.length });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ code: "NOT_FOUND", message: "Meme not found" });
        }
        res.status(500).json({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
});

// DELETE /memes/:id/like - Unlike a meme
router.delete('/:id/like', isAuthenticated, async (req, res) => {
    try {
        const meme = await Meme.findById(req.params.id);

        if (!meme) {
            return res.status(404).json({ code: "NOT_FOUND", message: "Meme not found" });
        }

        // Check authorization: if not public and not owner, return 404
        if (!meme.isPublic && req.user._id.toString() !== meme.owner.toString()) {
            return res.status(404).json({ code: "NOT_FOUND", message: "Meme not found" });
        }

        // Check if user has liked this
        if (!meme.likes.includes(req.user._id)) {
            return res.status(400).json({ code: "NOT_LIKED", message: "You have not liked this meme" });
        }

        meme.likes = meme.likes.filter(id => id.toString() !== req.user._id.toString());
        await meme.save();
        res.json({ likeCount: meme.likes.length });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ code: "NOT_FOUND", message: "Meme not found" });
        }
        res.status(500).json({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
});

// POST /memes/:id/comments - Add a comment
router.post('/:id/comments', isAuthenticated, async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ code: "VALIDATION_ERROR", message: "Comment text is required" });
        }

        const meme = await Meme.findById(req.params.id);

        if (!meme) {
            return res.status(404).json({ code: "NOT_FOUND", message: "Meme not found" });
        }

        // Check authorization: if not public and not owner, return 404
        if (!meme.isPublic && req.user._id.toString() !== meme.owner.toString()) {
            return res.status(404).json({ code: "NOT_FOUND", message: "Meme not found" });
        }

        meme.comments.push({
            author: req.user._id,
            text
        });

        await meme.save();
        await meme.populate('comments.author', 'displayName profileImage');
        res.status(201).json(meme.comments[meme.comments.length - 1]);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ code: "NOT_FOUND", message: "Meme not found" });
        }
        res.status(500).json({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
});

// DELETE /memes/:id/comments/:commentId - Delete a comment
router.delete('/:id/comments/:commentId', isAuthenticated, async (req, res) => {
    try {
        const meme = await Meme.findById(req.params.id);

        if (!meme) {
            return res.status(404).json({ code: "NOT_FOUND", message: "Meme not found" });
        }

        const comment = meme.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ code: "NOT_FOUND", message: "Comment not found" });
        }

        // Check if user owns the comment or the meme
        if (req.user._id.toString() !== comment.author.toString() && 
            req.user._id.toString() !== meme.owner.toString()) {
            return res.status(404).json({ code: "NOT_FOUND", message: "Comment not found" });
        }

        meme.comments.id(req.params.commentId).deleteOne();
        await meme.save();
        res.status(204).send();
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ code: "NOT_FOUND", message: "Meme not found" });
        }
        res.status(500).json({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
});

module.exports = router;
