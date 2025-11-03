// Configurable 3D Signboards System
import * as THREE from '../../../vendor/three.module.js';
import { colors } from '../utils/colors.js';

export class SignboardSystem {
    constructor(scene) {
        this.scene = scene;
        this.signboards = [];
        // Deprecated shared canvas; each board now creates its own canvas for text

        // Performance optimization: throttle animations
        this.animationThrottle = 0;
        this.animationInterval = 2; // Update every 2 frames

        console.log('Signboard system initialized');
    }
    
    /**
     * Load signboards from JSON configuration
     * @param {Array} signboardsConfig - Array of signboard configurations
     */
    async loadFromConfig(signboardsConfig) {
        if (!Array.isArray(signboardsConfig)) {
            console.error('Signboards config must be an array');
            return;
        }
        
        signboardsConfig.forEach((config, index) => {
            try {
                this.createSignboard(config);
            } catch (error) {
                console.error(`Error creating signboard ${index}:`, error);
            }
        });
        
        console.log(`Loaded ${this.signboards.length} signboards`);
    }
    
    /**
     * Create a signboard from configuration
     * @param {Object} config - Signboard configuration
     */
    createSignboard(config) {
        const group = new THREE.Group();
        
        // Default values
        const defaults = {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            size: { width: 10, height: 5, depth: 0.5 },
            text: {
                content: 'Sample Text',
                fontSize: 48,
                fontFamily: 'Arial, sans-serif',
                color: '#ffffff',
                align: 'center',
                verticalAlign: 'middle',
                lineHeight: 1.2,
                padding: 20
            },
            style: 'modern', // 'modern', 'neon', 'holographic', 'classic', 'minimal'
            background: {
                color: '#1a1a2e',
                opacity: 0.9,
                gradient: null // { from: '#color1', to: '#color2', direction: 'vertical' }
            },
            border: {
                enabled: true,
                width: 0.2,
                color: '#00d4ff',
                style: 'solid' // 'solid', 'glow', 'neon'
            },
            effects: {
                glow: false,
                glowIntensity: 0.5,
                glowColor: '#00d4ff',
                pulse: false,
                pulseSpeed: 1,
                particles: false
            },
            stand: {
                enabled: false,
                type: 'single', // 'single', 'double', 'tripod'
                height: 5,
                color: '#666666'
            },
            decor: {
                floating: { enabled: true, amplitude: 0.25, speed: 0.3, rotAmpX: 0.02, rotAmpY: 0.03 },
                drones: { enabled: true, color: '#00d4ff', size: 0.6, offsetX: 0.8, offsetY: 0.8, frontOffset: 0.3 },
                cables: { enabled: true, color: '#888888', thickness: 0.03 }
            }
        };
        
        // Merge config with defaults
        const cfg = this.mergeConfig(defaults, config);
        
        // Create main board
        const board = this.createBoard(cfg);
        group.add(board);
        
        // Create text texture
        const textTexture = this.createTextTexture(cfg);
        const textMaterial = new THREE.MeshBasicMaterial({
            map: textTexture,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        const textGeometry = new THREE.PlaneGeometry(cfg.size.width - 0.1, cfg.size.height - 0.1);
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.z = cfg.size.depth / 2 + 0.01;
        group.add(textMesh);
        
        // Add border if enabled
        if (cfg.border.enabled) {
            const border = this.createBorder(cfg);
            group.add(border);
        }
        
        // Add glow effect if enabled
        if (cfg.effects.glow) {
            const glow = this.createGlow(cfg);
            group.add(glow);
        }
        
        // Add stand if enabled
        if (cfg.stand.enabled) {
            const stand = this.createStand(cfg);
            group.add(stand);
        }
        
        // Position and rotate
        group.position.set(cfg.position.x, cfg.position.y, cfg.position.z);
        group.rotation.set(
            cfg.rotation.x * Math.PI / 180,
            cfg.rotation.y * Math.PI / 180,
            cfg.rotation.z * Math.PI / 180
        );

        // Mark as interactive target
        group.userData = group.userData || {};
        group.userData.type = 'signboard';
        group.userData.config = cfg;
        if (cfg.action) {
            group.userData.action = cfg.action;
        }

        // Optional shootable target (small marker in front of the board)
        let target = null;
        if (cfg.target?.enabled !== false) {
            const tCfg = cfg.target || {};
            const sizeFactor = Math.min(cfg.size.width, cfg.size.height);
            const ringOuter = (tCfg.size ?? 0.12) * sizeFactor;
            const ringTube = (tCfg.thickness ?? 0.025) * sizeFactor;
            const ringSegments = tCfg.segments ?? 16;
            const radialSegments = tCfg.radialSegments ?? 12;
            const markerGeometry = new THREE.TorusGeometry(
                ringOuter,
                ringTube,
                radialSegments,
                ringSegments
            );
            const markerMaterial = new THREE.MeshBasicMaterial({
                color: tCfg.color || cfg.border?.color || '#00d4ff',
                transparent: true,
                opacity: 0.95
            });
            target = new THREE.Mesh(markerGeometry, markerMaterial);
            const forwardOffset = (tCfg.offset ?? 1.6);
            const upOffset = (tCfg.offsetUp ?? 0.6) + (cfg.size.height * 0.5);
            target.position.set(0, upOffset, cfg.size.depth / 2 + forwardOffset);

            // Add inner dot
            const dotGeometry = new THREE.CircleGeometry(ringTube * 1.2, radialSegments);
            const dotMaterial = new THREE.MeshBasicMaterial({ color: tCfg.innerColor || '#ffffff' });
            const dot = new THREE.Mesh(dotGeometry, dotMaterial);
            dot.position.z = 0.02;
            target.add(dot);

            // Optional crosshair lines
            if (tCfg.crosshair) {
                const lineMat = new THREE.LineBasicMaterial({ color: tCfg.crosshair.color || markerMaterial.color });
                const half = ringOuter * 1.2;
                const geomH = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(-half, 0, 0), new THREE.Vector3(half, 0, 0)
                ]);
                const geomV = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(0, -half, 0), new THREE.Vector3(0, half, 0)
                ]);
                target.add(new THREE.Line(geomH, lineMat));
                target.add(new THREE.Line(geomV, lineMat));
            }

            group.add(target);
            target.userData = target.userData || {};
            target.userData.type = 'hitTarget';
            target.userData.signboard = group;
            target.userData.orient = tCfg.orient || 'faceCamera';
            if (cfg.action) target.userData.action = cfg.action;
        }
        
        // Decor (drones holding the board with cables)
        const decor = { drones: [], cables: [], anchors: [], floating: null };
        this.createDecor(cfg, group, decor);

        // 3D attached panel (created on-demand)
        group.userData.panel3D = null;
        window.addEventListener('signboard:toggle-3d', (e) => {
            const target = e.detail?.target;
            const panel = e.detail?.panel;
            if (!target || target.parent !== group || !panel) return;

            // Toggle existing
            if (group.userData.panel3D) {
                group.remove(group.userData.panel3D);
                group.userData.panel3D.traverse((ch)=>{
                    if (ch.geometry) ch.geometry.dispose();
                    if (ch.material) ch.material.dispose?.();
                });
                group.userData.panel3D = null;
                return;
            }

            // Create panel geometry higher and larger, ~300px lift in screen terms -> ~adjust y locally
            const panelWidth = Math.max(5, cfg.size.width * 1.15);
            const panelHeight = Math.max(3.2, cfg.size.height * 1.35);
            const planeGeo = new THREE.PlaneGeometry(panelWidth, panelHeight, 1, 1);
            const bgMat = new THREE.MeshBasicMaterial({ color: 0x0f1628, transparent: true, opacity: 0.92 });
            const plane = new THREE.Mesh(planeGeo, bgMat);
            plane.position.set(0, (cfg.size.height * 0.5) + 11, cfg.size.depth * 0.5 + 0.02);

            // Border
            const borderGeo = new THREE.PlaneGeometry(panelWidth + 0.14, panelHeight + 0.14, 1, 1);
            const borderMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(panel.accent || '#00d4ff') , transparent: true, opacity: 1, side: THREE.BackSide });
            const border = new THREE.Mesh(borderGeo, borderMat);
            border.position.copy(plane.position);

            // Content canvas texture com estilos alinhados ao HUD (rounded, glow, header, chips)
            // Canvas base
            const c = document.createElement('canvas');
            c.width = Math.floor(panelWidth * 260);
            c.height = Math.floor(panelHeight * 260);
            const ctx = c.getContext('2d');
            // helper: rounded rect
            const roundRect = (x,y,w,h,r) => {
                const rr = Math.min(r, w/2, h/2);
                ctx.beginPath();
                ctx.moveTo(x+rr, y);
                ctx.lineTo(x+w-rr, y);
                ctx.quadraticCurveTo(x+w, y, x+w, y+rr);
                ctx.lineTo(x+w, y+h-rr);
                ctx.quadraticCurveTo(x+w, y+h, x+w-rr, y+h);
                ctx.lineTo(x+rr, y+h);
                ctx.quadraticCurveTo(x, y+h, x, y+h-rr);
                ctx.lineTo(x, y+rr);
                ctx.quadraticCurveTo(x, y, x+rr, y);
                ctx.closePath();
            };
            // background gradient + glow
            const W = c.width, H = c.height;
            const panelX = Math.floor(W * 0.04), panelY = Math.floor(H * 0.06);
            const panelW = W - panelX * 2, panelH = H - panelY * 2;
            const grd = ctx.createLinearGradient(panelX, panelY, panelX+panelW, panelY+panelH);
            grd.addColorStop(0, '#1a1f3a');
            grd.addColorStop(1, '#0f1628');
            ctx.save();
            ctx.shadowColor = (panel.accent || '#00d4ff');
            ctx.shadowBlur = Math.max(8, Math.floor(Math.min(panelW, panelH) * 0.05));
            roundRect(panelX, panelY, panelW, panelH, Math.floor(Math.min(panelW, panelH) * 0.06));
            ctx.fillStyle = grd; ctx.fill();
            ctx.restore();
            // border
            ctx.lineWidth = Math.max(2, Math.floor(Math.min(panelW, panelH) * 0.006));
            ctx.strokeStyle = (panel.accent || '#00d4ff');
            roundRect(panelX, panelY, panelW, panelH, Math.floor(Math.min(panelW, panelH) * 0.06));
            ctx.stroke();
            // helpers
            const drawText = (txt, fontPx, color, x, y) => { ctx.fillStyle=color; ctx.font=`${fontPx}px Inter, Arial`; ctx.textAlign='left'; ctx.fillText(txt, x, y); };
            const wrapText = (text, fontPx, color, x, y, maxW, lineH, maxY) => {
                ctx.fillStyle=color; ctx.font=`${fontPx}px Inter, Arial`; ctx.textAlign='left';
                const words = String(text||'').split(/\s+/);
                let line = '';
                for (let i=0;i<words.length;i++) {
                    const test = line ? line + ' ' + words[i] : words[i];
                    if (ctx.measureText(test).width > maxW) {
                        ctx.fillText(line, x, y);
                        y += lineH; line = words[i];
                        if (maxY && y > maxY) break;
                    } else { line = test; }
                }
                if (line && (!maxY || y <= maxY)) ctx.fillText(line, x, y);
                return y + lineH;
            };

            // layout metrics
            const margin = Math.floor(W * 0.04);
            const colGap = Math.floor(W * 0.04);
            const leftX = panelX + margin;
            const maxY = panelY + panelH - margin;
            let y = panelY + Math.floor(H * 0.10);

            // Title
            const titleSize = Math.max(26, Math.floor(H * 0.095));
            drawText(panel.title || '', titleSize, (panel.accent || '#00d4ff'), leftX, y);
            y += Math.floor(H * 0.06);

            // Column widths (reserve right column if photo/thumb)
            const hasImage = !!(panel.photo || panel.thumb);
            const rightColW = hasImage ? Math.floor(W * 0.32) : 0;
            const contentW = panelW - margin*2 - (hasImage ? (rightColW + colGap) : 0);
            const contentMaxX = leftX + contentW;

            // Subtitle
            if (panel.subtitle) {
                y = wrapText(panel.subtitle, Math.max(14, Math.floor(H * 0.045)), '#a0aec0', leftX, y, contentW, Math.max(18, Math.floor(H * 0.052)), maxY);
            }
            // Body
            if (panel.body) {
                y = wrapText(panel.body, Math.max(13, Math.floor(H * 0.04)), '#cbd5e0', leftX, y, contentW, Math.max(16, Math.floor(H * 0.048)), maxY);
            }
            if (Array.isArray(panel.items)) {
                // Simple bar chart for skills
                panel.items.forEach(it=>{
                    ctx.fillStyle = '#cbd5e0'; ctx.font = `${Math.max(12, Math.floor(H*0.038))}px Inter, Arial`; ctx.fillText(`${it.name}`, leftX, y);
                    const barX = leftX + Math.floor(W * 0.16), barW = Math.max(Math.floor(contentW * 0.55), Math.floor(W * 0.22)), barH = Math.max(12, Math.floor(H * 0.028));
                    // rounded bar bg
                    ctx.fillStyle = 'rgba(255,255,255,0.16)';
                    roundRect(barX, y - Math.floor(barH*0.6), barW, barH, Math.floor(barH*0.5)); ctx.fill();
                    ctx.fillStyle = panel.accent || '#00d4ff'; ctx.fillRect(barX, y - Math.floor(barH*0.45), Math.floor(barW * (it.level/100)), Math.floor(barH*0.7));
                    y+= Math.max(18, Math.floor(H * 0.035));
                });
            }
            if (panel.links) {
                ctx.fillStyle = panel.accent || '#00d4ff';
                ctx.font = `${Math.max(13, Math.floor(H*0.04))}px Inter, Arial`;
                if (panel.links.repo) { ctx.fillText('Repo', leftX, y); y+= Math.max(16, Math.floor(H * 0.032)); }
                if (panel.links.demo) { ctx.fillText('Demo', leftX, y); y+= Math.max(16, Math.floor(H * 0.032)); }
                if (panel.links.link) { ctx.fillText(panel.links.link, leftX, y); }
            }
            // optional photo/thumb on right
            if (panel.photo || panel.thumb) {
                try {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = ()=>{
                        const iw = rightColW || Math.floor(W * 0.32), ih = Math.floor(H * 0.38);
                        // clip rounded rect for image
                        ctx.save();
                        roundRect((panelX+panelW) - iw - margin, panelY + margin, iw, ih, Math.floor(Math.min(panelW, panelH) * 0.04));
                        ctx.clip();
                        ctx.drawImage(img, (panelX+panelW) - iw - margin, panelY + margin, iw, ih);
                        ctx.restore();
                        // image border
                        ctx.lineWidth = Math.max(2, Math.floor(Math.min(panelW, panelH) * 0.006));
                        ctx.strokeStyle = panel.accent || '#00d4ff';
                        roundRect((panelX+panelW) - iw - margin, panelY + margin, iw, ih, Math.floor(Math.min(panelW, panelH) * 0.04));
                        ctx.stroke();
                        tex.needsUpdate = true;
                    };
                    img.src = panel.photo || panel.thumb;
                } catch {}
            }
            const tex = new THREE.CanvasTexture(c);
            tex.needsUpdate = true;
            // Improve texture sampling and avoid lazy mipmap init warnings
            tex.generateMipmaps = false;
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.anisotropy = 4;
            const contentMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
            const content = new THREE.Mesh(new THREE.PlaneGeometry(panelWidth-0.2, panelHeight-0.2), contentMat);
            content.position.copy(plane.position).add(new THREE.Vector3(0,0,0.01));

            const panelGroup = new THREE.Group();
            panelGroup.add(border);
            panelGroup.add(plane);
            panelGroup.add(content);

            group.add(panelGroup);
            group.userData.panel3D = panelGroup;
        });

        this.scene.add(group);
        
        this.signboards.push({
            group: group,
            config: cfg,
            textMesh: textMesh,
            target: target,
            decor: decor,
            basePosition: new THREE.Vector3(cfg.position.x, cfg.position.y, cfg.position.z),
            floatSeed: Math.random() * Math.PI * 2
        });
        
        return group;
    }
    
    createBoard(cfg) {
        const geometry = new THREE.BoxGeometry(cfg.size.width, cfg.size.height, cfg.size.depth);
        
        let material;
        
        switch (cfg.style) {
            case 'neon':
                material = new THREE.MeshStandardMaterial({
                    color: cfg.background.color,
                    emissive: cfg.background.color,
                    emissiveIntensity: 0.5,
                    metalness: 0.8,
                    roughness: 0.2,
                    transparent: true,
                    opacity: cfg.background.opacity
                });
                break;
                
            case 'holographic':
                material = new THREE.MeshPhysicalMaterial({
                    color: cfg.background.color,
                    metalness: 0.9,
                    roughness: 0.1,
                    transparent: true,
                    opacity: cfg.background.opacity * 0.7,
                    transmission: 0.5,
                    thickness: 0.5
                });
                break;
                
            case 'classic':
                material = new THREE.MeshStandardMaterial({
                    color: cfg.background.color,
                    metalness: 0.3,
                    roughness: 0.7,
                    transparent: true,
                    opacity: cfg.background.opacity
                });
                break;
                
            case 'minimal':
                material = new THREE.MeshBasicMaterial({
                    color: cfg.background.color,
                    transparent: true,
                    opacity: cfg.background.opacity * 0.5
                });
                break;
                
            default: // modern
                material = new THREE.MeshStandardMaterial({
                    color: cfg.background.color,
                    metalness: 0.5,
                    roughness: 0.4,
                    transparent: true,
                    opacity: cfg.background.opacity
                });
        }
        
        const mesh = new THREE.Mesh(geometry, material);
        return mesh;
    }
    
    createTextTexture(cfg) {
        const text = cfg.text;
        const resolution = 256; // pixels per unit
        const canvas = document.createElement('canvas');
        const widthPx = Math.max(2, Math.floor(cfg.size.width * resolution));
        const heightPx = Math.max(2, Math.floor(cfg.size.height * resolution));
        canvas.width = widthPx;
        canvas.height = heightPx;
        const ctx = canvas.getContext('2d');

        if (cfg.background.gradient) {
            const gradient = cfg.background.gradient;
            let grd;
            if (gradient.direction === 'vertical') {
                grd = ctx.createLinearGradient(0, 0, 0, heightPx);
            } else {
                grd = ctx.createLinearGradient(0, 0, widthPx, 0);
            }
            grd.addColorStop(0, gradient.from);
            grd.addColorStop(1, gradient.to);
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, widthPx, heightPx);
        }

        ctx.font = `${text.fontSize * resolution / 10}px ${text.fontFamily}`;
        ctx.fillStyle = text.color;
        ctx.textAlign = text.align;
        ctx.textBaseline = 'top';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        const lines = text.content.split('\n');
        const lineHeightPx = text.fontSize * resolution / 10 * text.lineHeight;
        const totalTextHeight = lines.length * lineHeightPx;

        let startY;
        if (text.verticalAlign === 'top') {
            startY = text.padding * resolution / 10;
        } else if (text.verticalAlign === 'bottom') {
            startY = heightPx - totalTextHeight - text.padding * resolution / 10;
        } else {
            startY = (heightPx - totalTextHeight) / 2;
        }

        let x;
        if (text.align === 'left') {
            x = text.padding * resolution / 10;
        } else if (text.align === 'right') {
            x = widthPx - text.padding * resolution / 10;
        } else {
            x = widthPx / 2;
        }

        lines.forEach((line, index) => {
            const y = startY + index * lineHeightPx;
            ctx.fillText(line, x, y);
        });

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }
    
    createBorder(cfg) {
        const group = new THREE.Group();
        const border = cfg.border;
        
        const borderGeometry = new THREE.BoxGeometry(
            cfg.size.width + border.width,
            cfg.size.height + border.width,
            cfg.size.depth + border.width
        );
        
        let borderMaterial;
        
        if (border.style === 'glow' || border.style === 'neon') {
            borderMaterial = new THREE.MeshBasicMaterial({
                color: border.color,
                transparent: true,
                opacity: 0.8,
                side: THREE.BackSide
            });
        } else {
            borderMaterial = new THREE.MeshStandardMaterial({
                color: border.color,
                metalness: 0.8,
                roughness: 0.2
            });
        }
        
        const borderMesh = new THREE.Mesh(borderGeometry, borderMaterial);
        group.add(borderMesh);
        
        return group;
    }
    
    createGlow(cfg) {
        const glowGeometry = new THREE.BoxGeometry(
            cfg.size.width * 1.1,
            cfg.size.height * 1.1,
            cfg.size.depth * 1.1
        );
        
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: cfg.effects.glowColor,
            transparent: true,
            opacity: cfg.effects.glowIntensity * 0.3,
            side: THREE.BackSide
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        return glow;
    }
    
    createStand(cfg) {
        const group = new THREE.Group();
        const stand = cfg.stand;
        
        const standMaterial = new THREE.MeshStandardMaterial({
            color: stand.color,
            metalness: 0.6,
            roughness: 0.4
        });
        
        if (stand.type === 'single') {
            const poleGeometry = new THREE.CylinderGeometry(0.2, 0.2, stand.height, 8);
            const pole = new THREE.Mesh(poleGeometry, standMaterial);
            pole.position.y = -cfg.size.height / 2 - stand.height / 2;
            group.add(pole);
            
            // Base
            const baseGeometry = new THREE.CylinderGeometry(1, 1.5, 0.5, 8);
            const base = new THREE.Mesh(baseGeometry, standMaterial);
            base.position.y = -cfg.size.height / 2 - stand.height - 0.25;
            group.add(base);
            
        } else if (stand.type === 'double') {
            const poleGeometry = new THREE.CylinderGeometry(0.15, 0.15, stand.height, 8);
            
            const pole1 = new THREE.Mesh(poleGeometry, standMaterial);
            pole1.position.set(-cfg.size.width / 3, -cfg.size.height / 2 - stand.height / 2, 0);
            group.add(pole1);
            
            const pole2 = new THREE.Mesh(poleGeometry, standMaterial);
            pole2.position.set(cfg.size.width / 3, -cfg.size.height / 2 - stand.height / 2, 0);
            group.add(pole2);
            
            // Bases
            const baseGeometry = new THREE.CylinderGeometry(0.8, 1, 0.4, 8);
            const base1 = new THREE.Mesh(baseGeometry, standMaterial);
            base1.position.set(-cfg.size.width / 3, -cfg.size.height / 2 - stand.height - 0.2, 0);
            group.add(base1);
            
            const base2 = new THREE.Mesh(baseGeometry, standMaterial);
            base2.position.set(cfg.size.width / 3, -cfg.size.height / 2 - stand.height - 0.2, 0);
            group.add(base2);
            
        } else if (stand.type === 'tripod') {
            const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, stand.height, 6);
            
            const angles = [0, 120, 240];
            angles.forEach(angle => {
                const pole = new THREE.Mesh(poleGeometry, standMaterial);
                const rad = angle * Math.PI / 180;
                const offset = cfg.size.width / 4;
                pole.position.set(
                    Math.cos(rad) * offset,
                    -cfg.size.height / 2 - stand.height / 2,
                    Math.sin(rad) * offset
                );
                pole.rotation.z = Math.sin(rad) * 0.1;
                pole.rotation.x = Math.cos(rad) * 0.1;
                group.add(pole);
            });
        }
        
        return group;
    }
    
    createDecor(cfg, group, decor) {
        const dCfg = cfg.decor || {};
        // Floating setup
        const floatingCfg = dCfg.floating || {};
        if (floatingCfg.enabled !== false) {
            decor.floating = {
                amplitude: floatingCfg.amplitude ?? 0.25,
                speed: floatingCfg.speed ?? 0.3,
                rotAmpX: floatingCfg.rotAmpX ?? 0.02,
                rotAmpY: floatingCfg.rotAmpY ?? 0.03
            };
        }

        // Drones and cables
        const dronesCfg = dCfg.drones || {};
        const cablesCfg = dCfg.cables || {};
        if (dronesCfg.enabled !== false) {
            const halfW = cfg.size.width * 0.5;
            const topY = cfg.size.height * 0.5;
            const frontZ = cfg.size.depth * 0.5;
            const dx = (dronesCfg.offsetX ?? 0.8);
            const dy = (dronesCfg.offsetY ?? 0.8);
            const fz = (dronesCfg.frontOffset ?? 0.3);
            const size = (dronesCfg.size ?? 0.6);

            const positions = [
                new THREE.Vector3(-(halfW + dx), topY + dy, frontZ + fz),
                new THREE.Vector3(+(halfW + dx), topY + dy, frontZ + fz)
            ];

            positions.forEach((p, i) => {
                const drone = this.createDroneMesh(size, dronesCfg.color || '#00d4ff');
                drone.position.copy(p);
                drone.userData.basePos = p.clone();
                drone.userData.phase = Math.random() * Math.PI * 2;
                group.add(drone);
                decor.drones.push(drone);

                // Cable anchor on board top corners
                const anchor = new THREE.Vector3(i === 0 ? -halfW : halfW, topY, frontZ);
                decor.anchors.push(anchor);

                if (cablesCfg.enabled !== false) {
                    const cable = this.createCableMesh(cablesCfg.thickness ?? 0.03, cablesCfg.color || '#888888');
                    group.add(cable);
                    decor.cables.push(cable);
                    // Initialize transform
                    this.updateCableBetween(cable, anchor, drone.position, cablesCfg.thickness ?? 0.03);
                }
            });
        }
    }

    createDroneMesh(size, color) {
        // Simple "ship/boat" drone: body + nose + side fins
        const group = new THREE.Group();
        const bodyGeo = new THREE.SphereGeometry(size * 0.7, 12, 12);
        const bodyMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.4, metalness: 0.6, roughness: 0.4 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        group.add(body);

        const noseGeo = new THREE.ConeGeometry(size * 0.4, size * 0.9, 12);
        const noseMat = new THREE.MeshStandardMaterial({ color });
        const nose = new THREE.Mesh(noseGeo, noseMat);
        nose.rotation.x = Math.PI / 2;
        nose.position.z = size * 0.8;
        group.add(nose);

        const finGeo = new THREE.BoxGeometry(size * 0.9, size * 0.1, size * 0.3);
        const finMat = new THREE.MeshStandardMaterial({ color });
        const finL = new THREE.Mesh(finGeo, finMat);
        finL.position.set(-size * 0.6, 0, 0);
        const finR = finL.clone();
        finR.position.x = size * 0.6;
        group.add(finL);
        group.add(finR);
        return group;
    }

    createCableMesh(thickness, color) {
        const geo = new THREE.CylinderGeometry(thickness, thickness, 1, 8);
        const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.6, roughness: 0.3 });
        const mesh = new THREE.Mesh(geo, mat);
        return mesh;
    }

    updateCableBetween(cable, from, to, thickness) {
        // from, to in group local space
        const dir = new THREE.Vector3().subVectors(to, from);
        const len = dir.length();
        const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
        cable.position.copy(mid);
        cable.scale.set(1, len, 1);
        // Orient cylinder Y-axis along dir
        const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
        cable.setRotationFromQuaternion(quat);
    }

    update(delta) {
        const time = performance.now() / 1000;

        // Performance optimization: throttle animations
        this.animationThrottle++;
        if (this.animationThrottle < this.animationInterval) {
            return; // Skip animation updates this frame
        }
        this.animationThrottle = 0;

        this.signboards.forEach(signboard => {
            const cfg = signboard.config;
            
            // Pulse effect
            if (cfg.effects.pulse) {
                const pulseValue = Math.sin(time * cfg.effects.pulseSpeed * 2) * 0.5 + 0.5;
                
                if (signboard.group.children[0].material.emissive) {
                    signboard.group.children[0].material.emissiveIntensity = 0.3 + pulseValue * 0.3;
                }
                
                if (cfg.effects.glow) {
                    const glowMesh = signboard.group.children.find(child => 
                        child.material && child.material.side === THREE.BackSide
                    );
                    if (glowMesh) {
                        glowMesh.material.opacity = cfg.effects.glowIntensity * 0.3 * (0.5 + pulseValue * 0.5);
                    }
                }
            }

            // Animate target (rotation/pulse/hover)
            if (signboard.target) {
                const tCfg = cfg.target || {};
                const spin = (tCfg.spinSpeed ?? 1.0) * 0.8;
                signboard.target.rotation.z += delta * spin;
                if (tCfg.pulse !== false) {
                    const base = tCfg.baseScale ?? 1.0;
                    const amp = tCfg.pulseAmplitude ?? 0.08;
                    const scale = base + Math.sin(time * (tCfg.pulseSpeed ?? 2.0)) * amp;
                    signboard.target.scale.set(scale, scale, scale);
                }
                // subtle bobbing
                if (tCfg.bob) {
                    const baseY = signboard.target.userData?.baseY ?? signboard.target.position.y;
                    const offset = Math.sin(time * (tCfg.bob.speed ?? 1.4)) * (tCfg.bob.amplitude ?? 0.15);
                    signboard.target.position.y = baseY + offset;
                }
                // fade when close
                if (tCfg.fadeNear) {
                    const cam = window.galaxyPortfolio?.camera?.getCamera?.();
                    if (cam) {
                        const worldPos = signboard.target.getWorldPosition(new THREE.Vector3());
                        const dist = cam.position.distanceTo(worldPos);
                        const near = tCfg.fadeNear.near ?? 10;
                        const far = tCfg.fadeNear.far ?? 120;
                        const alpha = Math.max(0.2, Math.min(1, (dist - near) / (far - near)));
                        if (signboard.target.material) signboard.target.material.opacity = alpha;
                    }
                }
                // orientation: horizontal means keep flat to world, faceCamera faces camera
                const orient = signboard.target.userData?.orient;
                if (orient === 'horizontal') {
                    signboard.target.rotation.x = 0;
                } else if (orient === 'faceCamera') {
                    const cam = window.galaxyPortfolio?.camera?.getCamera?.();
                    if (cam) {
                        const worldPos = signboard.target.getWorldPosition(new THREE.Vector3());
                        signboard.target.lookAt(cam.position);
                        // lock to face camera but keep relatively flat by zeroing roll
                        signboard.target.rotation.x = 0;
                    }
                }
            }

            // Floating boards and drone/cables animation
            if (signboard.decor) {
                const floating = signboard.decor.floating;
                if (floating) {
                    const off = Math.sin((time + signboard.floatSeed) * floating.speed) * floating.amplitude;
                    signboard.group.position.y = signboard.basePosition.y + off;
                    signboard.group.rotation.x = Math.sin((time + signboard.floatSeed * 0.7) * floating.speed) * floating.rotAmpX;
                    signboard.group.rotation.y = Math.sin((time + signboard.floatSeed * 1.1) * floating.speed) * floating.rotAmpY;
                }

                // Drones bobbing and cable updates (in group local space)
                if (Array.isArray(signboard.decor.drones)) {
                    signboard.decor.drones.forEach((drone, i) => {
                        const base = drone.userData.basePos;
                        const phase = drone.userData.phase || 0;
                        const bob = Math.sin(time * 1.5 + phase) * 0.1;
                        drone.position.set(base.x, base.y + bob, base.z);
                        const anchor = signboard.decor.anchors[i];
                        const cable = signboard.decor.cables[i];
                        if (cable && anchor) {
                            this.updateCableBetween(cable, anchor, drone.position, cfg.decor?.cables?.thickness ?? 0.03);
                        }
                    });
                }
            }
        });
    }
    
    mergeConfig(defaults, config) {
        const merged = JSON.parse(JSON.stringify(defaults));
        
        Object.keys(config).forEach(key => {
            if (typeof config[key] === 'object' && !Array.isArray(config[key]) && config[key] !== null) {
                merged[key] = { ...merged[key], ...config[key] };
            } else {
                merged[key] = config[key];
            }
        });
        
        return merged;
    }
    
    cleanup() {
        this.signboards.forEach(signboard => {
            this.scene.remove(signboard.group);
            signboard.group.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (child.material.map) child.material.map.dispose();
                    child.material.dispose();
                }
            });
        });
        
        this.signboards = [];
    }

    getHitTargets() {
        const targets = [];
        this.signboards.forEach(s => {
            if (s.target) targets.push(s.target);
        });
        return targets;
    }
}
