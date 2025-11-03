// Starfield with improved star rendering and glow
import * as THREE from '../../../vendor/three.module.js';
import { perfMonitor } from '../utils/perf.js';
import { randomRange } from '../utils/math.js';

export class Starfield {
    constructor(scene) {
        this.scene = scene;
        this.stars = null;
        this.count = perfMonitor.settings.maxParticles;
        this.currentCount = this.count;

        // Performance monitoring
        this.lastPerformanceCheck = 0;
        this.performanceCheckInterval = 2000; // Check every 2 seconds
        this.targetFPS = 50;
        this.minStars = 1000;
        this.maxStars = perfMonitor.settings.maxParticles;

        this.create();
    }

    create() {
        // Adjust count based on device
        const count = perfMonitor.settings.isMobile ? 3000 : 15000;
        
        // Create geometry
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            
            // Random position in sphere
            const radius = randomRange(200, 1000);
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // Star color variation (white to slightly blue/yellow)
            const colorType = Math.random();
            if (colorType < 0.7) {
                // White stars
                colors[i3] = 1.0;
                colors[i3 + 1] = 1.0;
                colors[i3 + 2] = 1.0;
            } else if (colorType < 0.85) {
                // Blue-ish stars
                colors[i3] = 0.8;
                colors[i3 + 1] = 0.9;
                colors[i3 + 2] = 1.0;
            } else {
                // Yellow-ish stars
                colors[i3] = 1.0;
                colors[i3 + 1] = 0.95;
                colors[i3 + 2] = 0.8;
            }
            
            // Random size with more variation
            sizes[i] = randomRange(1.0, 3.5);
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Create custom shader material for better star appearance
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                enableTwinkle: { value: true }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                uniform float time;
                uniform bool enableTwinkle;

                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

                    float twinkle = 1.0;
                    if (enableTwinkle) {
                        // Slight twinkle effect (only when performance allows)
                        twinkle = sin(time * 2.0 + position.x * 0.1) * 0.3 + 0.7;
                    }

                    gl_PointSize = size * twinkle * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    // Create circular star with soft glow
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);
                    
                    // Soft circular gradient
                    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
                    
                    // Add glow
                    float glow = exp(-dist * 4.0);
                    alpha = max(alpha, glow * 0.3);
                    
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        // Create points
        this.stars = new THREE.Points(geometry, material);
        this.scene.add(this.stars);
        
        console.log(`Starfield created with ${count} stars (improved)`);
    }

    update(delta, elapsed) {
        if (!this.stars) return;

        // Dynamic performance adjustment
        const now = performance.now();
        if (now - this.lastPerformanceCheck > this.performanceCheckInterval) {
            this.adjustStarCount();
            this.lastPerformanceCheck = now;
        }

        // Update shader uniforms (performance-aware)
        if (this.stars.material.uniforms) {
            // Disable twinkle effect when FPS is low
            const enableTwinkle = perfMonitor && perfMonitor.fps > 45;
            if (this.stars.material.uniforms.enableTwinkle.value !== enableTwinkle) {
                this.stars.material.uniforms.enableTwinkle.value = enableTwinkle;
            }

            // Only update time if twinkle is enabled
            if (enableTwinkle) {
                this.stars.material.uniforms.time.value = elapsed;
            }
        }

        // Very slow rotation for parallax effect
        this.stars.rotation.y += delta * 0.005;
        this.stars.rotation.x += delta * 0.002;
    }

    adjustStarCount() {
        const currentFPS = perfMonitor ? perfMonitor.fps : 60;
        let targetCount = this.currentCount;

        if (currentFPS < 30) {
            // Performance is poor, reduce star count
            targetCount = Math.max(this.minStars, Math.floor(this.currentCount * 0.8));
        } else if (currentFPS > this.targetFPS + 10) {
            // Performance is good, can increase star count slightly
            targetCount = Math.min(this.maxStars, Math.floor(this.currentCount * 1.1));
        }

        if (Math.abs(targetCount - this.currentCount) > 100) {
            // Only update if change is significant
            this.updateCount(targetCount);
            this.currentCount = targetCount;
            console.log(`Starfield: Adjusted star count to ${targetCount} (${currentFPS} FPS)`);
        }
    }

    updateCount(newCount) {
        if (this.stars) {
            this.scene.remove(this.stars);
            this.stars.geometry.dispose();
            this.stars.material.dispose();
        }

        this.count = newCount;
        this.create();
    }

    dispose() {
        if (this.stars) {
            this.scene.remove(this.stars);
            this.stars.geometry.dispose();
            this.stars.material.dispose();
        }
    }
}
