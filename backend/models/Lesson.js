const { dbAsync } = require('../config/database');

class Lesson {
    // Create new lesson
    static async create(lessonData) {
        const { user_id, title, content_types, generated_content } = lessonData;

        const sql = `
            INSERT INTO lessons (user_id, title, content_types, generated_content)
            VALUES (?, ?, ?, ?)
        `;

        const result = await dbAsync.run(sql, [
            user_id,
            title,
            JSON.stringify(content_types),
            JSON.stringify(generated_content)
        ]);

        return result.id;
    }

    // Find all lessons by user ID
    static async findByUserId(userId, options = {}) {
        const { limit = 20, offset = 0, includeDeleted = false } = options;

        let sql = `
            SELECT id, title, content_types, created_at, updated_at
            FROM lessons 
            WHERE user_id = ?
        `;

        if (!includeDeleted) {
            sql += ' AND deleted_at IS NULL';
        }

        sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

        const lessons = await dbAsync.all(sql, [userId, limit, offset]);

        // Parse JSON fields
        return lessons.map(lesson => ({
            ...lesson,
            content_types: JSON.parse(lesson.content_types)
        }));
    }

    // Find lesson by ID
    static async findById(id) {
        const sql = `
            SELECT * FROM lessons 
            WHERE id = ? AND deleted_at IS NULL
        `;

        const lesson = await dbAsync.get(sql, [id]);

        if (!lesson) return null;

        // Parse JSON fields
        return {
            ...lesson,
            content_types: JSON.parse(lesson.content_types),
            generated_content: JSON.parse(lesson.generated_content)
        };
    }

    // Update lesson
    static async update(id, lessonData) {
        const { title, generated_content } = lessonData;

        const sql = `
            UPDATE lessons 
            SET title = ?, generated_content = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND deleted_at IS NULL
        `;

        await dbAsync.run(sql, [
            title,
            JSON.stringify(generated_content),
            id
        ]);

        return await this.findById(id);
    }

    // Soft delete lesson
    static async delete(id) {
        const sql = `
            UPDATE lessons 
            SET deleted_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        await dbAsync.run(sql, [id]);
        return true;
    }

    // Hard delete lesson (permanent)
    static async hardDelete(id) {
        const sql = 'DELETE FROM lessons WHERE id = ?';
        await dbAsync.run(sql, [id]);
        return true;
    }

    // Check if lesson belongs to user
    static async belongsToUser(lessonId, userId) {
        const sql = 'SELECT id FROM lessons WHERE id = ? AND user_id = ?';
        const result = await dbAsync.get(sql, [lessonId, userId]);
        return !!result;
    }

    // Get total count for pagination
    static async countByUserId(userId, includeDeleted = false) {
        let sql = 'SELECT COUNT(*) as count FROM lessons WHERE user_id = ?';

        if (!includeDeleted) {
            sql += ' AND deleted_at IS NULL';
        }

        const result = await dbAsync.get(sql, [userId]);
        return result.count;
    }
}

module.exports = Lesson;
