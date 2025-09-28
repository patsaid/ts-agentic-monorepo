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
npm run test:backend     # Run backend tests with coverage
npm run test:frontend    # Run frontend tests with coverage
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage reports

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

## 🧪 Testing

This project maintains comprehensive test coverage with an 80% threshold requirement for all applications.

### Testing Stack

**Backend (NestJS)**

- **Framework**: Jest with ts-jest
- **Database**: MongoDB Memory Server for isolated testing
- **Coverage**: 80% minimum threshold (branches, functions, lines, statements)
- **Test Types**: Unit tests, Integration tests, E2E tests

**Frontend (React)**

- **Framework**: Vitest with React Testing Library + Playwright for E2E
- **Environment**: jsdom for unit/integration tests, real browsers for E2E
- **Coverage**: 80% minimum threshold (branches, functions, lines, statements)
- **Test Types**: Component tests, Hook tests, API integration tests, E2E tests

### Running Tests

```bash
# Run all tests across the monorepo
npm run test              # Unit and integration tests
npm run test:e2e          # E2E tests

# Backend testing
cd apps/backend
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:cov          # With coverage report
npm run test:e2e          # End-to-end tests

# Frontend testing
cd apps/frontend
npm run test              # Run unit/integration tests
npm run test:ui           # Run with Vitest UI
npm run test:e2e          # Run E2E tests
npm run test:e2e:ui       # Run E2E tests with Playwright UI
npm run test:e2e:debug    # Debug E2E tests
npm run test:e2e:headed   # Run E2E tests in headed mode
```

### Coverage Requirements

Both applications enforce a minimum of **80% coverage** across all metrics:

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

Tests will **fail** if coverage drops below these thresholds.

### Test Structure

**Backend Tests**

```
apps/backend/src/
├── users/
│   ├── users.service.spec.ts     # Unit tests
│   └── users.controller.spec.ts  # Controller tests
├── agents/
│   └── agents.service.spec.ts    # Service tests
└── test/
    ├── setup.ts                  # Test configuration
    ├── users.e2e-spec.ts         # E2E tests
    └── agents.e2e-spec.ts        # E2E tests
```

**Frontend Tests**

```
apps/frontend/
├── src/
│   ├── components/
│   │   ├── Login.test.tsx        # Component tests
│   │   └── AgentChat.test.tsx    # Component tests
│   ├── services/
│   │   └── api.test.ts           # API integration tests
│   └── test/
│       └── setup.ts              # Test configuration
└── e2e/
    ├── auth.spec.ts              # E2E authentication tests
    └── chat.spec.ts              # E2E chat functionality tests
```

### Testing Best Practices

1. **Isolation**: Each test should be independent and not rely on external services
2. **Mocking**: External APIs and services are properly mocked
3. **Coverage**: All business logic, error handling, and edge cases are tested
4. **Naming**: Test names clearly describe what is being tested
5. **Setup**: Common test setup is centralized in setup files
6. **E2E Testing**: User workflows are tested end-to-end across real browsers
7. **Cross-browser**: E2E tests run on Chrome, Firefox, Safari, and mobile devices

### E2E Testing with Playwright

The frontend includes comprehensive E2E tests using Playwright:

**Features Tested:**

- User authentication (login/signup flows)
- Chat interface functionality
- Message sending and receiving
- Quick actions (weather, user info)
- Conversation management
- Error handling and edge cases
- Mobile responsiveness

**Browser Coverage:**

- Desktop: Chrome, Firefox, Safari
- Mobile: Chrome (Pixel 5), Safari (iPhone 12)

**Test Environment:**

- Automatic browser management
- Mock API responses for consistent testing
- Screenshot capture on failures
- Trace recording for debugging

### Continuous Integration

The testing suite is designed to run in CI/CD environments:

- MongoDB Memory Server provides isolated database testing
- All external dependencies are mocked
- Coverage reports are generated in multiple formats (text, lcov, html)
- Playwright tests run in headless mode with automatic browser installation
- Cross-platform compatibility (Linux, macOS, Windows)

## 🐳 Docker

The project includes multi-stage Docker builds:

- **Development**: Hot reload with volume mounts
- **Production**: Optimized builds with security

### Docker Compose Services

- `backend`: NestJS API server
- `frontend`: React application
- `mongodb`: Database with initialization

## 📝 Commit Guidelines

This project enforces **conventional commits** using Husky and Commitlint. All commits must follow the established format.

### 🔧 Commit Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### 📋 Available Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New features | `feat(agents): add conversation memory` |
| `fix` | Bug fixes | `fix(auth): resolve token validation issue` |
| `docs` | Documentation changes | `docs(api): update swagger definitions` |
| `style` | Code style/formatting | `style(backend): fix eslint warnings` |
| `refactor` | Code refactoring | `refactor(users): simplify auth logic` |
| `test` | Adding/updating tests | `test(frontend): add Login component tests` |
| `chore` | Maintenance tasks | `chore(deps): upgrade dependencies` |
| `ci` | CI/CD changes | `ci(github): add automated testing` |
| `perf` | Performance improvements | `perf(api): optimize database queries` |
| `revert` | Revert previous commits | `revert: undo feature X` |

### 🎯 Available Scopes

| Scope | Description |
|-------|-------------|
| `backend` | Backend-specific changes |
| `frontend` | Frontend-specific changes |
| `agents` | AI agents module |
| `users` | Users module |
| `auth` | Authentication |
| `conversations` | Conversations module |
| `user-info` | User info module |
| `database` | Database changes |
| `api` | API changes |
| `ui` | UI components |
| `config` | Configuration changes |
| `deps` | Dependencies |
| `monorepo` | Monorepo-wide changes |
| `testing` | Testing infrastructure |
| `lint` | Linting configuration |

### ✅ Good Commit Examples

```bash
feat(agents): add conversation context memory
fix(users): resolve bcrypt hash comparison bug
docs(readme): update installation instructions
test(frontend): add comprehensive Login component tests
chore(deps): upgrade mongoose to v7.0.0
refactor(api): simplify error handling middleware
style(backend): fix eslint formatting issues
```

### ❌ Bad Commit Examples

```bash
# Too vague
fix: bug fix
update stuff
WIP

# Missing type
add new feature
fixed the thing

# Wrong format
Fixed: user login bug
FEAT: new ai agent
```

### 🚀 How to Commit

#### Option 1: Guided Commits (Recommended)
```bash
npm run commit
```
This opens an interactive prompt that guides you through creating a proper commit message.

#### Option 2: Manual Commits
```bash
git add .
git commit -m "feat(agents): add real-time conversation updates"
```

### 🛡️ Automatic Enforcement

**Pre-commit hooks** automatically:
- ✅ Run linting on all staged files
- ✅ Validate commit message format
- ❌ Block commits that don't follow conventions

**Example of blocked commit:**
```bash
$ git commit -m "fix stuff"

⧗   input: fix stuff
✖   subject may not be empty [subject-empty]
✖   type may not be empty [type-empty]

✖   found 2 problems, 0 warnings
husky - commit-msg script failed (code 1)
```

**Example of successful commit:**
```bash
$ git commit -m "fix(auth): resolve token validation issue"

✅ Commit accepted! Linting passed.
```

### 💡 Tips for Great Commits

1. **Be specific**: Describe what changed and why
2. **Use imperative mood**: "add feature" not "added feature"
3. **Keep subject under 72 characters**
4. **Reference issues**: Include issue numbers when relevant
5. **Break up large changes**: Multiple focused commits > one giant commit

### 📚 Additional Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [How to Write Good Commit Messages](https://chris.beams.io/posts/git-commit/)

## 🤝 Contributing

1. **Follow the commit guidelines above** ⬆️
2. Add tests for new features (80% coverage required)
3. Update documentation as needed
4. Ensure all linting passes
5. Test your changes thoroughly

## 📄 License

ISC
