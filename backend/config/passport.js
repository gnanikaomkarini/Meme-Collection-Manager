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
                email: profile.emails[0].value,
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
