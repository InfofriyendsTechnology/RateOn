import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/index.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:1126/api/v1/auth/google/callback';
const BUSINESS_GOOGLE_CALLBACK_URL = GOOGLE_CALLBACK_URL; // Use same callback URL

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

    // Business Google OAuth Strategy
    passport.use('google-business', new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: BUSINESS_GOOGLE_CALLBACK_URL
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Just return Google profile data, conflict detection will be in callback
            const tempUser = {
                googleId: profile.id,
                email: profile.emails[0].value,
                profile: {
                    firstName: profile.name.givenName || '',
                    lastName: profile.name.familyName || '',
                    avatar: profile.photos[0]?.value || null
                },
                isTemporary: true
            };
            return done(null, tempUser);
        } catch (error) {
            console.error('❌ Business Google OAuth error:', error.message);
            return done(error, null);
        }
    }));
} else {
    console.log('⚠️  Google OAuth not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env file.');
}

passport.serializeUser((user, done) => {
    // Handle temporary objects (conflict markers, temp users)
    if (user && (user.isConflict || user.isTemporary)) {
        // Serialize a special marker string instead of false
        return done(null, `temp:${user.email || 'unknown'}`);
    }
    // Normal user serialization
    if (user && user._id) {
        return done(null, user._id.toString());
    }
    // Fallback for any other case
    done(null, null);
});

passport.deserializeUser(async (id, done) => {
    try {
        // If it's a temp marker, don't deserialize
        if (!id || typeof id === 'string' && id.startsWith('temp:')) {
            return done(null, false);
        }
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
