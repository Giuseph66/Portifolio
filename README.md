# 🌌 Galaxy Portfolio

Portfólio interativo de Giuseph Giangareli com dois modos únicos: **Galaxy Explorer** (3D espacial) e **Classic** (tradicional).

## 🚀 Início Rápido

### Pré-requisitos
- Node.js >= 16.0.0
- npm >= 8.0.0

### Instalação
```bash
# Instalar dependências
npm install

# Iniciar servidor em modo desenvolvimento
npm run dev

# Ou em modo produção
npm start
```

O servidor estará disponível em: **http://localhost:3000**

## 🌌 Modos Disponíveis

### Galaxy Explorer (Modo Principal)
- **URL**: http://localhost:3000/galaxy ou http://localhost:3000/
- **Tecnologias**: Three.js, WebGL, ES6 Modules
- **Características**:
  - Navegação 3D no espaço
  - Sistema solar interativo
  - Spaceship com controles WASD/QE
  - Sistema de armas (laser/projetil)
  - Signboards flutuantes
  - Otimizações de performance automáticas

### Classic Mode (Modo Tradicional)
- **URL**: http://localhost:3000/classic
- **Tecnologias**: HTML5, CSS3, Vanilla JavaScript
- **Características**:
  - Design responsivo moderno
  - Animações suaves
  - Seções: Sobre, Projetos, Contato
  - API backend completa

## 📋 Scripts Disponíveis

```bash
# Iniciar servidor (modo desenvolvimento)
npm run dev

# Iniciar servidor (modo produção)
npm start

# Iniciar apenas o modo galáctico
npm run galaxy

# Iniciar apenas o modo clássico
npm run classic
```

## 🏗️ Estrutura do Projeto

```
galaxy-portfolio/
├── galaxy/                 # Modo Galáctico (3D)
│   ├── galaxy.html        # Página principal
│   ├── galaxy.css         # Estilos
│   └── scripts/           # Módulos JavaScript
│       ├── main.js        # Ponto de entrada
│       ├── engine/        # Engine 3D (Three.js)
│       ├── world/         # Elementos do mundo (planetas, nave, etc.)
│       ├── ui/            # Interface (HUD, overlays)
│       └── utils/         # Utilitários (cores, performance)
├── classic/                # Modo Clássico (2D)
│   ├── classic.html       # Página principal
│   ├── classic.css        # Estilos
│   ├── server.js          # Servidor Express (completo)
│   └── assets/            # Recursos estáticos
├── vendor/                 # Dependências externas
│   ├── three.module.js    # Three.js
│   ├── gsap.min.js        # GSAP
│   └── howler.min.js      # Howler.js
├── server.js              # Servidor principal (simples)
├── package.json           # Dependências e scripts
└── README.md              # Esta documentação
```

## 🎮 Controles - Modo Galáctico

| Tecla | Função |
|-------|--------|
| `WASD` | Movimentação (frente/trás/esquerda/direita) |
| `QE` | Subir/Descer |
| `Shift` | Turbo (velocidade aumentada) |
| `Botão Direito` | Rotação da nave (modo normal) |
| `Mouse` | Controle de voo (modo mouse flight) |
| `V` | Alternar câmera (1ª/3ª pessoa) |
| `M` | Ativar/desativar mouse flight |
| `Espaço` | Autopilot (navega automaticamente) |
| `Clique Esquerdo` | Atirar |
| `Tab` | Trocar arma (laser/projetil) |
| `G` | Alternar para modo clássico |
| `H` | Ocultar HUD |
| `ESC` | Sair do mouse flight |

## 🔧 Desenvolvimento

### Adicionando Novos Projetos
1. Editar `galaxy/assets/data/signboards.json` (modo galáctico)
2. Editar `classic/assets/data/projects.js` (modo clássico)

### Otimizações Implementadas
- **Object Pooling** para lasers e projéteis
- **Throttle** em animações (reduz updates por frame)
- **Geometrias reduzidas** no sistema solar
- **Renderização adaptativa** baseada em FPS
- **Culling automático** de objetos distantes

## 🌐 API Endpoints

- `GET /api/health` - Status do servidor
- `GET /galaxy` - Modo galáctico
- `GET /classic` - Modo clássico

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Outras Plataformas
O projeto é compatível com:
- Netlify
- Heroku
- Railway
- Render

## 📄 Licença

MIT - Copyright (c) 2024 Giuseph Giangareli

## 👨‍💻 Autor

**Giuseph Giangareli**
- Email: giusephgangareli@gmail.com
- LinkedIn: [Giuseph Giangareli](https://linkedin.com/in/giuseph-giangareli)
- GitHub: [@Giuseph66](https://github.com/Giuseph66)
- Website: [giuseph.dev](https://giuseph.dev)