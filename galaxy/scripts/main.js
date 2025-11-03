// Main application entry point with spaceship and solar system
import { Engine } from './engine/core.js';
import { CameraController } from './engine/camera.js';
import { Controls } from './engine/controls.js';
import { Starfield } from './world/starfield.js';
import { Spaceship } from './world/spaceship.js';
import { SolarSystem } from './world/solarsystem.js';
import { WeaponSystem } from './world/weapons.js';
import { SignboardSystem } from './world/signboards.js';
import { createPlanet, createStation } from './world/body.js';
import { createProjectConstellations, createSkillClusters } from './world/constellation.js';
import { dataAdapter } from './data/adapter.js';
import { HUD } from './ui/hud.js';
import { Overlay } from './ui/overlay.js';
import * as THREE from '../../vendor/three.module.js';
import { colors } from './utils/colors.js';
import { perfMonitor } from './utils/perf.js';

class GalaxyPortfolio {
    constructor() {
        this.engine = null;
        this.camera = null;
        this.controls = null;
        this.starfield = null;
        this.spaceship = null;
        this.solarSystem = null;
        this.weaponSystem = null;
        this.signboardSystem = null;
        this.hud = null;
        this.overlay = null;
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        this.clickTargets = [];
        
        this.bodies = [];
        this.constellations = [];
        this.stops = {};
        
        this.data = {
            profile: null,
            skills: null,
            projects: null
        };
        
        // Config do tooltip
        this.planetTipNear = 100;
        this.planetTipFar = 140;

        // Performance optimization: throttle tooltip updates
        this.tooltipUpdateThrottle = 0;
        this.tooltipUpdateInterval = 3; // Update every 3 frames

        // Performance optimization: throttle HUD updates
        this.hudUpdateThrottle = 0;
        this.hudUpdateInterval = 2; // Update every 2 frames
        
        this.init();
    }

    async init() {
        console.log('Initializing Galaxy Portfolio...');
        
        // Show loading
        this.showLoading();
        
        try {
            // Load data
            await this.loadData();
            
            // Initialize engine
            const container = document.getElementById('app');
            this.engine = new Engine(container);
            
            // Initialize camera
            this.camera = new CameraController();
            
            // Create spaceship (spawn aligned to corridor)
            this.spaceship = new Spaceship(this.engine.getScene());
            this.spaceship.setPosition(0, 8, 300);
            // Face the Sun at the origin
            this.spaceship.lookAt(new THREE.Vector3(0, 0, 0));
            
            // Link camera with spaceship
            this.camera.setSpaceship(this.spaceship);
            
            // Initialize controls with spaceship
            this.controls = new Controls(this.camera, this.spaceship);
            
            // Initialize weapon system
            this.weaponSystem = new WeaponSystem(this.engine.getScene(), this.spaceship);
            
            // Initialize signboard system
            this.signboardSystem = new SignboardSystem(this.engine.getScene());
            
            // Initialize UI
            this.hud = new HUD();
            this.overlay = new Overlay();
            
            // Create world
            await this.createWorld();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Start engine
            this.engine.start();
            
            // Hide loading
            this.hideLoading();
            
            console.log('Galaxy Portfolio initialized successfully');
        } catch (error) {
            console.error('Failed to initialize:', error);
            this.showError('Falha ao inicializar o portfólio. Por favor, recarregue a página.');
        }
    }

    async loadData() {
        console.log('Loading data...');
        
        this.data.profile = await dataAdapter.getProfile();
        this.data.skills = await dataAdapter.getSkills();
        this.data.projects = await dataAdapter.getProjects();
        
        console.log('Data loaded:', this.data);
    }

    async createWorld() {
        const scene = this.engine.getScene();
        
        // Create starfield
        this.starfield = new Starfield(scene);
        
        // Create solar system
        this.solarSystem = new SolarSystem(scene);
        
        // Create about stop (orbiting planet)
        const earthPlanet = this.solarSystem.getPlanetByName('Terra');
        if (earthPlanet) {
            this.stops.about = {
                getPosition: () => {
                    const worldPos = new THREE.Vector3();
                    earthPlanet.mesh.getWorldPosition(worldPos);
                    return worldPos;
                },
                getMesh: () => earthPlanet.mesh
            };
        }
        
        // Load signboards from JSON
        try {
            const signboardsResponse = await fetch('./assets/data/signboards.json');
            const signboardsData = await signboardsResponse.json();
            await this.signboardSystem.loadFromConfig(signboardsData);
        } catch (error) {
            console.warn('Could not load signboards:', error);
        }

        // Collect hit targets for shooting interaction (and feed to weapon system)
        const hitTargets = this.signboardSystem.getHitTargets();
        this.clickTargets.push(...hitTargets);
        if (this.weaponSystem) {
            this.weaponSystem.collisionTargets = hitTargets;
        }
        
        console.log('World created with solar system, spaceship, and', this.constellations.length, 'constellations');
    }

    setupEventListeners() {
        // Engine update
        window.addEventListener('engine:update', (e) => {
            const { delta, elapsed } = e.detail;
            this.update(delta, elapsed);
        });
        
        // Autopilot events
        window.addEventListener('autopilot:started', (e) => {
            const target = e.detail.target;
            console.log('Autopilot started to', target);
        });
        
        window.addEventListener('autopilot:arrived', (e) => {
            console.log('Autopilot arrived at', e.detail.target);
            this.onArrival();
        });
        
        // Click on bodies to navigate/open overlay
        const canvas = this.engine.getRenderer().domElement;
        canvas.addEventListener('click', (e) => this.onCanvasClick(e));

        // Shooting hit actions -> open 3D panel attached to the signboard
        window.addEventListener('signboard:hit', (e) => {
            const action = e.detail?.action;
            const target = e.detail?.target;
            if (!action || !target) return;

            const payload = { type: action.type };
            if (action.type === 'profile' && this.data.profile) {
                const p = this.data.profile;
                payload.title = p.name;
                payload.subtitle = `${p.title} • ${p.company} • ${p.location}`;
                payload.body = p.bio;
                payload.accent = '#00d4ff';
                payload.photo = 'assets/textures/eu.png';
            } else if (action.type === 'skills' && action.category && this.data.skills) {
                payload.title = `Skills - ${action.category}`;
                payload.items = (this.data.skills[action.category] || []).map(s=>({ name: s.name, level: s.level }));
                payload.accent = '#00d4ff';
            } else if (action.type === 'project' && action.id) {
                const proj = (this.data.projects||[]).find(p=>p.id===action.id);
                if (!proj) return;
                payload.title = proj.title;
                payload.body = proj.summary || proj.description;
                payload.links = { repo: proj.links?.repo, demo: proj.links?.demo };
                payload.accent = '#ff6b35';
                if (proj.thumb) payload.thumb = proj.thumb;
            } else if (action.type === 'link' && action.url) {
                payload.title = 'Abrir link';
                payload.links = { link: action.url };
                payload.accent = '#00d4ff';
            }

            window.dispatchEvent(new CustomEvent('signboard:toggle-3d', {
                detail: { target, panel: payload }
            }));
        });
    }

    update(delta, elapsed) {
        // Update camera
        this.camera.update(delta);
        
        // Update controls
        this.controls.update(delta);
        
        // Update starfield
        if (this.starfield) {
            this.starfield.update(delta, elapsed);
        }
        
        // Update spaceship
        if (this.spaceship) {
            this.spaceship.update(delta, elapsed);
        }
        
        // Update solar system
        if (this.solarSystem) {
            this.solarSystem.update(delta, elapsed);
        }

        // Planet tooltip logic (throttled for performance)
        this.tooltipUpdateThrottle++;
        if (this.tooltipUpdateThrottle >= this.tooltipUpdateInterval) {
            this.tooltipUpdateThrottle = 0;
            this.updatePlanetTooltip();
        }
        
        // Update bodies
        this.bodies.forEach(body => body.update(delta, elapsed));
        
        // Update constellations
        this.constellations.forEach(constellation => constellation.update(delta, elapsed));
        
        // Update weapon system
        if (this.weaponSystem) {
            this.weaponSystem.update(delta);
        }
        
        // Update signboard system
        if (this.signboardSystem) {
            this.signboardSystem.update(delta);
        }
        
        // Update HUD (throttled for performance)
        this.hudUpdateThrottle++;
        if (this.hudUpdateThrottle >= this.hudUpdateInterval) {
            this.hudUpdateThrottle = 0;

            if (this.hud) {
                this.hud.updateSpeed(this.controls.getSpeed());

                // Update weapon display
                if (this.weaponSystem) {
                    this.hud.updateWeapon(this.weaponSystem.getCurrentWeapon());
                }
            }
        }
        
        // Render
        this.engine.render(this.camera.getCamera());
    }

    async performAction(action) {
        if (!action || !this.overlay) return;
        switch (action.type) {
            case 'profile':
                if (this.data.profile) {
                    this.overlay.showProfile(this.data.profile);
                }
                break;
            case 'skills':
                if (action.category && this.data.skills) {
                    this.overlay.showSkills(this.data.skills, action.category);
                }
                break;
            case 'project':
                if (action.id) {
                    const project = (this.data.projects || []).find(p => p.id === action.id);
                    if (project) {
                        this.overlay.showProject(project);
                    }
                }
                break;
            case 'link':
                if (action.url) {
                    window.open(action.url, '_blank');
                }
                break;
        }
    }

    updatePlanetTooltip() {
        if (!this.hud || !this.solarSystem || !this.spaceship) return;
        const cam = this.camera.getCamera();
        const shipPos = this.spaceship.getPosition();
        const canvas = this.engine.getRenderer().domElement;
        
        let closest = null;
        let closestDist = Infinity;
        
        this.solarSystem.planets.forEach(p => {
            const worldPos = new THREE.Vector3();
            p.mesh.getWorldPosition(worldPos);
            const dist = shipPos.distanceTo(worldPos);
            if (dist < closestDist) {
                closestDist = dist;
                closest = { planet: p, worldPos };
            }
        });
        
        if (!closest) {
            this.hud.hidePlanetTooltip();
            return;
        }
        
        if (closestDist < this.planetTipNear) {
            // Projeta posição do planeta na tela
            const projected = closest.worldPos.clone().project(cam);
            const sx = (projected.x * 0.5 + 0.5) * canvas.clientWidth;
            const sy = (-projected.y * 0.5 + 0.5) * canvas.clientHeight;
            this.hud.updatePlanetTooltip(sx, sy, closest.planet.name);
        } else if (closestDist > this.planetTipFar) {
            this.hud.hidePlanetTooltip();
        }
    }

    onCanvasClick(event) {
        const canvas = this.engine.getRenderer().domElement;
        const rect = canvas.getBoundingClientRect();
        this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.pointer, this.camera.getCamera());
        const intersects = this.raycaster.intersectObjects(this.clickTargets, true);
        if (!intersects.length) return;

        // Find the top-most mesh that has userData
        let hit = intersects[0].object;
        while (hit && !hit.userData?.data && !hit.userData?.type && hit.parent) {
            hit = hit.parent;
        }
        if (!hit) return;

        // If signboard or hit target: perform its action
        if (hit.userData.type === 'signboard' || hit.userData.type === 'hitTarget') {
            const group = hit.userData.type === 'hitTarget' ? hit.userData.signboard : hit;
            const action = group?.userData?.action;

            const pos = new THREE.Vector3();
            group.getWorldPosition(pos);
            this.controls.setAutopilotTarget(pos.x, pos.y + 12, pos.z + 26);
            this.hud.setDestination('Painel', this.camera.distanceTo(pos.x, pos.y, pos.z));
            if (action) this.performAction(action);
            return;
        }
    }

    onArrival() {
        // Show content based on current stop
        // This would be triggered when autopilot arrives at a destination
    }

    navigateToStop(stopName) {
        const stop = this.stops[stopName];
        if (!stop) {
            console.warn('Stop not found:', stopName);
            return;
        }
        
        const pos = stop.getPosition();
        this.controls.setAutopilotTarget(pos.x, pos.y + 50, pos.z + 50);
        
        const data = stop.getMesh().userData.data;
        this.hud.setDestination(data?.name || stopName, this.camera.distanceTo(pos.x, pos.y, pos.z));
    }

    showLoading() {
        const loading = document.createElement('div');
        loading.id = 'loading';
        loading.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1628 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            color: #e0e6ed;
        `;
        loading.innerHTML = `
            <div style="font-size: 64px; margin-bottom: 30px; animation: pulse 2s ease-in-out infinite;">🚀</div>
            <div style="font-size: 28px; font-weight: 700; margin-bottom: 15px; background: linear-gradient(135deg, #00d4ff 0%, #ff6b35 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Inicializando Galaxy Explorer</div>
            <div style="font-size: 16px; color: #a0aec0;">Preparando sua jornada pelo espaço...</div>
            <div style="margin-top: 30px; width: 200px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden;">
                <div style="width: 100%; height: 100%; background: linear-gradient(90deg, #00d4ff, #ff6b35); animation: loading 1.5s ease-in-out infinite;"></div>
            </div>
            <style>
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            </style>
        `;
        document.body.appendChild(loading);
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.opacity = '0';
            loading.style.transition = 'opacity 0.5s';
            setTimeout(() => loading.remove(), 500);
        }
    }

    showError(message) {
        const error = document.createElement('div');
        error.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 107, 53, 0.9);
            color: white;
            padding: 30px 40px;
            border-radius: 16px;
            font-size: 18px;
            z-index: 10000;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        `;
        error.textContent = message;
        document.body.appendChild(error);
    }

    dispose() {
        if (this.engine) this.engine.dispose();
        if (this.controls) this.controls.dispose();
        if (this.starfield) this.starfield.dispose();
        if (this.spaceship) this.spaceship.dispose();
        if (this.solarSystem) this.solarSystem.dispose();
        if (this.hud) this.hud.dispose();
        if (this.overlay) this.overlay.dispose();
        
        this.bodies.forEach(body => body.dispose());
        this.constellations.forEach(constellation => constellation.dispose());
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.galaxyPortfolio = new GalaxyPortfolio();
    });
} else {
    window.galaxyPortfolio = new GalaxyPortfolio();
}

export default GalaxyPortfolio;
