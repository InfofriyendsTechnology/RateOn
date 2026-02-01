import jwt from 'jsonwebtoken';
import { JWT_SECRET, FRONTEND_URL } from '../../config/config.js';
import { User, Business } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';

export default {
    // Step 1: Google OAuth callback (user authenticated via Google)
    callback: async (req, res) => {
        try {
            if (!req.user) {
                return res.redirect(`${FRONTEND_URL}/business/register?error=authentication_failed`);
            }

            const googleUser = req.user;
            
            // Check if account already exists
            const existingUser = await User.findOne({
                $or: [
                    { googleId: googleUser.googleId },
                    { email: googleUser.email }
                ]
            });
            
            if (existingUser) {
                // If user is already a business owner, just log them in
                if (existingUser.role === 'business_owner') {
                    const token = jwt.sign({
                        id: existingUser._id,
                        username: existingUser.username,
                        email: existingUser.email,
                        role: existingUser.role,
                        userType: 'user'
                    }, JWT_SECRET, { expiresIn: '30d' });

                    existingUser.isLoggedIn = true;
                    await existingUser.save();
                    
                    // Find the user's business
                    const userBusiness = await Business.findOne({ owner: existingUser._id });
                    
                    const userObj = existingUser.toObject();
                    if (userBusiness) {
                        userObj.business = {
                            _id: userBusiness._id,
                            id: userBusiness._id,
                            name: userBusiness.name,
                            type: userBusiness.type
                        };
                    }

                    const userData = encodeURIComponent(JSON.stringify({
                        token,
                        user: userObj,
                        userType: 'user'
                    }));

                    return res.redirect(`${FRONTEND_URL}/business/auth-callback?loginData=${userData}`);
                }
                
                // Otherwise show conflict (regular user trying to register as business)
                const params = new URLSearchParams({
                    existingEmail: existingUser.email,
                    existingUsername: existingUser.username,
                    existingRole: existingUser.role,
                    existingId: existingUser._id.toString(),
                    googleEmail: googleUser.email,
                    googleId: googleUser.googleId,
                    googleFirstName: googleUser.profile.firstName,
                    googleLastName: googleUser.profile.lastName,
                    googleAvatar: googleUser.profile.avatar || ''
                });
                
                return res.redirect(`${FRONTEND_URL}/business/account-conflict?${params.toString()}`);
            }

            // Check if this is temporary Google data (no conflict)
            if (googleUser.isTemporary) {
                // Store Google user data in session temporarily
                req.session.tempGoogleUser = {
                    googleId: googleUser.googleId,
                    email: googleUser.email,
                    profile: {
                        firstName: googleUser.profile.firstName,
                        lastName: googleUser.profile.lastName,
                        avatar: googleUser.profile.avatar
                    }
                };

                // Save session before redirect
                return req.session.save((err) => {
                    if (err) {
                        console.error('Session save error:', err);
                    }
                    
                    // Redirect to frontend business registration form with Google data
                    const tempData = encodeURIComponent(JSON.stringify({
                        googleId: googleUser.googleId,
                        email: googleUser.email,
                        firstName: googleUser.profile.firstName,
                        lastName: googleUser.profile.lastName,
                        avatar: googleUser.profile.avatar
                    }));

                    res.redirect(`${FRONTEND_URL}/business/complete-registration?googleData=${tempData}`);
                });
            }

            // Fallback: shouldn't reach here
            return res.redirect(`${FRONTEND_URL}/business/register?error=invalid_state`);

        } catch (error) {
            console.error('Business Google OAuth error:', error);
            return res.redirect(`${FRONTEND_URL}/business/register?error=${encodeURIComponent(error?.message || 'authentication_failed')}`);
        }
    },

    // Step 2: Complete business registration with Google account
    completeRegistration: async (req, res) => {
        try {
            const {
                googleId,
                email,
                firstName,
                lastName,
                avatar,
                username,
                phoneNumber,
                // Business details
                businessName,
                businessType,
                category,
                subcategory,
                description,
                address,
                city,
                state,
                country,
                pincode,
                coordinates,
                businessPhone,
                businessWhatsapp,
                businessEmail,
                businessWebsite
            } = req.body;

            // Validate required fields
            if (!googleId || !email || !username || !businessName || !businessType || 
                !category || !address || !city || !state || !coordinates) {
                return responseHandler.error(res, 'Missing required fields');
            }

            // Check if user with this Google ID already exists
            let user = await User.findOne({ googleId });

            if (user) {
                return responseHandler.conflict(res, 'This Google account is already registered');
            }

            // Check if email is already registered (as user or business owner)
            const existingEmail = await User.findOne({ email });
            if (existingEmail) {
                return responseHandler.conflict(
                    res,
                    'This email is already registered. Please use a different email or delete your existing account first.'
                );
            }

            // Check if username is taken
            const existingUsername = await User.findOne({ username });
            if (existingUsername) {
                return responseHandler.conflict(res, 'Username already taken');
            }

            // Check if business name exists in this city
            const existingBusiness = await Business.findOne({
                name: businessName,
                'location.city': city
            });

            if (existingBusiness) {
                return responseHandler.conflict(
                    res,
                    'A business with this name already exists in this city'
                );
            }

            // Create business owner user
            user = new User({
                googleId,
                email,
                username,
                phoneNumber: phoneNumber || undefined,
                role: 'business_owner',
                profile: {
                    firstName: firstName || '',
                    lastName: lastName || '',
                    avatar: avatar || null
                },
                isEmailVerified: true,
                isActive: true
            });

            await user.save();

            // Default business hours (Mon-Sat: 9 AM - 6 PM, Sunday closed)
            const defaultBusinessHours = [
                { day: 'monday', open: '09:00', close: '18:00', isClosed: false },
                { day: 'tuesday', open: '09:00', close: '18:00', isClosed: false },
                { day: 'wednesday', open: '09:00', close: '18:00', isClosed: false },
                { day: 'thursday', open: '09:00', close: '18:00', isClosed: false },
                { day: 'friday', open: '09:00', close: '18:00', isClosed: false },
                { day: 'saturday', open: '09:00', close: '18:00', isClosed: false },
                { day: 'sunday', open: '09:00', close: '18:00', isClosed: true }
            ];

            // Create business
            const business = new Business({
                name: businessName,
                type: businessType,
                category,
                subcategory,
                description,
                location: {
                    address,
                    city,
                    state,
                    country: country || 'India',
                    pincode,
                    coordinates: {
                        type: 'Point',
                        coordinates: [coordinates.lng, coordinates.lat]
                    }
                },
                contact: {
                    phone: businessPhone,
                    whatsapp: businessWhatsapp,
                    email: businessEmail || email,
                    website: businessWebsite
                },
                businessHours: defaultBusinessHours,
                owner: user._id,
                createdBy: user._id,
                isClaimed: true,
                isVerified: false
            });

            await business.save();

            // Generate JWT token
            const token = jwt.sign(
                {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    userType: 'user'
                },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Update user login status
            user.isLoggedIn = true;
            await user.save();

            // Return response
            const userResponse = {
                _id: user._id,
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                profile: user.profile,
                business: {
                    _id: business._id,
                    id: business._id,
                    name: business.name,
                    type: business.type
                },
                token
            };

            return responseHandler.success(
                res,
                'Business owner account created successfully via Google',
                userResponse,
                201
            );

        } catch (error) {
            console.error('Complete business registration error:', error);
            return responseHandler.error(res, error?.message || 'Failed to complete registration');
        }
    }
};


