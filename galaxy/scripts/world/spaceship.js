// Spaceship model and controller
import * as THREE from '../../../vendor/three.module.js';
import { colors } from '../utils/colors.js';

export class Spaceship {
    constructor(scene) {
        this.scene = scene;
        this.mesh = null;
        this.group = new THREE.Group();
        this.engineGlow = [];
        
        this.create();
    }

    create() {
        // Main body (fuselage)
        const bodyGeometry = new THREE.ConeGeometry(1.5, 6, 8);
		const bodyMaterial = new THREE.MeshBasicMaterial({
			color: 0x373738
		});
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.x = Math.PI / 2;
        this.group.add(body);
        
        // Cockpit
        const cockpitGeometry = new THREE.SphereGeometry(1, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const cockpitMaterial = new THREE.MeshStandardMaterial({
            color: 0x00d4ff,
            metalness: 0.9,
            roughness: 0.1,
            emissive: 0x00d4ff,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.8
        });
        const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
        cockpit.position.z = 2.5;
        cockpit.rotation.x = Math.PI;
        this.group.add(cockpit);
        
        // Wings
        const wingGeometry = new THREE.BoxGeometry(8, 0.3, 3);
		const wingTexture = this.createWingStripeTexture({
			width: 1024,
			height: 512,
			baseColor: 0x8c8c8c,
			stripeColor: 0x0000ff,
			// two stripes per wing (left/right): positions across X width
			stripeCenters: [0.125, 0.375, 0.625, 0.875],
			stripeWidthRatio: 0.06
		});
		const wingMaterial = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			map: wingTexture
		});
        const wings = new THREE.Mesh(wingGeometry, wingMaterial);
        wings.position.z = -1;
        this.group.add(wings);
        
        // Wing tips (glowing)
        const wingTipGeometry = new THREE.SphereGeometry(0.4, 8, 8);
        const wingTipMaterial = new THREE.MeshBasicMaterial({
            color: colors.neonBlue,
            transparent: true,
            opacity: 0.8
        });
        
        const leftWingTip = new THREE.Mesh(wingTipGeometry, wingTipMaterial);
        leftWingTip.position.set(-4, 0, -1);
        this.group.add(leftWingTip);
        
        const rightWingTip = new THREE.Mesh(wingTipGeometry, wingTipMaterial.clone());
        rightWingTip.position.set(4, 0, -1);
        this.group.add(rightWingTip);
        
        // Engine exhausts
        this.createEngines();
        
        // Add detail lines
        this.addDetailLines();
        
        this.mesh = this.group;
        this.scene.add(this.group);
        
        console.log('Spaceship created');
    }

	createStripeTexture({ width, height, baseColor, stripeColor, stripeCount, stripeWidth, orientation }) {
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext('2d');
		
		// Base
		ctx.fillStyle = `#${(baseColor >>> 0).toString(16).padStart(6, '0')}`;
		ctx.fillRect(0, 0, width, height);
		
		// Stripes
		ctx.fillStyle = `#${(stripeColor >>> 0).toString(16).padStart(6, '0')}`;
		const sw = Math.max(1, Math.floor((orientation === 'vertical' ? width : height) * stripeWidth));
		for (let i = 0; i < stripeCount; i++) {
			const t = (i + 1) / (stripeCount + 1);
			if (orientation === 'vertical') {
				const x = Math.floor(t * width - sw / 2);
				ctx.fillRect(x, 0, sw, height);
			} else {
				const y = Math.floor(t * height - sw / 2);
				ctx.fillRect(0, y, width, sw);
			}
		}
		
		const texture = new THREE.CanvasTexture(canvas);
		texture.anisotropy = 8;
		texture.needsUpdate = true;
		return texture;
	}

	createWingStripeTexture({ width, height, baseColor, stripeColor, stripeCenters, stripeWidthRatio }) {
		// Produz uma textura branca com 2 listras verticais em cada asa.
		// O mesh das asas é um único box; posicionamos 4 listras no eixo X da textura,
		// duas no lado esquerdo (asa esquerda) e duas no lado direito (asa direita).
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext('2d');
		
		// Base branca
		ctx.fillStyle = `#${(baseColor >>> 0).toString(16).padStart(6, '0')}`;
		ctx.fillRect(0, 0, width, height);
		
		// Listras verticais
		ctx.fillStyle = `#${(stripeColor >>> 0).toString(16).padStart(6, '0')}`;
		const stripeW = Math.max(1, Math.floor(width * stripeWidthRatio));
		stripeCenters.forEach(c => {
			const x = Math.floor(c * width - stripeW / 2);
			ctx.fillRect(x, 0, stripeW, height);
		});
		
		const texture = new THREE.CanvasTexture(canvas);
		texture.anisotropy = 8;
		texture.needsUpdate = true;
		return texture;
	}

    createEngines() {
        // Engine positions
        const enginePositions = [
            { x: -2, y: 0, z: -3 },
            { x: 2, y: 0, z: -3 }
        ];
        
        enginePositions.forEach(pos => {
            // Engine nozzle
            const nozzleGeometry = new THREE.CylinderGeometry(0.5, 0.7, 1.5, 8);
            const nozzleMaterial = new THREE.MeshBasicMaterial({
                color: 0x373738
            });
            const nozzle = new THREE.Mesh(nozzleGeometry, nozzleMaterial);
            nozzle.position.set(pos.x, pos.y, pos.z);
            nozzle.rotation.x = Math.PI / 2;
            this.group.add(nozzle);
            
            // Engine glow
            const glowGeometry = new THREE.SphereGeometry(0.6, 8, 8);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: colors.neonOrange,
                transparent: true,
                opacity: 0.7
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.position.set(pos.x, pos.y, pos.z - 0.5);
            this.group.add(glow);
            this.engineGlow.push(glow);
            
            // Engine light
            const engineLight = new THREE.PointLight(colors.neonOrange, 2, 20);
            engineLight.position.set(pos.x, pos.y, pos.z - 1);
            this.group.add(engineLight);
        });
    }

    addDetailLines() {
		// Accent stripes are now in textures; keep a subtle center glow line
		const lineMaterial = new THREE.LineBasicMaterial({
			color: colors.neonBlue,
			transparent: true,
			opacity: 0.25
		});
		const points = [];
		points.push(new THREE.Vector3(0, 0.01, 3));
		points.push(new THREE.Vector3(0, 0.01, -3));
		const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
		const line = new THREE.Line(lineGeometry, lineMaterial);
		this.group.add(line);
    }

    update(delta, elapsed) {
        // Animate engine glow
        this.engineGlow.forEach((glow, index) => {
            const pulse = Math.sin(elapsed * 10 + index) * 0.2 + 0.8;
            glow.scale.set(pulse, pulse, pulse);
            glow.material.opacity = 0.5 + pulse * 0.3;
        });
    }

    setPosition(x, y, z) {
        this.group.position.set(x, y, z);
    }

    setRotation(x, y, z) {
        this.group.rotation.set(x, y, z);
    }

    getPosition() {
        return this.group.position.clone();
    }

    getGroup() {
        return this.group;
    }

    setVisible(visible) {
        this.group.visible = visible;
    }

    lookAt(target) {
        this.group.lookAt(target);
    }

    dispose() {
        this.group.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => mat.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
        
        this.scene.remove(this.group);
    }
}
