// Component Management Module
import { projectsData } from '../data/projects.js';
import { skillsData } from '../data/skills.js';

export class ComponentManager {
    constructor() {
        this.components = new Map();
        this.loadedComponents = new Set();
        this.componentData = {
            projects: projectsData,
            skills: skillsData
        };
    }
    
    async loadAll() {
        console.log('📦 Loading all components...');
        
        try {
            await Promise.all([
                this.loadNavigation(),
                this.loadHeroSection(),
                this.loadWorkProcessSection(),
                this.loadAboutSection(),
                this.loadSkillsSection(),
                this.loadProjectsSection(),
                this.loadCompanySection(),
                this.loadContactSection(),
                this.loadFooter(),
                this.loadScrollToTop()
            ]);
            
            console.log('✅ All components loaded successfully');
        } catch (error) {
            console.error('❌ Error loading components:', error);
        }
    }
    
    async loadNavigation() {
        const container = document.getElementById('navigation-component');
        if (!container) return;
        
        const navigationHTML = `
            <nav class="navbar" id="navbar">
                <div class="nav-container">
                    <div class="nav-logo">
                    <img src="assets/images/eu.png" alt="Giuseph Giangareli">
                        <a href="#home">Giuseph Giangareli</a>
                    </div>
                    
                    <ul class="nav-menu" id="nav-menu">
                        <li><a href="#home" class="nav-link active">Home</a></li>
                        <li><a href="#sobre" class="nav-link">Sobre</a></li>
                        <li><a href="#competencias" class="nav-link">Competências</a></li>
                        <li><a href="#projetos" class="nav-link">Projetos</a></li>
                        <li><a href="#empresa" class="nav-link">Empresa</a></li>
                        <li><a href="#contato" class="nav-link">Contato</a></li>
                    </ul>
                    
                    <div class="nav-controls">
                        <button class="theme-toggle" id="theme-toggle" aria-label="Toggle dark mode">
                            <i class="fas fa-sun" id="theme-icon"></i>
                        </button>
                        
                        <div class="nav-toggle" id="nav-toggle">
                            <span class="bar"></span>
                            <span class="bar"></span>
                            <span class="bar"></span>
                        </div>
                    </div>
                </div>
            </nav>
        `;
        
        container.innerHTML = navigationHTML;
        this.loadedComponents.add('navigation');
    }
    
    async loadHeroSection() {
        const container = document.getElementById('hero-section');
        if (!container) return;
        
        const heroHTML = `
            <section id="home" class="hero">
                <div class="container">
                    <div class="hero-content" data-animate="fadeInUp">
                        <h1 class="hero-title gradient-text">Giuseph Giangareli</h1>
                        <h2 class="hero-subtitle">Neurelix</h2>
                        <p class="hero-description">
                            Desenvolvedor Full-Stack especializado em soluções completas
                        </p>
                        <p class="hero-subdescription">
                            Transformo ideias em realidade digital através de tecnologias modernas, 
                            integrações inteligentes e experiências excepcionais do usuário.
                        </p>
                        
                        <div class="hero-badges">
                            <span class="badge badge-blue">
                                <i class="fas fa-code"></i>
                                Full-Stack
                            </span>
                            <span class="badge badge-green">
                                <i class="fas fa-mobile-alt"></i>
                                Mobile
                            </span>
                            <span class="badge badge-purple">
                                <i class="fas fa-brain"></i>
                                IA & Automação
                            </span>
                        </div>
                        
                        <div class="hero-buttons">
                            <a href="#projetos" class="btn btn-primary">
                                <i class="fas fa-rocket"></i>
                                Ver Projetos
                            </a>
                            <a href="https://wa.me/5566999086599?text=Olá! Vi seu portfólio e gostaria de conversar sobre um projeto." target="_blank" class="btn btn-outline btn-whatsapp">
                                <div class="whatsapp-icon">
                                    <i class="fab fa-whatsapp"></i>
                                </div>
                                Falar no WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        `;
        
        container.innerHTML = heroHTML;
        this.loadedComponents.add('hero');
    }
    
    async loadWorkProcessSection() {
        const container = document.getElementById('work-process-section');
        if (!container) return;
        
        const workProcessHTML = `
            <section id="como-trabalho" class="work-process">
                <div class="container">
                    <div class="section-header" data-animate="fadeInDown">
                        <h2 class="section-title">Como Trabalho</h2>
                        <p class="section-description">
                            Meu processo estruturado garante resultados excepcionais em cada projeto
                        </p>
                    </div>
                    
                    <div class="process-grid">
                        <div class="process-card" data-animate="fadeInUp" data-delay="100">
                            <div class="process-icon">
                                <i class="fas fa-lightbulb"></i>
                            </div>
                            <h3>Descoberta</h3>
                            <p>Entendo profundamente suas necessidades, objetivos e desafios para criar a solução ideal.</p>
                        </div>
                        
                        <div class="process-card" data-animate="fadeInUp" data-delay="200">
                            <div class="process-icon">
                                <i class="fas fa-drafting-compass"></i>
                            </div>
                            <h3>Planejamento</h3>
                            <p>Desenvolvo uma estratégia detalhada com cronograma, tecnologias e arquitetura otimizada.</p>
                        </div>
                        
                        <div class="process-card" data-animate="fadeInUp" data-delay="300">
                            <div class="process-icon">
                                <i class="fas fa-code"></i>
                            </div>
                            <h3>Desenvolvimento</h3>
                            <p>Implemento a solução com código limpo, testes rigorosos e atualizações constantes.</p>
                        </div>
                        
                        <div class="process-card" data-animate="fadeInUp" data-delay="400">
                            <div class="process-icon">
                                <i class="fas fa-rocket"></i>
                            </div>
                            <h3>Entrega</h3>
                            <p>Realizo deploy seguro, treinamento completo e suporte contínuo pós-lançamento.</p>
                        </div>
                    </div>
                </div>
            </section>
        `;
        
        container.innerHTML = workProcessHTML;
        this.loadedComponents.add('workProcess');
    }
    
    async loadAboutSection() {
        const container = document.getElementById('about-section');
        if (!container) return;
        
        const aboutHTML = `
            <section id="sobre" class="about">
                <div class="container">
                    <div class="about-content">
                        <div class="about-text" data-animate="fadeInLeft">
                            <h2>Sobre Mim</h2>
                            <p>
                                Sou desenvolvedor Full-Stack apaixonado por criar soluções digitais que fazem a diferença. 
                                Com experiência em tecnologias modernas como React Native, Flutter, Java Spring Boot e 
                                integrações com IA, transformo ideias complexas em aplicações funcionais e intuitivas.
                            </p>
                            <p>
                                Fundei a <strong>Neurelix</strong>, uma empresa focada em desenvolvimento de software, 
                                automação e soluções inteligentes. Acredito que a tecnologia deve ser acessível e 
                                resolver problemas reais das pessoas e empresas.
                            </p>
                            <p>
                                Quando não estou codificando, gosto de estudar novas tecnologias, contribuir com a 
                                comunidade de desenvolvedores e pensar em como a IA pode revolucionar ainda mais 
                                nossas vidas.
                            </p>
                            
                            <div class="social-links">
                                <a href="https://www.linkedin.com/in/giuseph-giangareli-1bb910272/" target="_blank" class="btn btn-sm btn-linkedin">
                                    <i class="fab fa-linkedin"></i>
                                    LinkedIn
                                </a>
                                <a href="https://www.instagram.com/giuseph_gian/" target="_blank" class="btn btn-sm btn-instagram">
                                    <i class="fab fa-instagram"></i>
                                    Instagram
                                </a>
                                <a href="https://github.com/Giuseph66" target="_blank" class="btn btn-sm btn-outline">
                                    <i class="fab fa-github"></i>
                                    GitHub
                                </a>
                            </div>
                        </div>
                        
                        <div class="about-avatar" data-animate="fadeInRight">
                            <div class="avatar">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="about-info">
                                <p><i class="fas fa-map-marker-alt"></i> Sinop-MT, Brasil</p>
                                <p><i class="fas fa-envelope"></i> giusephgangareli@gmail.com</p>
                                <p><i class="fas fa-phone"></i> +55 (66) 99908-6599</p>
                                <p><i class="fas fa-building"></i> Fundador da Neurelix</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
        
        container.innerHTML = aboutHTML;
        this.loadedComponents.add('about');
    }
    
    async loadSkillsSection() {
        const container = document.getElementById('skills-section');
        if (!container) return;
        
        const skillsHTML = `
            <section id="competencias" class="skills">
                <div class="container">
                    <div class="section-header" data-animate="fadeInDown">
                        <h2 class="section-title">Competências Técnicas</h2>
                        <p class="section-description">
                            Domínio em tecnologias modernas para desenvolvimento completo de soluções
                        </p>
                    </div>
                    
                    <div class="skills-grid">
                        ${this.generateSkillCards()}
                    </div>
                </div>
            </section>
        `;
        
        container.innerHTML = skillsHTML;
        this.loadedComponents.add('skills');
    }
    
    generateSkillCards() {
        const skills = [
            {
                title: 'Frontend',
                icon: 'fas fa-palette',
                technologies: ['React', 'React Native', 'Flutter', 'HTML5', 'CSS3', 'JavaScript', 'TypeScript']
            },
            {
                title: 'Backend',
                icon: 'fas fa-server',
                technologies: ['Java Spring Boot', 'Node.js', 'Python', 'REST APIs', 'GraphQL', 'Microservices']
            },
            {
                title: 'Mobile',
                icon: 'fas fa-mobile-alt',
                technologies: ['React Native', 'Flutter', 'Dart', 'iOS', 'Android', 'Cross-platform']
            },
            {
                title: 'Database',
                icon: 'fas fa-database',
                technologies: ['PostgreSQL', 'MySQL', 'MongoDB', 'Firebase', 'Redis', 'SQLite']
            },
            {
                title: 'DevOps & Cloud',
                icon: 'fas fa-cloud',
                technologies: ['Docker', 'AWS', 'Google Cloud', 'CI/CD', 'Linux', 'Git']
            },
            {
                title: 'IA & Automação',
                icon: 'fas fa-brain',
                technologies: ['Machine Learning', 'OpenAI API', 'Automation', 'Data Analysis', 'Python']
            }
        ];
        
        return skills.map((skill, index) => `
            <div class="skill-card" data-animate="fadeInUp" data-delay="${index * 100}">
                <div class="skill-header">
                    <div class="skill-icon">
                        <i class="${skill.icon}"></i>
                    </div>
                    <h3>${skill.title}</h3>
                </div>
                <div class="skill-tags">
                    ${skill.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
            </div>
        `).join('');
    }
    
    async loadProjectsSection() {
        const container = document.getElementById('projects-section');
        if (!container) return;
        
        const projectsHTML = `
            <section id="projetos" class="projects">
                <div class="container">
                    <div class="section-header" data-animate="fadeInDown">
                        <h2 class="section-title">Projetos Destacados</h2>
                        <p class="section-description">
                            Soluções completas que demonstram expertise técnica e inovação
                        </p>
                    </div>
                    
                    <div class="projects-grid">
                        ${this.generateProjectCards()}
                    </div>
                </div>
            </section>
        `;
        
        container.innerHTML = projectsHTML;
        this.loadedComponents.add('projects');
    }
    
    generateProjectCards() {
        const projects = [
            {
                title: 'PAP - Sistema de Entregas',
                date: '2025-08-17',
                description: 'Plataforma completa de entregas ponto a ponto com React Native, Firebase e geolocalização em tempo real. Inclui matching geoespacial, pagamentos PIX e comunicação em tempo real.',
                technologies: ['React Native', 'TypeScript', 'Firebase', 'Expo'],
                highlights: ['Arquitetura Serverless', 'Real-time Tracking', 'Pagamentos PIX', 'Geolocalização'],
                status: 'Produção',
                githubUrl: 'https://github.com/Giuseph66/PAP',
                demoUrl: null
            },
            {
                title: 'Desafio Esfera Solar',
                date: '2025-08-15',
                description: 'Sistema full-stack de consulta CNPJ com Flutter Web e Node.js. Validação completa, integração OpenCNPJ API, paginação e containerização Docker.',
                technologies: ['Flutter', 'Dart', 'Node.js', 'PostgreSQL'],
                highlights: ['Flutter Web', 'API Integration', 'Docker', 'Full-Stack'],
                status: 'Produção',
                githubUrl: 'https://github.com/Giuseph66/Desafio_projeto_esfera',
                demoUrl: null
            },
            {
                title: 'Sistema de Relatórios com IA',
                date: '2025-08-20',
                description: 'Ferramenta avançada para criação de relatórios acadêmicos com IA. Transcrição de áudio, geração automática com Google Gemini e exportação PDF.',
                technologies: ['HTML', 'JavaScript', 'Google Gemini', 'IA'],
                highlights: ['Google Gemini', 'Transcrição de Áudio', 'IA Generativa', 'PDF Export'],
                status: 'Produção',
                githubUrl: null,
                demoUrl: 'https://relatorio.neurelix.com.br/'
            },
            {
                title: 'LabPage Backend',
                date: '2025-08-08',
                description: 'Sistema backend robusto construído em Spring Boot, Java. É uma das minhas linguagens de implementação para back-end, demonstrando arquitetura enterprise.',
                technologies: ['Java', 'Spring Boot', 'PostgreSQL', 'REST API'],
                highlights: ['Spring Boot', 'Enterprise Architecture', 'REST API', 'Database Integration'],
                status: 'Desenvolvimento',
                githubUrl: 'https://github.com/Giuseph66/LabPage/tree/main/java-back',
                demoUrl: null
            },
            {
                title: 'FASTSHII Mobile',
                date: '2025-08-19',
                description: 'Aplicativo mobile desenvolvido para otimizar processos e melhorar a experiência do usuário com interface moderna e funcionalidades avançadas.',
                technologies: ['React Native', 'JavaScript', 'Mobile', 'UI/UX'],
                highlights: ['Mobile First', 'Modern UI', 'Performance', 'User Experience'],
                status: 'Desenvolvimento',
                githubUrl: 'https://github.com/Giuseph66/FASTSHII',
                demoUrl: null
            },
            {
                title: 'Instalador Apps Linux',
                date: '2025-06-06',
                description: 'Script automatizado em Python para instalação de aplicativos essenciais no Linux, simplificando a configuração de ambientes de desenvolvimento.',
                technologies: ['Python', 'Linux', 'Bash', 'Automation'],
                highlights: ['Automation', 'Linux', 'Developer Tools', 'Productivity'],
                status: 'Produção',
                githubUrl: 'https://github.com/Giuseph66/instalador_apps_linux',
                demoUrl: null
            }
        ];
        
        return projects.map((project, index) => `
            <div class="project-card" data-animate="fadeInUp" data-delay="${index * 100}">
                <div class="project-header">
                    <div class="project-title-row">
                        <h3>${project.title}</h3>
                        <span class="status-badge status-${project.status.toLowerCase()}">${project.status}</span>
                    </div>
                    <p class="project-date">${this.formatDate(project.date)}</p>
                </div>
                
                <div class="project-content">
                    <p class="project-description">${project.description}</p>
                    
                    <div class="project-tech">
                        <h4>Tecnologias:</h4>
                        <div class="tech-tags">
                            ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                        </div>
                    </div>
                    
                    <div class="project-highlights">
                        <h4>Destaques:</h4>
                        <div class="highlight-tags">
                            ${project.highlights.map(highlight => `<span class="highlight-tag">${highlight}</span>`).join('')}
                        </div>
                    </div>
                    
                    <div class="project-actions">
                        ${project.githubUrl ? `
                            <a href="${project.githubUrl}" target="_blank" class="btn btn-outline">
                                <i class="fab fa-github"></i>
                                Código
                            </a>
                        ` : ''}
                        ${project.demoUrl ? `
                            <a href="${project.demoUrl}" target="_blank" class="btn btn-demo">
                                <i class="fas fa-external-link-alt"></i>
                                Demo
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    async loadCompanySection() {
        const container = document.getElementById('company-section');
        if (!container) return;
        
        const companyHTML = `
            <section id="empresa" class="company">
                <div class="container">
                    <div class="company-content" data-animate="fadeInUp">
                        <div class="company-logo">
                            <i class="fas fa-brain"></i>
                        </div>
                        <h2>Neurelix</h2>
                        <h3>Soluções Inteligentes em Tecnologia</h3>
                        <p>
                            A Neurelix é minha empresa focada em desenvolvimento de software, automação e 
                            soluções inteligentes. Combinamos expertise técnica com inovação para criar 
                            produtos que realmente fazem a diferença no mercado.
                        </p>
                        
                        <div class="company-pillars">
                            <div class="pillar" data-animate="fadeInUp" data-delay="100">
                                <div class="pillar-icon">
                                    <i class="fas fa-code"></i>
                                </div>
                                <h4>Desenvolvimento</h4>
                                <p>Soluções full-stack modernas e escaláveis</p>
                            </div>
                            
                            <div class="pillar" data-animate="fadeInUp" data-delay="200">
                                <div class="pillar-icon">
                                    <i class="fas fa-robot"></i>
                                </div>
                                <h4>Automação</h4>
                                <p>Processos inteligentes que otimizam resultados</p>
                            </div>
                            
                            <div class="pillar" data-animate="fadeInUp" data-delay="300">
                                <div class="pillar-icon">
                                    <i class="fas fa-lightbulb"></i>
                                </div>
                                <h4>Inovação</h4>
                                <p>Tecnologias emergentes aplicadas na prática</p>
                            </div>
                        </div>
                        
                        <a href="https://neurelix.com.br" target="_blank" class="btn btn-primary">
                            <img src="assets/images/neurelix_sem_fundo.png" alt="Neurelix">
                            Visitar Site da Neurelix
                        </a>
                    </div>
                </div>
            </section>
        `;
        
        container.innerHTML = companyHTML;
        this.loadedComponents.add('company');
    }
    
    async loadContactSection() {
        const container = document.getElementById('contact-section');
        if (!container) return;
        
        const contactHTML = `
            <section id="contato" class="contact">
                <div class="container">
                    <div class="section-header" data-animate="fadeInDown">
                        <h2 class="section-title">Vamos Conversar?</h2>
                        <p class="section-description">
                            Pronto para tirar sua ideia do papel? Entre em contato e vamos transformar sua visão em realidade
                        </p>
                    </div>
                    
                    <div class="contact-content">
                        <div class="contact-info" data-animate="fadeInLeft">
                            <h3>Informações de Contato</h3>
                            <div class="contact-item">
                                <i class="fas fa-envelope"></i>
                                <span>giusephgangareli@gmail.com</span>
                            </div>
                            <div class="contact-item">
                                <i class="fas fa-phone"></i>
                                <span>+55 (66) 99908-6599</span>
                            </div>
                            <div class="contact-item">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>Sinop-MT, Brasil</span>
                            </div>
                            
                            <div class="contact-social">
                                <h4>Redes Sociais</h4>
                                <div class="social-buttons">
                                    <a href="https://www.linkedin.com/in/giuseph-giangareli-1bb910272/" target="_blank" class="btn btn-sm btn-linkedin">
                                        <i class="fab fa-linkedin"></i>
                                        LinkedIn
                                    </a>
                                    <a href="https://www.instagram.com/giuseph_gian/" target="_blank" class="btn btn-sm btn-instagram">
                                        <i class="fab fa-instagram"></i>
                                        Instagram
                                    </a>
                                </div>
                            </div>
                        </div>
                        
                        <div class="contact-form-section" data-animate="fadeInRight">
                            <div class="card">
                                <h3>Enviar Mensagem</h3>
                                <form id="contact-form" class="contact-form">
                                    <div class="form-group">
                                        <label for="name">Nome</label>
                                        <input type="text" id="name" name="name" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="email">Email</label>
                                        <input type="email" id="email" name="email" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="subject">Assunto</label>
                                        <input type="text" id="subject" name="subject" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="message">Mensagem</label>
                                        <textarea id="message" name="message" rows="5" required></textarea>
                                    </div>
                                    <button type="submit" class="btn btn-primary btn-full">
                                        <i class="fas fa-paper-plane"></i>
                                        Enviar Mensagem
                                    </button>
                                </form>
                                
                                <div class="whatsapp-option">
                                    <p>Ou prefere falar diretamente?</p>
                                    <a href="https://wa.me/5566999086599?text=Olá! Vi seu portfólio e gostaria de conversar sobre um projeto." target="_blank" class="btn btn-whatsapp btn-full">
                                        <div class="whatsapp-icon">
                                            <i class="fab fa-whatsapp"></i>
                                        </div>
                                        Falar no WhatsApp
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
        
        container.innerHTML = contactHTML;
        this.loadedComponents.add('contact');
    }
    
    async loadFooter() {
        const container = document.getElementById('footer-component');
        if (!container) return;
        
        const footerHTML = `
            <footer class="footer">
                <div class="container">
                    <div class="footer-content">
                        <div class="footer-section">
                            <h4>Giuseph Giangareli</h4>
                            <p>Desenvolvedor Full-Stack especializado em soluções completas com React Native, Flutter, Java Spring Boot e integrações inteligentes.</p>
                        </div>
                        
                        <div class="footer-section">
                            <h4>Links Rápidos</h4>
                            <ul>
                                <li><a href="#home">Home</a></li>
                                <li><a href="#sobre">Sobre</a></li>
                                <li><a href="#competencias">Competências</a></li>
                                <li><a href="#projetos">Projetos</a></li>
                                <li><a href="#contato">Contato</a></li>
                            </ul>
                        </div>
                        
                        <div class="footer-section">
                            <h4>Tecnologias</h4>
                            <ul>
                                <li><a href="#">React Native</a></li>
                                <li><a href="#">Flutter</a></li>
                                <li><a href="#">Java Spring Boot</a></li>
                                <li><a href="#">Node.js</a></li>
                                <li><a href="#">Python</a></li>
                            </ul>
                        </div>
                        
                        <div class="footer-section">
                            <h4>Contato</h4>
                            <ul>
                                <li>giusephgangareli@gmail.com</li>
                                <li>+55 (66) 99908-6599</li>
                                <li>Sinop-MT, Brasil</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="footer-bottom">
                        <p>&copy; ${new Date().getFullYear()} Giuseph Giangareli. Todos os direitos reservados.</p>
                        
                        <div class="footer-social">
                            <a href="https://www.linkedin.com/in/giuseph-giangareli-1bb910272/" target="_blank" aria-label="LinkedIn">
                                <i class="fab fa-linkedin"></i>
                            </a>
                            <a href="https://www.instagram.com/giuseph_gian/" target="_blank" aria-label="Instagram">
                                <i class="fab fa-instagram"></i>
                            </a>
                            <a href="https://github.com/Giuseph66" target="_blank" aria-label="GitHub">
                                <i class="fab fa-github"></i>
                            </a>
                            <a href="https://wa.me/5566999086599" target="_blank" aria-label="WhatsApp">
                                <i class="fab fa-whatsapp"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        `;
        
        container.innerHTML = footerHTML;
        this.loadedComponents.add('footer');
    }
    
    async loadScrollToTop() {
        const container = document.getElementById('scroll-to-top');
        if (!container) return;
        
        const scrollToTopHTML = `
            <button class="scroll-to-top" id="scroll-to-top-btn" aria-label="Voltar ao topo">
                <i class="fas fa-arrow-up"></i>
            </button>
        `;
        
        container.innerHTML = scrollToTopHTML;
        this.loadedComponents.add('scrollToTop');
    }
    
    initializeAll() {
        console.log('🔧 Initializing all components...');
        
        // Initialize component-specific functionality
        this.initializeProjectFilters();
        this.initializeContactForm();
        this.initializeScrollToTop();
        
        console.log('✅ All components initialized');
    }
    
    initializeProjectFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const projectCards = document.querySelectorAll('.project-card');
        
        if (filterButtons.length === 0) return;
        
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-filter');
                
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Filter projects
                projectCards.forEach(card => {
                    if (filter === 'all') {
                        card.style.display = 'block';
                    } else {
                        const technologies = card.querySelector('.tech-tags').textContent.toLowerCase();
                        const shouldShow = technologies.includes(filter.toLowerCase());
                        card.style.display = shouldShow ? 'block' : 'none';
                    }
                });
            });
        });
    }
    
    initializeContactForm() {
        const contactForm = document.getElementById('contact-form');
        if (!contactForm) return;
        
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            // Show loading state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            submitBtn.disabled = true;
            
            try {
                // Simulate form submission
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Show success message
                this.showNotification('Mensagem enviada com sucesso!', 'success');
                contactForm.reset();
                
            } catch (error) {
                this.showNotification('Erro ao enviar mensagem. Tente novamente.', 'error');
            } finally {
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    initializeScrollToTop() {
        const scrollToTopBtn = document.getElementById('scroll-to-top-btn');
        if (!scrollToTopBtn) return;
        
        // Show/hide button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });
        
        // Scroll to top on click
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Add styles if not already added
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    padding: var(--space-md);
                    box-shadow: 0 10px 25px var(--shadow-medium);
                    z-index: var(--z-toast);
                    transform: translateX(400px);
                    transition: transform var(--transition-normal);
                    max-width: 400px;
                }
                
                .notification.show {
                    transform: translateX(0);
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                }
                
                .notification-success {
                    border-left: 4px solid var(--success-color);
                }
                
                .notification-error {
                    border-left: 4px solid var(--error-color);
                }
                
                .notification-warning {
                    border-left: 4px solid var(--warning-color);
                }
                
                .notification-info {
                    border-left: 4px solid var(--info-color);
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    margin-left: auto;
                }
            `;
            document.head.appendChild(styles);
        }
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => this.removeNotification(notification), 5000);
        
        // Close button handler
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.removeNotification(notification));
    }
    
    removeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
    
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || icons.info;
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    // Component management utilities
    isComponentLoaded(componentName) {
        return this.loadedComponents.has(componentName);
    }
    
    getLoadedComponents() {
        return Array.from(this.loadedComponents);
    }
    
    reloadComponent(componentName) {
        const methodName = `load${componentName.charAt(0).toUpperCase() + componentName.slice(1)}`;
        if (typeof this[methodName] === 'function') {
            this.loadedComponents.delete(componentName);
            return this[methodName]();
        }
        console.warn(`Component "${componentName}" not found`);
    }
}

export default ComponentManager;
