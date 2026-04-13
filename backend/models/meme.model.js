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

// Index for faster queries
memeSchema.index({ owner: 1, createdAt: -1 });
memeSchema.index({ isPublic: 1, createdAt: -1 });

module.exports = mongoose.model('Meme', memeSchema);
