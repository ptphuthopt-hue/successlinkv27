const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// Admin authentication middleware
async function adminAuth(req, res, next) {
    try {
        // First check if user is authenticated
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }

        // Check if user is admin
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during authentication'
        });
    }
}

module.exports = adminAuth;
