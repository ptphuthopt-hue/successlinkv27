const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Use in-memory database for production (Render), file-based for local
const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
const DB_PATH = isProduction ? ':memory:' : (process.env.DB_PATH || path.join(__dirname, '../database/successlink.db'));

// Only create directory for file-based database
if (!isProduction) {
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
        console.log(`Created database directory: ${dbDir}`);
    }
}

console.log(`Using database: ${isProduction ? 'In-Memory (Production)' : DB_PATH}`);

// Create database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initializeTables();
    }
});

// Initialize database tables
function initializeTables() {
    // Users table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT,
            name TEXT,
            teaching_level TEXT,
            subject TEXT,
            google_id TEXT UNIQUE,
            profile_picture TEXT,
            auth_provider TEXT DEFAULT 'email',
            role TEXT DEFAULT 'teacher',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating users table:', err.message);
        } else {
            console.log('Users table ready');
        }
    });

    // Lessons table
    db.run(`
        CREATE TABLE IF NOT EXISTS lessons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            content_types TEXT NOT NULL,
            generated_content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            deleted_at DATETIME,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `, (err) => {
        if (err) {
            console.error('Error creating lessons table:', err.message);
        } else {
            console.log('Lessons table ready');
        }
    });

    // AI Providers table
    db.run(`
        CREATE TABLE IF NOT EXISTS ai_providers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            display_name TEXT NOT NULL,
            api_key TEXT NOT NULL,
            endpoint TEXT,
            model TEXT,
            is_active BOOLEAN DEFAULT 1,
            priority INTEGER DEFAULT 5,
            rate_limit INTEGER DEFAULT 60,
            cost_per_1k_tokens REAL DEFAULT 0,
            usage_count INTEGER DEFAULT 0,
            total_cost REAL DEFAULT 0,
            last_used_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating ai_providers table:', err.message);
        } else {
            console.log('AI Providers table ready');
        }
    });

    // AI Usage Logs table
    db.run(`
        CREATE TABLE IF NOT EXISTS ai_usage_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            provider_id INTEGER,
            user_id INTEGER,
            lesson_id INTEGER,
            prompt_tokens INTEGER,
            completion_tokens INTEGER,
            total_tokens INTEGER,
            cost REAL,
            response_time_ms INTEGER,
            status TEXT,
            error_message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (provider_id) REFERENCES ai_providers(id),
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (lesson_id) REFERENCES lessons(id)
        )
    `, (err) => {
        if (err) {
            console.error('Error creating ai_usage_logs table:', err.message);
        } else {
            console.log('AI Usage Logs table ready');
        }
    });
}

// Promisify database methods for async/await
const dbAsync = {
    run: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    },

    get: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    all: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
};

module.exports = { db, dbAsync };
