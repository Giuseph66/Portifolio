// Projects Data Module
export const projectsData = [
    {
        id: 'pap-sistema-entregas',
        title: 'PAP - Sistema de Entregas',
        date: '2025-08-17',
        status: 'development',
        category: 'mobile',
        description: 'Plataforma completa de entregas ponto a ponto com React Native, Firebase e geolocalização em tempo real. Inclui matching geoespacial, pagamentos PIX e comunicação em tempo real.',
        longDescription: `
            O PAP é uma solução completa para entregas que conecta usuários que precisam enviar itens com entregadores disponíveis na região. 
            O sistema utiliza geolocalização avançada para fazer matching inteligente entre pedidos e entregadores, otimizando rotas e tempos de entrega.
            
            Principais funcionalidades:
            - Sistema de matching geoespacial em tempo real
            - Integração com pagamentos PIX
            - Chat em tempo real entre usuários e entregadores
            - Tracking de entregas com GPS
            - Sistema de avaliações e feedback
            - Painel administrativo para gestão
        `,
        technologies: ['React Native', 'TypeScript', 'Firebase', 'Expo', 'Google Maps API', 'PIX API'],
        highlights: ['Arquitetura Serverless', 'Real-time Tracking', 'Pagamentos PIX', 'Geolocalização'],
        features: [
            'Matching geoespacial inteligente',
            'Pagamentos integrados com PIX',
            'Chat em tempo real',
            'Tracking GPS das entregas',
            'Sistema de avaliações',
            'Painel administrativo'
        ],
        challenges: [
            'Otimização de consultas geoespaciais',
            'Sincronização em tempo real',
            'Integração com APIs de pagamento',
            'Performance em dispositivos móveis'
        ],
        results: [
            'Redução de 40% no tempo de matching',
            'Interface intuitiva e responsiva',
            'Sistema escalável e confiável',
            'Experiência de usuário otimizada'
        ],
        githubUrl: 'https://github.com/Giuseph66/PAP',
        demoUrl: null,
        images: [],
        tags: ['mobile', 'react-native', 'firebase', 'geolocation', 'real-time']
    },
    {
        id: 'desafio-esfera-solar',
        title: 'Desafio Esfera Solar',
        date: '2025-08-15',
        status: 'production',
        category: 'web',
        description: 'Sistema full-stack de consulta CNPJ com Flutter Web e Node.js. Validação completa, integração OpenCNPJ API, paginação e containerização Docker.',
        longDescription: `
            Projeto desenvolvido como desafio técnico para a Esfera Solar, demonstrando competências em desenvolvimento full-stack 
            com Flutter Web no frontend e Node.js no backend. O sistema permite consulta e validação de CNPJs com interface moderna e responsiva.
            
            Arquitetura:
            - Frontend: Flutter Web com design responsivo
            - Backend: Node.js com Express e PostgreSQL
            - API Externa: Integração com OpenCNPJ
            - Containerização: Docker para deploy
            - Validação: Algoritmo de validação de CNPJ
        `,
        technologies: ['Flutter', 'Dart', 'Node.js', 'PostgreSQL', 'Docker', 'OpenCNPJ API'],
        highlights: ['Flutter Web', 'API Integration', 'Docker', 'Full-Stack'],
        features: [
            'Consulta de CNPJ em tempo real',
            'Validação de CNPJ com algoritmo próprio',
            'Interface responsiva em Flutter Web',
            'Paginação de resultados',
            'Cache de consultas',
            'Containerização com Docker'
        ],
        challenges: [
            'Integração Flutter Web com APIs REST',
            'Otimização de performance no web',
            'Validação robusta de dados',
            'Containerização para deploy'
        ],
        results: [
            'Sistema completo e funcional',
            'Interface moderna e intuitiva',
            'Performance otimizada',
            'Deploy automatizado com Docker'
        ],
        githubUrl: 'https://github.com/Giuseph66/Desafio_projeto_esfera',
        demoUrl: null,
        images: [],
        tags: ['web', 'flutter', 'nodejs', 'postgresql', 'docker']
    },
    {
        id: 'sistema-relatorios-ia',
        title: 'Sistema de Relatórios com IA',
        date: '2025-08-20',
        status: 'production',
        category: 'ai',
        description: 'Ferramenta avançada para criação de relatórios acadêmicos com IA. Transcrição de áudio, geração automática com Google Gemini e exportação PDF.',
        longDescription: `
            Sistema inovador que utiliza inteligência artificial para automatizar a criação de relatórios acadêmicos. 
            A ferramenta permite transcrição de áudio, geração de conteúdo com IA e exportação em diversos formatos.
            
            Funcionalidades principais:
            - Transcrição automática de áudio para texto
            - Geração de relatórios com Google Gemini AI
            - Templates personalizáveis para diferentes tipos de relatório
            - Exportação em PDF, Word e outros formatos
            - Interface intuitiva e moderna
            - Processamento em tempo real
        `,
        technologies: ['HTML5', 'JavaScript', 'Google Gemini AI', 'Web Speech API', 'PDF.js'],
        highlights: ['Google Gemini', 'Transcrição de Áudio', 'IA Generativa', 'PDF Export'],
        features: [
            'Transcrição de áudio em tempo real',
            'Geração automática de relatórios',
            'Templates personalizáveis',
            'Exportação em múltiplos formatos',
            'Interface moderna e responsiva',
            'Processamento local e na nuvem'
        ],
        challenges: [
            'Integração com APIs de IA',
            'Processamento de áudio no browser',
            'Geração de PDFs complexos',
            'Otimização de performance'
        ],
        results: [
            'Redução de 80% no tempo de criação de relatórios',
            'Interface intuitiva e acessível',
            'Alta qualidade dos relatórios gerados',
            'Sistema estável e confiável'
        ],
        githubUrl: 'https://github.com/Giuseph66/Relatorios-com-ia',
        demoUrl: 'https://relatorio.neurelix.com.br/',
        images: [],
        tags: ['ai', 'javascript', 'gemini', 'audio', 'pdf']
    },
    {
        id: 'labpage-backend',
        title: 'LabPage Backend',
        date: '2025-08-08',
        status: 'development',
        category: 'backend',
        description: 'Sistema backend robusto construído em Spring Boot, Java. É uma das minhas linguagens de implementação para back-end, demonstrando arquitetura enterprise.',
        longDescription: `
            Projeto backend desenvolvido em Java com Spring Boot, demonstrando competências em arquitetura enterprise e 
            desenvolvimento de APIs robustas e escaláveis. O sistema implementa padrões de design modernos e boas práticas de desenvolvimento.
            
            Arquitetura:
            - Framework: Spring Boot com Spring Security
            - Banco de dados: PostgreSQL com JPA/Hibernate
            - Autenticação: JWT com Spring Security
            - Documentação: Swagger/OpenAPI
            - Testes: JUnit e Mockito
            - Build: Maven com profiles de ambiente
        `,
        technologies: ['Java', 'Spring Boot', 'PostgreSQL', 'JPA/Hibernate', 'Maven', 'JWT'],
        highlights: ['Spring Boot', 'Enterprise Architecture', 'REST API', 'Database Integration'],
        features: [
            'API REST completa e documentada',
            'Autenticação e autorização JWT',
            'Integração com banco PostgreSQL',
            'Validação robusta de dados',
            'Tratamento de exceções centralizado',
            'Testes unitários e de integração'
        ],
        challenges: [
            'Arquitetura escalável e maintível',
            'Segurança robusta com JWT',
            'Performance de consultas complexas',
            'Documentação completa da API'
        ],
        results: [
            'API robusta e bem documentada',
            'Arquitetura limpa e escalável',
            'Cobertura de testes > 80%',
            'Performance otimizada'
        ],
        githubUrl: 'https://github.com/Giuseph66/LabPage/tree/main/java-back',
        demoUrl: null,
        images: [],
        tags: ['backend', 'java', 'spring-boot', 'postgresql', 'api']
    },
    {
        id: 'nfce-scan',
        title: 'NFC-e Scan',
        date: '2025-11-03',
        status: 'production',
        category: 'webapp',
        description: 'Leitor de QR Code de NFC-e direto no navegador, com histórico local e busca por produto.',
        longDescription: `
          Aplicação web para leitura e consulta de NFC-e. Permite escanear o QR Code do
          cupom fiscal usando a câmera do dispositivo, inserir o link manualmente, visualizar
          os dados essenciais da nota (chave, emitente, ambiente e itens) e manter um histórico
          local das notas lidas. Inclui página de busca por produto que agrega itens de diferentes
          notas e exibe badges quando houver padronização de dados por IA.
          
          Páginas:
          - Leitor: captura via câmera (iniciar/parar) e processamento manual de link.
          - Histórico: lista local de notas lidas com navegação/paginação.
          - Busca por Produto: pesquisa consolidada de itens, com indicação de dados padronizados por IA.
        `,
        technologies: ['HTML5', 'CSS3', 'JavaScript', 'MediaDevices/getUserMedia', 'LocalStorage'],
        highlights: ['Leitura de QR Code', 'Histórico local de notas', 'Busca por produto (IA)', 'Interface responsiva'],
        features: [
          'Leitor com câmera (Iniciar/Parar) e solicitação de permissão',
          'Entrada manual de link NFC-e (Processar Link)',
          'Exibição de chave, emitente, ambiente e itens da nota',
          'Histórico local de notas lidas com navegação',
          'Busca por produto com badges indicando padronização por IA'
        ],
        challenges: [
          'Compatibilidade e permissões de câmera em diferentes navegadores/dispositivos',
          'Padronização de dados entre portais SEFAZ',
          'Performance em dispositivos móveis',
          'Privacidade dos dados armazenados localmente'
        ],
        results: [
          'Leitura rápida de QR Code de NFC-e no navegador',
          'Consulta consolidada de itens por produto a partir de múltiplas notas',
          'Fluxo simples para reprocessar e escanear novamente'
        ],
        githubUrl: 'https://github.com/Giuseph66/Scan-NFC-e-',
        demoUrl: 'https://nfc-scan.neurelix.com.br/',
        images: [],
        tags: ['webapp', 'nfce', 'qr-code', 'scanner', 'javascript']
      },      
    {
        id: 'fastshii-mobile',
        title: 'FASTSHII Mobile',
        date: '2025-08-19',
        status: 'development',
        category: 'mobile',
        description: 'Aplicativo mobile desenvolvido para otimizar processos e melhorar a experiência do usuário com interface moderna e funcionalidades avançadas.',
        longDescription: `
            Aplicativo mobile focado em otimização de processos e experiência do usuário. O FASTSHII utiliza tecnologias modernas 
            para entregar uma interface fluida e funcionalidades avançadas que atendem às necessidades específicas dos usuários.
            
            Características principais:
            - Interface moderna e intuitiva
            - Performance otimizada
            - Funcionalidades offline
            - Sincronização automática
            - Design responsivo
            - Animações fluidas
        `,
        technologies: ['React Native', 'JavaScript', 'AsyncStorage', 'React Navigation', 'Styled Components'],
        highlights: ['Mobile First', 'Modern UI', 'Performance', 'User Experience'],
        features: [
            'Interface moderna e responsiva',
            'Funcionalidades offline',
            'Sincronização automática',
            'Animações fluidas',
            'Navegação intuitiva',
            'Performance otimizada'
        ],
        challenges: [
            'Otimização de performance mobile',
            'Sincronização offline/online',
            'Design consistente multiplataforma',
            'Experiência de usuário fluida'
        ],
        results: [
            'Interface altamente responsiva',
            'Experiência de usuário excepcional',
            'Performance otimizada',
            'Funcionalidades robustas'
        ],
        githubUrl: 'https://github.com/Giuseph66/FASTSHII',
        demoUrl: null,
        images: [],
        tags: ['mobile', 'react-native', 'ui-ux', 'performance']
    },
    {
        id: 'instalador-apps-linux',
        title: 'Instalador Apps Linux',
        date: '2025-06-06',
        status: 'production',
        category: 'automation',
        description: 'Script automatizado em Python para instalação de aplicativos essenciais no Linux, simplificando a configuração de ambientes de desenvolvimento.',
        longDescription: `
            Ferramenta de automação desenvolvida em Python para simplificar a configuração de ambientes de desenvolvimento Linux. 
            O script automatiza a instalação de aplicativos essenciais, configurações do sistema e ferramentas de desenvolvimento.
            
            Funcionalidades:
            - Instalação automatizada de pacotes
            - Configuração de ambientes de desenvolvimento
            - Suporte a múltiplas distribuições Linux
            - Interface de linha de comando intuitiva
            - Logs detalhados de instalação
            - Rollback em caso de erro
        `,
        technologies: ['Python', 'Bash', 'Linux', 'Package Managers', 'CLI'],
        highlights: ['Automation', 'Linux', 'Developer Tools', 'Productivity'],
        features: [
            'Instalação automatizada de pacotes',
            'Suporte a múltiplas distribuições',
            'Interface de linha de comando',
            'Logs detalhados',
            'Sistema de rollback',
            'Configurações personalizáveis'
        ],
        challenges: [
            'Compatibilidade com diferentes distribuições',
            'Gerenciamento de dependências',
            'Tratamento de erros robusto',
            'Interface de usuário intuitiva'
        ],
        results: [
            'Redução de 90% no tempo de setup',
            'Suporte a 5+ distribuições Linux',
            'Interface intuitiva e confiável',
            'Adoção pela comunidade de desenvolvedores'
        ],
        githubUrl: 'https://github.com/Giuseph66/instalador_apps_linux',
        demoUrl: null,
        images: [],
        tags: ['automation', 'python', 'linux', 'devtools', 'cli']
    }
];

// Helper functions for projects data
export const projectsHelpers = {
    // Get project by ID
    getById: (id) => {
        return projectsData.find(project => project.id === id);
    },
    
    // Get projects by category
    getByCategory: (category) => {
        if (category === 'all') return projectsData;
        return projectsData.filter(project => project.category === category);
    },
    
    // Get projects by status
    getByStatus: (status) => {
        return projectsData.filter(project => project.status === status);
    },
    
    // Get projects by technology
    getByTechnology: (tech) => {
        return projectsData.filter(project => 
            project.technologies.some(technology => 
                technology.toLowerCase().includes(tech.toLowerCase())
            )
        );
    },
    
    // Get featured projects
    getFeatured: () => {
        return projectsData.filter(project => project.featured === true);
    },
    
    // Get recent projects
    getRecent: (limit = 3) => {
        return projectsData
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    },
    
    // Get all categories
    getCategories: () => {
        const categories = [...new Set(projectsData.map(project => project.category))];
        return ['all', ...categories];
    },
    
    // Get all technologies
    getTechnologies: () => {
        const technologies = new Set();
        projectsData.forEach(project => {
            project.technologies.forEach(tech => technologies.add(tech));
        });
        return Array.from(technologies).sort();
    },
    
    // Search projects
    search: (query) => {
        const searchTerm = query.toLowerCase();
        return projectsData.filter(project => 
            project.title.toLowerCase().includes(searchTerm) ||
            project.description.toLowerCase().includes(searchTerm) ||
            project.technologies.some(tech => tech.toLowerCase().includes(searchTerm)) ||
            project.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    },
    
    // Get project statistics
    getStats: () => {
        const total = projectsData.length;
        const production = projectsData.filter(p => p.status === 'production').length;
        const development = projectsData.filter(p => p.status === 'development').length;
        const categories = projectsHelpers.getCategories().length - 1; // Exclude 'all'
        const technologies = projectsHelpers.getTechnologies().length;
        
        return {
            total,
            production,
            development,
            categories,
            technologies
        };
    }
};

export default projectsData;
