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
    // Debug: Log session info
    console.log('OAuth callback - Session ID:', req.sessionID);
    console.log('OAuth callback - Is authenticated:', req.isAuthenticated());
    console.log('OAuth callback - User:', req.user);
    console.log('OAuth callback - Session:', req.session);
    
    // Redirect to frontend callback route which will verify auth was successful
    res.redirect(process.env.FRONTEND_URL + '/auth/callback');
});

//GET /current_user
// Returns 200 with user object if authenticated, 401 if not
// Fixed: Removed verbose response envelope, returns proper HTTP semantics
router.get('/current_user', (req, res) => {
    console.log('current_user - Session ID:', req.sessionID);
    console.log('current_user - Is authenticated:', req.isAuthenticated());
    console.log('current_user - User:', req.user);
    console.log('current_user - Cookies:', req.headers.cookie);
    
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
