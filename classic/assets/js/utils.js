// Utility Functions Module
export class Utils {
    constructor() {
        this.cache = new Map();
        this.debounceTimers = new Map();
        this.throttleTimers = new Map();
    }
    
    // Debounce function
    debounce(func, wait, immediate = false) {
        const key = func.toString();
        
        return (...args) => {
            const later = () => {
                this.debounceTimers.delete(key);
                if (!immediate) func.apply(this, args);
            };
            
            const callNow = immediate && !this.debounceTimers.has(key);
            
            if (this.debounceTimers.has(key)) {
                clearTimeout(this.debounceTimers.get(key));
            }
            
            this.debounceTimers.set(key, setTimeout(later, wait));
            
            if (callNow) func.apply(this, args);
        };
    }
    
    // Throttle function
    throttle(func, limit) {
        const key = func.toString();
        
        return (...args) => {
            if (!this.throttleTimers.has(key)) {
                func.apply(this, args);
                this.throttleTimers.set(key, setTimeout(() => {
                    this.throttleTimers.delete(key);
                }, limit));
            }
        };
    }
    
    // Delay function (Promise-based)
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Email validation
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Phone validation (Brazilian format)
    isValidPhone(phone) {
        const phoneRegex = /^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/;
        return phoneRegex.test(phone);
    }
    
    // URL validation
    isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
    
    // Format phone number
    formatPhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (cleaned.length === 10) {
            return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        
        return phone;
    }
    
    // Format currency (Brazilian Real)
    formatCurrency(value, currency = 'BRL') {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: currency
        }).format(value);
    }
    
    // Format date
    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        const formatOptions = { ...defaultOptions, ...options };
        
        return new Intl.DateTimeFormat('pt-BR', formatOptions).format(new Date(date));
    }
    
    // Format relative time
    formatRelativeTime(date) {
        const now = new Date();
        const targetDate = new Date(date);
        const diffInSeconds = Math.floor((now - targetDate) / 1000);
        
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };
        
        for (const [unit, seconds] of Object.entries(intervals)) {
            const interval = Math.floor(diffInSeconds / seconds);
            
            if (interval >= 1) {
                return new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })
                    .format(-interval, unit);
            }
        }
        
        return 'agora mesmo';
    }
    
    // Slugify string
    slugify(text) {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    }
    
    // Capitalize first letter
    capitalize(text) {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }
    
    // Title case
    titleCase(text) {
        return text
            .toLowerCase()
            .split(' ')
            .map(word => this.capitalize(word))
            .join(' ');
    }
    
    // Truncate text
    truncate(text, length = 100, suffix = '...') {
        if (text.length <= length) return text;
        return text.substring(0, length).trim() + suffix;
    }
    
    // Generate random ID
    generateId(prefix = '', length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = prefix;
        
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return result;
    }
    
    // Generate UUID v4
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    // Deep clone object
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }
    
    // Merge objects deeply
    deepMerge(target, ...sources) {
        if (!sources.length) return target;
        const source = sources.shift();
        
        if (this.isObject(target) && this.isObject(source)) {
            for (const key in source) {
                if (this.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    this.deepMerge(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }
        
        return this.deepMerge(target, ...sources);
    }
    
    // Check if value is object
    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }
    
    // Check if value is empty
    isEmpty(value) {
        if (value == null) return true;
        if (typeof value === 'string') return value.trim().length === 0;
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    }
    
    // Get nested object property safely
    getNestedProperty(obj, path, defaultValue = undefined) {
        const keys = path.split('.');
        let result = obj;
        
        for (const key of keys) {
            if (result == null || typeof result !== 'object') {
                return defaultValue;
            }
            result = result[key];
        }
        
        return result !== undefined ? result : defaultValue;
    }
    
    // Set nested object property
    setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        let current = obj;
        
        for (const key of keys) {
            if (!(key in current) || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        
        current[lastKey] = value;
        return obj;
    }
    
    // Array utilities
    arrayUtils = {
        // Remove duplicates
        unique: (arr) => [...new Set(arr)],
        
        // Remove duplicates by property
        uniqueBy: (arr, key) => {
            const seen = new Set();
            return arr.filter(item => {
                const value = typeof key === 'function' ? key(item) : item[key];
                if (seen.has(value)) return false;
                seen.add(value);
                return true;
            });
        },
        
        // Group array by property
        groupBy: (arr, key) => {
            return arr.reduce((groups, item) => {
                const value = typeof key === 'function' ? key(item) : item[key];
                (groups[value] = groups[value] || []).push(item);
                return groups;
            }, {});
        },
        
        // Sort array by property
        sortBy: (arr, key, direction = 'asc') => {
            return [...arr].sort((a, b) => {
                const aVal = typeof key === 'function' ? key(a) : a[key];
                const bVal = typeof key === 'function' ? key(b) : b[key];
                
                if (aVal < bVal) return direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return direction === 'asc' ? 1 : -1;
                return 0;
            });
        },
        
        // Chunk array into smaller arrays
        chunk: (arr, size) => {
            const chunks = [];
            for (let i = 0; i < arr.length; i += size) {
                chunks.push(arr.slice(i, i + size));
            }
            return chunks;
        },
        
        // Flatten nested arrays
        flatten: (arr) => arr.flat(Infinity),
        
        // Get random item from array
        random: (arr) => arr[Math.floor(Math.random() * arr.length)],
        
        // Shuffle array
        shuffle: (arr) => {
            const shuffled = [...arr];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        }
    };
    
    // DOM utilities
    domUtils = {
        // Query selector with error handling
        qs: (selector, context = document) => {
            try {
                return context.querySelector(selector);
            } catch (error) {
                console.warn(`Invalid selector: ${selector}`, error);
                return null;
            }
        },
        
        // Query selector all with error handling
        qsa: (selector, context = document) => {
            try {
                return Array.from(context.querySelectorAll(selector));
            } catch (error) {
                console.warn(`Invalid selector: ${selector}`, error);
                return [];
            }
        },
        
        // Create element with attributes
        createElement: (tag, attributes = {}, children = []) => {
            const element = document.createElement(tag);
            
            Object.entries(attributes).forEach(([key, value]) => {
                if (key === 'className') {
                    element.className = value;
                } else if (key === 'innerHTML') {
                    element.innerHTML = value;
                } else if (key === 'textContent') {
                    element.textContent = value;
                } else if (key.startsWith('data-')) {
                    element.setAttribute(key, value);
                } else {
                    element[key] = value;
                }
            });
            
            children.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else if (child instanceof Node) {
                    element.appendChild(child);
                }
            });
            
            return element;
        },
        
        // Check if element is in viewport
        isInViewport: (element, threshold = 0) => {
            const rect = element.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            const windowWidth = window.innerWidth || document.documentElement.clientWidth;
            
            return (
                rect.top >= -threshold &&
                rect.left >= -threshold &&
                rect.bottom <= windowHeight + threshold &&
                rect.right <= windowWidth + threshold
            );
        },
        
        // Get element offset
        getOffset: (element) => {
            const rect = element.getBoundingClientRect();
            return {
                top: rect.top + window.pageYOffset,
                left: rect.left + window.pageXOffset,
                width: rect.width,
                height: rect.height
            };
        },
        
        // Smooth scroll to element
        scrollToElement: (element, offset = 0, behavior = 'smooth') => {
            const elementTop = this.domUtils.getOffset(element).top;
            window.scrollTo({
                top: elementTop - offset,
                behavior: behavior
            });
        }
    };
    
    // Local storage utilities
    storage = {
        // Set item with expiration
        set: (key, value, expirationHours = null) => {
            const item = {
                value: value,
                timestamp: Date.now(),
                expiration: expirationHours ? Date.now() + (expirationHours * 60 * 60 * 1000) : null
            };
            
            try {
                localStorage.setItem(key, JSON.stringify(item));
                return true;
            } catch (error) {
                console.warn('Failed to save to localStorage:', error);
                return false;
            }
        },
        
        // Get item with expiration check
        get: (key, defaultValue = null) => {
            try {
                const itemStr = localStorage.getItem(key);
                if (!itemStr) return defaultValue;
                
                const item = JSON.parse(itemStr);
                
                // Check expiration
                if (item.expiration && Date.now() > item.expiration) {
                    localStorage.removeItem(key);
                    return defaultValue;
                }
                
                return item.value;
            } catch (error) {
                console.warn('Failed to get from localStorage:', error);
                return defaultValue;
            }
        },
        
        // Remove item
        remove: (key) => {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.warn('Failed to remove from localStorage:', error);
                return false;
            }
        },
        
        // Clear all items
        clear: () => {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.warn('Failed to clear localStorage:', error);
                return false;
            }
        },
        
        // Get all keys
        keys: () => {
            try {
                return Object.keys(localStorage);
            } catch (error) {
                console.warn('Failed to get localStorage keys:', error);
                return [];
            }
        }
    };
    
    // URL utilities
    urlUtils = {
        // Get URL parameters
        getParams: (url = window.location.href) => {
            const urlObj = new URL(url);
            const params = {};
            
            for (const [key, value] of urlObj.searchParams) {
                params[key] = value;
            }
            
            return params;
        },
        
        // Set URL parameter
        setParam: (key, value, url = window.location.href) => {
            const urlObj = new URL(url);
            urlObj.searchParams.set(key, value);
            return urlObj.toString();
        },
        
        // Remove URL parameter
        removeParam: (key, url = window.location.href) => {
            const urlObj = new URL(url);
            urlObj.searchParams.delete(key);
            return urlObj.toString();
        },
        
        // Update browser URL without reload
        updateURL: (url, title = null) => {
            if (history.pushState) {
                history.pushState(null, title, url);
            }
        }
    };
    
    // Performance utilities
    performance = {
        // Measure function execution time
        measure: async (fn, label = 'Function') => {
            const start = performance.now();
            const result = await fn();
            const end = performance.now();
            
            console.log(`${label} took ${(end - start).toFixed(2)} milliseconds`);
            return result;
        },
        
        // Create performance observer
        observe: (entryTypes, callback) => {
            if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver(callback);
                observer.observe({ entryTypes });
                return observer;
            }
            return null;
        }
    };
    
    // Device detection utilities
    device = {
        // Check if mobile device
        isMobile: () => {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        },
        
        // Check if tablet
        isTablet: () => {
            return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
        },
        
        // Check if desktop
        isDesktop: () => {
            return !this.device.isMobile() && !this.device.isTablet();
        },
        
        // Get screen size category
        getScreenSize: () => {
            const width = window.innerWidth;
            
            if (width < 640) return 'xs';
            if (width < 768) return 'sm';
            if (width < 1024) return 'md';
            if (width < 1280) return 'lg';
            if (width < 1536) return 'xl';
            return '2xl';
        },
        
        // Check if touch device
        isTouchDevice: () => {
            return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        }
    };
    
    // Color utilities
    colorUtils = {
        // Convert hex to RGB
        hexToRgb: (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        },
        
        // Convert RGB to hex
        rgbToHex: (r, g, b) => {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        },
        
        // Generate random color
        randomColor: () => {
            return '#' + Math.floor(Math.random() * 16777215).toString(16);
        }
    };
    
    // Cleanup method
    cleanup() {
        this.cache.clear();
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        this.throttleTimers.forEach(timer => clearTimeout(timer));
        this.debounceTimers.clear();
        this.throttleTimers.clear();
    }
}

// Export individual utility functions for convenience
export const {
    debounce,
    throttle,
    delay,
    isValidEmail,
    formatDate,
    slugify,
    capitalize,
    generateId,
    deepClone
} = new Utils();

export default Utils;
