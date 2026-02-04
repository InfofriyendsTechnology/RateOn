import responseHandler from '../utils/responseHandler.js';

const authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        if (!req.user) {
            return responseHandler.error(res, 'Unauthorized: User not authenticated');
        }

        // Prioritize database role (req.userData.role) over JWT token role (req.user.role)
        // This ensures real-time role updates are respected
        const userRole = req.userData?.role || req.user.role;

        if (!userRole) {
            return responseHandler.error(res, 'Unauthorized: Role not found');
        }

        if (roles.length && !roles.includes(userRole)) {
            return responseHandler.error(
                res, 
                `Forbidden: You don't have permission to access this resource`
            );
        }

        next();
    };
};

export default authorize;
