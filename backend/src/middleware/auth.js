import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/config.js';
import responseHandler from '../utils/responseHandler.js';
import { User, Admin } from '../models/index.js';

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return responseHandler.error(res, 'Access denied. No token provided.');
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;

        const userData = decoded.userType === 'admin'
            ? await Admin.findById(decoded.id).select('-password')
            : await User.findById(decoded.id).select('-password');

        if (!userData) {
            return responseHandler.error(res, 'User not found');
        }

        if (!userData.isActive) {
            return responseHandler.error(res, 'Account has been deactivated');
        }

        req.userData = userData;
        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return responseHandler.error(res, 'Token has expired');
        }
        if (error.name === 'JsonWebTokenError') {
            return responseHandler.error(res, 'Invalid token');
        }
        return responseHandler.error(res, 'Authentication failed');
    }
};

export default auth;
