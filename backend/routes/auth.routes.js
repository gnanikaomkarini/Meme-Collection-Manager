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
router.get('/current_user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

//GET /logout
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect(process.env.FRONTEND_URL + '/login');
    });
});

module.exports = router;
