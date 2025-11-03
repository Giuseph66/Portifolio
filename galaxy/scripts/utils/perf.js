// Performance monitoring and optimization utilities

export class PerformanceMonitor {
    constructor() {
        this.fps = 60;
        this.frameTime = 0;
        this.lastTime = performance.now();
        this.frames = 0;
        this.fpsUpdateInterval = 1000;
        this.lastFpsUpdate = 0;
        
        this.settings = {
            targetFPS: 60,
            lowPowerMode: false,
            reducedMotion: this.checkReducedMotion(),
            isMobile: this.checkMobile(),
            maxParticles: this.checkMobile() ? 3000 : 15000,
            enablePostProcessing: !this.checkMobile(),
            enableBloom: !this.checkMobile(),
            shadowQuality: this.checkMobile() ? 'none' : 'low'
        };
        
        this.budget = {
            drawCalls: 0,
            triangles: 0,
            maxDrawCalls: 150,
            maxTriangles: 100000
        };
    }

    checkMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    checkReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    update() {
        const now = performance.now();
        this.frameTime = now - this.lastTime;
        this.lastTime = now;
        this.frames++;

        // Update FPS counter
        if (now - this.lastFpsUpdate >= this.fpsUpdateInterval) {
            this.fps = Math.round((this.frames * 1000) / (now - this.lastFpsUpdate));
            this.frames = 0;
            this.lastFpsUpdate = now;
            
            // Auto-adjust quality based on FPS
            this.autoAdjustQuality();
        }
    }

    autoAdjustQuality() {
        if (this.fps < 30 && !this.settings.lowPowerMode) {
            console.log('Low FPS detected, enabling low power mode');
            this.enableLowPowerMode();
        } else if (this.fps > 55 && this.settings.lowPowerMode) {
            console.log('FPS stable, disabling low power mode');
            this.disableLowPowerMode();
        }
    }

    enableLowPowerMode() {
        this.settings.lowPowerMode = true;
        this.settings.maxParticles = Math.floor(this.settings.maxParticles * 0.5);
        this.settings.enablePostProcessing = false;
        this.settings.enableBloom = false;
        this.settings.shadowQuality = 'none';
    }

    disableLowPowerMode() {
        this.settings.lowPowerMode = false;
        this.settings.maxParticles = this.checkMobile() ? 3000 : 15000;
        this.settings.enablePostProcessing = !this.checkMobile();
        this.settings.enableBloom = !this.checkMobile();
        this.settings.shadowQuality = this.checkMobile() ? 'none' : 'low';
    }

    updateBudget(renderer) {
        if (renderer && renderer.info) {
            this.budget.drawCalls = renderer.info.render.calls;
            this.budget.triangles = renderer.info.render.triangles;
        }
    }

    isOverBudget() {
        return this.budget.drawCalls > this.budget.maxDrawCalls ||
               this.budget.triangles > this.budget.maxTriangles;
    }

    getStats() {
        return {
            fps: this.fps,
            frameTime: this.frameTime.toFixed(2),
            drawCalls: this.budget.drawCalls,
            triangles: this.budget.triangles,
            lowPowerMode: this.settings.lowPowerMode,
            isMobile: this.settings.isMobile
        };
    }

    shouldReduceEffects() {
        return this.settings.reducedMotion || this.settings.lowPowerMode;
    }
}

export const perfMonitor = new PerformanceMonitor();
