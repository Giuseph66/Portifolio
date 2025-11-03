const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'", "https:", "http:"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            manifestSrc: ["'self'"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://giuseph-portfolio.vercel.app', 'https://giuseph.dev'] 
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files middleware
app.use(express.static(path.join(__dirname), {
    maxAge: process.env.NODE_ENV === 'production' ? '1y' : '0',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
        // Set cache headers for different file types
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        } else if (path.match(/\.(js|css)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
        } else if (path.match(/\.(png|jpg|jpeg|gif|ico|svg)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 days
        }
    }
}));

// API Routes
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: require('./package.json').version
    });
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        // Basic validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                error: 'Todos os campos são obrigatórios'
            });
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Email inválido'
            });
        }
        
        // Log the contact form submission
        console.log('Contact form submission:', {
            name,
            email,
            subject,
            message: message.substring(0, 100) + '...',
            timestamp: new Date().toISOString(),
            ip: req.ip
        });
        
        // In a real application, you would:
        // 1. Save to database
        // 2. Send email notification
        // 3. Send confirmation email to user
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        res.json({
            success: true,
            message: 'Mensagem enviada com sucesso! Retornarei em breve.'
        });
        
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            error: 'Erro interno do servidor. Tente novamente mais tarde.'
        });
    }
});

// Projects API endpoint
app.get('/api/projects', (req, res) => {
    try {
        // In a real application, this would come from a database
        const projects = require('./assets/data/projects.js').projectsData;
        
        const { category, status, limit, search } = req.query;
        let filteredProjects = [...projects];
        
        // Filter by category
        if (category && category !== 'all') {
            filteredProjects = filteredProjects.filter(p => p.category === category);
        }
        
        // Filter by status
        if (status) {
            filteredProjects = filteredProjects.filter(p => p.status === status);
        }
        
        // Search functionality
        if (search) {
            const searchTerm = search.toLowerCase();
            filteredProjects = filteredProjects.filter(p =>
                p.title.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm) ||
                p.technologies.some(tech => tech.toLowerCase().includes(searchTerm))
            );
        }
        
        // Sort by date (newest first)
        filteredProjects.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Limit results
        if (limit) {
            filteredProjects = filteredProjects.slice(0, parseInt(limit));
        }
        
        res.json({
            projects: filteredProjects,
            total: filteredProjects.length,
            filters: { category, status, search, limit }
        });
        
    } catch (error) {
        console.error('Projects API error:', error);
        res.status(500).json({
            error: 'Erro ao carregar projetos'
        });
    }
});

// Skills API endpoint
app.get('/api/skills', (req, res) => {
    try {
        // In a real application, this would come from a database
        const skills = require('./assets/data/skills.js').skillsData;
        
        const { category } = req.query;
        
        if (category) {
            const categoryData = skills.categories.find(cat => cat.id === category);
            if (!categoryData) {
                return res.status(404).json({
                    error: 'Categoria não encontrada'
                });
            }
            res.json(categoryData);
        } else {
            res.json(skills);
        }
        
    } catch (error) {
        console.error('Skills API error:', error);
        res.status(500).json({
            error: 'Erro ao carregar habilidades'
        });
    }
});

// Analytics endpoint (basic)
app.post('/api/analytics', (req, res) => {
    try {
        const { event, page, data } = req.body;
        
        // Log analytics event
        console.log('Analytics event:', {
            event,
            page,
            data,
            timestamp: new Date().toISOString(),
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        res.json({ success: true });
        
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Erro ao registrar evento' });
    }
});

// Sitemap endpoint
app.get('/sitemap.xml', (req, res) => {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${req.protocol}://${req.get('host')}/</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${req.protocol}://${req.get('host')}/pages/about.html</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>${req.protocol}://${req.get('host')}/pages/projects.html</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>${req.protocol}://${req.get('host')}/pages/contact.html</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
</urlset>`;
    
    res.set('Content-Type', 'text/xml');
    res.send(sitemap);
});

// Robots.txt endpoint
app.get('/robots.txt', (req, res) => {
    const robots = `User-agent: *
Allow: /

Sitemap: ${req.protocol}://${req.get('host')}/sitemap.xml`;
    
    res.set('Content-Type', 'text/plain');
    res.send(robots);
});

// Specific routes for pages
app.get('/sobre', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/about.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/about.html'));
});

app.get('/projetos', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/projects.html'));
});

app.get('/projects', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/projects.html'));
});

app.get('/contato', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/contact.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/contact.html'));
});

// Serve pages directory
app.get('/pages/:page', (req, res) => {
    const filePath = path.join(__dirname, 'pages', req.params.page);
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).sendFile(path.join(__dirname, 'index.html'));
        }
    });
});

// Default route - serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Erro interno do servidor' 
            : err.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Página não encontrada',
        path: req.path
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`
🚀 Giuseph Portfolio Server
📍 Environment: ${process.env.NODE_ENV || 'development'}
🌐 Server running on: http://localhost:${PORT}
⏰ Started at: ${new Date().toISOString()}
    `);
});

module.exports = app;
