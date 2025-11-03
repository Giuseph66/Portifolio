// Weapon system for spaceship - Lasers and Projectiles
import * as THREE from '../../../vendor/three.module.js';
import { colors } from '../utils/colors.js';

export class WeaponSystem {
    constructor(scene, spaceship) {
        this.scene = scene;
        this.spaceship = spaceship;

        // Weapon types
        this.currentWeapon = 'laser'; // 'laser' or 'projectile'

        // Projectiles and lasers arrays
        this.projectiles = [];
        this.lasers = [];
        this.collisionTargets = [];

        // Object pooling for performance optimization
        this.poolSize = 20;
        this.laserPool = [];
        this.projectilePool = [];
        // Weapon settings
        this.laserSettings = {
            speed: 200,
            lifetime: 3, // seconds
            cooldown: 0.15, // seconds between shots
            lastShot: 0,
            color: colors.neonBlue,
            length: 20,
            width: 0.3
        };

        this.projectileSettings = {
            speed: 200,
            lifetime: 3,
            cooldown: 0.3,
            lastShot: 0,
            color: 0xff6600,
            size: 0.5
        };

        this.weaponOffsets = [
            new THREE.Vector3(-2, 0, 3), // Left weapon
            new THREE.Vector3(2, 0, 3)   // Right weapon
        ];

        this.initializePools();

        this.setupEventListeners();
        console.log('Weapon system initialized');
    }

    initializePools() {
        // Pre-create laser geometries and materials for pooling
        for (let i = 0; i < this.poolSize; i++) {
            const laserGeometry = new THREE.CylinderGeometry(0.3, 0.3, this.laserSettings.length, 6);
            laserGeometry.rotateX(Math.PI / 2);
            const laserMaterial = new THREE.MeshBasicMaterial({
                color: this.laserSettings.color,
                transparent: true,
                opacity: 0.9
            });
            const glowGeometry = new THREE.CylinderGeometry(0.6, 0.6, this.laserSettings.length, 6);
            glowGeometry.rotateX(Math.PI / 2);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: this.laserSettings.color,
                transparent: true,
                opacity: 0.3
            });

            this.laserPool.push({
                geometry: laserGeometry,
                material: laserMaterial,
                glowGeometry: glowGeometry,
                glowMaterial: glowMaterial,
                available: true
            });
        }

        // Pre-create projectile geometries and materials for pooling
        for (let i = 0; i < this.poolSize; i++) {
            const projectileGeometry = new THREE.SphereGeometry(this.projectileSettings.size, 6, 6);
            const projectileMaterial = new THREE.MeshBasicMaterial({
                color: this.projectileSettings.color
            });
            const glowGeometry = new THREE.SphereGeometry(this.projectileSettings.size * 1.5, 6, 6);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: this.projectileSettings.color,
                transparent: true,
                opacity: 0.4
            });
            const trailGeometry = new THREE.ConeGeometry(
                this.projectileSettings.size * 0.8,
                this.projectileSettings.size * 3,
                6
            );
            const trailMaterial = new THREE.MeshBasicMaterial({
                color: this.projectileSettings.color,
                transparent: true,
                opacity: 0.6
            });

            this.projectilePool.push({
                geometry: projectileGeometry,
                material: projectileMaterial,
                glowGeometry: glowGeometry,
                glowMaterial: glowMaterial,
                trailGeometry: trailGeometry,
                trailMaterial: trailMaterial,
                available: true
            });
        }
    }

    getLaserFromPool() {
        const available = this.laserPool.find(item => item.available);
        if (available) {
            available.available = false;
            return available;
        }
        return null;
    }

    getProjectileFromPool() {
        const available = this.projectilePool.find(item => item.available);
        if (available) {
            available.available = false;
            return available;
        }
        return null;
    }

    returnLaserToPool(laserItem) {
        if (laserItem && laserItem.mesh) {
            laserItem.mesh.visible = false;
            laserItem.available = true;
        }
    }

    returnProjectileToPool(projectileItem) {
        if (projectileItem && projectileItem.mesh) {
            projectileItem.mesh.visible = false;
            projectileItem.available = true;
        }
    }

    setupEventListeners() {
        // Left click to shoot; only block when overlay is open
        window.addEventListener('mousedown', (e) => {
            const overlayOpen = !!document.getElementById('overlay-container') &&
                document.getElementById('overlay-container').style.display === 'flex';
            if (e.button === 0 && !overlayOpen) {
                this.shoot();
            }
        });
        
        // Switch weapon with Tab
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Tab') {
                e.preventDefault();
                this.switchWeapon();
            }
        });
    }
    
    switchWeapon() {
        this.currentWeapon = this.currentWeapon === 'laser' ? 'projectile' : 'laser';
        
        // Dispatch event for UI update
        window.dispatchEvent(new CustomEvent('weapon:switched', {
            detail: { weapon: this.currentWeapon }
        }));
        
        console.log(`Switched to ${this.currentWeapon}`);
    }
    
    shoot() {
        const now = performance.now() / 1000;
        
        if (this.currentWeapon === 'laser') {
            if (now - this.laserSettings.lastShot < this.laserSettings.cooldown) return;
            this.shootLaser();
            this.laserSettings.lastShot = now;
        } else {
            if (now - this.projectileSettings.lastShot < this.projectileSettings.cooldown) return;
            this.shootProjectile();
            this.projectileSettings.lastShot = now;
        }
    }
    
    shootLaser() {
        const shipGroup = this.spaceship.getGroup();
        const shipPos = this.spaceship.getPosition();

        // Get laser from pool or create new if pool is empty
        let laserItem = this.getLaserFromPool();
        if (!laserItem) {
            // Fallback: create new laser (shouldn't happen with proper pool size)
            const laserGeometry = new THREE.CylinderGeometry(
                this.laserSettings.width,
                this.laserSettings.width,
                this.laserSettings.length,
                6
            );
            laserGeometry.rotateX(Math.PI / 2);
            const laserMaterial = new THREE.MeshBasicMaterial({
                color: this.laserSettings.color,
                transparent: true,
                opacity: 0.9
            });
            const glowGeometry = new THREE.CylinderGeometry(
                this.laserSettings.width * 2,
                this.laserSettings.width * 2,
                this.laserSettings.length,
                6
            );
            glowGeometry.rotateX(Math.PI / 2);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: this.laserSettings.color,
                transparent: true,
                opacity: 0.3
            });
            laserItem = {
                geometry: laserGeometry,
                material: laserMaterial,
                glowGeometry: glowGeometry,
                glowMaterial: glowMaterial,
                available: false
            };
        }

        // Create laser mesh if not exists
        if (!laserItem.mesh) {
            const laser = new THREE.Mesh(laserItem.geometry, laserItem.material);
            const glow = new THREE.Mesh(laserItem.glowGeometry, laserItem.glowMaterial);
            laser.add(glow);
            laserItem.mesh = laser;
            this.scene.add(laser);
        }

        // Single centered laser from the nose of the ship
        // Direction: if mouse flight mode is active, align with camera forward (crosshair);
        // otherwise use ship forward
        let forward = new THREE.Vector3(0, 0, 1).applyQuaternion(shipGroup.quaternion);
        const cameraCtrl = window.galaxyPortfolio?.camera;
        const controls = window.galaxyPortfolio?.controls;
        if (controls && controls.mouseFlightMode && cameraCtrl && cameraCtrl.getDirection) {
            forward = cameraCtrl.getDirection();
        }
        const noseOffset = new THREE.Vector3(0, 0, 3.2).applyQuaternion(shipGroup.quaternion);
        const startPos = shipPos.clone().add(noseOffset);

        laserItem.mesh.position.copy(startPos);
        laserItem.mesh.visible = true;

        // Orient cylinder (+Z) to face the chosen forward direction
        const quat = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 0, 1),
            forward.clone().normalize()
        );
        laserItem.mesh.quaternion.copy(quat);
        laserItem.mesh.position.add(forward.clone().multiplyScalar(this.laserSettings.length / 2));

        this.lasers.push({
            mesh: laserItem.mesh,
            velocity: forward.clone().multiplyScalar(this.laserSettings.speed),
            createdAt: performance.now() / 1000,
            poolItem: laserItem
        });

        // Dispatch event for sound/effects
        window.dispatchEvent(new Event('weapon:laser-fired'));
    }
    
    shootProjectile() {
        const shipGroup = this.spaceship.getGroup();
        const shipPos = this.spaceship.getPosition();

        // Create projectile from each weapon offset
        this.weaponOffsets.forEach(offset => {
            const worldOffset = offset.clone();
            worldOffset.applyQuaternion(shipGroup.quaternion);
            const startPos = shipPos.clone().add(worldOffset);

            // Get forward direction
            const forward = new THREE.Vector3(0, 0, 1);
            forward.applyQuaternion(shipGroup.quaternion);

            // Get projectile from pool or create new if pool is empty
            let projectileItem = this.getProjectileFromPool();
            if (!projectileItem) {
                // Fallback: create new projectile
                const projectileGeometry = new THREE.SphereGeometry(this.projectileSettings.size, 6, 6);
                const projectileMaterial = new THREE.MeshBasicMaterial({
                    color: this.projectileSettings.color
                });
                const glowGeometry = new THREE.SphereGeometry(this.projectileSettings.size * 1.5, 6, 6);
                const glowMaterial = new THREE.MeshBasicMaterial({
                    color: this.projectileSettings.color,
                    transparent: true,
                    opacity: 0.4
                });
                const trailGeometry = new THREE.ConeGeometry(
                    this.projectileSettings.size * 0.8,
                    this.projectileSettings.size * 3,
                    6
                );
                const trailMaterial = new THREE.MeshBasicMaterial({
                    color: this.projectileSettings.color,
                    transparent: true,
                    opacity: 0.6
                });
                projectileItem = {
                    geometry: projectileGeometry,
                    material: projectileMaterial,
                    glowGeometry: glowGeometry,
                    glowMaterial: glowMaterial,
                    trailGeometry: trailGeometry,
                    trailMaterial: trailMaterial,
                    available: false
                };
            }

            // Create projectile mesh if not exists
            if (!projectileItem.mesh) {
                const projectile = new THREE.Mesh(projectileItem.geometry, projectileItem.material);
                const glow = new THREE.Mesh(projectileItem.glowGeometry, projectileItem.glowMaterial);
                const trail = new THREE.Mesh(projectileItem.trailGeometry, projectileItem.trailMaterial);
                trail.rotation.x = Math.PI / 2;
                trail.position.z = -this.projectileSettings.size * 1.5;
                projectile.add(glow);
                projectile.add(trail);
                projectileItem.mesh = projectile;
                projectileItem.trail = trail;
                this.scene.add(projectile);
            }

            // Position projectile
            projectileItem.mesh.position.copy(startPos);
            projectileItem.mesh.visible = true;

            this.projectiles.push({
                mesh: projectileItem.mesh,
                velocity: forward.multiplyScalar(this.projectileSettings.speed),
                createdAt: performance.now() / 1000,
                trail: projectileItem.trail,
                poolItem: projectileItem
            });
        });

        // Dispatch event for sound/effects
        window.dispatchEvent(new Event('weapon:projectile-fired'));
    }
    
    update(delta) {
        const now = performance.now() / 1000;
        
        // Update lasers
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            const laser = this.lasers[i];
            
            // Move laser
            laser.mesh.position.addScaledVector(laser.velocity, delta);

            // Simple collision check with targets (distance to each target)
            for (let j = 0; j < this.collisionTargets.length; j++) {
                const target = this.collisionTargets[j];
                if (!target || !target.parent) continue;
                const worldPos = target.getWorldPosition(new THREE.Vector3());
                const dist = laser.mesh.position.distanceTo(worldPos);
                if (dist < 2.5) {
                    // Hit: flash and perform action
                    const sbGroup = target.userData?.signboard;
                    const action = target.userData?.action;
                    if (sbGroup) {
                        // brief flash effect
                        const mat = target.material;
                        const oldColor = mat.color.getHex();
                        mat.color.set(0xffffff);
                        setTimeout(() => mat.color.set(oldColor), 120);
                    }
                    if (action) {
                        window.dispatchEvent(new CustomEvent('signboard:hit', { detail: { action, target } }));
                    }
                    // Remove laser on hit
                    this.scene.remove(laser.mesh);
                    if (laser.mesh.geometry) laser.mesh.geometry.dispose();
                    if (laser.mesh.material) laser.mesh.material.dispose();
                    this.lasers.splice(i, 1);
                    break;
                }
            }
            
            // Remove if expired
            if (now - laser.createdAt > this.laserSettings.lifetime) {
                // Return to pool instead of disposing
                if (laser.poolItem) {
                    this.returnLaserToPool(laser.poolItem);
                } else {
                    // Fallback for non-pooled items
                    this.scene.remove(laser.mesh);
                    laser.mesh.geometry.dispose();
                    laser.mesh.material.dispose();
                }
                this.lasers.splice(i, 1);
            }
        }
        
        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            // Move projectile
            projectile.mesh.position.addScaledVector(projectile.velocity, delta);
            
            // Rotate projectile for effect
            projectile.mesh.rotation.y += delta * 5;
            
            // Animate trail
            if (projectile.trail) {
                projectile.trail.material.opacity = 0.6 * (1 - (now - projectile.createdAt) / this.projectileSettings.lifetime);
            }
            
            // Remove if expired
            if (now - projectile.createdAt > this.projectileSettings.lifetime) {
                // Return to pool instead of disposing
                if (projectile.poolItem) {
                    this.returnProjectileToPool(projectile.poolItem);
                } else {
                    // Fallback for non-pooled items
                    this.scene.remove(projectile.mesh);
                    projectile.mesh.geometry.dispose();
                    projectile.mesh.material.dispose();
                }
                this.projectiles.splice(i, 1);
            }
        }
    }
    
    getCurrentWeapon() {
        return this.currentWeapon;
    }
    
    cleanup() {
        // Remove all projectiles and lasers
        this.lasers.forEach(laser => {
            this.scene.remove(laser.mesh);
            if (laser.poolItem) {
                this.returnLaserToPool(laser.poolItem);
            } else {
                laser.mesh.geometry.dispose();
                laser.mesh.material.dispose();
            }
        });

        this.projectiles.forEach(projectile => {
            this.scene.remove(projectile.mesh);
            if (projectile.poolItem) {
                this.returnProjectileToPool(projectile.poolItem);
            } else {
                projectile.mesh.geometry.dispose();
                projectile.mesh.material.dispose();
            }
        });

        this.lasers = [];
        this.projectiles = [];
        this.collisionTargets = [];
    }
}
