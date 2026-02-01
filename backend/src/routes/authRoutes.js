import { Router } from "express";
import passport from 'passport';
import { 
    login, 
    register, 
    logout, 
    googleAuth, 
    verifyEmail, 
    businessRegister, 
    businessGoogleAuth,
    getConflictData,
    deleteAndContinue
} from "../controllers/authController/index.js";
import auth from "../middleware/auth.js";

const router = Router();

// User registration and login
router.post("/register", register.validator, register.handler);
router.post("/login", login.validator, login.handler);
router.post("/logout", auth, logout.handler);

// User Google OAuth
router.get("/google", passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
}));

router.get("/google/callback", (req, res, next) => {
    // Check if this is business registration via session
    const isBusiness = req.session && req.session.oauthType === 'business';
    const strategy = isBusiness ? 'google-business' : 'google';
    const sessionEnabled = isBusiness;
    const failureUrl = isBusiness ? '/api/v1/auth/business/google/failure' : '/api/v1/auth/google/failure';
    
    passport.authenticate(strategy, { 
        session: sessionEnabled,
        failureRedirect: failureUrl
    })(req, res, next);
}, (req, res) => {
    // After authentication, check req.user to determine if business flow
    const user = req.user;
    const isBusiness = user && (user.isConflict || user.isTemporary);
    
    // Clear the OAuth type flag from session
    if (req.session && req.session.oauthType) {
        delete req.session.oauthType;
    }
    
    if (isBusiness) {
        return businessGoogleAuth.callback(req, res);
    }
    return googleAuth.callback(req, res);
});

router.get("/google/failure", (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
});

// Business Owner registration
router.post("/business/register", 
    businessRegister.validator, 
    businessRegister.handler
);

// Business Owner Google OAuth
router.get("/business/google", (req, res, next) => {
    // Store business flag in session before OAuth
    req.session.oauthType = 'business';
    next();
}, passport.authenticate('google-business', { 
    scope: ['profile', 'email'],
    session: true,
    state: 'business'  // Pass state to identify flow
}));

router.get("/business/google/failure", (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/business/register?error=google_auth_failed`);
});

// Complete business registration after Google OAuth
router.post("/business/complete-registration", 
    businessGoogleAuth.completeRegistration
);

// Account conflict resolution
router.get("/business/conflict-data", getConflictData.handler);
router.post("/business/delete-and-continue", deleteAndContinue.handler);

// Email verification
router.get("/verify-email", verifyEmail.handler);

export default router;





