// Factory for creating celestial bodies (planets, asteroids, stations)
import * as THREE from '../../../vendor/three.module.js';
import { getCategoryColor } from '../utils/colors.js';

export class CelestialBody {
    constructor(type, options = {}) {
        this.type = type;
        this.options = {
            radius: options.radius || 10,
            color: options.color || 0x4488ff,
            emissive: options.emissive || 0x000000,
            emissiveIntensity: options.emissiveIntensity || 0.3,
            position: options.position || { x: 0, y: 0, z: 0 },
            rotation: options.rotation || { x: 0, y: 0, z: 0 },
            rotationSpeed: options.rotationSpeed || 0.001,
            category: options.category || null,
            data: options.data || {}
        };
        
        this.mesh = null;
        this.create();
    }

    create() {
        let geometry, material;
        
        switch (this.type) {
            case 'planet':
                geometry = new THREE.SphereGeometry(this.options.radius, 32, 32);
                material = new THREE.MeshStandardMaterial({
                    color: this.options.color,
                    emissive: this.options.emissive,
                    emissiveIntensity: this.options.emissiveIntensity,
                    roughness: 0.7,
                    metalness: 0.3
                });
                break;
                
            case 'asteroid':
                geometry = new THREE.DodecahedronGeometry(this.options.radius, 0);
                material = new THREE.MeshStandardMaterial({
                    color: this.options.color,
                    roughness: 0.9,
                    metalness: 0.1
                });
                break;
                
            case 'station':
                geometry = new THREE.OctahedronGeometry(this.options.radius, 0);
                material = new THREE.MeshStandardMaterial({
                    color: this.options.color,
                    emissive: this.options.emissive,
                    emissiveIntensity: this.options.emissiveIntensity,
                    roughness: 0.4,
                    metalness: 0.8
                });
                break;
                
            case 'star':
                geometry = new THREE.SphereGeometry(this.options.radius, 16, 16);
                material = new THREE.MeshBasicMaterial({
                    color: this.options.color,
                    transparent: true,
                    opacity: 0.8
                });
                break;
                
            default:
                geometry = new THREE.SphereGeometry(this.options.radius, 16, 16);
                material = new THREE.MeshStandardMaterial({
                    color: this.options.color
                });
        }
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(
            this.options.position.x,
            this.options.position.y,
            this.options.position.z
        );
        
        this.mesh.rotation.set(
            this.options.rotation.x,
            this.options.rotation.y,
            this.options.rotation.z
        );
        
        // Store reference to this body
        this.mesh.userData.body = this;
        this.mesh.userData.type = this.type;
        this.mesh.userData.category = this.options.category;
        this.mesh.userData.data = this.options.data;
        
        // Add glow for certain types
        if (this.type === 'planet' || this.type === 'station') {
            this.addGlow();
        }
    }

    addGlow() {
        const glowGeometry = new THREE.SphereGeometry(
            this.options.radius * 1.2,
            12,
            8
        );
        
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: this.options.emissive || this.options.color,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.mesh.add(glow);
    }

    update(delta, elapsed) {
        if (!this.mesh) return;
        
        // Rotate
        this.mesh.rotation.y += this.options.rotationSpeed;
        this.mesh.rotation.x += this.options.rotationSpeed * 0.5;
    }

    setPosition(x, y, z) {
        if (this.mesh) {
            this.mesh.position.set(x, y, z);
        }
    }

    getPosition() {
        return this.mesh ? this.mesh.position.clone() : new THREE.Vector3();
    }

    getMesh() {
        return this.mesh;
    }

    dispose() {
        if (this.mesh) {
            if (this.mesh.geometry) this.mesh.geometry.dispose();
            if (this.mesh.material) this.mesh.material.dispose();
            
            // Dispose children (glow)
            this.mesh.children.forEach(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        }
    }
}

// Factory functions
export function createPlanet(options) {
    return new CelestialBody('planet', options);
}

export function createAsteroid(options) {
    return new CelestialBody('asteroid', options);
}

export function createStation(options) {
    return new CelestialBody('station', options);
}

export function createStar(options) {
    return new CelestialBody('star', options);
}
