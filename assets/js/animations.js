// Animation Management Module
export class AnimationManager {
    constructor() {
        this.observers = [];
        this.animatedElements = new Set();
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.scrollElements = [];
        this.parallaxElements = [];
        this.countUpElements = [];
        
        this.animationQueue = [];
        this.isAnimating = false;
    }
    
    init() {
        this.setupIntersectionObserver();
        this.initializeScrollAnimations();
        this.initializeParallaxElements();
        this.initializeCountUpElements();
        this.setupEventListeners();
        
        console.log('🎬 Animation Manager initialized');
    }
    
    setupIntersectionObserver() {
        // Main intersection observer for entrance animations
        this.mainObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                    this.animateElement(entry.target);
                    this.animatedElements.add(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observe all animatable elements
        this.observeElements();
    }
    
    observeElements() {
        // Elements with data-animate attribute
        const animateElements = document.querySelectorAll('[data-animate]');
        animateElements.forEach(element => {
            this.mainObserver.observe(element);
        });
        
        // Cards and sections
        const cards = document.querySelectorAll('.card, .project-card, .skill-card, .process-card');
        cards.forEach(card => {
            card.setAttribute('data-animate', 'fadeInUp');
            this.mainObserver.observe(card);
        });
        
        // Section headers
        const sectionHeaders = document.querySelectorAll('.section-header, .page-header');
        sectionHeaders.forEach(header => {
            header.setAttribute('data-animate', 'fadeInDown');
            this.mainObserver.observe(header);
        });
    }
    
    animateElement(element) {
        if (this.isReducedMotion) return;
        
        const animationType = element.getAttribute('data-animate') || 'fadeInUp';
        const delay = element.getAttribute('data-delay') || 0;
        const duration = element.getAttribute('data-duration') || 600;
        
        setTimeout(() => {
            this.applyAnimation(element, animationType, duration);
        }, parseInt(delay));
    }
    
    applyAnimation(element, type, duration) {
        element.style.opacity = '0';
        element.style.transform = this.getInitialTransform(type);
        element.style.transition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        
        // Force reflow
        element.offsetHeight;
        
        // Apply final state
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'none';
            
            // Add completion class
            setTimeout(() => {
                element.classList.add('animation-complete');
            }, duration);
        });
    }
    
    getInitialTransform(type) {
        const transforms = {
            fadeInUp: 'translateY(30px)',
            fadeInDown: 'translateY(-30px)',
            fadeInLeft: 'translateX(-30px)',
            fadeInRight: 'translateX(30px)',
            fadeIn: 'scale(0.9)',
            zoomIn: 'scale(0.8)',
            slideInUp: 'translateY(50px)',
            slideInDown: 'translateY(-50px)',
            slideInLeft: 'translateX(-50px)',
            slideInRight: 'translateX(50px)',
            rotateIn: 'rotate(-10deg) scale(0.9)',
            flipInX: 'rotateX(-90deg)',
            flipInY: 'rotateY(-90deg)'
        };
        
        return transforms[type] || transforms.fadeInUp;
    }
    
    initializeScrollAnimations() {
        // Navbar scroll effect
        this.setupNavbarAnimation();
        
        // Parallax scrolling
        this.setupParallaxScrolling();
        
        // Progress indicators
        this.setupProgressIndicators();
    }
    
    setupNavbarAnimation() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        
        let lastScrollY = window.scrollY;
        let ticking = false;
        
        const updateNavbar = () => {
            const scrollY = window.scrollY;
            
            if (scrollY > 100) {
                navbar.classList.add('navbar-scrolled');
                
                // Hide/show navbar based on scroll direction
                if (scrollY > lastScrollY && scrollY > 200) {
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    navbar.style.transform = 'translateY(0)';
                }
            } else {
                navbar.classList.remove('navbar-scrolled');
                navbar.style.transform = 'translateY(0)';
            }
            
            lastScrollY = scrollY;
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        });
    }
    
    setupParallaxScrolling() {
        this.parallaxElements = document.querySelectorAll('[data-parallax]');
        
        if (this.parallaxElements.length === 0 || this.isReducedMotion) return;
        
        const updateParallax = () => {
            const scrollY = window.scrollY;
            
            this.parallaxElements.forEach(element => {
                const speed = parseFloat(element.getAttribute('data-parallax')) || 0.5;
                const yPos = -(scrollY * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        };
        
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        });
    }
    
    setupProgressIndicators() {
        // Scroll progress bar
        const progressBar = document.querySelector('.scroll-progress');
        if (progressBar) {
            const updateProgress = () => {
                const scrollTop = window.pageYOffset;
                const docHeight = document.body.scrollHeight - window.innerHeight;
                const scrollPercent = (scrollTop / docHeight) * 100;
                progressBar.style.width = `${Math.min(scrollPercent, 100)}%`;
            };
            
            window.addEventListener('scroll', updateProgress);
        }
        
        // Skill progress bars
        const skillBars = document.querySelectorAll('.skill-progress');
        if (skillBars.length > 0) {
            const skillObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const progress = entry.target.getAttribute('data-progress') || 0;
                        this.animateProgressBar(entry.target, progress);
                    }
                });
            }, { threshold: 0.5 });
            
            skillBars.forEach(bar => skillObserver.observe(bar));
        }
    }
    
    animateProgressBar(element, targetProgress) {
        let currentProgress = 0;
        const increment = targetProgress / 60; // 60 frames for 1 second at 60fps
        
        const animate = () => {
            currentProgress += increment;
            if (currentProgress >= targetProgress) {
                currentProgress = targetProgress;
            }
            
            element.style.width = `${currentProgress}%`;
            
            if (currentProgress < targetProgress) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    initializeCountUpElements() {
        this.countUpElements = document.querySelectorAll('[data-countup]');
        
        if (this.countUpElements.length === 0) return;
        
        const countUpObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    const target = parseInt(entry.target.getAttribute('data-countup'));
                    const duration = parseInt(entry.target.getAttribute('data-duration')) || 2000;
                    this.animateCountUp(entry.target, target, duration);
                    entry.target.classList.add('counted');
                }
            });
        }, { threshold: 0.5 });
        
        this.countUpElements.forEach(element => {
            countUpObserver.observe(element);
        });
    }
    
    animateCountUp(element, target, duration) {
        const start = 0;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * easeOut);
            
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = target.toLocaleString();
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    initializeParallaxElements() {
        // Background parallax elements
        const parallaxBgs = document.querySelectorAll('.parallax-bg');
        parallaxBgs.forEach(bg => {
            bg.setAttribute('data-parallax', '0.3');
        });
        
        // Floating elements
        this.initializeFloatingElements();
    }
    
    initializeFloatingElements() {
        const floatingElements = document.querySelectorAll('.floating');
        
        floatingElements.forEach((element, index) => {
            const delay = index * 0.5;
            const duration = 3 + (index % 3);
            
            element.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
        });
    }
    
    setupEventListeners() {
        // Reduced motion preference change
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            this.isReducedMotion = e.matches;
            if (this.isReducedMotion) {
                this.disableAnimations();
            }
        });
        
        // Page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
        
        // Window resize
        window.addEventListener('resize', this.debounce(() => {
            this.recalculate();
        }, 250));
    }
    
    // Public methods
    startEntranceAnimations() {
        // Animate hero section
        const hero = document.querySelector('.hero');
        if (hero) {
            this.animateHeroSection(hero);
        }
        
        // Stagger animate navigation items
        const navItems = document.querySelectorAll('.nav-link');
        navItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    animateHeroSection(hero) {
        const elements = hero.querySelectorAll('.hero-title, .hero-subtitle, .hero-description, .hero-badges, .hero-buttons');
        
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 200 + 300);
        });
    }
    
    initializeScrollAnimations() {
        // Already implemented above
    }
    
    startBackgroundAnimations() {
        // Gradient animations
        this.startGradientAnimations();
        
        // Particle effects (if needed)
        this.initializeParticleEffects();
    }
    
    startGradientAnimations() {
        const gradientElements = document.querySelectorAll('.gradient-bg');
        
        gradientElements.forEach(element => {
            element.style.backgroundSize = '400% 400%';
            element.style.animation = 'gradientShift 15s ease infinite';
        });
    }
    
    initializeParticleEffects() {
        // Simple floating particles for hero section
        const hero = document.querySelector('.hero');
        if (!hero || this.isReducedMotion) return;
        
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: var(--accent-primary);
                border-radius: 50%;
                opacity: 0.3;
                animation: float ${5 + i}s ease-in-out infinite;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation-delay: ${i * 0.5}s;
            `;
            
            hero.appendChild(particle);
        }
    }
    
    handleScroll() {
        // Trigger scroll-based animations
        this.updateScrollProgress();
        this.checkScrollTriggers();
    }
    
    updateScrollProgress() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        // Update any progress indicators
        document.dispatchEvent(new CustomEvent('scrollprogress', {
            detail: { percent: scrollPercent, position: scrollTop }
        }));
    }
    
    checkScrollTriggers() {
        // Check for elements that should animate on scroll
        const triggers = document.querySelectorAll('[data-scroll-trigger]');
        
        triggers.forEach(trigger => {
            const rect = trigger.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible && !trigger.classList.contains('triggered')) {
                trigger.classList.add('triggered');
                const animation = trigger.getAttribute('data-scroll-trigger');
                this.triggerAnimation(trigger, animation);
            }
        });
    }
    
    triggerAnimation(element, animation) {
        switch (animation) {
            case 'fadeIn':
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
                break;
            case 'slideIn':
                element.style.transform = 'translateX(0)';
                break;
            case 'scaleIn':
                element.style.transform = 'scale(1)';
                break;
            default:
                element.classList.add('animate-' + animation);
        }
    }
    
    recalculate() {
        // Recalculate animation positions after resize
        this.parallaxElements.forEach(element => {
            element.style.transform = 'none';
        });
        
        // Re-observe elements if needed
        this.observeElements();
    }
    
    pause() {
        // Pause all animations
        document.body.style.animationPlayState = 'paused';
        
        // Pause CSS animations
        const animatedElements = document.querySelectorAll('*');
        animatedElements.forEach(element => {
            element.style.animationPlayState = 'paused';
        });
    }
    
    resume() {
        // Resume all animations
        document.body.style.animationPlayState = 'running';
        
        // Resume CSS animations
        const animatedElements = document.querySelectorAll('*');
        animatedElements.forEach(element => {
            element.style.animationPlayState = 'running';
        });
    }
    
    disableAnimations() {
        // Disable all animations for reduced motion
        const style = document.createElement('style');
        style.textContent = `
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Animation presets
    animateIn(element, type = 'fadeInUp', delay = 0) {
        if (this.isReducedMotion) return;
        
        setTimeout(() => {
            this.applyAnimation(element, type, 600);
        }, delay);
    }
    
    animateOut(element, type = 'fadeOut', callback) {
        if (this.isReducedMotion) {
            if (callback) callback();
            return;
        }
        
        element.style.transition = 'all 300ms ease-in-out';
        element.style.opacity = '0';
        element.style.transform = this.getExitTransform(type);
        
        setTimeout(() => {
            if (callback) callback();
        }, 300);
    }
    
    getExitTransform(type) {
        const transforms = {
            fadeOut: 'scale(0.9)',
            slideOutUp: 'translateY(-30px)',
            slideOutDown: 'translateY(30px)',
            slideOutLeft: 'translateX(-30px)',
            slideOutRight: 'translateX(30px)',
            zoomOut: 'scale(0.8)',
            rotateOut: 'rotate(10deg) scale(0.9)'
        };
        
        return transforms[type] || transforms.fadeOut;
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
    
    // Cleanup
    destroy() {
        // Disconnect observers
        if (this.mainObserver) {
            this.mainObserver.disconnect();
        }
        
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        
        // Clear animation queue
        this.animationQueue = [];
        
        console.log('🎬 Animation Manager destroyed');
    }
}

export default AnimationManager;
