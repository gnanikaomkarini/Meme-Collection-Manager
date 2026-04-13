const express = require('express');
const passport = require('passport');
const router = express.Router();

//GET /google

router.get('/google' , passport.authenticate('google', {
    scope: ['profile', 'email']
}));

//GET /google/callback
router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: process.env.FRONTEND_URL + '/login'
}), (req, res) => {
    res.redirect(process.env.FRONTEND_URL + '/');
});

//GET /current_user
// Returns 200 with user object if authenticated, 401 if not
// Fixed: Removed verbose response envelope, returns proper HTTP semantics
router.get('/current_user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.status(401).json({ code: "UNAUTHORIZED", message: "User is not authenticated." });
    }
});

//GET /logout
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        // Fixed: Return 200 with no content instead of redirecting
        // Frontend will handle navigation
        res.status(200).json({ message: "Logged out successfully" });
    });
});

module.exports = router;
