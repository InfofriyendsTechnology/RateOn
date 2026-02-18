import { Router } from "express";
import passport from 'passport';
import { 
    login, 
    register, 
    logout, 
    googleAuth, 
    verifyEmail
} from "../controllers/authController/index.js";
import auth from "../middleware/auth.js";

const router = Router();

// User registration and login
router.post("/register", register.validator, register.handler);
router.post("/login", login.validator, login.handler);
router.post("/logout", auth, logout.handler);

// User Google OAuth
router.get("/google", (req, res, next) => {
    // Save state parameter (return URL) in session-like storage
    const state = req.query.state;
    if (state) {
        // Store state in cookie that will be available during callback
        res.cookie('oauth_state', state, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            maxAge: 5 * 60 * 1000 // 5 minutes
        });
    }
    
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        session: false 
    })(req, res, next);
});

router.get("/google/callback", 
    passport.authenticate('google', { 
        session: false,
        failureRedirect: '/api/v1/auth/google/failure'
    }), 
    googleAuth.callback
);

router.get("/google/failure", (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
});


// Email verification
router.get("/verify-email", verifyEmail.handler);

export default router;





