// Onboarding flow handling

const Onboarding = {
    selectedLevel: null,
    selectedSubject: null,

    init() {
        this.bindEvents();
        this.checkOnboardingStatus();
    },

    bindEvents() {
        // Level card selection
        const levelCards = DOM.selectAll('.level-card');
        levelCards.forEach(card => {
            card.addEventListener('click', () => this.selectLevel(card));
        });

        // Subject dropdown
        const subjectDropdown = DOM.select('#subject-dropdown');
        if (subjectDropdown) {
            subjectDropdown.addEventListener('change', (e) => this.selectSubject(e.target.value));
        }

        // Start button
        const startButton = DOM.select('#start-button');
        if (startButton) {
            startButton.addEventListener('click', () => this.completeOnboarding());
        }
    },

    checkOnboardingStatus() {
        const preferences = Storage.get('userPreferences');

        if (preferences && preferences.level && preferences.subject) {
            // User has completed onboarding, go to workspace
            this.navigateToWorkspace();
        }
    },

    selectLevel(card) {
        // Remove selection from all cards
        const allCards = DOM.selectAll('.level-card');
        allCards.forEach(c => DOM.removeClass(c, 'selected'));

        // Add selection to clicked card
        DOM.addClass(card, 'selected');
        this.selectedLevel = card.dataset.level;

        // Show subject selection
        const subjectSection = DOM.select('#subject-selection');
        DOM.show(subjectSection);

        // Scroll to subject selection
        subjectSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    },

    selectSubject(subject) {
        this.selectedSubject = subject;

        // Enable start button if subject is selected
        const startButton = DOM.select('#start-button');
        if (subject && startButton) {
            startButton.disabled = false;
        }
    },

    completeOnboarding() {
        if (!this.selectedLevel || !this.selectedSubject) {
            alert('Vui lòng chọn cấp học và môn học');
            return;
        }

        // Save preferences
        const preferences = {
            level: this.selectedLevel,
            subject: this.selectedSubject,
            completedAt: new Date().toISOString()
        };

        Storage.set('userPreferences', preferences);

        // Navigate to workspace
        this.navigateToWorkspace();
    },

    navigateToWorkspace() {
        const onboardingScreen = DOM.select('#onboarding-screen');
        const workspaceScreen = DOM.select('#workspace-screen');

        DOM.removeClass(onboardingScreen, 'active');
        DOM.addClass(workspaceScreen, 'active');
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Onboarding.init());
} else {
    Onboarding.init();
}
