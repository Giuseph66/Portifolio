// Navigation Management Module
export class NavigationManager {
    constructor() {
        this.navbar = null;
        this.navToggle = null;
        this.navMenu = null;
        this.navLinks = [];
        this.sections = [];
        this.currentSection = '';
        this.scrollOffset = 80; // Height of fixed navbar
        
        this.isScrolling = false;
        this.scrollTimeout = null;
    }
    
    init() {
        this.initializeElements();
        this.setupEventListeners();
        this.initializeSmoothScroll();
        this.updateActiveLink();
        
        console.log('🧭 Navigation Manager initialized');
    }
    
    initializeElements() {
        this.navbar = document.getElementById('navbar') || document.querySelector('.navbar');
        this.navToggle = document.getElementById('nav-toggle');
        this.navMenu = document.getElementById('nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('section[id]');
        
        if (!this.navbar) {
            console.warn('Navbar not found');
        }
    }
    
    setupEventListeners() {
        // Mobile menu toggle
        if (this.navToggle && this.navMenu) {
            this.navToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }
        
        // Navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleNavClick(e, link);
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.navMenu && this.navMenu.classList.contains('active')) {
                if (!this.navbar.contains(e.target)) {
                    this.closeMobileMenu();
                }
            }
        });
        
        // Scroll event for active link updates
        window.addEventListener('scroll', this.debounce(() => {
            this.updateActiveLink();
            this.updateNavbarBackground();
        }, 10));
        
        // Resize event
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.closeMobileMenu();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });
    }
    
    toggleMobileMenu() {
        if (this.navMenu && this.navToggle) {
            const isActive = this.navMenu.classList.contains('active');
            
            if (isActive) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        }
    }
    
    openMobileMenu() {
        if (this.navMenu && this.navToggle) {
            this.navMenu.classList.add('active');
            this.navToggle.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scroll
            
            // Add animation delay to menu items
            const menuItems = this.navMenu.querySelectorAll('.nav-link');
            menuItems.forEach((item, index) => {
                item.style.animationDelay = `${index * 0.1}s`;
                item.classList.add('menu-item-animate');
            });
        }
    }
    
    closeMobileMenu() {
        if (this.navMenu && this.navToggle) {
            this.navMenu.classList.remove('active');
            this.navToggle.classList.remove('active');
            document.body.style.overflow = ''; // Restore scroll
            
            // Remove animation classes
            const menuItems = this.navMenu.querySelectorAll('.nav-link');
            menuItems.forEach(item => {
                item.style.animationDelay = '';
                item.classList.remove('menu-item-animate');
            });
        }
    }
    
    handleNavClick(event, link) {
        event.preventDefault();
        
        const href = link.getAttribute('href');
        
        // Handle external links
        if (href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) {
            window.open(href, '_blank');
            return;
        }
        
        // Handle internal navigation
        if (href.startsWith('#')) {
            const targetId = href.substring(1);
            this.navigateTo(targetId);
        } else {
            // Handle page navigation
            window.location.href = href;
        }
        
        // Close mobile menu after navigation
        this.closeMobileMenu();
    }
    
    navigateTo(sectionId) {
        const targetSection = document.getElementById(sectionId);
        
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - this.scrollOffset;
            
            this.isScrolling = true;
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
            
            // Reset scrolling flag after animation
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(() => {
                this.isScrolling = false;
            }, 1000);
            
            // Update URL hash
            history.pushState(null, null, `#${sectionId}`);
        }
    }
    
    updateActiveLink() {
        if (this.isScrolling) return;
        
        const scrollPosition = window.scrollY + this.scrollOffset + 50;
        let currentSection = '';
        
        // Find current section
        this.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        // Update active link if section changed
        if (currentSection !== this.currentSection) {
            this.currentSection = currentSection;
            
            this.navLinks.forEach(link => {
                link.classList.remove('active');
                
                const href = link.getAttribute('href');
                if (href === `#${currentSection}`) {
                    link.classList.add('active');
                }
            });
        }
    }
    
    updateNavbarBackground() {
        if (!this.navbar) return;
        
        const scrollY = window.scrollY;
        
        if (scrollY > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    }
    
    initializeSmoothScroll() {
        // Handle hash links on page load
        if (window.location.hash) {
            const targetId = window.location.hash.substring(1);
            setTimeout(() => {
                this.navigateTo(targetId);
            }, 100);
        }
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => {
            if (window.location.hash) {
                const targetId = window.location.hash.substring(1);
                this.navigateTo(targetId);
            }
        });
    }
    
    handleKeyboardNavigation(event) {
        // Escape key closes mobile menu
        if (event.key === 'Escape') {
            this.closeMobileMenu();
        }
        
        // Arrow keys for section navigation
        if (event.altKey) {
            if (event.key === 'ArrowUp') {
                event.preventDefault();
                this.navigateToPreviousSection();
            } else if (event.key === 'ArrowDown') {
                event.preventDefault();
                this.navigateToNextSection();
            }
        }
        
        // Number keys for quick navigation (Alt + 1-9)
        if (event.altKey && event.key >= '1' && event.key <= '9') {
            event.preventDefault();
            const index = parseInt(event.key) - 1;
            const section = this.sections[index];
            
            if (section) {
                this.navigateTo(section.getAttribute('id'));
            }
        }
    }
    
    navigateToPreviousSection() {
        const currentIndex = Array.from(this.sections).findIndex(
            section => section.getAttribute('id') === this.currentSection
        );
        
        if (currentIndex > 0) {
            const previousSection = this.sections[currentIndex - 1];
            this.navigateTo(previousSection.getAttribute('id'));
        }
    }
    
    navigateToNextSection() {
        const currentIndex = Array.from(this.sections).findIndex(
            section => section.getAttribute('id') === this.currentSection
        );
        
        if (currentIndex < this.sections.length - 1) {
            const nextSection = this.sections[currentIndex + 1];
            this.navigateTo(nextSection.getAttribute('id'));
        }
    }
    
    // Breadcrumb functionality
    generateBreadcrumb() {
        const breadcrumb = [];
        const currentPath = window.location.pathname;
        const pathSegments = currentPath.split('/').filter(segment => segment);
        
        breadcrumb.push({ name: 'Home', url: '/' });
        
        let currentUrl = '';
        pathSegments.forEach(segment => {
            currentUrl += `/${segment}`;
            breadcrumb.push({
                name: this.formatBreadcrumbName(segment),
                url: currentUrl
            });
        });
        
        return breadcrumb;
    }
    
    formatBreadcrumbName(segment) {
        return segment
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }
    
    // Navigation state management
    saveNavigationState() {
        const state = {
            currentSection: this.currentSection,
            scrollPosition: window.scrollY,
            timestamp: Date.now()
        };
        
        sessionStorage.setItem('navigation-state', JSON.stringify(state));
    }
    
    restoreNavigationState() {
        const savedState = sessionStorage.getItem('navigation-state');
        
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                
                // Only restore if saved recently (within 5 minutes)
                if (Date.now() - state.timestamp < 300000) {
                    if (state.currentSection) {
                        setTimeout(() => {
                            this.navigateTo(state.currentSection);
                        }, 100);
                    }
                }
            } catch (error) {
                console.warn('Error restoring navigation state:', error);
            }
        }
    }
    
    // Utility methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    getCurrentSection() {
        return this.currentSection;
    }
    
    getAllSections() {
        return Array.from(this.sections).map(section => ({
            id: section.getAttribute('id'),
            title: section.querySelector('h1, h2, h3')?.textContent || section.getAttribute('id'),
            element: section
        }));
    }
    
    // Progress indicator
    updateScrollProgress() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        // Update progress bar if it exists
        const progressBar = document.querySelector('.scroll-progress-bar');
        if (progressBar) {
            progressBar.style.width = `${scrollPercent}%`;
        }
        
        // Dispatch progress event
        document.dispatchEvent(new CustomEvent('scrollprogress', {
            detail: { percent: scrollPercent, position: scrollTop }
        }));
    }
    
    // Accessibility helpers
    announceNavigation(sectionName) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `Navegando para ${sectionName}`;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
    
    // Debug helpers
    debugNavigation() {
        console.group('🧭 Navigation Debug Info');
        console.log('Current section:', this.currentSection);
        console.log('Scroll position:', window.scrollY);
        console.log('Available sections:', this.getAllSections());
        console.log('Active links:', Array.from(this.navLinks).filter(link => 
            link.classList.contains('active')
        ));
        console.groupEnd();
    }
}

export default NavigationManager;
