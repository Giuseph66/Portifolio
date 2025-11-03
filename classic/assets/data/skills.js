// Skills Data Module
export const skillsData = {
    categories: [
        {
            id: 'frontend',
            title: 'Frontend',
            icon: 'fas fa-palette',
            description: 'Desenvolvimento de interfaces modernas e responsivas',
            skills: [
                {
                    name: 'React',
                    level: 90,
                    experience: '3+ anos',
                    description: 'Desenvolvimento de SPAs e componentes reutilizáveis'
                },
                {
                    name: 'React Native',
                    level: 95,
                    experience: '3+ anos',
                    description: 'Aplicativos mobile multiplataforma'
                },
                {
                    name: 'Flutter',
                    level: 85,
                    experience: '2+ anos',
                    description: 'Desenvolvimento mobile e web com Dart'
                },
                {
                    name: 'HTML5',
                    level: 95,
                    experience: '4+ anos',
                    description: 'Marcação semântica e acessibilidade'
                },
                {
                    name: 'CSS3',
                    level: 90,
                    experience: '4+ anos',
                    description: 'Layouts responsivos e animações'
                },
                {
                    name: 'JavaScript',
                    level: 92,
                    experience: '4+ anos',
                    description: 'ES6+, DOM manipulation, APIs'
                },
                {
                    name: 'TypeScript',
                    level: 85,
                    experience: '2+ anos',
                    description: 'Tipagem estática e desenvolvimento escalável'
                }
            ]
        },
        {
            id: 'backend',
            title: 'Backend',
            icon: 'fas fa-server',
            description: 'Desenvolvimento de APIs robustas e escaláveis',
            skills: [
                {
                    name: 'Java Spring Boot',
                    level: 88,
                    experience: '2+ anos',
                    description: 'APIs REST, microservices, segurança'
                },
                {
                    name: 'Node.js',
                    level: 85,
                    experience: '3+ anos',
                    description: 'APIs REST, Express, middleware'
                },
                {
                    name: 'Python',
                    level: 80,
                    experience: '2+ anos',
                    description: 'Automação, scripts, análise de dados'
                },
                {
                    name: 'REST APIs',
                    level: 90,
                    experience: '3+ anos',
                    description: 'Design e implementação de APIs RESTful'
                },
                {
                    name: 'GraphQL',
                    level: 75,
                    experience: '1+ ano',
                    description: 'APIs flexíveis e eficientes'
                },
                {
                    name: 'Microservices',
                    level: 80,
                    experience: '2+ anos',
                    description: 'Arquitetura distribuída e escalável'
                }
            ]
        },
        {
            id: 'mobile',
            title: 'Mobile',
            icon: 'fas fa-mobile-alt',
            description: 'Desenvolvimento de aplicativos móveis nativos e híbridos',
            skills: [
                {
                    name: 'React Native',
                    level: 95,
                    experience: '3+ anos',
                    description: 'Apps iOS e Android com código compartilhado'
                },
                {
                    name: 'Flutter',
                    level: 85,
                    experience: '2+ anos',
                    description: 'Desenvolvimento multiplataforma com Dart'
                },
                {
                    name: 'Dart',
                    level: 85,
                    experience: '2+ anos',
                    description: 'Linguagem para desenvolvimento Flutter'
                },
                {
                    name: 'iOS Development',
                    level: 70,
                    experience: '1+ ano',
                    description: 'Desenvolvimento nativo iOS'
                },
                {
                    name: 'Android Development',
                    level: 75,
                    experience: '2+ anos',
                    description: 'Desenvolvimento nativo Android'
                },
                {
                    name: 'Cross-platform',
                    level: 90,
                    experience: '3+ anos',
                    description: 'Soluções multiplataforma eficientes'
                }
            ]
        },
        {
            id: 'database',
            title: 'Database',
            icon: 'fas fa-database',
            description: 'Modelagem e gerenciamento de dados',
            skills: [
                {
                    name: 'PostgreSQL',
                    level: 85,
                    experience: '3+ anos',
                    description: 'Banco relacional avançado'
                },
                {
                    name: 'MySQL',
                    level: 80,
                    experience: '2+ anos',
                    description: 'Banco relacional popular'
                },
                {
                    name: 'MongoDB',
                    level: 75,
                    experience: '2+ anos',
                    description: 'Banco NoSQL orientado a documentos'
                },
                {
                    name: 'Firebase',
                    level: 88,
                    experience: '3+ anos',
                    description: 'Backend-as-a-Service, Firestore, Auth'
                },
                {
                    name: 'Redis',
                    level: 70,
                    experience: '1+ ano',
                    description: 'Cache em memória e pub/sub'
                },
                {
                    name: 'SQLite',
                    level: 85,
                    experience: '3+ anos',
                    description: 'Banco local para aplicações mobile'
                }
            ]
        },
        {
            id: 'devops',
            title: 'DevOps & Cloud',
            icon: 'fas fa-cloud',
            description: 'Infraestrutura, deploy e automação',
            skills: [
                {
                    name: 'Docker',
                    level: 80,
                    experience: '2+ anos',
                    description: 'Containerização de aplicações'
                },
                {
                    name: 'AWS',
                    level: 75,
                    experience: '2+ anos',
                    description: 'Serviços de nuvem Amazon'
                },
                {
                    name: 'Google Cloud',
                    level: 70,
                    experience: '1+ ano',
                    description: 'Plataforma de nuvem Google'
                },
                {
                    name: 'CI/CD',
                    level: 75,
                    experience: '2+ anos',
                    description: 'Integração e deploy contínuo'
                },
                {
                    name: 'Linux',
                    level: 85,
                    experience: '4+ anos',
                    description: 'Administração de sistemas Linux'
                },
                {
                    name: 'Git',
                    level: 90,
                    experience: '4+ anos',
                    description: 'Controle de versão e colaboração'
                }
            ]
        },
        {
            id: 'ai',
            title: 'IA & Automação',
            icon: 'fas fa-brain',
            description: 'Inteligência artificial e automação de processos',
            skills: [
                {
                    name: 'Machine Learning',
                    level: 70,
                    experience: '1+ ano',
                    description: 'Algoritmos de aprendizado de máquina'
                },
                {
                    name: 'OpenAI API',
                    level: 85,
                    experience: '1+ ano',
                    description: 'Integração com GPT e outras APIs'
                },
                {
                    name: 'Google Gemini',
                    level: 80,
                    experience: '6+ meses',
                    description: 'IA generativa do Google'
                },
                {
                    name: 'Automation',
                    level: 88,
                    experience: '3+ anos',
                    description: 'Automação de processos e workflows'
                },
                {
                    name: 'Data Analysis',
                    level: 75,
                    experience: '2+ anos',
                    description: 'Análise e visualização de dados'
                },
                {
                    name: 'Python AI',
                    level: 80,
                    experience: '2+ anos',
                    description: 'Python para IA e ciência de dados'
                }
            ]
        }
    ],
    
    // Soft skills
    softSkills: [
        {
            name: 'Liderança',
            level: 85,
            description: 'Capacidade de liderar equipes e projetos'
        },
        {
            name: 'Comunicação',
            level: 90,
            description: 'Comunicação clara e efetiva'
        },
        {
            name: 'Resolução de Problemas',
            level: 92,
            description: 'Análise e solução de problemas complexos'
        },
        {
            name: 'Trabalho em Equipe',
            level: 88,
            description: 'Colaboração efetiva em equipes'
        },
        {
            name: 'Adaptabilidade',
            level: 90,
            description: 'Flexibilidade para mudanças e novos desafios'
        },
        {
            name: 'Criatividade',
            level: 85,
            description: 'Pensamento criativo e inovador'
        }
    ],
    
    // Tools and technologies
    tools: [
        {
            category: 'IDEs & Editors',
            items: ['VS Code', 'IntelliJ IDEA', 'Android Studio', 'Xcode']
        },
        {
            category: 'Design',
            items: ['Figma', 'Adobe XD', 'Photoshop', 'Canva']
        },
        {
            category: 'Project Management',
            items: ['Jira', 'Trello', 'Notion', 'Slack']
        },
        {
            category: 'Testing',
            items: ['Jest', 'JUnit', 'Cypress', 'Postman']
        },
        {
            category: 'Build Tools',
            items: ['Webpack', 'Vite', 'Maven', 'Gradle']
        },
        {
            category: 'Monitoring',
            items: ['Google Analytics', 'Sentry', 'LogRocket', 'Firebase Analytics']
        }
    ],
    
    // Certifications and achievements
    certifications: [
        {
            name: 'AWS Cloud Practitioner',
            issuer: 'Amazon Web Services',
            date: '2024',
            status: 'active'
        },
        {
            name: 'Google Cloud Associate',
            issuer: 'Google Cloud',
            date: '2024',
            status: 'active'
        },
        {
            name: 'React Native Certified Developer',
            issuer: 'Meta',
            date: '2023',
            status: 'active'
        }
    ],
    
    // Learning goals
    learningGoals: [
        {
            skill: 'Kubernetes',
            priority: 'high',
            timeline: '3 meses',
            reason: 'Orquestração de containers'
        },
        {
            skill: 'TensorFlow',
            priority: 'medium',
            timeline: '6 meses',
            reason: 'Machine Learning avançado'
        },
        {
            skill: 'Rust',
            priority: 'low',
            timeline: '12 meses',
            reason: 'Performance e sistemas'
        }
    ]
};

// Helper functions for skills data
export const skillsHelpers = {
    // Get skills by category
    getByCategory: (categoryId) => {
        const category = skillsData.categories.find(cat => cat.id === categoryId);
        return category ? category.skills : [];
    },
    
    // Get all skills flattened
    getAllSkills: () => {
        return skillsData.categories.reduce((all, category) => {
            return [...all, ...category.skills.map(skill => ({
                ...skill,
                category: category.title,
                categoryId: category.id
            }))];
        }, []);
    },
    
    // Get skills by level range
    getByLevelRange: (minLevel, maxLevel) => {
        return skillsHelpers.getAllSkills().filter(skill => 
            skill.level >= minLevel && skill.level <= maxLevel
        );
    },
    
    // Get top skills
    getTopSkills: (limit = 10) => {
        return skillsHelpers.getAllSkills()
            .sort((a, b) => b.level - a.level)
            .slice(0, limit);
    },
    
    // Search skills
    searchSkills: (query) => {
        const searchTerm = query.toLowerCase();
        return skillsHelpers.getAllSkills().filter(skill =>
            skill.name.toLowerCase().includes(searchTerm) ||
            skill.description.toLowerCase().includes(searchTerm)
        );
    },
    
    // Get skills statistics
    getStats: () => {
        const allSkills = skillsHelpers.getAllSkills();
        const totalSkills = allSkills.length;
        const averageLevel = Math.round(
            allSkills.reduce((sum, skill) => sum + skill.level, 0) / totalSkills
        );
        const expertSkills = allSkills.filter(skill => skill.level >= 85).length;
        const categories = skillsData.categories.length;
        
        return {
            totalSkills,
            averageLevel,
            expertSkills,
            categories,
            softSkills: skillsData.softSkills.length,
            tools: skillsData.tools.reduce((sum, category) => sum + category.items.length, 0)
        };
    },
    
    // Get skill level description
    getLevelDescription: (level) => {
        if (level >= 90) return 'Expert';
        if (level >= 80) return 'Avançado';
        if (level >= 70) return 'Intermediário';
        if (level >= 60) return 'Básico';
        return 'Iniciante';
    },
    
    // Get skills by experience
    getByExperience: (minYears) => {
        return skillsHelpers.getAllSkills().filter(skill => {
            const years = parseInt(skill.experience);
            return years >= minYears;
        });
    },
    
    // Get category by ID
    getCategoryById: (categoryId) => {
        return skillsData.categories.find(cat => cat.id === categoryId);
    },
    
    // Get skills for resume/CV
    getResumeSkills: () => {
        return {
            technical: skillsHelpers.getTopSkills(12),
            soft: skillsData.softSkills.slice(0, 6),
            tools: skillsData.tools.slice(0, 4)
        };
    }
};

export default skillsData;
