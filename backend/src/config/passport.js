import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/index.js';

import { BACKEND_URL } from './config.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Hardcoded production callback URL - only use localhost if explicitly set
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 
  (process.env.NODE_ENV === 'development' || BACKEND_URL?.includes('localhost') 
    ? 'http://localhost:1126/api/v1/auth/google/callback'
    : 'https://rateon-backend.vercel.app/api/v1/auth/google/callback');

console.log('🔍 GOOGLE_CALLBACK_URL configured as:', GOOGLE_CALLBACK_URL);

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    // User Google OAuth Strategy
    passport.use('google', new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Try to find existing user by Google ID
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
                user.trustScore = user.calculateTrustScore();
                await user.save();
                return done(null, user);
            }

            // Or link to existing account by email
            let existingEmail = await User.findOne({ email: profile.emails[0].value });
            
            if (existingEmail) {
                existingEmail.googleId = profile.id;
                existingEmail.isEmailVerified = true;
                existingEmail.trustScore = existingEmail.calculateTrustScore();
                await existingEmail.save();
                return done(null, existingEmail);
            }

            // Create username based on email local-part, with simple collision handling
            const email = profile.emails[0].value;
            const baseUsername = email.split('@')[0];
            let username = baseUsername;

            const existingSameUsername = await User.findOne({ username });
            if (existingSameUsername) {
                username = `${baseUsername}_${Date.now().toString().slice(-4)}`;
            }

            const newUser = await User.create({
                googleId: profile.id,
                email,
                username,
                profile: {
                    firstName: profile.name.givenName || '',
                    lastName: profile.name.familyName || '',
                    avatar: profile.photos[0]?.value || null
                },
                isEmailVerified: true,
                isActive: true
            });

            newUser.trustScore = newUser.calculateTrustScore();
            await newUser.save();

            return done(null, newUser);
        } catch (error) {
            console.error('❌ User Google OAuth error:', error.message);
            return done(error, null);
        }
    }));

} else {
    console.log('⚠️  Google OAuth not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env file.');
}

passport.serializeUser((user, done) => {
    if (user && user._id) {
        return done(null, user._id.toString());
    }
    done(null, null);
});

passport.deserializeUser(async (id, done) => {
    try {
        if (!id) {
            return done(null, false);
        }
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
