const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // SQLite errors
    if (err.code === 'SQLITE_CONSTRAINT') {
        if (err.message.includes('UNIQUE')) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }
    }

    // JWT errors (should be caught by auth middleware, but just in case)
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }

    // Default error
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;
