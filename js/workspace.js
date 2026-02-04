// Creation workspace functionality

const Workspace = {
    selectedTypes: new Set(),
    lessonInput: '',
    uploadedFile: null,

    init() {
        this.bindEvents();
    },

    bindEvents() {
        // Lesson input
        const lessonInput = DOM.select('#lesson-input');
        if (lessonInput) {
            lessonInput.addEventListener('input', (e) => {
                this.lessonInput = e.target.value.trim();
                this.updateCreateButton();
            });
        }

        // File upload
        const fileUpload = DOM.select('#file-upload');
        if (fileUpload) {
            fileUpload.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        // Content type cards
        const contentCards = DOM.selectAll('.content-card');
        contentCards.forEach(card => {
            card.addEventListener('click', () => this.toggleContentType(card));
        });

        // Create button
        const createButton = DOM.select('#create-button');
        if (createButton) {
            createButton.addEventListener('click', () => this.createLesson());
        }
    },

    toggleContentType(card) {
        const type = card.dataset.type;

        if (this.selectedTypes.has(type)) {
            // Deselect
            this.selectedTypes.delete(type);
            DOM.removeClass(card, 'selected');
        } else {
            // Select
            this.selectedTypes.add(type);
            DOM.addClass(card, 'selected');
        }

        this.updateCreateButton();
    },

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.uploadedFile = file;

            // Update input placeholder
            const lessonInput = DOM.select('#lesson-input');
            if (lessonInput) {
                lessonInput.placeholder = `Đã tải lên: ${file.name}`;
            }

            this.updateCreateButton();
        }
    },

    updateCreateButton() {
        const createButton = DOM.select('#create-button');
        if (!createButton) return;

        // Enable button if we have input/file AND at least one content type selected
        const hasInput = this.lessonInput || this.uploadedFile;
        const hasContentType = this.selectedTypes.size > 0;

        createButton.disabled = !(hasInput && hasContentType);
    },

    async createLesson() {
        // Get user preferences (optional for now)
        const preferences = Storage.get('userPreferences');

        // TEMPORARY: Allow creation even without preferences for testing
        // if (!preferences) {
        //     alert('Vui lòng hoàn tất thiết lập ban đầu');
        //     return;
        // }

        // Prepare lesson title
        let lessonTitle = this.lessonInput;
        if (!lessonTitle && this.uploadedFile) {
            lessonTitle = this.uploadedFile.name.replace(/\.[^/.]+$/, '');
        }

        // Show loading
        this.showLoading();

        try {
            // Call backend API to generate content
            const contentTypes = Array.from(this.selectedTypes);
            const token = Storage.get('authToken');

            if (!token) {
                throw new Error('Vui lòng đăng nhập lại');
            }

            const response = await fetch('https://successlinkv2-backend.onrender.com/api/ai/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: lessonTitle,
                    content_types: contentTypes
                })
            });

            const data = await response.json();

            console.log('🔍 Backend response:', data);
            console.log('📦 Content data:', data.data);
            console.log('📄 Generated content:', data.data.content);

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Không thể tạo bài giảng');
            }

            // Validate content structure
            if (!data.data || !data.data.content) {
                throw new Error('Backend không trả về nội dung bài giảng');
            }

            // Save generated content
            const lessonData = {
                id: data.data.lesson_id,
                title: lessonTitle,
                content: data.data.content,
                createdAt: new Date().toISOString(),
                preferences: preferences || {}
            };

            console.log('💾 Saving to localStorage:', lessonData);
            Storage.set('currentLesson', lessonData);

            // Hide loading
            this.hideLoading();

            // Navigate to dashboard
            this.navigateToDashboard();

        } catch (error) {
            console.error('Error generating content:', error);
            this.hideLoading();
            alert('Đã xảy ra lỗi khi tạo bài giảng: ' + error.message);
        }
    },

    showLoading() {
        const loadingOverlay = DOM.select('#loading-overlay');
        DOM.removeClass(loadingOverlay, 'hidden');
    },

    hideLoading() {
        const loadingOverlay = DOM.select('#loading-overlay');
        DOM.addClass(loadingOverlay, 'hidden');
    },

    navigateToDashboard() {
        const workspaceScreen = DOM.select('#workspace-screen');
        const dashboardScreen = DOM.select('#dashboard-screen');

        DOM.removeClass(workspaceScreen, 'active');
        DOM.addClass(dashboardScreen, 'active');

        // Initialize dashboard with generated content
        if (window.Dashboard) {
            Dashboard.loadContent();
        }
    },

    reset() {
        // Clear selections
        this.selectedTypes.clear();
        this.lessonInput = '';
        this.uploadedFile = null;

        // Reset UI
        const contentCards = DOM.selectAll('.content-card');
        contentCards.forEach(card => DOM.removeClass(card, 'selected'));

        const lessonInput = DOM.select('#lesson-input');
        if (lessonInput) {
            lessonInput.value = '';
            lessonInput.placeholder = 'Nhập tên bài học hoặc tải lên tài liệu...';
        }

        const fileUpload = DOM.select('#file-upload');
        if (fileUpload) {
            fileUpload.value = '';
        }

        this.updateCreateButton();
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Workspace.init());
} else {
    Workspace.init();
}

