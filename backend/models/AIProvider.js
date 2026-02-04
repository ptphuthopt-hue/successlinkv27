const { dbAsync } = require('../config/database');
const { encrypt, decrypt } = require('../utils/encryption');

class AIProvider {
    // Create new AI provider
    static async create(providerData) {
        const {
            name,
            display_name,
            api_key,
            endpoint,
            model,
            priority = 5,
            rate_limit = 60,
            cost_per_1k_tokens = 0
        } = providerData;

        // Encrypt API key
        const encryptedKey = encrypt(api_key);

        const sql = `
            INSERT INTO ai_providers (
                name, display_name, api_key, endpoint, model,
                priority, rate_limit, cost_per_1k_tokens
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await dbAsync.run(sql, [
            name,
            display_name,
            encryptedKey,
            endpoint,
            model,
            priority,
            rate_limit,
            cost_per_1k_tokens
        ]);

        return result.id;
    }

    // Get all providers
    static async getAll(includeInactive = false) {
        let sql = 'SELECT * FROM ai_providers';

        if (!includeInactive) {
            sql += ' WHERE is_active = 1';
        }

        sql += ' ORDER BY priority ASC, created_at ASC';

        const providers = await dbAsync.all(sql);

        // Decrypt API keys
        return providers.map(provider => ({
            ...provider,
            api_key: decrypt(provider.api_key),
            is_active: !!provider.is_active
        }));
    }

    // Get provider by ID
    static async findById(id) {
        const sql = 'SELECT * FROM ai_providers WHERE id = ?';
        const provider = await dbAsync.get(sql, [id]);

        if (!provider) return null;

        return {
            ...provider,
            api_key: decrypt(provider.api_key),
            is_active: !!provider.is_active
        };
    }

    // Get provider by name
    static async findByName(name) {
        const sql = 'SELECT * FROM ai_providers WHERE name = ?';
        const provider = await dbAsync.get(sql, [name]);

        if (!provider) return null;

        return {
            ...provider,
            api_key: decrypt(provider.api_key),
            is_active: !!provider.is_active
        };
    }

    // Update provider
    static async update(id, providerData) {
        const {
            display_name,
            api_key,
            endpoint,
            model,
            is_active,
            priority,
            rate_limit,
            cost_per_1k_tokens
        } = providerData;

        // Encrypt API key if provided
        const encryptedKey = api_key ? encrypt(api_key) : undefined;

        const updates = [];
        const values = [];

        if (display_name !== undefined) {
            updates.push('display_name = ?');
            values.push(display_name);
        }
        if (encryptedKey) {
            updates.push('api_key = ?');
            values.push(encryptedKey);
        }
        if (endpoint !== undefined) {
            updates.push('endpoint = ?');
            values.push(endpoint);
        }
        if (model !== undefined) {
            updates.push('model = ?');
            values.push(model);
        }
        if (is_active !== undefined) {
            updates.push('is_active = ?');
            values.push(is_active ? 1 : 0);
        }
        if (priority !== undefined) {
            updates.push('priority = ?');
            values.push(priority);
        }
        if (rate_limit !== undefined) {
            updates.push('rate_limit = ?');
            values.push(rate_limit);
        }
        if (cost_per_1k_tokens !== undefined) {
            updates.push('cost_per_1k_tokens = ?');
            values.push(cost_per_1k_tokens);
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        const sql = `UPDATE ai_providers SET ${updates.join(', ')} WHERE id = ?`;

        await dbAsync.run(sql, values);
        return await this.findById(id);
    }

    // Delete provider
    static async delete(id) {
        const sql = 'DELETE FROM ai_providers WHERE id = ?';
        await dbAsync.run(sql, [id]);
        return true;
    }

    // Update usage stats
    static async updateUsage(id, tokens, cost) {
        const sql = `
            UPDATE ai_providers 
            SET usage_count = usage_count + 1,
                total_cost = total_cost + ?,
                last_used_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        await dbAsync.run(sql, [cost, id]);
    }

    // Get active providers sorted by priority
    static async getActiveProviders() {
        const sql = `
            SELECT * FROM ai_providers 
            WHERE is_active = 1 
            ORDER BY priority ASC
        `;

        const providers = await dbAsync.all(sql);

        return providers.map(provider => ({
            ...provider,
            api_key: decrypt(provider.api_key),
            is_active: true
        }));
    }

    // Get provider stats
    static async getStats() {
        const sql = `
            SELECT 
                COUNT(*) as total_providers,
                COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_providers,
                SUM(usage_count) as total_requests,
                SUM(total_cost) as total_cost
            FROM ai_providers
        `;

        return await dbAsync.get(sql);
    }
}

module.exports = AIProvider;
