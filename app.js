// Main application initialization

const App = {
    init() {
        console.log('Successlink AI Teaching Assistant initialized');

        // Initialize all modules
        if (window.Onboarding) Onboarding.init();
        if (window.Workspace) Workspace.init();
        if (window.Dashboard) Dashboard.init();

        // Add global error handler
        window.addEventListener('error', (event) => {
            console.error('Application error:', event.error);
        });

        // Add unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
        });
    }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}
