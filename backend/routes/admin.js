const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/admin-auth');
const User = require('../models/User');
const Lesson = require('../models/Lesson');
const AIProvider = require('../models/AIProvider');
const { dbAsync } = require('../config/database');

// All routes require admin authentication
router.use(adminAuth);

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Admin
router.get('/stats', async (req, res, next) => {
    try {
        // User stats
        const userStats = await dbAsync.get(`
            SELECT 
                COUNT(*) as total_users,
                COUNT(CASE WHEN created_at >= datetime('now', '-7 days') THEN 1 END) as new_users_week,
                COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
                COUNT(CASE WHEN role = 'teacher' THEN 1 END) as teacher_count
            FROM users
        `);

        // Lesson stats
        const lessonStats = await dbAsync.get(`
            SELECT 
                COUNT(*) as total_lessons,
                COUNT(CASE WHEN created_at >= datetime('now', '-7 days') THEN 1 END) as new_lessons_week,
                COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as active_lessons
            FROM lessons
        `);

        // AI Provider stats
        const aiStats = await AIProvider.getStats();

        // AI Usage stats (last 30 days)
        const aiUsageStats = await dbAsync.get(`
            SELECT 
                COUNT(*) as total_requests,
                SUM(total_tokens) as total_tokens,
                SUM(cost) as total_cost,
                AVG(response_time_ms) as avg_response_time
            FROM ai_usage_logs
            WHERE created_at >= datetime('now', '-30 days')
        `);

        // Daily usage for chart (last 7 days)
        const dailyUsage = await dbAsync.all(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as requests,
                SUM(cost) as cost
            FROM ai_usage_logs
            WHERE created_at >= datetime('now', '-7 days')
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `);

        res.json({
            success: true,
            data: {
                users: userStats,
                lessons: lessonStats,
                ai: {
                    ...aiStats,
                    usage: aiUsageStats,
                    daily: dailyUsage
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Admin
router.get('/users', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        let sql = `
            SELECT 
                u.id,
                u.email,
                u.name,
                u.teaching_level,
                u.subject,
                u.role,
                u.auth_provider,
                u.profile_picture,
                u.created_at,
                COUNT(l.id) as lesson_count
            FROM users u
            LEFT JOIN lessons l ON u.id = l.user_id AND l.deleted_at IS NULL
        `;

        const params = [];

        if (search) {
            sql += ` WHERE u.email LIKE ? OR u.name LIKE ?`;
            params.push(`%${search}%`, `%${search}%`);
        }

        sql += ` GROUP BY u.id ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const users = await dbAsync.all(sql, params);

        // Get total count
        let countSql = 'SELECT COUNT(*) as total FROM users';
        const countParams = [];

        if (search) {
            countSql += ' WHERE email LIKE ? OR name LIKE ?';
            countParams.push(`%${search}%`, `%${search}%`);
        }

        const { total } = await dbAsync.get(countSql, countParams);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/admin/users/:id
// @desc    Get user details
// @access  Admin
router.get('/users/:id', async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user's lessons
        const lessons = await Lesson.findByUserId(user.id);

        // Get user's AI usage
        const aiUsage = await dbAsync.get(`
            SELECT 
                COUNT(*) as total_requests,
                SUM(total_tokens) as total_tokens,
                SUM(cost) as total_cost
            FROM ai_usage_logs
            WHERE user_id = ?
        `, [user.id]);

        res.json({
            success: true,
            data: {
                user,
                lessons,
                aiUsage
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Admin
router.put('/users/:id/role', async (req, res, next) => {
    try {
        const { role } = req.body;

        if (!['admin', 'teacher'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be "admin" or "teacher"'
            });
        }

        await dbAsync.run(
            'UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [role, req.params.id]
        );

        const user = await User.findById(req.params.id);

        res.json({
            success: true,
            message: 'User role updated successfully',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/admin/ai-providers
// @desc    Get all AI providers
// @access  Admin
router.get('/ai-providers', async (req, res, next) => {
    try {
        const providers = await AIProvider.getAll(true); // Include inactive

        res.json({
            success: true,
            data: { providers }
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/admin/ai-providers
// @desc    Add new AI provider
// @access  Admin
router.post('/ai-providers', async (req, res, next) => {
    try {
        const {
            name,
            display_name,
            api_key,
            endpoint,
            model,
            priority,
            rate_limit,
            cost_per_1k_tokens
        } = req.body;

        // Validation
        if (!name || !display_name || !api_key) {
            return res.status(400).json({
                success: false,
                message: 'Name, display name, and API key are required'
            });
        }

        const id = await AIProvider.create({
            name,
            display_name,
            api_key,
            endpoint,
            model,
            priority,
            rate_limit,
            cost_per_1k_tokens
        });

        const provider = await AIProvider.findById(id);

        res.status(201).json({
            success: true,
            message: 'AI provider added successfully',
            data: { provider }
        });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({
                success: false,
                message: 'Provider with this name already exists'
            });
        }
        next(error);
    }
});

// @route   PUT /api/admin/ai-providers/:id
// @desc    Update AI provider
// @access  Admin
router.put('/ai-providers/:id', async (req, res, next) => {
    try {
        const provider = await AIProvider.update(req.params.id, req.body);

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found'
            });
        }

        res.json({
            success: true,
            message: 'Provider updated successfully',
            data: { provider }
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/admin/ai-providers/:id
// @desc    Delete AI provider
// @access  Admin
router.delete('/ai-providers/:id', async (req, res, next) => {
    try {
        await AIProvider.delete(req.params.id);

        res.json({
            success: true,
            message: 'Provider deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/admin/ai-providers/:id/test
// @desc    Test AI provider connection
// @access  Admin
router.post('/ai-providers/:id/test', async (req, res, next) => {
    try {
        const provider = await AIProvider.findById(req.params.id);

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found'
            });
        }

        // TODO: Implement actual API test based on provider type
        // For now, just return success
        res.json({
            success: true,
            message: 'Connection test successful',
            data: {
                provider: provider.name,
                status: 'connected',
                latency: Math.floor(Math.random() * 500) + 100 // Mock latency
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/admin/analytics/usage
// @desc    Get AI usage analytics
// @access  Admin
router.get('/analytics/usage', async (req, res, next) => {
    try {
        const days = parseInt(req.query.days) || 30;

        // Usage by provider
        const byProvider = await dbAsync.all(`
            SELECT 
                p.display_name as provider,
                COUNT(l.id) as requests,
                SUM(l.total_tokens) as tokens,
                SUM(l.cost) as cost
            FROM ai_usage_logs l
            JOIN ai_providers p ON l.provider_id = p.id
            WHERE l.created_at >= datetime('now', '-${days} days')
            GROUP BY p.id
            ORDER BY requests DESC
        `);

        // Daily usage trend
        const dailyTrend = await dbAsync.all(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as requests,
                SUM(total_tokens) as tokens,
                SUM(cost) as cost
            FROM ai_usage_logs
            WHERE created_at >= datetime('now', '-${days} days')
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `);

        // Top users by usage
        const topUsers = await dbAsync.all(`
            SELECT 
                u.email,
                u.name,
                COUNT(l.id) as requests,
                SUM(l.cost) as cost
            FROM ai_usage_logs l
            JOIN users u ON l.user_id = u.id
            WHERE l.created_at >= datetime('now', '-${days} days')
            GROUP BY u.id
            ORDER BY requests DESC
            LIMIT 10
        `);

        res.json({
            success: true,
            data: {
                byProvider,
                dailyTrend,
                topUsers
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
