const { body, validationResult } = require('express-validator');

// Validation rules
const validationRules = {
    register: [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),
        body('name')
            .notEmpty()
            .trim()
            .withMessage('Name is required')
    ],

    login: [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email'),
        body('password')
            .notEmpty()
            .withMessage('Password is required')
    ],

    createLesson: [
        body('title')
            .notEmpty()
            .trim()
            .withMessage('Lesson title is required'),
        body('content_types')
            .isArray({ min: 1 })
            .withMessage('At least one content type is required'),
        body('generated_content')
            .notEmpty()
            .withMessage('Generated content is required')
    ],

    updateLesson: [
        body('title')
            .optional()
            .trim()
            .notEmpty()
            .withMessage('Title cannot be empty'),
        body('generated_content')
            .optional()
            .notEmpty()
            .withMessage('Generated content cannot be empty')
    ]
};

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }

    next();
};

module.exports = { validationRules, validate };
