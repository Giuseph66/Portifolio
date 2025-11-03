// Overlay panels for content display
export class Overlay {
    constructor() {
        this.container = null;
        this.currentPanel = null;
        this.create();
    }

    create() {
        this.container = document.createElement('div');
        this.container.id = 'overlay-container';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            backdrop-filter: blur(10px);
        `;
        
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container) {
                this.hide();
            }
        });
        
        document.body.appendChild(this.container);
        
        // ESC to close
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && this.container.style.display === 'flex') {
                this.hide();
            }
        });
    }

    show(content, title = '') {
        // Disable mouse flight mode when showing overlay
        const controls = window.galaxyPortfolio?.controls;
        if (controls && controls.mouseFlightMode) {
            this.wasMouseFlightActive = true;
            controls.toggleMouseFlightMode();
            controls.pendingMouseFlightRelock = false;
        }

        const panel = document.createElement('div');
        panel.style.cssText = `
            background: linear-gradient(135deg, #1a1f3a 0%, #0f1628 100%);
            border: 2px solid #00d4ff;
            border-radius: 20px;
            padding: 40px;
            max-width: 800px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
            box-shadow: 0 20px 60px rgba(0, 212, 255, 0.3);
            animation: slideIn 0.3s ease-out;
        `;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
        
        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: none;
            border: none;
            color: #e0e6ed;
            font-size: 32px;
            cursor: pointer;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s;
        `;
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.1)';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'none';
        });
        closeBtn.addEventListener('click', () => this.hide());
        
        panel.appendChild(closeBtn);
        
        // Title
        if (title) {
            const titleEl = document.createElement('h2');
            titleEl.textContent = title;
            titleEl.style.cssText = `
                color: #00d4ff;
                font-size: 32px;
                margin-bottom: 20px;
                font-weight: 700;
            `;
            panel.appendChild(titleEl);
        }
        
        // Content
        const contentEl = document.createElement('div');
        contentEl.innerHTML = content;
        contentEl.style.cssText = `
            color: #e0e6ed;
            font-size: 16px;
            line-height: 1.8;
        `;
        panel.appendChild(contentEl);
        
        // Clear previous content
        this.container.innerHTML = '';
        this.container.appendChild(panel);
        this.container.style.display = 'flex';
        this.currentPanel = panel;
    }

    showProfile(profile) {
        const content = `
            <div style="display: flex; gap: 30px; margin-bottom: 30px;">
                <div style="flex-shrink: 0;">
                    <img src="assets/textures/eu.png" alt="${profile.name}" 
                         style="width: 150px; height: 150px; border-radius: 50%; 
                                border: 3px solid #00d4ff; object-fit: cover;">
                </div>
                <div>
                    <h3 style="color: #ff6b35; font-size: 24px; margin-bottom: 10px;">${profile.title}</h3>
                    <p style="color: #a0aec0; margin-bottom: 10px;">${profile.company} • ${profile.location}</p>
                    <p style="margin-top: 20px;">${profile.bio}</p>
                </div>
            </div>
            
            <div style="margin-top: 30px;">
                <h4 style="color: #00d4ff; margin-bottom: 15px;">Contato</h4>
                <p><strong>Email:</strong> <a href="mailto:${profile.email}" style="color: #06ffa5;">${profile.email}</a></p>
                <p><strong>Telefone:</strong> ${profile.phone}</p>
            </div>
            
            <div style="margin-top: 30px;">
                <h4 style="color: #00d4ff; margin-bottom: 15px;">Redes Sociais</h4>
                <div style="display: flex; gap: 15px;">
                    ${Object.entries(profile.social).map(([key, url]) => `
                        <a href="${url}" target="_blank" 
                           style="color: #00d4ff; text-decoration: none; 
                                  padding: 10px 20px; background: rgba(0, 212, 255, 0.1);
                                  border-radius: 8px; transition: all 0.2s;"
                           onmouseenter="this.style.background='rgba(0, 212, 255, 0.2)'"
                           onmouseleave="this.style.background='rgba(0, 212, 255, 0.1)'">
                            ${key.charAt(0).toUpperCase() + key.slice(1)}
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
        
        this.show(content, 'Sobre Mim');
    }

    showProject(project) {
        const content = `
            <div style="margin-bottom: 20px;">
                <span style="display: inline-block; background: rgba(0, 212, 255, 0.2); 
                             color: #00d4ff; padding: 5px 15px; border-radius: 20px; 
                             font-size: 12px; font-weight: 600; margin-right: 10px;">
                    ${project.category.toUpperCase()}
                </span>
                <span style="display: inline-block; background: rgba(6, 255, 165, 0.2); 
                             color: #06ffa5; padding: 5px 15px; border-radius: 20px; 
                             font-size: 12px; font-weight: 600;">
                    ${project.status.toUpperCase()}
                </span>
            </div>
            
            <p style="font-size: 18px; margin-bottom: 20px; color: #cbd5e0;">
                ${project.description}
            </p>
            
            <div style="margin: 30px 0;">
                <h4 style="color: #00d4ff; margin-bottom: 15px;">Tecnologias</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                    ${project.tech.map(tech => `
                        <span style="background: rgba(157, 78, 221, 0.2); color: #9d4edd; 
                                     padding: 8px 16px; border-radius: 8px; font-size: 14px;">
                            ${tech}
                        </span>
                    `).join('')}
                </div>
            </div>
            
            <div style="margin-top: 30px; display: flex; gap: 15px;">
                ${project.links.repo ? `
                    <a href="${project.links.repo}" target="_blank"
                       style="background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
                              color: white; padding: 12px 24px; border-radius: 8px;
                              text-decoration: none; font-weight: 600; transition: all 0.2s;"
                       onmouseenter="this.style.transform='translateY(-2px)'"
                       onmouseleave="this.style.transform='translateY(0)'">
                        Ver Repositório
                    </a>
                ` : ''}
                ${project.links.demo ? `
                    <a href="${project.links.demo}" target="_blank"
                       style="background: linear-gradient(135deg, #ff6b35 0%, #cc5529 100%);
                              color: white; padding: 12px 24px; border-radius: 8px;
                              text-decoration: none; font-weight: 600; transition: all 0.2s;"
                       onmouseenter="this.style.transform='translateY(-2px)'"
                       onmouseleave="this.style.transform='translateY(0)'">
                        Ver Demo
                    </a>
                ` : ''}
            </div>
        `;
        
        this.show(content, project.title);
    }

    showSkills(skills, category) {
        const categorySkills = skills[category] || [];
        
        const content = `
            <div style="display: grid; gap: 20px;">
                ${categorySkills.map(skill => `
                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-weight: 600;">${skill.name}</span>
                            <span style="color: #00d4ff;">${skill.level}%</span>
                        </div>
                        <div style="background: rgba(255, 255, 255, 0.1); height: 8px; 
                                    border-radius: 4px; overflow: hidden;">
                            <div style="background: linear-gradient(90deg, #00d4ff 0%, #06ffa5 100%);
                                        height: 100%; width: ${skill.level}%; transition: width 0.5s ease;"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        this.show(content, `Skills - ${category.charAt(0).toUpperCase() + category.slice(1)}`);
    }

    hide() {
        this.container.style.display = 'none';
        this.currentPanel = null;

        // Re-enable mouse flight mode immediately if it was active before
        if (this.wasMouseFlightActive) {
            const controls = window.galaxyPortfolio?.controls;
            if (controls) {
                controls.pendingMouseFlightRelock = false;
                // Request pointer lock and re-enter M on this user interaction
                controls.toggleMouseFlightMode();
            }
            this.wasMouseFlightActive = false;
        }
    }

    dispose() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}
