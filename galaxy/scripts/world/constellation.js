// Generate constellations from project data
import * as THREE from '../../../vendor/three.module.js';
import { createStar, createPlanet, createStation } from './body.js';
import { getCategoryColor } from '../utils/colors.js';
import { randomRange } from '../utils/math.js';

export class Constellation {
    constructor(scene, category, items, position) {
        this.scene = scene;
        this.category = category;
        this.items = items;
        this.basePosition = position;
        this.bodies = [];
        this.group = new THREE.Group();
        
        this.create();
    }

    create() {
        const color = getCategoryColor(this.category);
        const count = this.items.length;
        
        // Arrange items in a cluster
        this.items.forEach((item, index) => {
            // Calculate position in cluster
            const angle = (index / count) * Math.PI * 2;
            const radius = 30 + Math.random() * 20;
            const height = (Math.random() - 0.5) * 20;
            
            const x = this.basePosition.x + Math.cos(angle) * radius;
            const y = this.basePosition.y + height;
            const z = this.basePosition.z + Math.sin(angle) * radius;
            
            // Create body based on item
            let body;
            if (item.status === 'production') {
                body = createPlanet({
                    radius: 5 + Math.random() * 3,
                    color: color,
                    emissive: color,
                    emissiveIntensity: 0.4,
                    position: { x, y, z },
                    rotationSpeed: 0.001 + Math.random() * 0.002,
                    category: this.category,
                    data: item
                });
            } else {
                body = createStar({
                    radius: 3 + Math.random() * 2,
                    color: color,
                    position: { x, y, z },
                    rotationSpeed: 0.002 + Math.random() * 0.003,
                    category: this.category,
                    data: item
                });
            }
            
            this.bodies.push(body);
            this.group.add(body.getMesh());
        });
        
        // Add connecting lines (optional)
        if (count > 1) {
            this.addConnections(color);
        }
        
        this.scene.add(this.group);
        console.log(`Constellation created for ${this.category} with ${count} items`);
    }

    addConnections(color) {
        const points = this.bodies.map(body => body.getPosition());
        
        // Connect nearby bodies
        for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
                const distance = points[i].distanceTo(points[j]);
                
                if (distance < 50) {
                    const geometry = new THREE.BufferGeometry().setFromPoints([
                        points[i],
                        points[j]
                    ]);
                    
                    const material = new THREE.LineBasicMaterial({
                        color: color,
                        transparent: true,
                        opacity: 0.2
                    });
                    
                    const line = new THREE.Line(geometry, material);
                    this.group.add(line);
                }
            }
        }
    }

    update(delta, elapsed) {
        this.bodies.forEach(body => body.update(delta, elapsed));
    }

    getBodies() {
        return this.bodies;
    }

    getGroup() {
        return this.group;
    }

    dispose() {
        this.bodies.forEach(body => body.dispose());
        
        this.group.children.forEach(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
        
        this.scene.remove(this.group);
    }
}

// Create constellations for all project categories
export function createProjectConstellations(scene, projects) {
    const constellations = [];
    
    // Group projects by category
    const categories = {
        web: [],
        mobile: [],
        ai: [],
        backend: []
    };
    
    projects.forEach(project => {
        if (categories[project.category]) {
            categories[project.category].push(project);
        }
    });
    
    // Define positions for each category
    const positions = {
        web: { x: 150, y: 20, z: -100 },
        mobile: { x: -150, y: 30, z: -80 },
        ai: { x: 100, y: -40, z: 120 },
        backend: { x: -120, y: -30, z: 100 }
    };
    
    // Create constellation for each category
    Object.keys(categories).forEach(category => {
        if (categories[category].length > 0) {
            const constellation = new Constellation(
                scene,
                category,
                categories[category],
                positions[category]
            );
            constellations.push(constellation);
        }
    });
    
    return constellations;
}

// Create skill clusters
export function createSkillClusters(scene, skills) {
    const clusters = [];
    
    // Define positions for skill categories
    const positions = {
        frontend: { x: -200, y: 50, z: -150 },
        backend: { x: 200, y: 40, z: -120 },
        mobile: { x: -180, y: -50, z: 130 },
        devops: { x: 180, y: -40, z: 140 },
        ai: { x: 0, y: 80, z: -200 },
        database: { x: 0, y: -80, z: 180 }
    };
    
    Object.keys(skills).forEach(category => {
        if (skills[category] && skills[category].length > 0 && positions[category]) {
            const cluster = new Constellation(
                scene,
                category,
                skills[category],
                positions[category]
            );
            clusters.push(cluster);
        }
    });
    
    return clusters;
}
