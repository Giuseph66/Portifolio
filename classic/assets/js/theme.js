// Theme Management Module
export class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.themeToggle = null;
        this.themeIcon = null;
        this.storageKey = 'portfolio-theme';
        
        this.themes = {
            light: {
                name: 'Light',
                icon: 'fas fa-sun'
            },
            dark: {
                name: 'Dark',
                icon: 'fas fa-moon'
            }
        };
    }
    
    init() {
        this.initializeElements();
        this.loadSavedTheme();
        this.setupEventListeners();
        this.applyTheme(this.currentTheme);
        
        console.log('🎨 Theme Manager initialized');
    }
    
    initializeElements() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.themeIcon = document.getElementById('theme-icon');
        
        if (!this.themeToggle || !this.themeIcon) {
            console.warn('Theme toggle elements not found');
        }
    }
    
    loadSavedTheme() {
        // Check localStorage first
        const savedTheme = localStorage.getItem(this.storageKey);
        
        if (savedTheme && this.themes[savedTheme]) {
            this.currentTheme = savedTheme;
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.currentTheme = prefersDark ? 'dark' : 'light';
        }
    }
    
    setupEventListeners() {
        // Theme toggle button
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(this.storageKey)) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
        
        // Keyboard shortcut (Ctrl/Cmd + Shift + T)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }
    
    setTheme(theme) {
        if (!this.themes[theme]) {
            console.warn(`Theme "${theme}" not found`);
            return;
        }
        
        this.currentTheme = theme;
        this.applyTheme(theme);
        this.saveTheme(theme);
        this.updateIcon(theme);
        this.triggerThemeChange(theme);
        
        console.log(`🎨 Theme changed to: ${theme}`);
    }
    
    applyTheme(theme) {
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', theme);
        
        // Add transition class for smooth theme change
        document.body.classList.add('theme-transitioning');
        
        // Remove transition class after animation
        setTimeout(() => {
            document.body.classList.remove('theme-transitioning');
        }, 300);
        
        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor(theme);
    }
    
    updateMetaThemeColor(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        const colors = {
            light: '#ffffff',
            dark: '#1e293b'
        };
        
        metaThemeColor.content = colors[theme] || colors.light;
    }
    
    saveTheme(theme) {
        localStorage.setItem(this.storageKey, theme);
    }
    
    updateIcon(theme) {
        if (this.themeIcon) {
            this.themeIcon.className = this.themes[theme].icon;
        }
    }
    
    triggerThemeChange(theme) {
        // Dispatch custom event for other components to listen to
        const event = new CustomEvent('themechange', {
            detail: { theme, previousTheme: this.currentTheme }
        });
        
        document.dispatchEvent(event);
    }
    
    getCurrentTheme() {
        return this.currentTheme;
    }
    
    getAvailableThemes() {
        return Object.keys(this.themes);
    }
    
    isSystemDarkMode() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    // Auto theme based on time of day
    setAutoTheme() {
        const hour = new Date().getHours();
        const isDayTime = hour >= 6 && hour < 18;
        const theme = isDayTime ? 'light' : 'dark';
        
        this.setTheme(theme);
    }
    
    // Theme presets for different contexts
    setThemeForContext(context) {
        const contextThemes = {
            presentation: 'dark',
            reading: 'light',
            coding: 'dark',
            default: this.isSystemDarkMode() ? 'dark' : 'light'
        };
        
        const theme = contextThemes[context] || contextThemes.default;
        this.setTheme(theme);
    }
    
    // Get CSS custom property value for current theme
    getCSSVariable(property) {
        return getComputedStyle(document.documentElement)
            .getPropertyValue(property)
            .trim();
    }
    
    // Update CSS custom property
    setCSSVariable(property, value) {
        document.documentElement.style.setProperty(property, value);
    }
    
    // Theme-aware color utilities
    getThemeColor(colorName) {
        const colorMap = {
            primary: '--text-primary',
            secondary: '--text-secondary',
            accent: '--accent-primary',
            background: '--bg-primary',
            card: '--bg-card'
        };
        
        const cssVar = colorMap[colorName];
        return cssVar ? this.getCSSVariable(cssVar) : null;
    }
    
    // Accessibility helpers
    getContrastRatio(color1, color2) {
        // Simplified contrast ratio calculation
        // In a real implementation, you'd use a proper color library
        const luminance1 = this.getLuminance(color1);
        const luminance2 = this.getLuminance(color2);
        
        const lighter = Math.max(luminance1, luminance2);
        const darker = Math.min(luminance1, luminance2);
        
        return (lighter + 0.05) / (darker + 0.05);
    }
    
    getLuminance(color) {
        // Simplified luminance calculation
        // This is a placeholder - use a proper color library for production
        return 0.5;
    }
    
    // Theme validation
    validateTheme(theme) {
        return this.themes.hasOwnProperty(theme);
    }
    
    // Export theme configuration
    exportThemeConfig() {
        return {
            currentTheme: this.currentTheme,
            availableThemes: this.getAvailableThemes(),
            systemPreference: this.isSystemDarkMode() ? 'dark' : 'light'
        };
    }
    
    // Import theme configuration
    importThemeConfig(config) {
        if (config.currentTheme && this.validateTheme(config.currentTheme)) {
            this.setTheme(config.currentTheme);
        }
    }
    
    // Debug helpers
    debugTheme() {
        console.group('🎨 Theme Debug Info');
        console.log('Current theme:', this.currentTheme);
        console.log('System preference:', this.isSystemDarkMode() ? 'dark' : 'light');
        console.log('Saved theme:', localStorage.getItem(this.storageKey));
        console.log('Available themes:', this.getAvailableThemes());
        console.log('CSS variables:', {
            primary: this.getCSSVariable('--text-primary'),
            background: this.getCSSVariable('--bg-primary'),
            accent: this.getCSSVariable('--accent-primary')
        });
        console.groupEnd();
    }
}

// Utility functions for theme-related operations
export const ThemeUtils = {
    // Convert hex to RGB
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },
    
    // Convert RGB to hex
    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },
    
    // Lighten/darken color
    adjustColor(color, amount) {
        const usePound = color[0] === "#";
        const col = usePound ? color.slice(1) : color;
        
        const num = parseInt(col, 16);
        let r = (num >> 16) + amount;
        let g = (num >> 8 & 0x00FF) + amount;
        let b = (num & 0x0000FF) + amount;
        
        r = r > 255 ? 255 : r < 0 ? 0 : r;
        g = g > 255 ? 255 : g < 0 ? 0 : g;
        b = b > 255 ? 255 : b < 0 ? 0 : b;
        
        return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
    },
    
    // Generate color palette
    generatePalette(baseColor, steps = 5) {
        const palette = [];
        const step = 40;
        
        for (let i = -steps; i <= steps; i++) {
            palette.push(this.adjustColor(baseColor, i * step));
        }
        
        return palette;
    }
};

export default ThemeManager;
