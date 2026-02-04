const bcrypt = require('bcryptjs');
const { dbAsync } = require('../config/database');

class User {
    // Create new user
    static async create(userData) {
        const { email, password, name, teaching_level, subject, role } = userData;

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const sql = `
            INSERT INTO users (email, password, name, teaching_level, subject, role)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const result = await dbAsync.run(sql, [
            email,
            hashedPassword,
            name || null,
            teaching_level,
            subject,
            role || 'user' // Default to 'user' if not specified
        ]);

        return result.id;
    }

    // Find user by email
    static async findByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ?';
        return await dbAsync.get(sql, [email]);
    }

    // Find user by ID
    static async findById(id) {
        const sql = 'SELECT id, email, name, teaching_level, subject, role, profile_picture, google_id, auth_provider, created_at FROM users WHERE id = ?';
        return await dbAsync.get(sql, [id]);
    }

    // Update user preferences
    static async update(id, userData) {
        const { name, teaching_level, subject } = userData;

        const sql = `
            UPDATE users 
            SET name = ?, teaching_level = ?, subject = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        await dbAsync.run(sql, [name, teaching_level, subject, id]);
        return await this.findById(id);
    }

    // Verify password
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Get user stats
    static async getStats(userId) {
        const sql = `
            SELECT 
                COUNT(*) as total_lessons,
                COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as active_lessons
            FROM lessons 
            WHERE user_id = ?
        `;

        return await dbAsync.get(sql, [userId]);
    }

    // Find user by Google ID
    static async findByGoogleId(googleId) {
        const sql = 'SELECT * FROM users WHERE google_id = ?';
        return await dbAsync.get(sql, [googleId]);
    }

    // Find or create user from Google OAuth
    static async findOrCreateByGoogle(googleData) {
        const { googleId, email, name, picture } = googleData;

        // Try to find by Google ID first
        let user = await this.findByGoogleId(googleId);

        if (user) {
            // Update user info if found
            const sql = `
                UPDATE users 
                SET name = ?, profile_picture = ?, updated_at = CURRENT_TIMESTAMP
                WHERE google_id = ?
            `;
            await dbAsync.run(sql, [name, picture, googleId]);
            return await this.findByGoogleId(googleId);
        }

        // Try to find by email (user might have registered with email/password)
        user = await this.findByEmail(email);

        if (user) {
            // Link Google account to existing user
            const sql = `
                UPDATE users 
                SET google_id = ?, profile_picture = ?, auth_provider = 'google', updated_at = CURRENT_TIMESTAMP
                WHERE email = ?
            `;
            await dbAsync.run(sql, [googleId, picture, email]);
            return await this.findByEmail(email);
        }

        // Create new user
        const sql = `
            INSERT INTO users (email, name, google_id, profile_picture, auth_provider)
            VALUES (?, ?, ?, ?, 'google')
        `;

        const result = await dbAsync.run(sql, [email, name, googleId, picture]);
        return await this.findById(result.id);
    }
}

module.exports = User;
