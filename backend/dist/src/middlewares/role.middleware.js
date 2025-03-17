"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleMiddleware = void 0;
// Role middleware to restrict access based on user roles
const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        // Check if user exists (should be set by authMiddleware)
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Check if user has one of the allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Access denied. You do not have the required permissions.'
            });
        }
        // User has required role, proceed to next middleware
        next();
    };
};
exports.roleMiddleware = roleMiddleware;
