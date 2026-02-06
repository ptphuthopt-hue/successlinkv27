// Teaching dashboard functionality

const Dashboard = {
    currentView: 'slide',
    currentSlideIndex: 0,
    lessonData: null,

    init() {
        this.bindEvents();
    },

    bindEvents() {
        // Dock navigation
        const dockItems = DOM.selectAll('.dock-item[data-view]');
        dockItems.forEach(item => {
            item.addEventListener('click', () => {
                const view = item.dataset.view;
                if (view) {
                    this.switchView(view);
                }
            });
        });

        // Back to workspace button
        const backButton = DOM.select('#back-to-workspace');
        if (backButton) {
            backButton.addEventListener('click', () => this.backToWorkspace());
        }

        // Slide navigation
        const prevButton = DOM.select('#prev-slide');
        const nextButton = DOM.select('#next-slide');

        if (prevButton) {
            prevButton.addEventListener('click', () => this.previousSlide());
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => this.nextSlide());
        }

        // Quiz export
        const exportButton = DOM.select('#export-zalo');
        if (exportButton) {
            exportButton.addEventListener('click', () => this.exportQuizToZalo());
        }
    },

    loadContent(data = null) {
        // Load lesson data from memory or storage
        this.lessonData = data || Storage.get('currentLesson');

        console.log('📚 Loading lesson data:', this.lessonData);

        if (!this.lessonData || !this.lessonData.content) {
            console.error('❌ No lesson data found or content is null');
            // Show empty state or alert
            if (data) alert('Không thể tải nội dung bài giảng');
            return;
        }

        console.log('✅ Lesson content:', this.lessonData.content);
        console.log('📊 Content keys:', Object.keys(this.lessonData.content));

        // Update dock visibility based on generated content
        this.updateDockVisibility();

        // Load first available view
        this.loadFirstView();
    },

    updateDockVisibility() {
        const content = this.lessonData.content;

        // Show/hide dock items based on generated content
        const dockItems = {
            'slide': DOM.select('.dock-item[data-view="slide"]'),
            'infographic': DOM.select('.dock-item[data-view="infographic"]'),
            'mindmap': DOM.select('.dock-item[data-view="mindmap"]'),
            'quiz': DOM.select('.dock-item[data-view="quiz"]')
        };

        Object.keys(dockItems).forEach(key => {
            const item = dockItems[key];
            if (item) {
                if (content[key] || content[key + 's']) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            }
        });
    },

    loadFirstView() {
        const content = this.lessonData.content;

        // Determine first available view
        if (content.slides) {
            this.switchView('slide');
        } else if (content.infographic) {
            this.switchView('infographic');
        } else if (content.mindmap) {
            this.switchView('mindmap');
        } else if (content.quiz) {
            this.switchView('quiz');
        }
    },

    switchView(viewName) {
        if (!this.lessonData || !this.lessonData.content) {
            console.warn('⚠️ Cannot switch view: No lesson data');
            return;
        }

        // Update dock items
        const dockItems = DOM.selectAll('.dock-item[data-view]');
        dockItems.forEach(item => {
            if (item.dataset.view === viewName) {
                DOM.addClass(item, 'active');
            } else {
                DOM.removeClass(item, 'active');
            }
        });

        // Update content views
        const contentViews = DOM.selectAll('.content-view');
        contentViews.forEach(view => DOM.removeClass(view, 'active'));

        const targetView = DOM.select(`#${viewName}-view`);
        if (targetView) {
            DOM.addClass(targetView, 'active');
        }

        this.currentView = viewName;

        // Load content for the view
        this.loadViewContent(viewName);
    },

    loadViewContent(viewName) {
        const content = this.lessonData.content;

        switch (viewName) {
            case 'slide':
                this.loadSlides(content.slides);
                break;
            case 'infographic':
                this.loadInfographic(content.infographic);
                break;
            case 'mindmap':
                this.loadMindmap(content.mindmap);
                break;
            case 'quiz':
                this.loadQuiz(content.quiz);
                break;
        }
    },

    loadSlides(slides) {
        if (!slides || slides.length === 0) return;

        this.currentSlideIndex = 0;
        this.renderSlide();
    },

    renderSlide() {
        const content = this.lessonData.content;
        const slides = content.slides;

        if (!slides || slides.length === 0) return;

        const slideContent = DOM.select('#slide-content');
        const slideCounter = DOM.select('#slide-counter');
        const prevButton = DOM.select('#prev-slide');
        const nextButton = DOM.select('#next-slide');

        // Update slide content
        if (slideContent) {
            DOM.setHTML(slideContent, slides[this.currentSlideIndex].content);
        }

        // Update counter
        if (slideCounter) {
            DOM.setText(slideCounter, `${this.currentSlideIndex + 1} / ${slides.length}`);
        }

        // Update navigation buttons
        if (prevButton) {
            prevButton.disabled = this.currentSlideIndex === 0;
        }

        if (nextButton) {
            nextButton.disabled = this.currentSlideIndex === slides.length - 1;
        }
    },

    previousSlide() {
        if (this.currentSlideIndex > 0) {
            this.currentSlideIndex--;
            this.renderSlide();
        }
    },

    nextSlide() {
        const slides = this.lessonData.content.slides;
        if (this.currentSlideIndex < slides.length - 1) {
            this.currentSlideIndex++;
            this.renderSlide();
        }
    },

    loadInfographic(infographic) {
        if (!infographic) return;

        const infographicContent = DOM.select('#infographic-content');
        if (infographicContent) {
            infographicContent.src = infographic.url;
            infographicContent.alt = infographic.description || 'Infographic';
        }
    },

    loadMindmap(mindmap) {
        if (!mindmap) return;

        const mindmapContent = DOM.select('#mindmap-content');
        if (mindmapContent) {
            // Render mindmap as a simple tree structure
            const html = this.renderMindmapHTML(mindmap);
            DOM.setHTML(mindmapContent, html);
        }
    },

    renderMindmapHTML(mindmap) {
        let html = `<div class="mindmap-tree">`;
        html += `<div class="mindmap-central">${mindmap.central}</div>`;
        html += `<div class="mindmap-branches">`;

        mindmap.branches.forEach(branch => {
            html += `<div class="mindmap-branch">`;
            html += `<div class="branch-title">${branch.title}</div>`;
            html += `<div class="branch-subs">`;
            branch.subbranches.forEach(sub => {
                html += `<div class="sub-branch">${sub}</div>`;
            });
            html += `</div></div>`;
        });

        html += `</div></div>`;

        // Add inline styles for mindmap
        html += `<style>
            .mindmap-tree { text-align: center; }
            .mindmap-central { 
                font-size: 2rem; 
                font-weight: 700; 
                color: var(--color-primary); 
                margin-bottom: 2rem;
                padding: 1.5rem 2rem;
                background: linear-gradient(135deg, rgba(77, 168, 218, 0.1) 0%, rgba(77, 168, 218, 0.2) 100%);
                border-radius: 1rem;
                display: inline-block;
            }
            .mindmap-branches { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                gap: 2rem; 
                margin-top: 2rem;
            }
            .mindmap-branch { 
                background: white; 
                padding: 1.5rem; 
                border-radius: 0.75rem; 
                box-shadow: var(--shadow-md);
            }
            .branch-title { 
                font-size: 1.25rem; 
                font-weight: 600; 
                color: var(--color-primary); 
                margin-bottom: 1rem;
            }
            .branch-subs { 
                display: flex; 
                flex-direction: column; 
                gap: 0.5rem;
            }
            .sub-branch { 
                padding: 0.5rem 1rem; 
                background: var(--color-bg-secondary); 
                border-radius: 0.5rem;
                font-size: 0.95rem;
            }
        </style>`;

        return html;
    },

    loadQuiz(quiz) {
        if (!quiz || quiz.length === 0) return;

        const quizContent = DOM.select('#quiz-content');
        if (quizContent) {
            const html = this.renderQuizHTML(quiz);
            DOM.setHTML(quizContent, html);
        }
    },

    renderQuizHTML(questions) {
        let html = '';

        questions.forEach((q, index) => {
            html += `<div class="quiz-question" data-question-id="${q.id}">`;
            html += `<div class="question-number">Câu ${q.id}</div>`;
            html += `<div class="question-text">${q.question}</div>`;
            html += `<div class="question-options">`;

            q.options.forEach(option => {
                const correctClass = option.correct ? 'correct' : '';
                html += `<div class="option ${correctClass}">`;
                html += `<strong>${option.id}.</strong> ${option.text}`;
                html += `</div>`;
            });

            html += `</div>`;

            // Add explanation
            if (q.explanation) {
                html += `<div class="question-explanation">`;
                html += `<div class="explanation-label">Giải thích:</div>`;
                html += `<div>${q.explanation}</div>`;
                html += `</div>`;
            }

            html += `</div>`;
        });

        return html;
    },

    async exportQuizToZalo() {
        const quizContent = DOM.select('#quiz-content');
        if (!quizContent) {
            alert('Không tìm thấy nội dung quiz');
            return;
        }

        // Generate filename with lesson title
        const filename = `quiz_${this.lessonData.title.replace(/\s+/g, '_')}_${Date.now()}.png`;

        // Export to image
        await exportToImage('quiz-content', filename);
    },

    backToWorkspace() {
        const dashboardScreen = DOM.select('#dashboard-screen');
        const workspaceScreen = DOM.select('#workspace-screen');

        DOM.removeClass(dashboardScreen, 'active');
        DOM.addClass(workspaceScreen, 'active');

        // Reset workspace
        if (window.Workspace) {
            Workspace.reset();
        }
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Dashboard.init());
} else {
    Dashboard.init();
}
