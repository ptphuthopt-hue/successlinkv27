const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyGoogleToken } = require('../config/google-oauth');
require('dotenv').config();

// @route   POST /api/auth/google
// @desc    Authenticate with Google OAuth
// @access  Public
router.post('/google', async (req, res, next) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({
                success: false,
                message: 'Google ID token is required'
            });
        }

        // Verify Google token
        let googleData;
        try {
            googleData = await verifyGoogleToken(idToken);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid Google token'
            });
        }

        // Find or create user
        const user = await User.findOrCreateByGoogle(googleData);

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                teaching_level: user.teaching_level,
                subject: user.subject
            },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Remove sensitive data
        delete user.password;
        delete user.google_id;

        res.json({
            success: true,
            message: 'Google authentication successful',
            data: {
                token,
                user,
                isNewUser: !user.teaching_level || !user.subject // Need onboarding if no preferences
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
