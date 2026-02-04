const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const authGoogleRoutes = require('./routes/auth-google');
const lessonRoutes = require('./routes/lessons');
const aiRoutes = require('./routes/ai');
const adminRoutes = require('./routes/admin');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import database
require('./config/database');

// Create Express app
const app = express();

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        const allowedOrigins = [
             'http://localhost:5500',
             'http://localhost:8080',
             'http://127.0.0.1:5500',
             'https://sclv2-orcin.vercel.app',
             'https://successlinkv21226.vercel.app',
             'https://successlinkv27.vercel.app' // Thêm domain hiện tại
        ];
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(null, true);
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Successlink API is running 🚀'
    });
});

app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Successlink API is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', authGoogleRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

// Seed admin user
const seedAdminUser = async () => {
    const User = require('./models/User');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@successlink.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    try {
        const existingAdmin = await User.findByEmail(adminEmail);
        if (!existingAdmin) {
            await User.create({
                email: adminEmail,
                password: adminPassword,
                name: 'System Admin',
                role: 'admin',
                teaching_level: 'middle',
                subject: 'toan'
            });
            console.log('✅ Admin user created');
        }
    } catch (error) {
        console.error('❌ Error seeding admin:', error.message);
    }
};

// Seed default AI Provider
const seedAIProvider = async () => {
    const AIProvider = require('./models/AIProvider');
    const geminiKey = process.env.GEMINI_API_KEY || 'AIzaSyAvyYKLvrccJVKa2npFfc2awa1C5dn5gKE';
    try {
        // FIX: Use getAll instead of findAll
        const providers = await AIProvider.getAll(true);
        const geminiExists = providers.some(p => p.name === 'gemini');

        if (!geminiExists) {
            // FIX: Correct property names
            await AIProvider.create({
                name: 'gemini',
                display_name: 'Google Gemini Pro',
                api_key: geminiKey,
                endpoint: 'https://generativelanguage.googleapis.com/v1beta',
                model: 'gemini-1.5-pro',
                priority: 1,
                rate_limit: 60,
                cost_per_1k_tokens: 0.00025,
                is_active: true
            });
            console.log('✅ Default Gemini provider created');
        }
    } catch (error) {
        console.error('❌ Error seeding AI provider:', error.message);
    }
};

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    setTimeout(async () => {
        await seedAdminUser();
        await seedAIProvider();
    }, 2000);
});

module.exports = app;
