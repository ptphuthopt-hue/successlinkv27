// Google OAuth Login Handler
// NOTE: Replace 'YOUR_GOOGLE_CLIENT_ID' with actual Client ID from Google Cloud Console

const GoogleLogin = {
    GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
    API_BASE_URL: 'https://successlinkv2-backend.onrender.com/api',

    init() {
        // Wait for Google Identity Services to load
        if (typeof google !== 'undefined') {
            this.initializeGoogleSignIn();
        } else {
            window.addEventListener('load', () => {
                setTimeout(() => this.initializeGoogleSignIn(), 500);
            });
        }

        // Bind auth tab switchers
        const authTabs = document.querySelectorAll('.auth-tab');
        authTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchAuthTab(tabName);

                // Update active tab
                authTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });

        // Bind email login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEmailLogin();
            });
        }

        // Bind email register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEmailRegister();
            });
        }

        // Check if already logged in
        this.checkLoginStatus();

        // Check for admin auto-login parameter
        this.checkAdminAutoLogin();
    },

    checkAdminAutoLogin() {
        // Check if URL has ?admin=true parameter
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('admin') === 'true') {
            console.log('🔐 Admin auto-login detected');

            // Fill in admin credentials
            const emailInput = document.getElementById('login-email');
            const passwordInput = document.getElementById('login-password');

            if (emailInput && passwordInput) {
                emailInput.value = 'admin@successlink.com';
                passwordInput.value = 'admin123';

                // Auto-submit after a short delay
                setTimeout(() => {
                    console.log('🚀 Auto-submitting admin login...');
                    this.handleEmailLogin();
                }, 500);
            }
        }
    },

    switchAuthTab(tabName) {
        // Hide all forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });

        // Show selected form
        const targetForm = document.getElementById(`${tabName}-form`);
        if (targetForm) {
            targetForm.classList.add('active');
        }
    },

    checkLoginStatus() {
        // Check if user is already logged in
        if (typeof AuthService !== 'undefined' && AuthService.isAuthenticated()) {
            const user = AuthService.getCurrentUser();

            // Check if user has completed onboarding
            if (user && user.teaching_level && user.subject) {
                this.navigateToWorkspace();
            } else {
                this.navigateToOnboarding();
            }
        }
    },

    navigateToOnboarding() {
        const loginScreen = document.getElementById('login-screen');
        const onboardingScreen = document.getElementById('onboarding-screen');

        if (loginScreen) loginScreen.classList.remove('active');
        if (onboardingScreen) onboardingScreen.classList.add('active');
    },

    navigateToWorkspace() {
        const loginScreen = document.getElementById('login-screen');
        const onboardingScreen = document.getElementById('onboarding-screen');
        const workspaceScreen = document.getElementById('workspace-screen');

        if (loginScreen) loginScreen.classList.remove('active');
        if (onboardingScreen) onboardingScreen.classList.remove('active');
        if (workspaceScreen) workspaceScreen.classList.add('active');
    },

    showLoading(message = 'Đang xử lý...') {
        const loadingHTML = `
            <div id="google-loading" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            ">
                <div style="
                    background: white;
                    padding: 2rem;
                    border-radius: 1rem;
                    text-align: center;
                ">
                    <div class="loading-spinner" style="
                        width: 40px;
                        height: 40px;
                        border: 4px solid #f3f3f3;
                        border-top: 4px solid #4DA8DA;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 1rem;
                    "></div>
                    <p style="margin: 0; color: #333;">${message}</p>
                </div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.insertAdjacentHTML('beforeend', loadingHTML);
    },

    async handleEmailLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            alert('Vui lòng nhập đầy đủ email và mật khẩu!');
            return;
        }

        this.showLoading('Đang đăng nhập...');

        try {
            const response = await fetch(`${this.API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Đăng nhập thất bại');
            }

            // Save token and user data
            AuthService.setToken(data.data.token);
            AuthService.setCurrentUser(data.data.user);

            this.hideLoading();

            // Check where to redirect
            this.checkLoginStatus();

        } catch (error) {
            this.hideLoading();
            alert(error.message || 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.');
        }
    },

    async handleEmailRegister() {
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        if (!name || !email || !password) {
            alert('Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        if (password.length < 6) {
            alert('Mật khẩu phải có ít nhất 6 ký tự!');
            return;
        }

        this.showLoading('Đang đăng ký...');

        try {
            const response = await fetch(`${this.API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    role: 'teacher' // Default role
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Đăng ký thất bại');
            }

            // Save token and user data
            AuthService.setToken(data.data.token);
            AuthService.setCurrentUser(data.data.user);

            this.hideLoading();

            // New user goes to onboarding
            this.navigateToOnboarding();
            alert('Đăng ký thành công! Chào mừng bạn đến với Successlink.');

        } catch (error) {
            this.hideLoading();
            alert(error.message || 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.');
        }
    },

    hideLoading() {
        const loading = document.getElementById('google-loading');
        if (loading) {
            loading.remove();
        }
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GoogleLogin.init());
} else {
    GoogleLogin.init();
}
