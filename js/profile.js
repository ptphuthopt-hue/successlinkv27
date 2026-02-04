// Profile Menu Handler
const ProfileMenu = {
    init() {
        this.profileButton = document.getElementById('profile-button');
        this.profileDropdown = document.getElementById('profile-dropdown');
        this.editNameBtn = document.getElementById('edit-name-btn');
        this.logoutBtn = document.getElementById('logout-btn');

        if (!this.profileButton) return;

        // Load user data
        this.loadUserData();

        // Bind events
        this.profileButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.profileDropdown.contains(e.target) && e.target !== this.profileButton) {
                this.closeDropdown();
            }
        });

        // Edit name button
        if (this.editNameBtn) {
            this.editNameBtn.addEventListener('click', () => this.handleEditName());
        }

        // Logout button
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    },

    loadUserData() {
        const user = AuthService.getCurrentUser();

        if (!user) {
            console.warn('No user data found');
            return;
        }

        // Update profile name
        const profileName = document.getElementById('profile-name');
        const profileEmail = document.getElementById('profile-email');
        const profileAvatar = document.getElementById('profile-avatar');
        const profileAvatarLarge = document.getElementById('profile-avatar-large');
        const tierBadge = document.getElementById('tier-badge');

        if (profileName) profileName.textContent = user.name || 'User';
        if (profileEmail) profileEmail.textContent = user.email || '';

        // Set avatar initial (first letter of name)
        const initial = (user.name || 'U').charAt(0).toUpperCase();
        if (profileAvatar) profileAvatar.textContent = initial;
        if (profileAvatarLarge) profileAvatarLarge.textContent = initial;

        // Set subscription tier
        const tier = user.subscription_tier || 'free';
        if (tierBadge) {
            tierBadge.textContent = tier === 'pro' ? 'Pro ✨' : 'Free';
            tierBadge.className = 'tier-badge';
            if (tier === 'pro') {
                tierBadge.classList.add('pro');
            }
        }
    },

    toggleDropdown() {
        this.profileDropdown.classList.toggle('active');
    },

    closeDropdown() {
        this.profileDropdown.classList.remove('active');
    },

    async handleEditName() {
        const user = AuthService.getCurrentUser();
        const currentName = user?.name || '';

        const newName = prompt('Nhập tên mới:', currentName);

        if (!newName || newName.trim() === '') {
            alert('Tên không được để trống!');
            return;
        }

        if (newName === currentName) {
            return; // No change
        }

        try {
            // Show loading
            this.showLoading('Đang cập nhật...');

            // Call API to update name
            const response = await fetch(`${Config.API_BASE_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AuthService.getToken()}`
                },
                body: JSON.stringify({
                    name: newName.trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Cập nhật thất bại');
            }

            // Update local storage
            const updatedUser = { ...user, name: newName.trim() };
            AuthService.setCurrentUser(updatedUser);

            // Reload user data in UI
            this.loadUserData();

            this.hideLoading();
            alert('Cập nhật tên thành công!');

        } catch (error) {
            this.hideLoading();
            console.error('Error updating name:', error);
            alert(error.message || 'Có lỗi xảy ra khi cập nhật tên. Vui lòng thử lại.');
        }
    },

    handleLogout() {
        if (!confirm('Bạn có chắc muốn đăng xuất?')) {
            return;
        }

        // Clear authentication data
        AuthService.logout();

        // Redirect to login screen
        const loginScreen = document.getElementById('login-screen');
        const workspaceScreen = document.getElementById('workspace-screen');

        if (loginScreen) loginScreen.classList.add('active');
        if (workspaceScreen) workspaceScreen.classList.remove('active');

        // Close dropdown
        this.closeDropdown();

        // Optional: Reload page to clear all state
        // window.location.reload();
    },

    showLoading(message = 'Đang xử lý...') {
        const loadingHTML = `
            <div id="profile-loading" style="
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
        `;
        document.body.insertAdjacentHTML('beforeend', loadingHTML);
    },

    hideLoading() {
        const loading = document.getElementById('profile-loading');
        if (loading) {
            loading.remove();
        }
    }
};

// Initialize when workspace screen is shown
document.addEventListener('DOMContentLoaded', () => {
    // Check if workspace screen is active
    const workspaceScreen = document.getElementById('workspace-screen');
    if (workspaceScreen && workspaceScreen.classList.contains('active')) {
        ProfileMenu.init();
    }

    // Also initialize when workspace becomes active
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.id === 'workspace-screen' &&
                mutation.target.classList.contains('active')) {
                ProfileMenu.init();
            }
        });
    });

    if (workspaceScreen) {
        observer.observe(workspaceScreen, { attributes: true, attributeFilter: ['class'] });
    }
});
