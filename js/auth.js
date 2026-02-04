// API Configuration
const API_BASE_URL = Config.API_BASE_URL;

// Authentication service
const AuthService = {
    // Get token from localStorage
    getToken() {
        return Storage.get('authToken');
    },

    // Set token in localStorage
    setToken(token) {
        Storage.set('authToken', token);
    },

    // Remove token
    removeToken() {
        Storage.remove('authToken');
    },

    // Get current user
    getCurrentUser() {
        return Storage.get('currentUser');
    },

    // Set current user
    setCurrentUser(user) {
        Storage.set('currentUser', user);
    },

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.getToken();
    },

    // Register new user
    async register(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Save token and user data
            this.setToken(data.data.token);
            this.setCurrentUser(data.data.user);

            return data.data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    // Login user
    async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Save token and user data
            this.setToken(data.data.token);
            this.setCurrentUser(data.data.user);

            return data.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    // Logout user
    logout() {
        this.removeToken();
        Storage.remove('currentUser');
        Storage.remove('userPreferences');

        // Redirect to login
        window.location.reload();
    },

    // Get user profile
    async getProfile() {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to get profile');
            }

            return data.data;
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    },

    // Update user profile
    async updateProfile(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            this.setCurrentUser(data.data.user);

            return data.data;
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    }
};

// Show login/register modal
function showAuthModal(mode = 'login') {
    const modalHTML = `
        <div id="auth-modal" class="auth-modal">
            <div class="auth-modal-content">
                <button class="auth-modal-close" onclick="closeAuthModal()">×</button>
                
                <h2 id="auth-title">${mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}</h2>
                
                <form id="auth-form">
                    ${mode === 'register' ? `
                        <div class="form-group">
                            <label>Họ tên (tùy chọn)</label>
                            <input type="text" id="auth-name" class="form-input" placeholder="Nguyễn Văn A">
                        </div>
                    ` : ''}
                    
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="auth-email" class="form-input" placeholder="email@example.com" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Mật khẩu</label>
                        <input type="password" id="auth-password" class="form-input" placeholder="••••••••" required>
                    </div>
                    
                    ${mode === 'register' ? `
                        <input type="hidden" id="auth-level" value="">
                        <input type="hidden" id="auth-subject" value="">
                    ` : ''}
                    
                    <div id="auth-error" class="auth-error" style="display: none;"></div>
                    
                    <button type="submit" class="btn-primary btn-full">${mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}</button>
                </form>
                
                <p class="auth-switch">
                    ${mode === 'login'
            ? 'Chưa có tài khoản? <a href="#" onclick="switchAuthMode(\'register\')">Đăng ký ngay</a>'
            : 'Đã có tài khoản? <a href="#" onclick="switchAuthMode(\'login\')">Đăng nhập</a>'
        }
                </p>
            </div>
        </div>
        
        <style>
            .auth-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
                animation: fadeIn 0.3s;
            }
            
            .auth-modal-content {
                background: white;
                padding: 2rem;
                border-radius: 1rem;
                max-width: 400px;
                width: 90%;
                position: relative;
                animation: slideUp 0.3s;
            }
            
            .auth-modal-close {
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: none;
                border: none;
                font-size: 2rem;
                cursor: pointer;
                color: #6B7280;
            }
            
            .form-group {
                margin-bottom: 1rem;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 600;
                color: #333;
            }
            
            .form-input {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid #E5E7EB;
                border-radius: 0.5rem;
                font-size: 1rem;
                transition: all 0.2s;
            }
            
            .form-input:focus {
                outline: none;
                border-color: #4DA8DA;
                box-shadow: 0 0 0 3px rgba(77, 168, 218, 0.1);
            }
            
            .btn-full {
                width: 100%;
                margin-top: 1rem;
            }
            
            .auth-error {
                background: #FEE2E2;
                color: #DC2626;
                padding: 0.75rem;
                border-radius: 0.5rem;
                margin-bottom: 1rem;
                font-size: 0.875rem;
            }
            
            .auth-switch {
                text-align: center;
                margin-top: 1.5rem;
                color: #6B7280;
            }
            
            .auth-switch a {
                color: #4DA8DA;
                text-decoration: none;
                font-weight: 600;
            }
            
            @keyframes slideUp {
                from {
                    transform: translateY(20px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
        </style>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Bind form submit
    document.getElementById('auth-form').addEventListener('submit', handleAuthSubmit);
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.remove();
    }
}

function switchAuthMode(mode) {
    closeAuthModal();
    showAuthModal(mode);
}

async function handleAuthSubmit(e) {
    e.preventDefault();

    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const errorDiv = document.getElementById('auth-error');

    // Hide previous errors
    errorDiv.style.display = 'none';

    try {
        const title = document.getElementById('auth-title').textContent;

        if (title === 'Đăng ký') {
            // Get onboarding data from localStorage
            const preferences = Storage.get('userPreferences');
            if (!preferences) {
                throw new Error('Vui lòng hoàn tất thiết lập ban đầu');
            }

            const name = document.getElementById('auth-name').value;

            await AuthService.register({
                email,
                password,
                name,
                teaching_level: preferences.level,
                subject: preferences.subject
            });
        } else {
            await AuthService.login(email, password);
        }

        closeAuthModal();

        // Reload to update UI
        window.location.reload();

    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
    }
}
