const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { validationRules, validate } = require('../middleware/validator');
require('dotenv').config();

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', validationRules.register, validate, async (req, res, next) => {
    try {
        const { email, password, name, teaching_level, subject } = req.body;

        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Create user
        const userId = await User.create({
            email,
            password,
            name,
            teaching_level,
            subject,
            role: email === 'admin@successlink.com' ? 'admin' : 'user' // Auto-assign admin role
        });

        // Get user data (without password)
        const user = await User.findById(userId);

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

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                token,
                user
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validationRules.login, validate, async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Verify password
        const isMatch = await User.verifyPassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

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

        // Remove password from response
        delete user.password;

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user stats
        const stats = await User.getStats(req.user.id);

        res.json({
            success: true,
            data: {
                user,
                stats
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res, next) => {
    try {
        const { name, teaching_level, subject } = req.body;

        const updatedUser = await User.update(req.user.id, {
            name,
            teaching_level,
            subject
        });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user: updatedUser }
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/auth/make-admin
// @desc    Promote current user to admin (TEMPORARY - for development)
// @access  Private
router.post('/make-admin', auth, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update user role to admin
        const db = require('../config/database');
        await db.run(
            'UPDATE users SET role = ? WHERE id = ?',
            ['admin', req.user.id]
        );

        // Get updated user
        const updatedUser = await User.findById(req.user.id);

        res.json({
            success: true,
            message: 'User promoted to admin successfully',
            data: { user: updatedUser }
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/auth/auto-login/:token
// @desc    Auto-login with secret token (for admin quick access)
// @access  Public
router.get('/auto-login/:token', async (req, res, next) => {
    try {
        const { token } = req.params;

        // Secret token for auto-login (can be changed via env variable)
        const AUTO_LOGIN_TOKEN = process.env.AUTO_LOGIN_TOKEN || 'admin-quick-access-2026';

        if (token !== AUTO_LOGIN_TOKEN) {
            return res.status(401).json({
                success: false,
                message: 'Invalid auto-login token'
            });
        }

        // Find or create admin user
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@successlink.com';
        let user = await User.findByEmail(adminEmail);

        if (!user) {
            // Create admin if doesn't exist
            const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
            const userId = await User.create({
                email: adminEmail,
                password: adminPassword,
                name: 'System Admin',
                role: 'admin',
                teaching_level: 'middle',
                subject: 'toan'
            });
            user = await User.findById(userId);
        }

        // Generate JWT token
        const jwtToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                teaching_level: user.teaching_level,
                subject: user.subject
            },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Remove password from response
        delete user.password;

        // Return HTML page that auto-saves token and redirects
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Auto Login - Successlink</title>
                <style>
                    body {
                        font-family: 'Inter', sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    }
                    .container {
                        text-align: center;
                        background: white;
                        padding: 3rem;
                        border-radius: 1rem;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    }
                    h1 { color: #4DA8DA; margin-bottom: 1rem; }
                    p { color: #666; margin-bottom: 2rem; }
                    .spinner {
                        border: 4px solid #f3f3f3;
                        border-top: 4px solid #4DA8DA;
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        animation: spin 1s linear infinite;
                        margin: 0 auto;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🚀 Successlink Admin</h1>
                    <p>Đang đăng nhập tự động...</p>
                    <div class="spinner"></div>
                </div>
                <script>
                    // Save token and user data
                    const token = '${jwtToken}';
                    const user = ${JSON.stringify(user)};
                    
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(user));
                    
                    // Redirect to admin dashboard
                    setTimeout(() => {
                        window.location.href = 'https://successlinkv26.vercel.app/admin.html';
                    }, 1500);
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
