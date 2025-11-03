// HUD (Heads-Up Display) interface
export class HUD {
    constructor() {
        this.container = null;
        this.elements = {};
        this.visible = true;
        
        this.create();
        this.setupEventListeners();
    }

    create() {
        // Create HUD container
        this.container = document.createElement('div');
        this.container.id = 'hud';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 100;
            font-family: 'Inter', sans-serif;
            color: #e0e6ed;
        `;
        
        document.body.appendChild(this.container);
        
        // Create HUD elements
        this.createSpeedometer();
        this.createDestination();
        this.createAutopilotIndicator();
        this.createControls();
        this.createModeToggle();
        this.createPlanetTooltip();
        this.createCrosshair();
        this.createMobileControls();
        this.createBoardPanelsLayer();
        this.createFullscreen();
    }

    createPlanetTooltip() {
        const tip = document.createElement('div');
        tip.id = 'planet-tip';
        tip.style.cssText = `
            position: absolute;
            transform: translate(-50%, -120%);
            background: rgba(10, 14, 39, 0.9);
            border: 2px solid #00d4ff;
            border-radius: 10px;
            padding: 8px 12px;
            pointer-events: none;
            display: none;
            white-space: nowrap;
            font-size: 14px;
        `;
        tip.innerHTML = `<span id="planet-tip-name" style="font-weight:600;color:#00d4ff;">Planeta</span>
                         <div id="planet-tip-arrow" style="position:absolute;left:50%;bottom:-10px;transform:translateX(-50%);width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:10px solid #00d4ff;"></div>`;
        this.container.appendChild(tip);
        this.elements.planetTip = tip;
        this.elements.planetTipName = tip.querySelector('#planet-tip-name');
    }

    createCrosshair() {
        const crosshair = document.createElement('div');
        crosshair.id = 'crosshair';
        crosshair.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 20px;
            height: 20px;
            pointer-events: none;
            display: none;
            z-index: 200;
        `;

        // Ensure crosshair is properly positioned on all screen sizes
        const updatePosition = () => {
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            const centerX = screenWidth / 2;
            const centerY = screenHeight / 2;

            crosshair.style.left = `${centerX}px`;
            crosshair.style.top = `${centerY}px`;
        };

        // Update position on resize and orientation change
        window.addEventListener('resize', updatePosition);
        window.addEventListener('orientationchange', updatePosition);

        // Set initial position
        updatePosition();

        // Create crosshair lines
        const horizontal = document.createElement('div');
        horizontal.style.cssText = `
            position: absolute;
            width: 100%;
            height: 2px;
            background: #00d4ff;
            top: 50%;
            left: 0;
            transform: translateY(-50%);
            box-shadow: 0 0 10px #00d4ff;
        `;

        const vertical = document.createElement('div');
        vertical.style.cssText = `
            position: absolute;
            width: 2px;
            height: 100%;
            background: #00d4ff;
            left: 50%;
            top: 0;
            transform: translateX(-50%);
            box-shadow: 0 0 10px #00d4ff;
        `;

        crosshair.appendChild(horizontal);
        crosshair.appendChild(vertical);

        this.container.appendChild(crosshair);
        this.elements.crosshair = crosshair;
    }

    createBoardPanelsLayer() {
        const layer = document.createElement('div');
        layer.id = 'board-panels';
        layer.style.cssText = `
            position: fixed; left:0; top:0; width:100%; height:100%;
            pointer-events: none; z-index: 120;
        `;
        this.container.appendChild(layer);
        this.elements.boardPanels = layer;

        // Allow scroll wheel to scroll the latest panel even em pointer lock
        window.addEventListener('wheel', (e) => {
            if (!this.elements.boardPanels) return;
            const panels = this.elements.boardPanels.querySelectorAll('.board-panel');
            if (!panels.length) return;
            const panel = panels[panels.length - 1];
            panel.scrollTop += e.deltaY;
            e.preventDefault();
        }, { passive: false });

        // Toggle open/close via event from main when a target is hit
        window.addEventListener('signboard:toggle-panel', (e) => {
            const { worldPos, html, width, maxHeight } = e.detail;
            // Project 3D to 2D
            const cam = window.galaxyPortfolio?.camera?.getCamera?.();
            const renderer = window.galaxyPortfolio?.engine?.getRenderer?.();
            if (!cam || !renderer || !this.elements.boardPanels) return;
            const p = worldPos.clone().project(cam);
            const sx = (p.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
            const sy = (-p.y * 0.5 + 0.5) * renderer.domElement.clientHeight;

            // If a panel already exists near this position, close it
            const existing = Array.from(this.elements.boardPanels.children).find((el) => {
                const dx = Math.abs(parseFloat(el.dataset.sx || '0') - sx);
                const dy = Math.abs(parseFloat(el.dataset.sy || '0') - sy);
                return dx < 40 && dy < 40; // threshold
            });
            if (existing) { existing.remove(); return; }

            // Create panel
            const panel = document.createElement('div');
            panel.className = 'board-panel';
            panel.dataset.sx = String(sx);
            panel.dataset.sy = String(sy);
            panel.style.cssText = `
                position: absolute; left: ${Math.round(sx)}px; top: ${Math.round(sy - 20)}px;
                transform: translate(-50%, -100%);
                background: linear-gradient(135deg, #1a1f3a 0%, #0f1628 100%);
                border: 2px solid #00d4ff; border-radius: 20px; color: #e0e6ed;
                max-width: ${width || 560}px; max-height: ${maxHeight || 420}px; overflow: auto;
                padding: 40px; pointer-events: auto; box-shadow: 0 20px 60px rgba(0, 212, 255, 0.3);
                animation: slideIn 0.3s ease-out;
            `;
            panel.innerHTML = html;
            this.elements.boardPanels.appendChild(panel);
        });
    }

    updatePlanetTooltip(screenX, screenY, name) {
        if (!this.elements.planetTip) return;
        this.elements.planetTip.style.left = `${screenX}px`;
        this.elements.planetTip.style.top = `${screenY}px`;
        if (name) this.elements.planetTipName.textContent = name;
        this.elements.planetTip.style.display = 'block';
    }

    hidePlanetTooltip() {
        if (this.elements.planetTip) {
            this.elements.planetTip.style.display = 'none';
        }
    }

    createSpeedometer() {
        const speedometer = document.createElement('div');
        speedometer.id = 'speedometer';
        speedometer.style.cssText = `
            position: absolute;
            top: 10px;
            left: 15px;
            background: rgba(10, 14, 39, 0.8);
            border: 2px solid #00d4ff;
            border-radius: 12px;
            padding: 15px 20px;
            pointer-events: auto;
        `;
        speedometer.innerHTML = `
            <div style="font-size: 12px; color: #a0aec0; margin-bottom: 5px;">VELOCIDADE</div>
            <div id="speed-value" style="font-size: 24px; font-weight: 700; color: #00d4ff;">0</div>
        `;
        
        this.container.appendChild(speedometer);
        this.elements.speedometer = speedometer;
        this.elements.speedValue = document.getElementById('speed-value');
    }

    createDestination() {
        const destination = document.createElement('div');
        destination.id = 'destination';
        destination.style.cssText = `
            position: absolute;
            top: 30px;
            left: 30px;
            background: rgba(10, 14, 39, 0.8);
            border: 2px solid #ff6b35;
            border-radius: 12px;
            padding: 15px 20px;
            pointer-events: auto;
            display: none;
        `;
        destination.innerHTML = `
            <div style="font-size: 12px; color: #a0aec0; margin-bottom: 5px;">DESTINO</div>
            <div id="destination-name" style="font-size: 18px; font-weight: 600; color: #ff6b35;">Nenhum</div>
            <div id="destination-distance" style="font-size: 14px; color: #cbd5e0; margin-top: 5px;">-</div>
        `;
        
        this.container.appendChild(destination);
        this.elements.destination = destination;
        this.elements.destinationName = document.getElementById('destination-name');
        this.elements.destinationDistance = document.getElementById('destination-distance');
    }

    createAutopilotIndicator() {
        const autopilot = document.createElement('div');
        autopilot.id = 'autopilot';
        autopilot.style.cssText = `
            position: absolute;
            top: 30px;
            right: 30px;
            background: rgba(10, 14, 39, 0.8);
            border: 2px solid #06ffa5;
            border-radius: 12px;
            padding: 15px 20px;
            pointer-events: auto;
            display: none;
        `;
        autopilot.innerHTML = `
            <div style="font-size: 12px; color: #a0aec0; margin-bottom: 5px;">AUTOPILOT</div>
            <div style="font-size: 18px; font-weight: 600; color: #06ffa5;">● ATIVO</div>
        `;
        
        this.container.appendChild(autopilot);
        this.elements.autopilot = autopilot;
        
        // Camera mode indicator
        const cameraMode = document.createElement("div");
        cameraMode.id = "camera-mode";
        cameraMode.style.cssText = `
            position: absolute;
            top: 10px;
            right: 30px;
            background: rgba(10, 14, 39, 0.8);
            border: 2px solid #9d4edd;
            border-radius: 12px;
            padding: 15px 20px;
            pointer-events: auto;
        `;
        cameraMode.innerHTML = `
            <div style="font-size: 12px; color: #a0aec0; margin-bottom: 5px;">CÂMERA</div>
            <div id="camera-mode-text" style="font-size: 16px; font-weight: 600; color: #9d4edd;">3ª Pessoa</div>
        `;
        
        this.container.appendChild(cameraMode);
        this.elements.cameraMode = cameraMode;
        this.elements.cameraModeText = document.getElementById("camera-mode-text");

        // Mouse Flight Mode indicator
        const mouseFlight = document.createElement("div");
        mouseFlight.id = "mouse-flight";
        mouseFlight.style.cssText = `
            position: absolute;
            top: 100px;
            right: 30px;
            background: rgba(10, 14, 39, 0.8);
            border: 2px solid #ff006e;
            border-radius: 12px;
            padding: 15px 20px;
            pointer-events: auto;
            display: none;
        `;
        mouseFlight.innerHTML = `
            <div style="font-size: 12px; color: #a0aec0; margin-bottom: 5px;">VOO MOUSE</div>
            <div id="mouse-flight-text" style="font-size: 16px; font-weight: 600; color: #ff006e;">ATIVO</div>
        `;
        
        this.container.appendChild(mouseFlight);
        this.elements.mouseFlight = mouseFlight;
        this.elements.mouseFlightText = document.getElementById("mouse-flight-text");
    }

    createControls() {
        const controls = document.createElement('div');
        controls.id = 'controls-help';
        controls.style.cssText = `
            position: absolute;
            bottom: 30px;
            right: 30px;
            background: rgba(10, 14, 39, 0.8);
            border: 2px solid #9d4edd;
            border-radius: 12px;
            padding: 15px 20px;
            pointer-events: auto;
            font-size: 13px;
            line-height: 1.8;
        `;
        controls.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 10px; color: #9d4edd;">CONTROLES</div>
            <div><span style="color: #00d4ff;">W</span> - Acelerar</div>
            <div><span style="color: #00d4ff;">S</span> - Desacelerar</div>
            <div><span style="color: #00d4ff;">A/D</span> - Rolar (no modo Mouse Flight) / Mover lateralmente</div>
            <div><span style="color: #00d4ff;">Q/E</span> - Subir/Descer</div>
            <div><span style="color: #00d4ff;">Shift</span> - Turbo</div>
            <div><span style="color: #00d4ff;">Botão Direito do Mouse</span> - Rotacionar Nave (modo normal)</div>
            <div><span style="color: #00d4ff;">Mouse</span> - Guiar Nave (no modo Mouse Flight)</div>
            <div><span style="color: #00d4ff;">V</span> - Câmera (1ª/3ª pessoa)</div>
            <div><span style="color: #00d4ff;">M</span> - Alternar Modo Mouse Flight</div>
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(157, 78, 221, 0.3);">
                <span style="color: #00ff88;">Clique Esquerdo</span> - Atirar
            </div>
            <div><span style="color: #00ff88;">TAB</span> - Trocar Arma (Laser/Projétil)</div>
            <div><span style="color: #00d4ff;">Espaço</span> - Autopilot</div>
            <div><span style="color: #00d4ff;">G</span> - Modo Clássico</div>
            <div><span style="color: #00d4ff;">H</span> - Ocultar HUD</div>
        `;
        
        this.container.appendChild(controls);
        this.elements.controls = controls;
    }

    createModeToggle() {
        const toggle = document.createElement('button');
        toggle.id = 'mode-toggle';
        toggle.style.cssText = `
            position: absolute;
            top: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #ff6b35 0%, #cc5529 100%);
            border: none;
            border-radius: 25px;
            padding: 12px 24px;
            color: white;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            pointer-events: auto;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
        `;
        toggle.innerHTML = '📄 Modo Clássico';
        toggle.addEventListener('click', () => {
            localStorage.setItem('portfolioMode', 'classic');
            window.location.href = '/classic/classic.html';
        });
        
        toggle.addEventListener('mouseenter', () => {
            toggle.style.transform = 'translateX(-50%) translateY(-2px)';
            toggle.style.boxShadow = '0 6px 20px rgba(255, 107, 53, 0.6)';
        });
        
        toggle.addEventListener('mouseleave', () => {
            toggle.style.transform = 'translateX(-50%)';
            toggle.style.boxShadow = '0 4px 15px rgba(255, 107, 53, 0.4)';
        });
        
        this.container.appendChild(toggle);
        this.elements.modeToggle = toggle;
    }

    setupEventListeners() {
        // Autopilot events
        window.addEventListener('autopilot:started', () => {
            this.showAutopilot();
        });
        
        window.addEventListener('autopilot:stopped', () => {
            this.hideAutopilot();
        });
        
        window.addEventListener('autopilot:arrived', () => {
            this.hideAutopilot();
            this.hideDestination();
        });
        
        // Camera mode change
        window.addEventListener('camera:mode-changed', (e) => {
            const mode = e.detail.mode;
            this.updateCameraMode(mode);
        });
        
        // Weapon switch event
        window.addEventListener('weapon:switched', (e) => {
            const weapon = e.detail.weapon;
            this.updateWeapon(weapon);
        });
        
        // Mouse Flight Mode events - Desktop behavior
        window.addEventListener("controls:mouse-flight-mode-changed", (e) => {
            if (e.detail.active) {
                this.showMouseFlightIndicator();
                this.showCrosshair();
            } else {
                this.hideMouseFlightIndicator();
                this.hideCrosshair();
            }
        });

        // Keyboard shortcuts
        window.addEventListener("keydown", (e) => {
            if (e.code === "KeyH") {
                this.toggle();
            }
        });
    }

    updateSpeed(speed) {
        if (this.elements.speedValue) {
            this.elements.speedValue.textContent = Math.round(speed);
        }
    }

    setDestination(name, distance) {
        if (this.elements.destinationName && this.elements.destinationDistance) {
            this.elements.destinationName.textContent = name;
            this.elements.destinationDistance.textContent = `${Math.round(distance)} unidades`;
            this.showDestination();
        }
    }

    showDestination() {
        if (this.elements.destination) {
            this.elements.destination.style.display = 'block';
        }
    }

    hideDestination() {
        if (this.elements.destination) {
            this.elements.destination.style.display = 'none';
        }
    }

    showAutopilot() {
        if (this.elements.autopilot) {
            this.elements.autopilot.style.display = 'block';
        }
    }

    hideAutopilot() {
        if (this.elements.autopilot) {
            this.elements.autopilot.style.display = 'none';
        }
    }

    updateCameraMode(mode) {
        if (this.elements.cameraModeText) {
            this.elements.cameraModeText.textContent = mode === 'first-person' ? '1ª Pessoa' : '3ª Pessoa';
        }
    }

    showMouseFlightIndicator() {
        if (this.elements.mouseFlight) {
            this.elements.mouseFlight.style.display = 'block';
        }
    }

    hideMouseFlightIndicator() {
        if (this.elements.mouseFlight) {
            this.elements.mouseFlight.style.display = 'none';
        }
    }

    showCrosshair() {
        if (this.elements.crosshair) {
            this.elements.crosshair.style.display = 'block';

            // Ensure crosshair is visible and properly positioned
            const updatePosition = () => {
                const screenWidth = window.innerWidth;
                const screenHeight = window.innerHeight;
                const centerX = screenWidth / 2;
                const centerY = screenHeight / 2;

                this.elements.crosshair.style.left = `${centerX}px`;
                this.elements.crosshair.style.top = `${centerY}px`;
            };

            // Update position when showing
            updatePosition();

            // Also update on next frame to ensure it's visible
            requestAnimationFrame(updatePosition);
        }
    }

    hideCrosshair() {
        if (this.elements.crosshair) {
            this.elements.crosshair.style.display = 'none';
        }
    }

    updateWeapon(weaponType) {
        // Create weapon indicator if it doesn't exist
        if (!this.elements.weaponIndicator) {
            const weaponIndicator = document.createElement('div');
            weaponIndicator.id = 'weapon-indicator';
            weaponIndicator.style.cssText = `
                position: absolute;
                top: 10px;
                left: 150px;
                background: rgba(10, 14, 39, 0.8);
                border: 2px solid #00ff88;
                border-radius: 12px;
                padding: 15px 20px;
                pointer-events: auto;
            `;
            weaponIndicator.innerHTML = `
                <div style="font-size: 12px; color: #a0aec0; margin-bottom: 5px;">ARMA ATIVA</div>
                <div id="weapon-type" style="font-size: 20px; font-weight: 700; color: #00ff88;">LASER</div>
            `;
            
            this.container.appendChild(weaponIndicator);
            this.elements.weaponIndicator = weaponIndicator;
            this.elements.weaponType = document.getElementById('weapon-type');
        }
        
        // Update weapon type display
        if (this.elements.weaponType) {
            const weaponName = weaponType === 'laser' ? 'LASER' : 'PROJÉTIL';
            const weaponColor = weaponType === 'laser' ? '#00d4ff' : '#ff6600';
            
            this.elements.weaponType.textContent = weaponName;
            this.elements.weaponType.style.color = weaponColor;
            this.elements.weaponIndicator.style.borderColor = weaponColor;
        }
    }

    toggle() {
        this.visible = !this.visible;
        this.container.style.display = this.visible ? 'block' : 'none';
    }

    show() {
        this.visible = true;
        this.container.style.display = 'block';
    }

    hide() {
        this.visible = false;
        this.container.style.display = 'none';
    }

    dispose() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }

    // --- Mobile Controls ---
    createMobileControls() {
        const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        if (!isTouch) return;
        this.isTouch = true;

        const controls = () => window.galaxyPortfolio?.controls;
        const weapons = () => window.galaxyPortfolio?.weaponSystem;
        const cameraCtrl = () => window.galaxyPortfolio?.camera;

        // Always enable mouse flight mode on mobile for consistent control
        try {
            controls()?.setMouseFlightActive?.(true);
            // Show crosshair on mobile since mouse flight mode is always active
            this.showCrosshair();

            // Add specific listener for mobile to ensure crosshair stays visible
            window.addEventListener("controls:mouse-flight-mode-changed", (e) => {
                if (this.isTouch) {
                    // Always show crosshair on mobile regardless of mode
                    this.showCrosshair();
                }
            });

        } catch {}

        // Style helper
        const btnStyle = `
            background: rgba(10, 14, 39, 0.8);
            border: 2px solid #00d4ff;
            color: #e0e6ed;
            font-weight: 600;
            border-radius: 12px;
            padding: 10px 12px;
            pointer-events: auto;
            user-select: none;
        `;

        // D-Pad (left bottom) for forward/back and strafe
        const pad = document.createElement('div');
        pad.id = 'mobile-dpad';
        pad.style.cssText = `
            position: absolute; left: 18px; bottom: 18px; width: 180px; height: 160px; pointer-events: auto;
        `;
        const mkBtn = (txt, style) => { const b=document.createElement('button'); b.textContent=txt; b.style.cssText = btnStyle + style; return b; };
        const up = mkBtn('▲', ' position:absolute; left:64px; top:-10px; width:52px; height:52px; border-radius:10px;');
        const down = mkBtn('▼', ' position:absolute; left:64px; top:110px; width:52px; height:52px; border-radius:10px;');
        const left = mkBtn('◀', ' position:absolute; left:0; top:48px; width:52px; height:52px; border-radius:10px;');
        const right = mkBtn('▶', ' position:absolute; left:128px; top:48px; width:52px; height:52px; border-radius:10px;');
        pad.appendChild(up); pad.appendChild(down); pad.appendChild(left); pad.appendChild(right);
        this.container.appendChild(pad);
        const bindHold = (el, on, off) => { el.addEventListener('touchstart', (e)=>{on(); e.preventDefault();}, {passive:false}); el.addEventListener('touchend', off); el.addEventListener('touchcancel', off); };
        bindHold(up, ()=>{ const c=controls(); if(c){ c.keys.forward=true; c.keys.backward=false; }}, ()=>{ const c=controls(); if(c){ c.keys.forward=false; }});
        bindHold(down, ()=>{ const c=controls(); if(c){ c.keys.backward=true; c.keys.forward=false; }}, ()=>{ const c=controls(); if(c){ c.keys.backward=false; }});
        bindHold(left, ()=>{ const c=controls(); if(c){ c.keys.left=true; c.keys.right=false; }}, ()=>{ const c=controls(); if(c){ c.keys.left=false; }});
        bindHold(right, ()=>{ const c=controls(); if(c){ c.keys.right=true; c.keys.left=false; }}, ()=>{ const c=controls(); if(c){ c.keys.right=false; }});

        // Look area (right drag)
        const lookArea = document.createElement('div');
        lookArea.id = 'mobile-look';
        lookArea.style.cssText = `
            position: absolute; right: 0; bottom: 0; width: 55%; height: 60%;
            pointer-events: auto; /* transparent capture */
        `;
        this.container.appendChild(lookArea);
        let lookLast = null;
        lookArea.addEventListener('touchstart', (e) => {
            const t = e.touches[0];
            lookLast = { x: t.clientX, y: t.clientY };
        });
        lookArea.addEventListener('touchmove', (e) => {
            if (!lookLast) return;
            const t = e.touches[0];
            const dx = t.clientX - lookLast.x;
            const dy = t.clientY - lookLast.y;
            lookLast = { x: t.clientX, y: t.clientY };
            controls()?.onTouchLook?.(dx, dy);
            e.preventDefault();
        }, { passive: false });
        lookArea.addEventListener('touchend', () => { lookLast = null; });

        // Up/Down buttons (right edge)
        const upBtn = document.createElement('button');
        upBtn.textContent = '↑';
        upBtn.style.cssText = `${btnStyle} position: absolute; right: 18px; bottom: 200px; width: 54px; height: 54px; border-radius: 50%;`;
        const dnBtn = document.createElement('button');
        dnBtn.textContent = '↓';
        dnBtn.style.cssText = `${btnStyle} position: absolute; right: 18px; bottom: 138px; width: 54px; height: 54px; border-radius: 50%;`;
        this.container.appendChild(upBtn);
        this.container.appendChild(dnBtn);
        const pressHold = (el, on, off) => {
            const start = (e) => { on(); e.preventDefault(); };
            const end = () => { off(); };
            el.addEventListener('touchstart', start, { passive: false });
            el.addEventListener('touchend', end);
            el.addEventListener('touchcancel', end);
        };
        pressHold(upBtn, () => { const c = controls(); if (c) c.keys.up = true; }, () => { const c = controls(); if (c) c.keys.up = false; });
        pressHold(dnBtn, () => { const c = controls(); if (c) c.keys.down = true; }, () => { const c = controls(); if (c) c.keys.down = false; });

        // Turbo button (hold = turbo)
        const turboBtn = document.createElement('button');
        turboBtn.textContent = 'TURBO';
        turboBtn.style.cssText = `${btnStyle} position: absolute; right: 88px; bottom: 18px; width: 96px; height: 52px; border-radius: 14px;`;
        const turboOn = () => { const c = controls(); if (c) c.keys.shift = true; };
        const turboOff = () => { const c = controls(); if (c) c.keys.shift = false; };
        turboBtn.addEventListener('touchstart', (e) => { turboOn(); e.preventDefault(); }, { passive: false });
        turboBtn.addEventListener('touchend', turboOff);
        turboBtn.addEventListener('touchcancel', turboOff);
        this.container.appendChild(turboBtn);

        // Camera toggle
        const camBtn = document.createElement('button');
        camBtn.textContent = 'CAM';
        camBtn.style.cssText = `${btnStyle} position: absolute; right: 18px; bottom: 18px; width: 54px; height: 52px; border-radius: 12px;`;
        camBtn.addEventListener('touchstart', (e) => { cameraCtrl()?.toggleMode?.(); e.preventDefault(); }, { passive: false });
        this.container.appendChild(camBtn);

        // Weapon switch
        const weaponBtn = document.createElement('button');
        weaponBtn.textContent = 'ARMA';
        weaponBtn.style.cssText = `${btnStyle} position: absolute; right: 196px; bottom: 18px; height: 52px; border-radius: 12px;`;
        weaponBtn.addEventListener('touchstart', (e) => { window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Tab' })); e.preventDefault(); }, { passive: false });
        this.container.appendChild(weaponBtn);

        // Reposition speed/weapon indicators to top-left on mobile
        if (this.elements.weaponIndicator) {
            const w = this.elements.weaponIndicator;
            w.style.top = '96px'; w.style.left = '12px'; w.style.right = '';
            w.style.bottom = '';
        }
        // Hide controls help panel on mobile
        if (this.elements.controls) {
            this.elements.controls.style.display = 'none';
        }
    }

    createFullscreen() {
        const btn = document.createElement('button');
        btn.id = 'fullscreen-btn';
        btn.textContent = '⛶';
        btn.title = 'Fullscreen';
        btn.style.cssText = `
            position: absolute; right: 160px; top: 10px;
            background: rgba(10, 14, 39, 0.8);
            border: 2px solid #00d4ff;
            color: #e0e6ed;
            font-weight: 700;
            border-radius: 10px;
            width: 44px; height: 40px;
            pointer-events: auto;
        `;

        const isFs = () => document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
        const reqFs = (el) => (el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen)?.call(el);
        const exitFs = () => (document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen)?.call(document);

        const update = () => {
            btn.textContent = isFs() ? '✕' : '⛶';
            btn.title = isFs() ? 'Exit Fullscreen' : 'Fullscreen';
        };

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (isFs()) {
                exitFs();
            } else {
                reqFs(document.documentElement);
            }
        });

        document.addEventListener('fullscreenchange', update);
        document.addEventListener('webkitfullscreenchange', update);
        document.addEventListener('msfullscreenchange', update);
        update();

        this.container.appendChild(btn);
        this.elements.fullscreenBtn = btn;
    }
}
