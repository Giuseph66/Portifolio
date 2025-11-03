const express = require('express');
const path = require('path');
const compression = require('compression');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware básico
app.use(compression());
app.use(cors());

// Servir arquivos estáticos do diretório raiz (para index.html principal)
app.use(express.static(path.join(__dirname), {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0'
}));

// Servir arquivos estáticos do modo galáctico
app.use('/galaxy', express.static(path.join(__dirname, 'galaxy'), {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0'
}));

// Servir arquivos estáticos do modo clássico
app.use('/classic', express.static(path.join(__dirname, 'classic'), {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0'
}));

// Servir Three.js e outras dependências
app.use('/vendor', express.static(path.join(__dirname, 'vendor'), {
    maxAge: '7d' // Cache mais longo para dependências
}));

// Rota principal - redirecionar para o modo galáctico
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para o modo galáctico
app.get('/galaxy', (req, res) => {
    res.sendFile(path.join(__dirname, 'galaxy', 'galaxy.html'));
});

// Rota para o modo clássico
app.get('/classic', (req, res) => {
    res.sendFile(path.join(__dirname, 'classic', 'classic.html'));
});

// Endpoint de saúde
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: '2.0.0',
        modes: {
            galaxy: 'available',
            classic: 'available'
        }
    });
});

// Tratamento de erros 404
app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Página não encontrada</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .container { max-width: 600px; margin: 0 auto; }
                h1 { color: #ff6b35; }
                p { color: #666; }
                a { color: #00d4ff; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🚀 Página não encontrada</h1>
                <p>A página que você está procurando não existe.</p>
                <p>
                    <a href="/">← Voltar ao início</a> |
                    <a href="/galaxy">🌌 Modo Galáctico</a> |
                    <a href="/classic">📄 Modo Clássico</a>
                </p>
            </div>
        </body>
        </html>
    `);
});

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Erro interno</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .container { max-width: 600px; margin: 0 auto; }
                h1 { color: #ff006e; }
                p { color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>❌ Erro interno do servidor</h1>
                <p>Ocorreu um erro inesperado. Tente novamente mais tarde.</p>
                <p><a href="/">← Voltar ao início</a></p>
            </div>
        </body>
        </html>
    `);
});

// Iniciar servidor
const server = app.listen(PORT, () => {
    console.log(`
🌌🚀 GALAXY PORTFOLIO SERVER
📍 Environment: ${process.env.NODE_ENV || 'development'}
🌐 Server running on: http://localhost:${PORT}
🌌 Galaxy Mode: http://localhost:${PORT}/galaxy
📄 Classic Mode: http://localhost:${PORT}/classic
⏰ Started at: ${new Date().toISOString()}

📖 Usage:
   npm start          # Production mode
   npm run dev        # Development mode
   node server.js     # Direct execution
    `);
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

module.exports = app;
