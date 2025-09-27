# Agentic Orchestration Monorepo

A modern TypeScript monorepo for agentic orchestration with NestJS backend and React frontend.

## 🏗️ Architecture

```
ts-agentic-monorepo/
├── apps/
│   ├── backend/          # NestJS API server
│   └── frontend/         # React frontend
├── libs/
│   └── shared/           # Shared types and utilities
├── docker/               # Docker configurations
└── package.json          # Root workspace configuration
```

## 🚀 Features

### Backend (NestJS)
- ✅ Modern NestJS architecture with modules
- ✅ Winston logging with file rotation
- ✅ Global exception handling
- ✅ Request/response interceptors
- ✅ MongoDB integration with Mongoose
- ✅ Swagger API documentation
- ✅ Environment-based configuration
- ✅ Security middleware (Helmet, CORS)

### Frontend (React)
- ✅ Modern React 18 with TypeScript
- ✅ Vite for fast development
- ✅ TailwindCSS for styling
- ✅ React Query for data fetching
- ✅ Zustand for state management
- ✅ React Hook Form with Zod validation

### DevOps
- ✅ Docker Compose with hot reload
- ✅ Multi-stage Docker builds
- ✅ MongoDB with initialization scripts
- ✅ Nginx reverse proxy for production

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm 9+
- Docker & Docker Compose

### Quick Start

1. **Clone and setup**
   ```bash
   cd ts-agentic-monorepo
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run with Docker (Recommended)**
   ```bash
   npm run docker:up
   ```

   Services will be available at:
   - Backend API: http://localhost:3000
   - Frontend: http://localhost:5173
   - API Docs: http://localhost:3000/api/docs
   - MongoDB: localhost:27017

4. **Run locally (Alternative)**
   ```bash
   # Terminal 1 - Backend
   npm run dev:backend

   # Terminal 2 - Frontend
   npm run dev:frontend
   ```

### Available Scripts

```bash
# Development
npm run dev              # Run both frontend and backend
npm run dev:backend      # Run backend only
npm run dev:frontend     # Run frontend only

# Building
npm run build            # Build both apps
npm run build:backend    # Build backend only
npm run build:frontend   # Build frontend only

# Testing
npm run test             # Run all tests
npm run test:backend     # Run backend tests
npm run test:frontend    # Run frontend tests

# Code quality
npm run lint             # Lint all code
npm run format           # Format all code

# Docker
npm run docker:up        # Start all services
npm run docker:down      # Stop all services
```

## 📦 Project Structure

### Backend Structure
```
apps/backend/src/
├── auth/                # Authentication module
├── users/               # User management
├── agents/              # AI agent management
├── conversations/       # Conversation handling
├── common/              # Shared utilities
│   ├── filters/         # Exception filters
│   ├── interceptors/    # Request interceptors
│   ├── guards/          # Auth guards
│   └── pipes/           # Validation pipes
├── config/              # Configuration
└── database/            # Database setup
```

### Frontend Structure
```
apps/frontend/src/
├── components/          # Reusable components
├── pages/               # Page components
├── hooks/               # Custom hooks
├── stores/              # Zustand stores
├── services/            # API services
├── types/               # TypeScript types
└── utils/               # Utility functions
```

## 🔧 Configuration

### Environment Variables
See `.env.example` for all available configuration options.

### Database
MongoDB is used with automatic initialization. The database schema is managed through Mongoose models.

### Logging
Winston is configured with:
- Console output for development
- File rotation for production
- Error tracking and request logging

## 🐳 Docker

The project includes multi-stage Docker builds:
- **Development**: Hot reload with volume mounts
- **Production**: Optimized builds with security

### Docker Compose Services
- `backend`: NestJS API server
- `frontend`: React application
- `mongodb`: Database with initialization

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation as needed
4. Use conventional commit messages

## 📄 License

ISC