// Core 3D engine initialization and management
import * as THREE from '../../../vendor/three.module.js';
import { perfMonitor } from '../utils/perf.js';

export class Engine {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        this.isRunning = false;
        this.animationId = null;

        // Adaptive rendering optimization
        this.frameSkip = 0;
        this.frameSkipThreshold = 0;
        this.targetFPS = 45;
        this.lowPerfThreshold = 30;
        this.adaptiveCheckInterval = 5000; // Check every 5 seconds
        this.lastAdaptiveCheck = 0;

        this.init();
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x0a0e27, 0.00015);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: false, // Use FXAA instead
            alpha: false,
            powerPreference: 'high-performance'
        });
        
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x0a0e27, 1);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        
        this.container.appendChild(this.renderer.domElement);

        // Setup lights
        this.setupLights();

        // Handle resize
        window.addEventListener('resize', () => this.onResize());
        
        console.log('Engine initialized');
    }

    setupLights() {
        // Hemisphere light for ambient
        const hemiLight = new THREE.HemisphereLight(0x4488ff, 0x002244, 0.4);
        this.scene.add(hemiLight);

        // Directional light (weak, no shadows on mobile)
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.3);
        dirLight.position.set(50, 100, 50);
        
        if (!perfMonitor.settings.isMobile) {
            dirLight.castShadow = false; // Disabled for performance
        }
        
        this.scene.add(dirLight);

        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
    }

    onResize() {
        if (!this.renderer) return;
        
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.renderer.setSize(width, height);
        
        // Notify camera (will be handled by camera module)
        window.dispatchEvent(new CustomEvent('engine:resize', {
            detail: { width, height }
        }));
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.animate();
        console.log('Engine started');
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        console.log('Engine stopped');
    }

    animate() {
        if (!this.isRunning) return;

        this.animationId = requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        const elapsed = this.clock.getElapsedTime();
        const now = performance.now();

        // Adaptive rendering: skip frames if performance is poor
        if (this.frameSkipThreshold > 0) {
            this.frameSkip++;
            if (this.frameSkip < this.frameSkipThreshold) {
                return; // Skip this frame
            }
            this.frameSkip = 0;
        }

        // Periodic adaptive quality check
        if (now - this.lastAdaptiveCheck > this.adaptiveCheckInterval) {
            this.adjustAdaptiveRendering();
            this.lastAdaptiveCheck = now;
        }

        // Update performance monitor
        perfMonitor.update();
        perfMonitor.updateBudget(this.renderer);

        // Dispatch update event
        window.dispatchEvent(new CustomEvent('engine:update', {
            detail: { delta, elapsed }
        }));

        // Render will be called by main after camera update
    }

    adjustAdaptiveRendering() {
        const currentFPS = perfMonitor ? perfMonitor.fps : 60;

        if (currentFPS < this.lowPerfThreshold) {
            // Performance is very poor, enable frame skipping
            this.frameSkipThreshold = Math.min(2, Math.floor((this.targetFPS - currentFPS) / 10) + 1);
            console.log(`Engine: Enabling adaptive rendering (skip ${this.frameSkipThreshold} frames)`);
        } else if (currentFPS > this.targetFPS + 5) {
            // Performance is good, reduce or disable frame skipping
            if (this.frameSkipThreshold > 0) {
                this.frameSkipThreshold = Math.max(0, this.frameSkipThreshold - 1);
                if (this.frameSkipThreshold === 0) {
                    console.log('Engine: Disabling adaptive rendering');
                }
            }
        }
    }

    render(camera) {
        if (this.renderer && this.scene && camera) {
            this.renderer.render(this.scene, camera);
        }
    }

    dispose() {
        this.stop();
        
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement && this.renderer.domElement.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
        }
        
        window.removeEventListener('resize', this.onResize);
        
        console.log('Engine disposed');
    }

    getScene() {
        return this.scene;
    }

    getRenderer() {
        return this.renderer;
    }

    getClock() {
        return this.clock;
    }
}
