// Enhanced controls with improved mouse navigation and mouse flight mode
import * as THREE from '../../../vendor/three.module.js';
import { clamp, normalizeAngle } from '../utils/math.js';

export class Controls {
    constructor(camera, spaceship = null) {
        this.camera = camera;
        this.spaceship = spaceship;
        this.enabled = true;
        this.pendingMouseFlightRelock = false;
        
        // Movement state
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            up: false,
            down: false,
            shift: false
        };
        
        // Mouse state - simplified and improved
        this.mouse = {
            sensitivity: 0.002, // Adjusted for direct camera control
            rightButton: false,
            leftButton: false, 
            lastX: 0,
            lastY: 0,
            deltaX: 0, 
            deltaY: 0  
        };

        // Touch detection and sensitivity boost for mobile
        this.isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        if (this.isTouch) {
            // Increase look sensitivity on touch devices
            this.mouse.sensitivity = 0.0045;
        }
        
        // Rotation state for spaceship
        this.rotation = {
            yaw: 0,
            pitch: 0,
            roll: 0
        };
        
        // New mouse flight mode
        this.mouseFlightMode = false;

        // Movement settings
        this.speed = 80;
        this.turboMultiplier = 2.5;
        this.rotationSpeed = 5;
        
        // Autopilot
        this.autopilot = {
            active: false,
            target: null,
            speed: 0.03,
            arrivalDistance: 40
        };
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Keyboard
        window.addEventListener("keydown", (e) => this.onKeyDown(e));
        window.addEventListener("keyup", (e) => this.onKeyUp(e));
        
        // Mouse - simplified
        window.addEventListener("mousemove", (e) => this.onMouseMove(e));
        window.addEventListener("mousedown", (e) => this.onMouseDown(e));
        window.addEventListener("mouseup", (e) => this.onMouseUp(e));
        
        // Pointer lock events
        document.addEventListener("pointerlockchange", () => this.onPointerLockChange());
        document.addEventListener("mozpointerlockchange", () => this.onPointerLockChange()); // Firefox
        document.addEventListener("webkitpointerlockchange", () => this.onPointerLockChange()); // Chrome, Safari

        // Prevent context menu
        window.addEventListener("contextmenu", (e) => e.preventDefault());
    }

    // Touch look for mobile (delta in px)
    onTouchLook(dx, dy) {
        if (!this.enabled) return;
        // Simulate mouse flight yaw/pitch changes
        const gain = this.isTouch ? 1.4 : 1.0;
        this.rotation.yaw -= (dx || 0) * this.mouse.sensitivity * gain;
        this.rotation.pitch += (dy || 0) * this.mouse.sensitivity * gain;
        this.rotation.pitch = clamp(this.rotation.pitch, -Math.PI / 2, Math.PI / 2);
    }

    // Allow HUD to force mouse flight active on mobile
    setMouseFlightActive(active) {
        if (active && !this.mouseFlightMode) {
            // On mobile, we don't need pointer lock, just set the mode
            if (this.isTouch) {
                this.mouseFlightMode = true;
                window.dispatchEvent(new CustomEvent("controls:mouse-flight-mode-changed", {
                    detail: { active: true }
                }));
            } else {
                this.toggleMouseFlightMode();
            }
        } else if (!active && this.mouseFlightMode) {
            // On mobile, we don't need pointer lock, just unset the mode
            if (this.isTouch) {
                this.mouseFlightMode = false;
                window.dispatchEvent(new CustomEvent("controls:mouse-flight-mode-changed", {
                    detail: { active: false }
                }));
            } else {
                this.toggleMouseFlightMode();
            }
        }
    }

    onKeyDown(e) {
        if (!this.enabled) return;

        switch (e.code) {
            case "KeyW":
            case "ArrowUp":
                this.keys.forward = true;
                this.autopilot.active = false;
                break;
            case "KeyS":
            case "ArrowDown":
                this.keys.backward = true;
                this.autopilot.active = false;
                break;
            case "KeyA":
            case "ArrowLeft":
                this.keys.left = true;
                this.autopilot.active = false;
                break;
            case "KeyD":
            case "ArrowRight":
                this.keys.right = true;
                this.autopilot.active = false;
                break;
            case "KeyQ":
                this.keys.down = true;
                this.autopilot.active = false;
                break;
            case "KeyE":
                this.keys.up = true;
                this.autopilot.active = false;
                break;
            case "ShiftLeft":
            case "ShiftRight":
                this.keys.shift = true;
                break;
            case "Space":
                this.toggleAutopilot();
                e.preventDefault();
                break;
            case "KeyG":
                this.toggleMode();
                break;
            case "KeyV":
                // Toggle camera view (first/third person)
                this.camera.toggleMode();
                e.preventDefault();
                break;
            case "KeyM": // Toggle mouse flight mode
                this.toggleMouseFlightMode();
                e.preventDefault();
                break;
            case "Escape": // Exit mouse flight mode
                if (this.mouseFlightMode) {
                    this.toggleMouseFlightMode();
                    e.preventDefault();
                }
                break;
        }
    }

    onKeyUp(e) {
        switch (e.code) {
            case "KeyW":
            case "ArrowUp":
                this.keys.forward = false;
                break;
            case "KeyS":
            case "ArrowDown":
                this.keys.backward = false;
                break;
            case "KeyA":
            case "ArrowLeft":
                this.keys.left = false;
                break;
            case "KeyD":
            case "ArrowRight":
                this.keys.right = false;
                break;
            case "KeyQ":
                this.keys.down = false;
                break;
            case "KeyE":
                this.keys.up = false;
                break;
            case "ShiftLeft":
            case "ShiftRight":
                this.keys.shift = false;
                break;
        }
    }

    onMouseMove(e) {
        if (!this.enabled) return;
        
        // Only process mouse movement if pointer is locked (for mouse flight mode)
        if (document.pointerLockElement === document.body) {
            // Limit mouse movement to prevent extreme values
            const maxDelta = 100; // Maximum pixels per frame
            this.mouse.deltaX = clamp(e.movementX || 0, -maxDelta, maxDelta);
            this.mouse.deltaY = clamp(e.movementY || 0, -maxDelta, maxDelta);

            // Apply rotation based on mouse movement
            // Fixed Y-axis: mouse up -> pitch up (positive deltaY movement should pitch up)
            this.rotation.yaw -= this.mouse.deltaX * this.mouse.sensitivity;
            this.rotation.pitch += this.mouse.deltaY * this.mouse.sensitivity; // Fixed: inverted sign
            
            // DON'T normalize yaw here - let updateSpaceshipControls handle it
            // This prevents conflicts between normalized and non-normalized values
            
            // Clamp pitch to prevent gimbal lock
            this.rotation.pitch = clamp(this.rotation.pitch, -Math.PI / 2, Math.PI / 2);
        } else if (this.mouse.rightButton && this.spaceship && !this.mouseFlightMode) {
            // Old right-click rotation for non-mouse-flight mode
            const deltaX = e.clientX - this.mouse.lastX;
            const deltaY = e.clientY - this.mouse.lastY;
            
            // Limit delta to prevent extreme values
            const maxDelta = 50;
            const clampedDeltaX = clamp(deltaX, -maxDelta, maxDelta);
            const clampedDeltaY = clamp(deltaY, -maxDelta, maxDelta);
            
            this.rotation.yaw -= clampedDeltaX * this.mouse.sensitivity * 0.01;
            this.rotation.pitch += clampedDeltaY * this.mouse.sensitivity * 0.01; // Fixed: inverted sign
            
            // DON'T normalize yaw here - let updateSpaceshipControls handle it
            
            // Clamp pitch
            this.rotation.pitch = clamp(this.rotation.pitch, -Math.PI / 3, Math.PI / 3);
        }
        
        this.mouse.lastX = e.clientX;
        this.mouse.lastY = e.clientY;
    }

    onMouseDown(e) {
        if (e.button === 0) { // Left click
            this.mouse.leftButton = true;
            // Only toggle mouse flight when clicking on the 3D canvas, not on UI
            const isCanvas = e.target && e.target.tagName === 'CANVAS';
            if (isCanvas && (!this.mouseFlightMode || this.pendingMouseFlightRelock)) {
                this.pendingMouseFlightRelock = false;
                // Request pointer lock via user gesture
                document.body.requestPointerLock();
            }
        } else if (e.button === 2) { // Right click
            this.mouse.rightButton = true;
            this.mouse.lastX = e.clientX;
            this.mouse.lastY = e.clientY;
            if (!this.mouseFlightMode) {
                document.body.style.cursor = "grabbing";
            }
        }
    }

    onMouseUp(e) {
        if (e.button === 0) {
            this.mouse.leftButton = false;
        } else if (e.button === 2) {
            this.mouse.rightButton = false;
            if (!this.mouseFlightMode) {
                document.body.style.cursor = "default";
            }
        }
    }

    onPointerLockChange() {
        if (document.pointerLockElement === document.body) {
            // Pointer is locked, hide cursor
            document.body.style.cursor = "none";
            this.mouseFlightMode = true; // Ensure mouseFlightMode is active
            window.dispatchEvent(new CustomEvent("controls:mouse-flight-mode-changed", {
                detail: { active: true }
            }));
        } else {
            // Pointer is unlocked, show cursor
            document.body.style.cursor = "default";
            this.mouseFlightMode = false; // Ensure mouseFlightMode is inactive
            window.dispatchEvent(new CustomEvent("controls:mouse-flight-mode-changed", {
                detail: { active: false }
            }));
        }
    }

    update(delta) {
        if (!this.enabled) return;
        
        if (this.autopilot.active) {
            this.updateAutopilot(delta);
        } else {
            if (this.spaceship) {
                this.updateSpaceshipControls(delta);
            } else {
                this.updateManualControls(delta);
            }
        }
    }

    updateSpaceshipControls(delta) {
        const speed = this.speed * delta * (this.keys.shift ? this.turboMultiplier : 1);
        const shipGroup = this.spaceship.getGroup();
        
        // Get current rotation from quaternion
        const currentRotation = new THREE.Euler().setFromQuaternion(shipGroup.quaternion, "YXZ");
        
        // Normalize current rotation to match our tracking
        let currentYaw = normalizeAngle(currentRotation.y);
        let currentPitch = currentRotation.x;
        let currentRoll = currentRotation.z;
        
        // Calculate shortest path for yaw rotation
        let yawDiff = this.rotation.yaw - currentYaw;
        // Normalize the difference to find shortest rotation
        while (yawDiff > Math.PI) yawDiff -= 2 * Math.PI;
        while (yawDiff < -Math.PI) yawDiff += 2 * Math.PI;
        
        // Apply smooth interpolation using shortest path
        currentYaw += yawDiff * 0.2;
        currentPitch += (this.rotation.pitch - currentPitch) * 0.2;
        currentRoll += (this.rotation.roll - currentRoll) * 0.2;
        
        // Update quaternion with interpolated values
        const newRotation = new THREE.Euler(currentPitch, currentYaw, currentRoll, "YXZ");
        shipGroup.quaternion.setFromEuler(newRotation);
        
        // Sync our tracking with actual rotation to prevent drift
        this.rotation.yaw = normalizeAngle(currentYaw);
        this.rotation.pitch = currentPitch;
        this.rotation.roll = currentRoll;
        
        // Get ship's forward direction
        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(shipGroup.quaternion);
        
        const right = new THREE.Vector3(1, 0, 0);
        right.applyQuaternion(shipGroup.quaternion);
        
        const up = new THREE.Vector3(0, 1, 0);
        up.applyQuaternion(shipGroup.quaternion);
        
        // Movement
        if (this.mouseFlightMode) {
            // Mouse flight: WS forward/back, AD strafe, QE ascend/descend
            if (this.keys.forward) {
                shipGroup.position.addScaledVector(forward, speed);
            }
            if (this.keys.backward) {
                shipGroup.position.addScaledVector(forward, -speed * 0.5);
            }

            // Lateral strafing
            if (this.keys.left && !this.keys.shift) {
                shipGroup.position.addScaledVector(right, speed * 0.7);
            }
            if (this.keys.right && !this.keys.shift) {
                shipGroup.position.addScaledVector(right, -speed * 0.7);
            }

            // Vertical movement (world up for intuitive climb/descend)
            const worldUp = new THREE.Vector3(0, 1, 0);
            if (this.keys.up) {
                shipGroup.position.addScaledVector(worldUp, speed * 0.8);
            }
            if (this.keys.down) {
                shipGroup.position.addScaledVector(worldUp, -speed * 0.8);
            }

            // Optional roll with Shift + A/D
            if (this.keys.shift && this.keys.left) {
                this.rotation.roll -= delta * this.rotationSpeed;
            }
            if (this.keys.shift && this.keys.right) {
                this.rotation.roll += delta * this.rotationSpeed;
            }

            // Gentle auto-level roll
            const rollDamping = 0.92;
            if (!(this.keys.shift && (this.keys.left || this.keys.right))) {
                this.rotation.roll *= rollDamping;
                if (Math.abs(this.rotation.roll) < 0.0005) this.rotation.roll = 0;
            }
        } else { // Normal mode
            if (this.keys.forward) {
                shipGroup.position.addScaledVector(forward, speed);
            }
            if (this.keys.backward) {
                shipGroup.position.addScaledVector(forward, -speed * 0.5);
            }
            
            // Strafing only when holding right mouse button; otherwise rotate
            if (this.mouse.rightButton) {
                if (this.keys.left) {
                    shipGroup.position.addScaledVector(right, -speed * 0.7);
                }
                if (this.keys.right) {
                    shipGroup.position.addScaledVector(right, speed * 0.7);
                }
            }
            
            // Vertical movement
            if (this.keys.up) {
                shipGroup.position.addScaledVector(up, speed * 0.8);
            }
            if (this.keys.down) {
                shipGroup.position.addScaledVector(up, -speed * 0.8);
            }
            
            // Keyboard rotation (A/D for yaw when not strafing and not in mouse flight mode)
            if (!this.mouse.rightButton) {
                if (this.keys.left) {
                    this.rotation.yaw += delta * this.rotationSpeed; // A -> left turn
                }
                if (this.keys.right) {
                    this.rotation.yaw -= delta * this.rotationSpeed; // D -> right turn
                }
            }
        }
    }

    updateManualControls(delta) {
        const cam = this.camera.getCamera();
        const speed = this.speed * delta * (this.keys.shift ? this.turboMultiplier : 1);
        
        // Get camera direction vectors
        const forward = new THREE.Vector3();
        cam.getWorldDirection(forward);
        
        const right = new THREE.Vector3();
        right.crossVectors(forward, cam.up).normalize();
        
        // Apply movement
        if (this.keys.forward) {
            cam.position.addScaledVector(forward, speed);
        }
        if (this.keys.backward) {
            cam.position.addScaledVector(forward, -speed);
        }
        if (this.keys.left) {
            cam.position.addScaledVector(right, -speed);
        }
        if (this.keys.right) {
            cam.position.addScaledVector(right, speed);
        }
        if (this.keys.up) {
            cam.position.y += speed;
        }
        if (this.keys.down) {
            cam.position.y -= speed;
        }
        
        // Mouse rotation for free camera (only if not in mouse flight mode)
        if (this.mouse.rightButton && !this.mouseFlightMode) {
            const euler = new THREE.Euler().setFromQuaternion(cam.quaternion, "YXZ");
            euler.y = this.rotation.yaw;
            euler.x = this.rotation.pitch;
            cam.quaternion.setFromEuler(euler);
        }
    }

    updateAutopilot(delta) {
        if (!this.autopilot.target) {
            this.autopilot.active = false;
            return;
        }
        
        const position = this.spaceship ? this.spaceship.getPosition() : this.camera.getCamera().position;
        const target = this.autopilot.target;
        
        // Calculate direction to target
        const direction = new THREE.Vector3()
            .subVectors(target, position)
            .normalize();
        
        const distance = position.distanceTo(target);
        
        // Move towards target
        if (distance > this.autopilot.arrivalDistance) {
            const moveSpeed = this.speed * this.autopilot.speed;
            
            if (this.spaceship) {
                const shipGroup = this.spaceship.getGroup();
                shipGroup.position.addScaledVector(direction, moveSpeed);
                
                // Smoothly rotate ship to face target
                const targetQuaternion = new THREE.Quaternion();
                const lookMatrix = new THREE.Matrix4();
                lookMatrix.lookAt(position, target, new THREE.Vector3(0, 1, 0));
                targetQuaternion.setFromRotationMatrix(lookMatrix);
                
                shipGroup.quaternion.slerp(targetQuaternion, 0.05);
                
                // Update rotation state
                const euler = new THREE.Euler().setFromQuaternion(shipGroup.quaternion, "YXZ");
                this.rotation.yaw = euler.y;
                this.rotation.pitch = euler.x;
            } else {
                position.addScaledVector(direction, moveSpeed);
            }
            
            // Look at target
            this.camera.setTarget(target.x, target.y, target.z);
        } else {
            // Arrived
            this.autopilot.active = false;
            window.dispatchEvent(new CustomEvent("autopilot:arrived", {
                detail: { target: this.autopilot.target }
            }));
        }
    }

    setAutopilotTarget(x, y, z) {
        this.autopilot.target = new THREE.Vector3(x, y, z);
        this.autopilot.active = true;
        
        window.dispatchEvent(new CustomEvent("autopilot:started", {
            detail: { target: this.autopilot.target }
        }));
    }

    toggleAutopilot() {
        this.autopilot.active = !this.autopilot.active;
        
        if (!this.autopilot.active) {
            window.dispatchEvent(new Event("autopilot:stopped"));
        }
    }

    toggleMode() {
        // Toggle between galaxy and classic mode
        const currentMode = localStorage.getItem("portfolioMode") || "galaxy";
        const newMode = currentMode === "galaxy" ? "classic" : "galaxy";
        localStorage.setItem("portfolioMode", newMode);
        
        const url = newMode === "galaxy" ? "/galaxy" : "/classic";
        window.location.href = url;
    }

    toggleMouseFlightMode() {
        // Request pointer lock when entering mouse flight mode for seamless control
        if (!this.mouseFlightMode) { // If currently not in mouse flight mode, activate it
            document.body.requestPointerLock();
        } else { // If currently in mouse flight mode, deactivate it
            if (document.pointerLockElement) {
                document.exitPointerLock();
            }
        }
        // The onPointerLockChange event listener will handle setting this.mouseFlightMode and dispatching events
    }

    setSpaceship(spaceship) {
        this.spaceship = spaceship;
        
        // Initialize rotation from spaceship's current rotation
        if (spaceship) {
            const euler = new THREE.Euler().setFromQuaternion(spaceship.getGroup().quaternion, "YXZ");
            this.rotation.yaw = euler.y;
            this.rotation.pitch = euler.x;
            this.rotation.roll = euler.z;
        }
    }

    isAutopilotActive() {
        return this.autopilot.active;
    }

    getSpeed() {
        return this.keys.shift ? this.speed * this.turboMultiplier : this.speed;
    }

    dispose() {
        window.removeEventListener("keydown", this.onKeyDown);
        window.removeEventListener("keyup", this.onKeyUp);
        window.removeEventListener("mousemove", this.onMouseMove);
        window.removeEventListener("mousedown", this.onMouseDown);
        window.removeEventListener("mouseup", this.onMouseUp);
        document.removeEventListener("pointerlockchange", this.onPointerLockChange);
        document.removeEventListener("mozpointerlockchange", this.onPointerLockChange);
        document.removeEventListener("webkitpointerlockchange", this.onPointerLockChange);
    }
}
