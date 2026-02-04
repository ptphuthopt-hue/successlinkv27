// Lesson History Handler
const LessonHistory = {
    lessons: [],
    filteredLessons: [],
    displayedCount: 0,
    itemsPerPage: 6,
    currentView: 'grid', // 'grid' or 'list'
    currentFilters: {
        grade: 'all',
        subject: 'all',
        sort: 'newest'
    },

    init() {
        this.lessonCards = document.getElementById('lesson-cards');
        this.emptyState = document.getElementById('empty-state');
        this.lessonCount = document.getElementById('lesson-count');
        this.loadMoreBtn = document.getElementById('load-more-btn');
        this.filterGrade = document.getElementById('filter-grade');
        this.filterSubject = document.getElementById('filter-subject');
        this.filterSort = document.getElementById('filter-sort');
        this.gridViewBtn = document.getElementById('grid-view-btn');
        this.listViewBtn = document.getElementById('list-view-btn');

        if (!this.lessonCards) return;

        // Bind view toggle events
        if (this.gridViewBtn) {
            this.gridViewBtn.addEventListener('click', () => this.switchView('grid'));
        }
        if (this.listViewBtn) {
            this.listViewBtn.addEventListener('click', () => this.switchView('list'));
        }

        // Bind filter events
        if (this.filterGrade) {
            this.filterGrade.addEventListener('change', () => this.handleFilterChange());
        }
        if (this.filterSubject) {
            this.filterSubject.addEventListener('change', () => this.handleFilterChange());
        }
        if (this.filterSort) {
            this.filterSort.addEventListener('change', () => this.handleFilterChange());
        }

        // Bind load more button
        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener('click', () => this.loadMore());
        }

        // Restore saved view preference
        const savedView = localStorage.getItem('lessonViewPreference');
        if (savedView && (savedView === 'grid' || savedView === 'list')) {
            this.switchView(savedView);
        }

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.lesson-card-actions')) {
                document.querySelectorAll('.settings-dropdown.active').forEach(d => {
                    d.classList.remove('active');
                });
            }
        });

        // Load lessons
        this.loadLessons();
    },

    async loadLessons() {
        try {
            const token = AuthService.getToken();
            if (!token) {
                console.warn('No auth token found');
                this.showEmptyState();
                return;
            }

            const response = await fetch(`${GoogleLogin.API_BASE_URL}/lessons`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch lessons');
            }

            const data = await response.json();
            this.lessons = data.lessons || [];

            // Apply filters and display
            this.applyFilters();
            this.displayLessons();

        } catch (error) {
            console.error('Error loading lessons:', error);
            this.showEmptyState();
        }
    },

    handleFilterChange() {
        this.currentFilters.grade = this.filterGrade.value;
        this.currentFilters.subject = this.filterSubject.value;
        this.currentFilters.sort = this.filterSort.value;

        this.applyFilters();
        this.displayLessons(true); // Reset display
    },

    applyFilters() {
        let filtered = [...this.lessons];

        // Filter by grade
        if (this.currentFilters.grade !== 'all') {
            filtered = filtered.filter(lesson =>
                lesson.teaching_level === this.currentFilters.grade
            );
        }

        // Filter by subject
        if (this.currentFilters.subject !== 'all') {
            filtered = filtered.filter(lesson =>
                lesson.subject === this.currentFilters.subject
            );
        }

        // Sort
        switch (this.currentFilters.sort) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                break;
            case 'az':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }

        this.filteredLessons = filtered;
    },

    displayLessons(reset = false) {
        if (reset) {
            this.displayedCount = 0;
            this.lessonCards.innerHTML = '';
        }

        // Update count
        if (this.lessonCount) {
            this.lessonCount.textContent = `(${this.filteredLessons.length})`;
        }

        // Show empty state if no lessons
        if (this.filteredLessons.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();

        // Display next batch
        const startIndex = this.displayedCount;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredLessons.length);

        for (let i = startIndex; i < endIndex; i++) {
            const lesson = this.filteredLessons[i];
            const card = this.createLessonCard(lesson);
            this.lessonCards.appendChild(card);
        }

        this.displayedCount = endIndex;

        // Show/hide load more button
        if (this.loadMoreBtn) {
            if (this.displayedCount < this.filteredLessons.length) {
                this.loadMoreBtn.classList.remove('hidden');
            } else {
                this.loadMoreBtn.classList.add('hidden');
            }
        }
    },

    createLessonCard(lesson) {
        const card = document.createElement('div');
        card.className = 'lesson-card';
        card.dataset.lessonId = lesson.id;

        // Get icon based on primary content type
        const icon = this.getContentIcon(lesson.content_types?.[0] || 'slide');

        // Get grade label
        const gradeLabel = this.getGradeLabel(lesson.teaching_level);

        // Get subject label
        const subjectLabel = this.getSubjectLabel(lesson.subject);

        // Get time ago
        const timeAgo = this.getTimeAgo(lesson.created_at);

        // Create content type badges
        const typeBadges = (lesson.content_types || []).map(type =>
            `<span class="type-badge ${type}">${this.getTypeLabel(type)}</span>`
        ).join('');

        card.innerHTML = `
            <div class="lesson-card-header">
                <div class="lesson-card-icon">${icon}</div>
                <div class="lesson-card-content">
                    <h3 class="lesson-card-title">${this.escapeHtml(lesson.title)}</h3>
                    <div class="lesson-card-meta">
                        <span>${gradeLabel}</span>
                        <span class="meta-separator">•</span>
                        <span>${subjectLabel}</span>
                        <span class="meta-separator">•</span>
                        <span>${timeAgo}</span>
                    </div>
                </div>

                <!-- Settings Menu -->
                <div class="lesson-card-actions">
                    <button class="settings-btn" data-lesson-id="${lesson.id}">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                        </svg>
                    </button>
                    <div class="settings-dropdown">
                        <button class="settings-item rename-btn" data-lesson-id="${lesson.id}">
                            <span>✏️</span>
                            <span>Đổi tên</span>
                        </button>
                        <button class="settings-item delete-btn" data-lesson-id="${lesson.id}">
                            <span>🗑️</span>
                            <span>Xóa</span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="lesson-card-types">
                ${typeBadges}
            </div>
        `;

        // Add click handler for card (not settings)
        const cardContent = card.querySelector('.lesson-card-content');
        const cardIcon = card.querySelector('.lesson-card-icon');
        const cardTypes = card.querySelector('.lesson-card-types');

        [cardContent, cardIcon, cardTypes].forEach(el => {
            if (el) {
                el.addEventListener('click', () => this.openLesson(lesson));
                el.style.cursor = 'pointer';
            }
        });

        // Settings button handler
        const settingsBtn = card.querySelector('.settings-btn');
        const settingsDropdown = card.querySelector('.settings-dropdown');

        if (settingsBtn && settingsDropdown) {
            settingsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSettingsMenu(settingsDropdown);
            });
        }

        // Rename button handler
        const renameBtn = card.querySelector('.rename-btn');
        if (renameBtn) {
            renameBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.renameLesson(lesson);
            });
        }

        // Delete button handler
        const deleteBtn = card.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteLesson(lesson);
            });
        }

        return card;
    },

    getContentIcon(type) {
        const icons = {
            slide: '📊',
            infographic: '📈',
            mindmap: '🧠',
            quiz: '❓'
        };
        return icons[type] || '📄';
    },

    getGradeLabel(level) {
        const labels = {
            elementary: 'Tiểu học',
            middle: 'THCS',
            high: 'THPT'
        };
        return labels[level] || level;
    },

    getSubjectLabel(subject) {
        const labels = {
            toan: 'Toán',
            van: 'Ngữ văn',
            anh: 'Tiếng Anh',
            ly: 'Vật lý',
            hoa: 'Hóa học',
            sinh: 'Sinh học',
            su: 'Lịch sử',
            dia: 'Địa lý',
            gdcd: 'GDCD',
            tin: 'Tin học',
            other: 'Khác'
        };
        return labels[subject] || subject;
    },

    getTypeLabel(type) {
        const labels = {
            slide: 'Slide',
            infographic: 'Infographic',
            mindmap: 'Mindmap',
            quiz: 'Quiz'
        };
        return labels[type] || type;
    },

    getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hôm nay';
        if (diffDays === 1) return 'Hôm qua';
        if (diffDays < 7) return `${diffDays} ngày trước`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
        return `${Math.floor(diffDays / 365)} năm trước`;
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    loadMore() {
        this.displayLessons();
    },

    switchView(view) {
        if (this.currentView === view) return;

        this.currentView = view;

        // Update button states
        if (view === 'grid') {
            this.gridViewBtn?.classList.add('active');
            this.listViewBtn?.classList.remove('active');
            this.lessonCards?.classList.remove('list-view');
        } else {
            this.listViewBtn?.classList.add('active');
            this.gridViewBtn?.classList.remove('active');
            this.lessonCards?.classList.add('list-view');
        }

        // Save preference to localStorage
        localStorage.setItem('lessonViewPreference', view);
    },

    toggleSettingsMenu(dropdown) {
        // Close all other dropdowns first
        document.querySelectorAll('.settings-dropdown.active').forEach(d => {
            if (d !== dropdown) d.classList.remove('active');
        });

        // Toggle current dropdown
        dropdown.classList.toggle('active');
    },

    async renameLesson(lesson) {
        const newTitle = prompt('Nhập tên mới cho bài giảng:', lesson.title);

        if (!newTitle || newTitle.trim() === '') {
            alert('Tên bài giảng không được để trống!');
            return;
        }

        if (newTitle.trim() === lesson.title) {
            return; // No change
        }

        try {
            const response = await fetch(`${GoogleLogin.API_BASE_URL}/lessons/${lesson.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AuthService.getToken()}`
                },
                body: JSON.stringify({
                    title: newTitle.trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Cập nhật thất bại');
            }

            // Update lesson in local array
            const lessonIndex = this.lessons.findIndex(l => l.id === lesson.id);
            if (lessonIndex !== -1) {
                this.lessons[lessonIndex].title = newTitle.trim();
            }

            // Update card title in DOM
            const card = document.querySelector(`.lesson-card[data-lesson-id="${lesson.id}"]`);
            if (card) {
                const titleEl = card.querySelector('.lesson-card-title');
                if (titleEl) {
                    titleEl.textContent = newTitle.trim();
                }
            }

            // Close dropdown
            const dropdown = card?.querySelector('.settings-dropdown');
            if (dropdown) dropdown.classList.remove('active');

            alert('Đổi tên thành công!');

        } catch (error) {
            console.error('Error renaming lesson:', error);
            alert(error.message || 'Có lỗi xảy ra khi đổi tên. Vui lòng thử lại.');
        }
    },

    async deleteLesson(lesson) {
        if (!confirm(`Bạn có chắc muốn xóa bài giảng "${lesson.title}"?`)) {
            return;
        }

        try {
            const response = await fetch(`${GoogleLogin.API_BASE_URL}/lessons/${lesson.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${AuthService.getToken()}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Xóa thất bại');
            }

            // Remove from local arrays
            this.lessons = this.lessons.filter(l => l.id !== lesson.id);
            this.filteredLessons = this.filteredLessons.filter(l => l.id !== lesson.id);

            // Remove card from DOM
            const card = document.querySelector(`.lesson-card[data-lesson-id="${lesson.id}"]`);
            if (card) {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    card.remove();

                    // Update count
                    if (this.lessonCount) {
                        this.lessonCount.textContent = `(${this.filteredLessons.length})`;
                    }

                    // Show empty state if no lessons left
                    if (this.filteredLessons.length === 0) {
                        this.showEmptyState();
                    }

                    // Update displayed count
                    this.displayedCount--;
                }, 300);
            }

            alert('Xóa bài giảng thành công!');

        } catch (error) {
            console.error('Error deleting lesson:', error);
            alert(error.message || 'Có lỗi xảy ra khi xóa. Vui lòng thử lại.');
        }
    },

    showEmptyState() {
        if (this.lessonCards) this.lessonCards.innerHTML = '';
        if (this.emptyState) this.emptyState.classList.remove('hidden');
        if (this.loadMoreBtn) this.loadMoreBtn.classList.add('hidden');
        if (this.lessonCount) this.lessonCount.textContent = '(0)';
    },

    hideEmptyState() {
        if (this.emptyState) this.emptyState.classList.add('hidden');
    },

    openLesson(lesson) {
        // Store lesson data
        localStorage.setItem('currentLesson', JSON.stringify(lesson));

        // Navigate to dashboard
        const workspaceScreen = document.getElementById('workspace-screen');
        const dashboardScreen = document.getElementById('dashboard-screen');

        if (workspaceScreen) workspaceScreen.classList.remove('active');
        if (dashboardScreen) {
            dashboardScreen.classList.add('active');

            // Trigger dashboard to load the lesson
            if (window.Dashboard && typeof window.Dashboard.loadLesson === 'function') {
                window.Dashboard.loadLesson(lesson);
            }
        }
    }
};

// Initialize when workspace screen is shown
document.addEventListener('DOMContentLoaded', () => {
    const workspaceScreen = document.getElementById('workspace-screen');
    if (workspaceScreen && workspaceScreen.classList.contains('active')) {
        LessonHistory.init();
    }

    // Also initialize when workspace becomes active
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.id === 'workspace-screen' &&
                mutation.target.classList.contains('active')) {
                LessonHistory.init();
            }
        });
    });

    if (workspaceScreen) {
        observer.observe(workspaceScreen, { attributes: true, attributeFilter: ['class'] });
    }
});
