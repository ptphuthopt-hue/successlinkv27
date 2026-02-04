// Utility functions for localStorage and DOM manipulation

const Storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    },
    
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Storage error:', e);
            return null;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    },
    
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    }
};

const DOM = {
    select: (selector) => document.querySelector(selector),
    selectAll: (selector) => document.querySelectorAll(selector),
    
    addClass: (element, className) => {
        if (element) element.classList.add(className);
    },
    
    removeClass: (element, className) => {
        if (element) element.classList.remove(className);
    },
    
    toggleClass: (element, className) => {
        if (element) element.classList.toggle(className);
    },
    
    hasClass: (element, className) => {
        return element ? element.classList.contains(className) : false;
    },
    
    show: (element) => {
        if (element) element.classList.remove('hidden');
    },
    
    hide: (element) => {
        if (element) element.classList.add('hidden');
    },
    
    setHTML: (element, html) => {
        if (element) element.innerHTML = html;
    },
    
    setText: (element, text) => {
        if (element) element.textContent = text;
    }
};

// Export quiz to image for Zalo
const exportToImage = async (elementId, filename = 'quiz.png') => {
    try {
        // Check if html2canvas is available
        if (typeof html2canvas === 'undefined') {
            // Dynamically load html2canvas
            await loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');
        }
        
        const element = DOM.select(`#${elementId}`);
        if (!element) {
            throw new Error('Element not found');
        }
        
        const canvas = await html2canvas(element, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false,
            useCORS: true
        });
        
        // Convert to blob and download
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = filename;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        });
        
        return true;
    } catch (error) {
        console.error('Export error:', error);
        alert('Không thể xuất ảnh. Vui lòng thử lại.');
        return false;
    }
};

// Load external script dynamically
const loadScript = (src) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

// Format date/time
const formatDate = (date = new Date()) => {
    return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

// Debounce function for input handling
const debounce = (func, wait = 300) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Random ID generator
const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
