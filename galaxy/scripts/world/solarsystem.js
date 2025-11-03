// Solar system with sun and planets
import * as THREE from '../../../vendor/three.module.js';
import { colors } from '../utils/colors.js';
import { perfMonitor } from '../utils/perf.js';
const AU_KM = 149597870.7; // Unidade astronômica em km

export class SolarSystem {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.options = {
            showSun: options.showSun !== undefined ? options.showSun : true,
            showRings: options.showRings !== undefined ? options.showRings : true,
            showMoons: options.showMoons !== undefined ? options.showMoons : true,
            showOrbitLines: options.showOrbitLines !== undefined ? options.showOrbitLines : true
        };
        // Config
        this.configUrl = options.configUrl || './assets/data/solarsystem.json';
        this.config = null;
        // Escalas (defaults, podem ser sobrescritos pelo JSON)
        this.auScale = options.auScale || 25; // 1 AU = 25 unidades
        this.planetSizePerKm = options.planetSizePerKm || 0.00015;
        this.moonSizePerKm = options.moonSizePerKm || 0.00018;
        this.sunSizePerKm = options.sunSizePerKm || 0.000009;
        // Raio visual do Sol (calculado a partir do JSON se disponível)
        this.sunRadius = options.sunRadius || 6;
        this.sun = null;
        this.planets = [];
        this.group = new THREE.Group();
        
        // Materiais com tempo animado
        this._animatedMaterials = [];
        
        this.create();
    }

    async create() {
        // Tenta carregar configuração
        try {
            const res = await fetch(this.configUrl);
            if (res.ok) {
                this.config = await res.json();
                // Atualiza escalas do JSON
                if (this.config.scale) {
                    this.auScale = this.config.scale.distancePerAU ?? this.auScale;
                    this.planetSizePerKm = this.config.scale.planetSizePerKm ?? this.planetSizePerKm;
                    this.moonSizePerKm = this.config.scale.moonSizePerKm ?? this.moonSizePerKm;
                    this.sunSizePerKm = this.config.scale.sunSizePerKm ?? this.sunSizePerKm;
                }
            }
        } catch (e) {
            console.warn('SolarSystem: não foi possível carregar solarsystem.json, usando defaults.', e);
        }
        
        // Create the Sun (central body)
        if (this.options.showSun) {
            this.createSun();
        } else {
            // Still add a point light to illuminate planets
            const sunLight = new THREE.PointLight(0xffaa00, 2.2, 1000);
            sunLight.position.set(0, 0, 0);
            this.group.add(sunLight);
        }
        
        // Create planets orbiting the sun
        this.createPlanets();
        
        this.scene.add(this.group);
        console.log('Solar system created');
    }

    createSun() {
        // Determina raio do Sol: do JSON (km) * escala ou fallback
        if (this.config?.sun?.diameter_km) {
            this.sunRadius = (this.config.sun.diameter_km * 0.5) * this.sunSizePerKm;
        }
        // Sun geometry (otimizado para performance)
        const sunGeometry = new THREE.SphereGeometry(this.sunRadius, 32, 16);
        
        // Sun material with custom shader for animated surface
        const sunMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color1: { value: new THREE.Color(0xffaa00) },
                color2: { value: new THREE.Color(0xff6600) }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vNormal;
                
                void main() {
                    vUv = uv;
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color1;
                uniform vec3 color2;
                varying vec2 vUv;
                varying vec3 vNormal;
                
                // Simple noise function
                float noise(vec2 p) {
                    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
                }
                
                void main() {
                    // Animated surface pattern
                    float pattern = noise(vUv * 10.0 + time * 0.1);
                    pattern += noise(vUv * 20.0 - time * 0.15) * 0.5;
                    
                    // Mix colors based on pattern
                    vec3 color = mix(color1, color2, pattern);
                    
                    // Add edge glow
                    float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    color += fresnel * vec3(1.0, 0.8, 0.3) * 0.5;
                    
                    gl_FragColor = vec4(color, 1.0);
                }
            `
        });
        
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.sun.position.set(0, 0, 0);
        this.group.add(this.sun);
        
        // Registrar para animação
        this._animatedMaterials.push(sunMaterial);
        
        // Sun glow: clamp para não invadir a órbita de Mercúrio
        const mercuryOrbit = this.auScale * 0.39;
        const targetGlow = Math.min(this.sunRadius * 1.6, mercuryOrbit * 0.85);
        const glowGeometry = new THREE.SphereGeometry(targetGlow, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.sun.add(glow);
        
        // Sun light
        const sunLight = new THREE.PointLight(0xffaa00, 3, 1000);
        sunLight.position.set(0, 0, 0);
        this.group.add(sunLight);
    }

    createPlanets() {
        const planetData = this.config?.planets ?? [];

        planetData.forEach((data, index) => {
            // Distância: usar semi-eixo maior em km -> AU -> unidades
            const au = (data.semi_major_axis_km ? (data.semi_major_axis_km / AU_KM) : (data.au || 1));
            data.distance = au * this.auScale;
            // Raio: a partir do diâmetro (km) * escala
            if (data.diameter_km) {
                data.radius = (data.diameter_km * 0.5) * this.planetSizePerKm;
            }
            // fase inicial aleatória para evitar alinhamento
            data.initialPhase = Math.random() * Math.PI * 2;
            const planet = this.createPlanet(data);
            this.planets.push(planet);
            this.group.add(planet.orbit);
        });
    }

    createPlanet(data) {
        const orbit = new THREE.Group();

        // Planet mesh (otimizado para performance)
        const geometry = new THREE.SphereGeometry(data.radius, 16, 16);
        let material;
        if (data.shader) {
            material = this.createProceduralPlanetMaterial(data.shader);
        } else {
            material = new THREE.MeshStandardMaterial({
                color: data.color,
                emissive: data.emissive || 0x000000,
                emissiveIntensity: 0.2,
                roughness: 0.8,
                metalness: 0.2
            });
            // texturas opcionais
            if (data.textures || data.texture) {
                this.applyOptionalTextures(material, data.textures || data.texture);
            }
        }
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = data.distance;
        orbit.add(mesh);
        
        // Inclinação do plano orbital (pequena, realista)
        if (data.inclinationDeg !== undefined) {
            orbit.rotation.x = THREE.MathUtils.degToRad(data.inclinationDeg);
        }
        // Fase inicial para evitar alinhamento
        if (data.initialPhase !== undefined) {
            orbit.rotation.y = data.initialPhase;
        }
        
        // Anéis
        if (this.options.showRings && (data.hasRings || data.rings)) {
            const inner = (data.rings && data.rings.innerRadius) ? data.rings.innerRadius : data.radius * 1.5;
            const outer = (data.rings && data.rings.outerRadius) ? data.rings.outerRadius : data.radius * 2.5;
            const ringGeometry = new THREE.RingGeometry(inner, outer, 32, 8);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: (data.rings && data.rings.color) ? data.rings.color : 0xc9b18a,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: (data.rings && data.rings.opacity) ? data.rings.opacity : 0.7,
                depthWrite: false
            });
            if (data.rings && data.rings.texture) {
                const ringTex = this.loadTextureSafe(data.rings.texture, true);
                if (ringTex) {
                    ringMaterial.map = ringTex;
                    ringMaterial.needsUpdate = true;
                }
            }
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            mesh.add(ring);
        }
        
        // Orbit line
        if (this.options.showOrbitLines) {
            const orbitLine = this.createOrbitLine(
                data.distance,
                0.03 + Math.random() * 0.04, // leve excentricidade
                Math.random() * Math.PI * 2   // rotação da elipse
            );
            orbit.add(orbitLine);
        }
        
        // Moons (if any)
        const moons = [];
        if (this.options.showMoons && Array.isArray(data.moons)) {
            data.moons.forEach((moonData, i) => {
                // calcular raio e distância
                const m = { ...moonData };
                if (m.diameter_km && !m.radius) {
                    m.radius = (m.diameter_km * 0.5) * this.moonSizePerKm;
                }
                if (m.semi_major_axis_km && !m.distance) {
                    m.distance = Math.max(data.radius * 3, (m.semi_major_axis_km * 0.00001));
                }
                // se não houver distância em km, use um fallback em unidades
                if (!m.distance) {
                    m.distance = data.radius * (3 + i * 0.8);
                }
                m.speed = m.speed || (0.05 + Math.random() * 0.03);
                const moon = this.createMoon(mesh, m);
                // textura/shader de lua
                if (m.shader) {
                    moon.mesh.material = this.createProceduralPlanetMaterial(m.shader);
                } else if (m.textures || m.texture) {
                    this.applyOptionalTextures(moon.mesh.material, m.textures || m.texture);
                }
                moons.push(moon);
            });
        }
        
        return {
            orbit: orbit,
            mesh: mesh,
            speed: data.speed,
            distance: data.distance,
            name: data.name,
            moons: moons
        };
    }
    
    createMoon(parentMesh, data) {
        const moonOrbit = new THREE.Group();
        moonOrbit.position.set(0, 0, 0);

        const geometry = new THREE.SphereGeometry(data.radius, 12, 12);
        const material = new THREE.MeshStandardMaterial({
            color: data.color || 0xbebebe,
            roughness: 0.9,
            metalness: 0.1
        });
        const moonMesh = new THREE.Mesh(geometry, material);
        moonMesh.position.x = data.distance;
        
        moonOrbit.add(moonMesh);
        
        // Add moon orbit line
        const moonOrbitLine = this.createMoonOrbitLine(data.distance);
        moonOrbit.add(moonOrbitLine);
        
        // Attach to the planet
        parentMesh.add(moonOrbit);
        
        return {
            orbit: moonOrbit,
            mesh: moonMesh,
            speed: data.speed,
            distance: data.distance,
            name: data.name
        };
    }

    createOrbitLine(radius, eccentricity = 0.05, angle = Math.random() * Math.PI * 2) {
        // Orbit elíptica leve para reduzir sobreposição visual
        const a = radius; // semi-major
        const b = radius * (1 - eccentricity); // semi-minor
        const curve = new THREE.EllipseCurve(
            0, 0,
            a, b,
            0, 2 * Math.PI,
            false,
            angle
        );
        
        const points = curve.getPoints(100);
        const geometry = new THREE.BufferGeometry().setFromPoints(
            points.map(p => new THREE.Vector3(p.x, 0, p.y))
        );
        
        const material = new THREE.LineBasicMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.3,
            depthWrite: false
        });
        
        const line = new THREE.LineLoop(geometry, material);
        line.renderOrder = -1;
        return line;
    }
    
    createMoonOrbitLine(radius) {
        const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, 2 * Math.PI, false, 0);
        const points = curve.getPoints(100);
        const geometry = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(p.x, 0, p.y)));
        const material = new THREE.LineBasicMaterial({ color: 0x666666, transparent: true, opacity: 0.25, depthWrite: false });
        const line = new THREE.LineLoop(geometry, material);
        line.renderOrder = -1;
        return line;
    }

    // Texturas utilitárias
    loadTextureSafe(url, isColor = true) {
        try {
            const tex = new THREE.TextureLoader().load(url);
            if (isColor && THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
            tex.anisotropy = 8;
            tex.needsUpdate = true;
            return tex;
        } catch (e) {
            console.warn('Falha ao carregar textura:', url, e);
            return null;
        }
    }

    applyOptionalTextures(material, textures) {
        if (!textures) return;
        const colorMapUrl = textures.color || textures.map;
        if (colorMapUrl) material.map = this.loadTextureSafe(colorMapUrl, true);
        if (textures.normal) material.normalMap = this.loadTextureSafe(textures.normal, false);
        if (textures.roughness) material.roughnessMap = this.loadTextureSafe(textures.roughness, false);
        if (textures.metalness) material.metalnessMap = this.loadTextureSafe(textures.metalness, false);
        const aoUrl = textures.ao || textures.ambientOcclusion || textures.aoMap;
        if (aoUrl) material.aoMap = this.loadTextureSafe(aoUrl, false);
        material.needsUpdate = true;
    }

    // Materiais procedurais (estilo do Sol) com iluminação simples
    createProceduralPlanetMaterial(cfg = {}) {
        const color1 = new THREE.Color(cfg.color1 || 0x666666);
        const color2 = new THREE.Color(cfg.color2 || 0x333333);
        const color3 = new THREE.Color(cfg.color3 || 0x000000);
        const speed = cfg.speed ?? 0.1;
        const noiseScale = cfg.noiseScale ?? 5.0;
        const banding = cfg.banding ?? 0.0; // para gas giants
        const bandStrength = cfg.bandStrength ?? 0.0;
        const emissiveStrength = cfg.emissiveStrength ?? 0.0;
        const lightPos = cfg.lightPos || new THREE.Vector3(0, 0, 0);
        
        const uniforms = {
            time: { value: 0 },
            color1: { value: color1 },
            color2: { value: color2 },
            color3: { value: color3 },
            speed: { value: speed },
            noiseScale: { value: noiseScale },
            banding: { value: banding },
            bandStrength: { value: bandStrength },
            emissiveStrength: { value: emissiveStrength },
            lightPos: { value: lightPos }
        };
        const material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vWorldPos;
                varying vec3 vNormalW;
                void main() {
                    vUv = uv;
                    vec4 wp = modelMatrix * vec4(position, 1.0);
                    vWorldPos = wp.xyz;
                    vNormalW = normalize(mat3(modelMatrix) * normal);
                    gl_Position = projectionMatrix * viewMatrix * wp;
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color1, color2, color3;
                uniform float speed, noiseScale, banding, bandStrength, emissiveStrength;
                uniform vec3 lightPos;
                varying vec2 vUv;
                varying vec3 vWorldPos;
                varying vec3 vNormalW;
                
                float noise(vec2 p) {
                    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
                }
                
                float fbm(vec2 p) {
                    float v = 0.0;
                    float a = 0.5;
                    for (int i = 0; i < 5; i++) {
                        v += a * noise(p);
                        p *= 2.0;
                        a *= 0.5;
                    }
                    return v;
                }
                
                void main() {
                    vec2 uv = vUv * noiseScale;
                    float n = fbm(uv + time * speed);
                    vec3 base = mix(color1, color2, n);
                    if (banding > 0.0) {
                        float bands = 0.5 + 0.5 * sin(vWorldPos.y * banding + time * speed * 2.0);
                        base = mix(base, color3, bands * bandStrength);
                    }
                    // Iluminação lambert simples a partir do Sol no (0,0,0)
                    vec3 L = normalize(lightPos - vWorldPos);
                    float diff = max(dot(normalize(vNormalW), L), 0.0);
                    vec3 lit = base * (0.2 + 0.8 * diff);
                    // Emissão sutil opcional
                    lit += base * emissiveStrength;
                    gl_FragColor = vec4(lit, 1.0);
                }
            `
        });
        this._animatedMaterials.push(material);
        return material;
    }

    update(delta, elapsed) {
        // Performance optimization: reduce shader updates when FPS is low
        const shouldUpdateShaders = perfMonitor && perfMonitor.fps > 40 || elapsed % 2 < 1; // Update every other second when low FPS

        if (shouldUpdateShaders) {
            // Atualiza tempo dos materiais animados
            for (const mat of this._animatedMaterials) {
                if (mat.uniforms && mat.uniforms.time) {
                    mat.uniforms.time.value = elapsed;
                }
            }

            // Rotate sun
            if (this.sun && this.sun.material.uniforms) {
                this.sun.material.uniforms.time.value = elapsed;
                this.sun.rotation.y += delta * 0.1;
            }
        }

        // Always update orbits (essential for gameplay)
        this.planets.forEach(planet => {
            planet.orbit.rotation.y += delta * planet.speed;
            planet.mesh.rotation.y += delta * 0.5;

            if (Array.isArray(planet.moons)) {
                planet.moons.forEach(moon => {
                    moon.orbit.rotation.y += delta * moon.speed;
                    moon.mesh.rotation.y += delta * 0.6;
                });
            }
        });
    }

    getPlanetByName(name) {
        return this.planets.find(p => p.name === name);
    }

    getSunPosition() {
        return this.sun ? this.sun.position.clone() : new THREE.Vector3(0, 0, 0);
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
