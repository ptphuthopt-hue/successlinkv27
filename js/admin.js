// Admin Dashboard JavaScript
const AdminDashboard = {
    API_BASE_URL: Config.API_BASE_URL,
    currentView: 'dashboard',
    charts: {},

    init() {
        // Check if user is admin
        this.checkAdminAccess();

        // Setup navigation
        this.setupNavigation();

        // Setup event listeners
        this.setupEventListeners();

        // Load initial data
        this.loadDashboardData();
    },

    async checkAdminAccess() {
        if (typeof AuthService === 'undefined' || !AuthService.isAuthenticated()) {
            window.location.href = '/index.html';
            return;
        }

        const user = AuthService.getCurrentUser();

        // TEMPORARY: Disable admin check for testing
        // TODO: Re-enable after backend is deployed with proper admin user
        /*
        if (!user || user.role !== 'admin') {
            // Show error but don't redirect - stay on admin page
            const errorMsg = document.createElement('div');
            errorMsg.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 2rem;
                border-radius: 1rem;
                box-shadow: 0 8px 24px rgba(0,0,0,0.2);
                z-index: 10000;
                text-align: center;
                max-width: 400px;
            `;
            errorMsg.innerHTML = `
                <h2 style="color: #dc3545; margin-bottom: 1rem;">⚠️ Access Denied</h2>
                <p style="margin-bottom: 1.5rem;">Admin privileges required.</p>
                <p style="font-size: 0.9rem; color: #666; margin-bottom: 1rem;">
                    Current user: <strong>${user?.email || 'Not logged in'}</strong><br>
                    Role: <strong>${user?.role || 'none'}</strong>
                </p>
                <p style="font-size: 0.85rem; color: #999;">
                    Please contact system administrator to grant admin access.
                </p>
            `;
            document.body.appendChild(errorMsg);

            // Disable all interactive elements except the error message
            document.querySelectorAll('button, a, input, select').forEach(el => {
                el.style.pointerEvents = 'none';
                el.style.opacity = '0.5';
            });
            return;
        }
        */

        // Display admin info
        document.getElementById('admin-name').textContent = user.name || 'Admin';
        document.getElementById('admin-email').textContent = user.email;

        if (user.profile_picture) {
            document.getElementById('admin-avatar').src = user.profile_picture;
        }
    },

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();

                const view = item.dataset.view;
                this.switchView(view);

                // Update active state
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });
    },

    switchView(view) {
        // Hide all views
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

        // Show selected view
        document.getElementById(`${view}-view`).classList.add('active');

        this.currentView = view;

        // Load data for view
        switch (view) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'users':
                this.loadUsers();
                break;
            case 'ai-providers':
                this.loadProviders();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
        }
    },

    setupEventListeners() {
        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            AuthService.logout();
            window.location.href = '/index.html';
        });

        // User search
        const userSearch = document.getElementById('user-search');
        if (userSearch) {
            let searchTimeout;
            userSearch.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.loadUsers(1, e.target.value);
                }, 500);
            });
        }

        // Add provider button
        document.getElementById('add-provider-btn').addEventListener('click', () => {
            this.showProviderModal();
        });

        // Provider form
        document.getElementById('provider-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProvider();
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModal();
            });
        });

        // Provider type change
        document.getElementById('provider-type').addEventListener('change', (e) => {
            this.updateProviderDefaults(e.target.value);
        });

        // Analytics period change
        const analyticsPeriod = document.getElementById('analytics-period');
        if (analyticsPeriod) {
            analyticsPeriod.addEventListener('change', (e) => {
                this.loadAnalytics(e.target.value);
            });
        }
    },

    async apiCall(endpoint, options = {}) {
        const token = AuthService.getToken();

        const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...options.headers
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    },

    // Dashboard Methods
    async loadDashboardData() {
        try {
            const { data } = await this.apiCall('/admin/stats');

            // Update stats cards
            document.getElementById('stat-total-users').textContent = data.users.total_users;
            document.getElementById('stat-new-users').textContent = `+${data.users.new_users_week} tuần này`;

            document.getElementById('stat-total-lessons').textContent = data.lessons.total_lessons;
            document.getElementById('stat-new-lessons').textContent = `+${data.lessons.new_lessons_week} tuần này`;

            document.getElementById('stat-ai-requests').textContent = data.ai.usage?.total_requests || 0;
            document.getElementById('stat-avg-response').textContent =
                `~${Math.round(data.ai.usage?.avg_response_time || 0)}ms`;

            document.getElementById('stat-total-cost').textContent =
                `$${(data.ai.usage?.total_cost || 0).toFixed(2)}`;

            // Create charts
            this.createUsageTrendChart(data.ai.daily || []);
            this.createProviderDistributionChart();

            // Load recent users
            this.loadRecentUsers();
        } catch (error) {
            console.error('Error loading dashboard:', error);
            alert('Failed to load dashboard data');
        }
    },

    createUsageTrendChart(dailyData) {
        const ctx = document.getElementById('usage-trend-chart');

        // Destroy existing chart
        if (this.charts.usageTrend) {
            this.charts.usageTrend.destroy();
        }

        const labels = dailyData.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
        });

        const requests = dailyData.map(d => d.requests);
        const costs = dailyData.map(d => d.cost);

        this.charts.usageTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Requests',
                        data: requests,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Cost ($)',
                        data: costs,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#cbd5e1'
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        position: 'left',
                        ticks: { color: '#cbd5e1' },
                        grid: { color: '#334155' }
                    },
                    y1: {
                        type: 'linear',
                        position: 'right',
                        ticks: { color: '#cbd5e1' },
                        grid: { display: false }
                    },
                    x: {
                        ticks: { color: '#cbd5e1' },
                        grid: { color: '#334155' }
                    }
                }
            }
        });
    },

    async createProviderDistributionChart() {
        try {
            const { data } = await this.apiCall('/admin/analytics/usage?days=30');

            const ctx = document.getElementById('provider-distribution-chart');

            if (this.charts.providerDist) {
                this.charts.providerDist.destroy();
            }

            const labels = data.byProvider.map(p => p.provider);
            const requests = data.byProvider.map(p => p.requests);

            const colors = [
                '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'
            ];

            this.charts.providerDist = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels,
                    datasets: [{
                        data: requests,
                        backgroundColor: colors,
                        borderColor: '#1e293b',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#cbd5e1',
                                padding: 15
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error loading provider distribution:', error);
        }
    },

    async loadRecentUsers() {
        try {
            const { data } = await this.apiCall('/admin/users?limit=5');

            const container = document.getElementById('recent-users');

            if (data.users.length === 0) {
                container.innerHTML = '<p class="loading">No users yet</p>';
                return;
            }

            container.innerHTML = data.users.map(user => `
                <div class="activity-item">
                    <img src="${user.profile_picture || '/default-avatar.png'}" 
                         alt="${user.name}" 
                         style="width: 40px; height: 40px; border-radius: 50%; background: #334155;">
                    <div style="flex: 1;">
                        <p style="font-weight: 600; color: #f1f5f9;">${user.name || user.email}</p>
                        <p style="font-size: 0.875rem; color: #94a3b8;">
                            ${user.teaching_level || 'N/A'} • ${user.lesson_count} lessons
                        </p>
                    </div>
                    <span class="badge badge-${user.role}">${user.role}</span>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading recent users:', error);
        }
    },

    // User Management Methods
    async loadUsers(page = 1, search = '') {
        try {
            const { data } = await this.apiCall(`/admin/users?page=${page}&limit=20&search=${search}`);

            const tbody = document.getElementById('users-table-body');

            if (data.users.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="loading">No users found</td></tr>';
                return;
            }

            tbody.innerHTML = data.users.map(user => `
                <tr>
                    <td>${user.email}</td>
                    <td>${user.name || '-'}</td>
                    <td>${user.teaching_level || '-'}</td>
                    <td>${user.subject || '-'}</td>
                    <td><span class="badge badge-${user.role}">${user.role}</span></td>
                    <td>${user.lesson_count}</td>
                    <td>${new Date(user.created_at).toLocaleDateString('vi-VN')}</td>
                    <td>
                        ${user.role === 'teacher' ?
                    `<button class="btn-sm btn-primary" onclick="AdminDashboard.promoteToAdmin(${user.id})">
                                Make Admin
                            </button>` :
                    `<button class="btn-sm btn-secondary" onclick="AdminDashboard.demoteToTeacher(${user.id})">
                                Remove Admin
                            </button>`
                }
                    </td>
                </tr>
            `).join('');

            // Update pagination
            this.updatePagination(data.pagination, search);
        } catch (error) {
            console.error('Error loading users:', error);
            alert('Failed to load users');
        }
    },

    updatePagination(pagination, search) {
        const container = document.getElementById('users-pagination');

        const buttons = [];

        // Previous button
        buttons.push(`
            <button ${pagination.page === 1 ? 'disabled' : ''} 
                    onclick="AdminDashboard.loadUsers(${pagination.page - 1}, '${search}')">
                Previous
            </button>
        `);

        // Page numbers
        for (let i = 1; i <= pagination.pages; i++) {
            buttons.push(`
                <button class="${i === pagination.page ? 'active' : ''}"
                        onclick="AdminDashboard.loadUsers(${i}, '${search}')">
                    ${i}
                </button>
            `);
        }

        // Next button
        buttons.push(`
            <button ${pagination.page === pagination.pages ? 'disabled' : ''}
                    onclick="AdminDashboard.loadUsers(${pagination.page + 1}, '${search}')">
                Next
            </button>
        `);

        container.innerHTML = buttons.join('');
    },

    async promoteToAdmin(userId) {
        if (!confirm('Are you sure you want to make this user an admin?')) return;

        try {
            await this.apiCall(`/admin/users/${userId}/role`, {
                method: 'PUT',
                body: JSON.stringify({ role: 'admin' })
            });

            alert('User promoted to admin successfully');
            this.loadUsers();
        } catch (error) {
            console.error('Error promoting user:', error);
            alert('Failed to promote user');
        }
    },

    async demoteToTeacher(userId) {
        if (!confirm('Remove admin privileges from this user?')) return;

        try {
            await this.apiCall(`/admin/users/${userId}/role`, {
                method: 'PUT',
                body: JSON.stringify({ role: 'teacher' })
            });

            alert('Admin privileges removed');
            this.loadUsers();
        } catch (error) {
            console.error('Error demoting user:', error);
            alert('Failed to update user role');
        }
    },

    // AI Provider Methods (continued in next part)
    async loadProviders() {
        try {
            const { data } = await this.apiCall('/admin/ai-providers');

            const container = document.getElementById('providers-grid');

            if (data.providers.length === 0) {
                container.innerHTML = '<p class="loading">No providers configured yet</p>';
                return;
            }

            container.innerHTML = data.providers.map(provider => `
                <div class="provider-card">
                    <div class="provider-header">
                        <h3 class="provider-name">${provider.display_name}</h3>
                        <div class="provider-toggle ${provider.is_active ? 'active' : ''}"
                             onclick="AdminDashboard.toggleProvider(${provider.id}, ${!provider.is_active})">
                        </div>
                    </div>
                    
                    <div class="provider-stats">
                        <div class="provider-stat">
                            <p class="provider-stat-label">Priority</p>
                            <p class="provider-stat-value">${provider.priority}</p>
                        </div>
                        <div class="provider-stat">
                            <p class="provider-stat-label">Usage</p>
                            <p class="provider-stat-value">${provider.usage_count}</p>
                        </div>
                        <div class="provider-stat">
                            <p class="provider-stat-label">Cost</p>
                            <p class="provider-stat-value">$${provider.total_cost.toFixed(2)}</p>
                        </div>
                        <div class="provider-stat">
                            <p class="provider-stat-label">Rate Limit</p>
                            <p class="provider-stat-value">${provider.rate_limit}/min</p>
                        </div>
                    </div>
                    
                    <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1rem;">
                        Model: ${provider.model || 'N/A'}
                    </p>
                    
                    <div class="provider-actions">
                        <button class="btn-sm btn-secondary" 
                                onclick="AdminDashboard.testProvider(${provider.id})">
                            Test
                        </button>
                        <button class="btn-sm btn-primary" 
                                onclick="AdminDashboard.editProvider(${provider.id})">
                            Edit
                        </button>
                        <button class="btn-sm btn-danger" 
                                onclick="AdminDashboard.deleteProvider(${provider.id})">
                            Delete
                        </button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading providers:', error);
            alert('Failed to load providers');
        }
    },

    showProviderModal(providerId = null) {
        const modal = document.getElementById('provider-modal');
        const form = document.getElementById('provider-form');

        form.reset();
        form.dataset.providerId = providerId || '';

        if (providerId) {
            document.getElementById('modal-title').textContent = 'Edit AI Provider';
            this.loadProviderData(providerId);
        } else {
            document.getElementById('modal-title').textContent = 'Add AI Provider';
        }

        modal.classList.add('active');
    },

    async loadProviderData(providerId) {
        try {
            const { data } = await this.apiCall('/admin/ai-providers');
            const provider = data.providers.find(p => p.id === providerId);

            if (!provider) return;

            document.getElementById('provider-type').value = provider.name;
            document.getElementById('provider-display-name').value = provider.display_name;
            document.getElementById('provider-api-key').value = provider.api_key;
            document.getElementById('provider-endpoint').value = provider.endpoint || '';
            document.getElementById('provider-model').value = provider.model || '';
            document.getElementById('provider-priority').value = provider.priority;
            document.getElementById('provider-rate-limit').value = provider.rate_limit;
            document.getElementById('provider-cost').value = provider.cost_per_1k_tokens;
        } catch (error) {
            console.error('Error loading provider data:', error);
        }
    },

    updateProviderDefaults(providerType) {
        const defaults = {
            gemini: {
                display_name: 'Google Gemini',
                endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
                model: 'gemini-pro',
                cost: 0
            },
            openrouter: {
                display_name: 'OpenRouter',
                endpoint: 'https://openrouter.ai/api/v1/chat/completions',
                model: 'gpt-3.5-turbo',
                cost: 0.002
            },
            chatgpt: {
                display_name: 'OpenAI ChatGPT',
                endpoint: 'https://api.openai.com/v1/chat/completions',
                model: 'gpt-4',
                cost: 0.03
            },
            claude: {
                display_name: 'Anthropic Claude',
                endpoint: 'https://api.anthropic.com/v1/messages',
                model: 'claude-3-sonnet',
                cost: 0.015
            }
        };

        const config = defaults[providerType];
        if (config) {
            document.getElementById('provider-display-name').value = config.display_name;
            document.getElementById('provider-endpoint').value = config.endpoint;
            document.getElementById('provider-model').value = config.model;
            document.getElementById('provider-cost').value = config.cost;
        }
    },

    async saveProvider() {
        const form = document.getElementById('provider-form');
        const providerId = form.dataset.providerId;

        const providerData = {
            name: document.getElementById('provider-type').value,
            display_name: document.getElementById('provider-display-name').value,
            api_key: document.getElementById('provider-api-key').value,
            endpoint: document.getElementById('provider-endpoint').value,
            model: document.getElementById('provider-model').value,
            priority: parseInt(document.getElementById('provider-priority').value),
            rate_limit: parseInt(document.getElementById('provider-rate-limit').value),
            cost_per_1k_tokens: parseFloat(document.getElementById('provider-cost').value)
        };

        try {
            if (providerId) {
                // Update existing
                await this.apiCall(`/admin/ai-providers/${providerId}`, {
                    method: 'PUT',
                    body: JSON.stringify(providerData)
                });
                alert('Provider updated successfully');
            } else {
                // Create new
                await this.apiCall('/admin/ai-providers', {
                    method: 'POST',
                    body: JSON.stringify(providerData)
                });
                alert('Provider added successfully');
            }

            this.closeModal();
            this.loadProviders();
        } catch (error) {
            console.error('Error saving provider:', error);
            alert(error.message || 'Failed to save provider');
        }
    },

    async toggleProvider(providerId, isActive) {
        try {
            await this.apiCall(`/admin/ai-providers/${providerId}`, {
                method: 'PUT',
                body: JSON.stringify({ is_active: isActive })
            });

            this.loadProviders();
        } catch (error) {
            console.error('Error toggling provider:', error);
            alert('Failed to update provider status');
        }
    },

    async testProvider(providerId) {
        try {
            const { data } = await this.apiCall(`/admin/ai-providers/${providerId}/test`, {
                method: 'POST'
            });

            alert(`✅ Connection successful!\nProvider: ${data.provider}\nLatency: ${data.latency}ms`);
        } catch (error) {
            console.error('Error testing provider:', error);
            alert('❌ Connection failed: ' + error.message);
        }
    },

    editProvider(providerId) {
        this.showProviderModal(providerId);
    },

    async deleteProvider(providerId) {
        if (!confirm('Are you sure you want to delete this provider?')) return;

        try {
            await this.apiCall(`/admin/ai-providers/${providerId}`, {
                method: 'DELETE'
            });

            alert('Provider deleted successfully');
            this.loadProviders();
        } catch (error) {
            console.error('Error deleting provider:', error);
            alert('Failed to delete provider');
        }
    },

    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    },

    // Analytics Methods
    async loadAnalytics(days = 30) {
        try {
            const { data } = await this.apiCall(`/admin/analytics/usage?days=${days}`);

            // Create daily trend chart
            this.createDailyTrendChart(data.dailyTrend);

            // Create cost by provider chart
            this.createCostByProviderChart(data.byProvider);

            // Update top users table
            this.updateTopUsersTable(data.topUsers);

            // Update provider performance table
            this.updateProviderPerformanceTable(data.byProvider);
        } catch (error) {
            console.error('Error loading analytics:', error);
            alert('Failed to load analytics');
        }
    },

    createDailyTrendChart(dailyData) {
        const ctx = document.getElementById('analytics-daily-chart');

        if (this.charts.dailyTrend) {
            this.charts.dailyTrend.destroy();
        }

        const labels = dailyData.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
        });

        this.charts.dailyTrend = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Requests',
                    data: dailyData.map(d => d.requests),
                    backgroundColor: '#3b82f6',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#cbd5e1' }
                    }
                },
                scales: {
                    y: {
                        ticks: { color: '#cbd5e1' },
                        grid: { color: '#334155' }
                    },
                    x: {
                        ticks: { color: '#cbd5e1' },
                        grid: { color: '#334155' }
                    }
                }
            }
        });
    },

    createCostByProviderChart(providerData) {
        const ctx = document.getElementById('analytics-cost-chart');

        if (this.charts.costByProvider) {
            this.charts.costByProvider.destroy();
        }

        const labels = providerData.map(p => p.provider);
        const costs = providerData.map(p => p.cost);

        this.charts.costByProvider = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Cost ($)',
                    data: costs,
                    backgroundColor: '#10b981',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        labels: { color: '#cbd5e1' }
                    }
                },
                scales: {
                    y: {
                        ticks: { color: '#cbd5e1' },
                        grid: { color: '#334155' }
                    },
                    x: {
                        ticks: { color: '#cbd5e1' },
                        grid: { color: '#334155' }
                    }
                }
            }
        });
    },

    updateTopUsersTable(topUsers) {
        const tbody = document.getElementById('top-users-table');

        if (topUsers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="loading">No data</td></tr>';
            return;
        }

        tbody.innerHTML = topUsers.map(user => `
            <tr>
                <td>${user.name || user.email}</td>
                <td>${user.requests}</td>
                <td>$${user.cost.toFixed(2)}</td>
            </tr>
        `).join('');
    },

    updateProviderPerformanceTable(providerData) {
        const tbody = document.getElementById('provider-performance-table');

        if (providerData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="loading">No data</td></tr>';
            return;
        }

        tbody.innerHTML = providerData.map(provider => `
            <tr>
                <td>${provider.provider}</td>
                <td>${provider.requests}</td>
                <td>${(provider.tokens / 1000).toFixed(1)}K</td>
                <td>$${provider.cost.toFixed(2)}</td>
            </tr>
        `).join('');
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AdminDashboard.init());
} else {
    AdminDashboard.init();
}
