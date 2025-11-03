// Simplified camera management with first/third person modes
import * as THREE from '../../../vendor/three.module.js';
import { clamp, lerp } from '../utils/math.js';

export class CameraController {
    constructor() {
        this.camera = null;
        this.target = new THREE.Vector3(0, 0, 0);
        this.currentTarget = new THREE.Vector3(0, 0, 0);
        this.smoothness = 0.08;
        
        // Camera modes
        this.mode = 'third-person'; // 'first-person' or 'third-person'
        this.thirdPersonDistance = 20;
        this.thirdPersonHeight = 6;
        this.firstPersonOffset = new THREE.Vector3(0, 1, 3);
        
        // Position limits
        this.limits = {
            minX: -1000,
            maxX: 1000,
            minY: -600,
            maxY: 600,
            minZ: -1000,
            maxZ: 1000,
            maxDistance: 1200
        };
        
        // Camera shake
        this.shake = {
            intensity: 0,
            decay: 0.95,
            offset: new THREE.Vector3()
        };
        
        // Spaceship reference
        this.spaceship = null;
        
        this.init();
        this.setupEventListeners();
    }

    init() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            3000
        );
        
        this.camera.position.set(0, 50, 200);
        this.camera.lookAt(0, 0, 0);
        
        console.log('Camera initialized (simplified controls)');
    }

    setupEventListeners() {
        window.addEventListener('engine:resize', (e) => {
            const { width, height } = e.detail;
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        });
    }

    setSpaceship(spaceship) {
        this.spaceship = spaceship;
    }

    toggleMode() {
        this.mode = this.mode === 'first-person' ? 'third-person' : 'first-person';
        console.log('Camera mode:', this.mode);
        
        // Show/hide spaceship based on mode
        if (this.spaceship) {
            this.spaceship.setVisible(this.mode === 'third-person');
        }
        
        window.dispatchEvent(new CustomEvent('camera:mode-changed', {
            detail: { mode: this.mode }
        }));
    }

    update(delta) {
        // Smooth camera target following
        this.currentTarget.lerp(this.target, this.smoothness);
        
        // Apply camera shake
        if (this.shake.intensity > 0.01) {
            this.shake.offset.set(
                (Math.random() - 0.5) * this.shake.intensity,
                (Math.random() - 0.5) * this.shake.intensity,
                (Math.random() - 0.5) * this.shake.intensity
            );
            this.shake.intensity *= this.shake.decay;
        } else {
            this.shake.offset.set(0, 0, 0);
            this.shake.intensity = 0;
        }
        
        // Update camera position based on mode
        if (this.spaceship) {
            this.updateSpaceshipCamera();
        } else {
            this.updateFreeCamera();
        }
        
        // Apply limits to camera position
        this.applyLimits();
    }

    updateSpaceshipCamera() {
        const shipPos = this.spaceship.getPosition();
        const shipGroup = this.spaceship.getGroup();
        
        if (this.mode === 'first-person') {
            // First person: camera inside cockpit
            const offset = this.firstPersonOffset.clone();
            offset.applyQuaternion(shipGroup.quaternion);
            
            this.camera.position.copy(shipPos).add(offset).add(this.shake.offset);
            
            // Look in the direction the ship is facing
            const forward = new THREE.Vector3(0, 0, 1);
            forward.applyQuaternion(shipGroup.quaternion);
            this.camera.lookAt(this.camera.position.clone().add(forward.multiplyScalar(100)));
            
        } else {
            // Third person: camera behind and above ship
            const offset = new THREE.Vector3(
                0,
                this.thirdPersonHeight,
                -this.thirdPersonDistance
            );
            offset.applyQuaternion(shipGroup.quaternion);
            
            const targetPos = shipPos.clone().add(offset).add(this.shake.offset);
            this.camera.position.lerp(targetPos, 0.15);
            
            // Look at ship (slightly ahead)
            const lookAtPos = shipPos.clone();
            const forward = new THREE.Vector3(0, 0, 1);
            forward.applyQuaternion(shipGroup.quaternion);
            lookAtPos.add(forward.multiplyScalar(5));
            lookAtPos.y += 2;
            
            this.camera.lookAt(lookAtPos);
        }
    }

    updateFreeCamera() {
        // Free camera mode (no spaceship)
        const lookAtTarget = new THREE.Vector3()
            .copy(this.currentTarget)
            .add(this.shake.offset);
        
        this.camera.lookAt(lookAtTarget);
    }

    applyLimits() {
        const pos = this.camera.position;
        
        // Clamp position
        pos.x = clamp(pos.x, this.limits.minX, this.limits.maxX);
        pos.y = clamp(pos.y, this.limits.minY, this.limits.maxY);
        pos.z = clamp(pos.z, this.limits.minZ, this.limits.maxZ);
        
        // Clamp distance from origin
        const distance = pos.length();
        if (distance > this.limits.maxDistance) {
            pos.normalize().multiplyScalar(this.limits.maxDistance);
        }
    }

    setTarget(x, y, z) {
        this.target.set(x, y, z);
    }

    setPosition(x, y, z) {
        this.camera.position.set(x, y, z);
    }

    moveBy(dx, dy, dz) {
        this.camera.position.x += dx;
        this.camera.position.y += dy;
        this.camera.position.z += dz;
    }

    addShake(intensity) {
        this.shake.intensity = Math.min(this.shake.intensity + intensity, 10);
    }

    getCamera() {
        return this.camera;
    }

    getPosition() {
        return this.camera.position.clone();
    }

    getDirection() {
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);
        return direction;
    }

    getMode() {
        return this.mode;
    }

    // Get distance to a point
    distanceTo(x, y, z) {
        const target = new THREE.Vector3(x, y, z);
        return this.camera.position.distanceTo(target);
    }

    // Smooth transition to position
    transitionTo(x, y, z, duration = 2000) {
        return new Promise((resolve) => {
            const startPos = this.camera.position.clone();
            const endPos = new THREE.Vector3(x, y, z);
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease in-out
                const t = progress < 0.5
                    ? 4 * progress * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
                
                this.camera.position.lerpVectors(startPos, endPos, t);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            animate();
        });
    }

    // Look at with smooth transition
    lookAtSmooth(x, y, z, duration = 1000) {
        return new Promise((resolve) => {
            const startTarget = this.target.clone();
            const endTarget = new THREE.Vector3(x, y, z);
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                const t = progress < 0.5
                    ? 2 * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                
                this.target.lerpVectors(startTarget, endTarget, t);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            animate();
        });
    }
}
