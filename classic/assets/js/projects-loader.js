// Projects Loader - Carrega projetos dinamicamente do projects.js
import { projectsData, projectsHelpers } from '../data/projects.js';

class ProjectsLoader {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Aguardar DOM carregar
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.loadProjects());
        } else {
            this.loadProjects();
        }
    }

    loadProjects() {
        this.container = document.getElementById('projects-grid');
        if (!this.container) {
            console.error('Container de projetos não encontrado');
            return;
        }

        // Carregar projetos recentes (últimos 6)
        const recentProjects = projectsHelpers.getRecent(6);
        this.renderProjects(recentProjects);
    }

    renderProjects(projects) {
        if (!projects || projects.length === 0) {
            this.container.innerHTML = '<p>Nenhum projeto encontrado.</p>';
            return;
        }

        const projectsHTML = projects.map((project, index) => {
            const statusClass = project.status === 'production' ? 'status-produção' : 'status-desenvolvimento';
            const statusText = project.status === 'production' ? 'Produção' : 'Desenvolvimento';
            const date = new Date(project.date).toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            return `
                <div class="project-card card hover-lift animate-fadeInUp" style="animation-delay: ${index * 0.1}s;">
                    <div class="project-header">
                        <span class="status-badge ${statusClass}">${statusText}</span>
                        <span class="project-date">${date}</span>
                    </div>
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <div class="project-tech-tags">
                        ${project.technologies.slice(0, 4).map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    </div>
                    <div class="project-highlights">
                        ${project.highlights.map(highlight => `<span class="highlight-tag">${highlight}</span>`).join('')}
                    </div>
                    <div class="project-actions">
                        ${project.githubUrl ? `<a href="${project.githubUrl}" target="_blank" class="btn btn-outline"><i class="fab fa-github"></i> Código</a>` : ''}
                        ${project.demoUrl ? `<a href="${project.demoUrl}" target="_blank" class="btn btn-primary">Demo</a>` : '<a href="#" class="btn btn-primary disabled">Demo</a>'}
                    </div>
                </div>
            `;
        }).join('');

        this.container.innerHTML = projectsHTML;
    }
}

// Inicializar quando o módulo for carregado
new ProjectsLoader();

// Exportar para uso global se necessário
window.ProjectsLoader = ProjectsLoader;
