const express = require('express');
const router = express.Router();
const Lesson = require('../models/Lesson');
const auth = require('../middleware/auth');
const { validationRules, validate } = require('../middleware/validator');

// @route   POST /api/lessons
// @desc    Create new lesson
// @access  Private
router.post('/', auth, validationRules.createLesson, validate, async (req, res, next) => {
    try {
        const { title, content_types, generated_content } = req.body;

        const lessonId = await Lesson.create({
            user_id: req.user.id,
            title,
            content_types,
            generated_content
        });

        const lesson = await Lesson.findById(lessonId);

        res.status(201).json({
            success: true,
            message: 'Lesson created successfully',
            data: { lesson }
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/lessons
// @desc    Get all user's lessons
// @access  Private
router.get('/', auth, async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const lessons = await Lesson.findByUserId(req.user.id, {
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const total = await Lesson.countByUserId(req.user.id);

        res.json({
            success: true,
            data: {
                lessons,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/lessons/:id
// @desc    Get specific lesson
// @access  Private
router.get('/:id', auth, async (req, res, next) => {
    try {
        const lesson = await Lesson.findById(req.params.id);

        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lesson not found'
            });
        }

        // Check ownership
        const belongsToUser = await Lesson.belongsToUser(req.params.id, req.user.id);
        if (!belongsToUser) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: { lesson }
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/lessons/:id
// @desc    Update lesson
// @access  Private
router.put('/:id', auth, validationRules.updateLesson, validate, async (req, res, next) => {
    try {
        // Check ownership
        const belongsToUser = await Lesson.belongsToUser(req.params.id, req.user.id);
        if (!belongsToUser) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const { title, generated_content } = req.body;

        const updatedLesson = await Lesson.update(req.params.id, {
            title,
            generated_content
        });

        res.json({
            success: true,
            message: 'Lesson updated successfully',
            data: { lesson: updatedLesson }
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/lessons/:id
// @desc    Delete lesson (soft delete)
// @access  Private
router.delete('/:id', auth, async (req, res, next) => {
    try {
        // Check ownership
        const belongsToUser = await Lesson.belongsToUser(req.params.id, req.user.id);
        if (!belongsToUser) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        await Lesson.delete(req.params.id);

        res.json({
            success: true,
            message: 'Lesson deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
