# Technology Rules & Stack Definition

## Automated Content Creation System

**Version:** 1.0  
**Status:** Draft  
**Last Updated:** 2026-02-04

---

## 1. Overview

This document defines the technology stack, coding standards, and architectural decisions for the Automated Content Creation System. All development must adhere to these rules to ensure consistency, maintainability, and scalability.

---

## 2. Core Technology Stack

### 2.1 Backend

| Component | Technology | Version | Rationale |
|-----------|------------|---------|-----------|
| Runtime | Node.js | 20.x LTS | Mature ecosystem, async I/O, TypeScript support |
| Language | TypeScript | 5.x | Type safety, better tooling, maintainability |
| Framework | Fastify | 4.x | High performance, low overhead, excellent plugin system |
| ORM | Prisma | 5.x | Type-safe queries, excellent migrations, good DX |
| Validation | Zod | 3.x | TypeScript-first schema validation |

### 2.2 Frontend

| Component | Technology | Version | Rationale |
|-----------|------------|---------|-----------|
| Framework | Next.js | 14.x | React-based, SSR/SSG, API routes, excellent DX |
| Language | TypeScript | 5.x | Consistency with backend |
| Styling | Tailwind CSS | 3.x | Utility-first, rapid development, consistent design |
| State | Zustand | 4.x | Lightweight, TypeScript-friendly, minimal boilerplate |
| UI Components | Radix UI | 1.x | Headless, accessible, unopinionated styling |

### 2.3 AI/ML Layer

| Component | Technology | Version | Rationale |
|-----------|------------|---------|-----------|
| LLM | OpenAI GPT-4 | Latest | Best quality for content generation |
| Embeddings | OpenAI text-embedding-3-large | Latest | High quality, cost-effective |
| Alternative LLM | Claude 3.5 Sonnet | Latest | High quality, good for longer context |
| Vector DB | Pinecone | Latest | Managed, scalable, excellent performance |
| Fallback LLM | Local LLM (Ollama) | Latest | Privacy, offline capability, cost control |

### 2.4 Data Storage

| Component | Technology | Version | Rationale |
|-----------|------------|---------|-----------|
| Primary DB | PostgreSQL | 16.x | ACID compliance, JSON support, reliable |
| Cache | Redis | 7.x | Fast key-value, pub/sub, session storage |
| Vector Store | Pinecone | Latest | Semantic search, managed service |
| File Storage | MinIO (S3-compatible) | Latest | Self-hosted object storage, S3 API compatibility |
| Search | PostgreSQL Full-Text + pgvector | Latest | Integrated search, no separate service needed |

### 2.5 Infrastructure

| Component | Technology | Version | Rationale |
|-----------|------------|---------|-----------|
| Container | Docker | Latest | Consistent environments, easy deployment |
| Orchestration | Docker Compose (local) / Kubernetes (prod) | Latest | Flexibility from dev to production |
| Reverse Proxy | Caddy | 2.x | Automatic HTTPS, simple config, modern |
| Queue | BullMQ | 4.x | Redis-based, reliable, TypeScript support |
| WebSocket | Socket.io | 4.x | Fallback support, room management, mature |

### 2.6 Development Tools

| Component | Technology | Version | Rationale |
|-----------|------------|---------|-----------|
| Package Manager | pnpm | 8.x | Fast, disk space efficient, strict dependency resolution |
| Linting | ESLint | 8.x | Standard TypeScript rules, customizable |
| Formatting | Prettier | 3.x | Consistent code style, zero config |
| Testing | Vitest | 1.x | Fast, TypeScript-native, Jest-compatible |
| E2E Testing | Playwright | 1.x | Modern, reliable, great debugging |
| Git Hooks | Husky | 8.x | Pre-commit checks, quality gates |

---

## 3. Architecture Rules

### 3.1 Code Organization

```
src/
├── config/              # Configuration files
├── modules/             # Feature modules
│   ├── ingestion/
│   ├── distillation/
│   ├── draft/
│   ├── refinement/
│   └── export/
├── shared/              # Shared utilities
│   ├── types/           # Global TypeScript types
│   ├── utils/           # Helper functions
│   ├── errors/          # Error classes
│   └── middleware/      # Common middleware
├── infrastructure/      # External services
│   ├── database/
│   ├── cache/
│   ├── queue/
│   └── llm/
└── api/                 # API routes
    ├── routes/
    ├── controllers/
    └── validators/
```

### 3.2 Module Structure

Every module must follow this structure:

```
modules/{module-name}/
├── index.ts             # Public API exports
├── {module}.service.ts  # Business logic
├── {module}.types.ts    # Module-specific types
├── {module}.repository.ts # Data access layer
├── {module}.controller.ts # HTTP handlers (if applicable)
├── {module}.routes.ts   # Route definitions (if applicable)
├── {module}.test.ts     # Unit tests
└── README.md            # Module documentation
```

### 3.3 Coding Standards

#### TypeScript Rules
- Strict mode enabled: `strict: true` in tsconfig.json
- No `any` types without explicit justification and comment
- Explicit return types on all public functions
- Interface over type for object definitions
- Use discriminated unions for complex state

#### Naming Conventions
```typescript
// Variables & Functions: camelCase
const userInput = "...";
function processInput() {}

// Classes & Types: PascalCase
class InputProcessor {}
interface UserInput {}
type InputType = ...;

// Constants: SCREAMING_SNAKE_CASE
const MAX_INPUT_SIZE = 50 * 1024 * 1024;

// File names: kebab-case
input-processor.ts
user-input-validator.ts

// Enums: PascalCase for name, UPPER_SNAKE for values
enum ProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed'
}
```

#### Error Handling
```typescript
// Use custom error classes
class ValidationError extends AppError {
  constructor(message: string, public field: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

// Never catch silently
try {
  await processFile(file);
} catch (error) {
  logger.error('File processing failed', { error, fileId: file.id });
  throw new ProcessingError('Failed to process file', { cause: error });
}
```

---

## 4. API Design Rules

### 4.1 REST Principles
- Resource-oriented URLs: `/projects/{id}/drafts` not `/getDraft`
- HTTP methods correctly: GET, POST, PUT, DELETE, PATCH
- Status codes: 200, 201, 400, 401, 403, 404, 409, 422, 500
- Consistent response format:

```typescript
// Success
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "...",
    "requestId": "..."
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "...",
    "details": [ ... ]
  },
  "meta": { ... }
}
```

### 4.2 Validation
- Validate at boundary (API layer)
- Use Zod schemas for all inputs
- Sanitize user input before processing
- Never trust client-side validation alone

---

## 5. Database Rules

### 5.1 Schema Guidelines
- Use snake_case for column names
- Always include: `id`, `created_at`, `updated_at`
- Use UUID v4 for all IDs (generated in application)
- Index foreign keys and frequently queried columns
- Use appropriate data types (TEXT over VARCHAR for long strings)

### 5.2 Migration Rules
- Never modify existing migrations
- Create new migrations for schema changes
- Test migrations on copy of production data before deploy
- All migrations must be reversible

### 5.3 Query Rules
- Use Prisma ORM for all database operations
- No raw SQL unless absolutely necessary (document why)
- Batch operations for bulk updates
- Use transactions for multi-table operations

---

## 6. AI/LLM Integration Rules

### 6.1 Prompt Engineering Standards
- All prompts versioned and stored in `src/prompts/`
- Use structured templates with type safety
- Include few-shot examples where helpful
- Set temperature: 0.3-0.5 for factual tasks, 0.7-0.9 for creative
- Max tokens appropriate for expected output + 20% buffer

### 6.2 Prompt Template Structure
```typescript
// prompts/draft-generation.ts
export const draftGenerationPrompt = `
You are an expert content writer. Create a {{contentType}} based on the following research summary.

Target Audience: {{audience}}
Tone: {{tone}}
Length: Approximately {{targetLength}} words

Research Summary:
{{researchSummary}}

Guidelines:
- Maintain factual accuracy
- Use natural transitions between sections
- Include citations where appropriate
- Follow a clear narrative structure

Output the content in {{format}} format.
`;
```

### 6.3 LLM Usage Constraints
- Implement rate limiting per user
- Cache embeddings aggressively
- Use streaming for long generations
- Monitor token usage and costs
- Implement fallback to local LLM for critical paths

---

## 7. Testing Rules

### 7.1 Testing Pyramid
- Unit tests: 70% of tests, fast, isolated
- Integration tests: 20% of tests, service boundaries
- E2E tests: 10% of tests, critical user flows

### 7.2 Testing Standards
```typescript
// Test file naming: {module}.test.ts or {module}.spec.ts
// Test structure
describe('ModuleName', () => {
  describe('functionName', () => {
    it('should do X when Y', async () => {
      // Arrange
      const input = ...;
      
      // Act
      const result = await functionName(input);
      
      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

### 7.3 Test Requirements
- Minimum 80% code coverage
- All critical paths must have tests
- Mock external services (LLM, DB, etc.)
- Test error cases and edge cases
- Use factories for test data, not hardcoded values

---

## 8. Security Rules

### 8.1 Authentication
- JWT with RS256 algorithm
- Access tokens: 15-minute expiry
- Refresh tokens: 7-day expiry, single use
- HTTPS only in production
- Secure, HttpOnly cookies for tokens

### 8.2 Authorization
- RBAC with roles: user, admin, super-admin
- Resource-level permissions checked on every request
- Principle of least privilege

### 8.3 Data Protection
- Encrypt PII at rest
- Never log sensitive data
- Input sanitization on all user inputs
- Output encoding to prevent XSS
- Rate limiting: 100 req/min per IP, 1000 req/min per user

### 8.4 File Upload
- Validate file types strictly
- Scan for malware
- Store outside web root
- Limit file sizes (50MB max)
- Randomize filenames

---

## 9. Performance Rules

### 9.1 Response Time Targets
- API responses: < 200ms (p95)
- Page load: < 2 seconds (first meaningful paint)
- Time to interactive: < 3 seconds
- Draft generation: < 5 minutes (initial), < 30 seconds (refinement)

### 9.2 Optimization Guidelines
- Use Redis caching for frequent queries
- Implement pagination for all list endpoints
- Lazy load images and heavy content
- Use connection pooling for database
- Compress API responses (gzip/brotli)

### 9.3 Database Performance
- Query timeout: 5 seconds max
- N+1 query prevention (use Prisma includes)
- Connection pool: 10-20 connections per instance
- Regular query performance monitoring

---

## 10. Monitoring & Logging Rules

### 10.1 Logging Standards
- Structured JSON logging only
- Log levels: ERROR, WARN, INFO, DEBUG
- Always include: timestamp, requestId, userId, traceId
- Never log: passwords, tokens, PII (redact if needed)

### 10.2 Required Monitoring
- Application performance (APM)
- Error rates and types
- API response times
- LLM token usage and costs
- Database query performance
- Queue processing times

### 10.3 Alerting Thresholds
- Error rate > 1% for 5 minutes
- API response time > 500ms (p95) for 10 minutes
- Queue backlog > 1000 jobs for 15 minutes
- LLM cost > $100/day

---

## 11. Deployment Rules

### 11.1 Environment Strategy
```
Development: Local Docker, hot reload, debug enabled
Staging: Production-like, test data, integration tests
Production: Blue-green deployment, auto-scaling, monitoring
```

### 11.2 Deployment Checklist
- [ ] All tests passing
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] Health checks defined
- [ ] Rollback plan documented
- [ ] Monitoring dashboards ready
- [ ] Alerting rules active

### 11.3 Git Workflow
```
main: Production code, protected branch
develop: Integration branch, auto-deploys to staging
feature/*: Feature development
hotfix/*: Emergency production fixes
```

### 11.4 Versioning
- Semantic versioning: MAJOR.MINOR.PATCH
- Tag all releases
- Maintain changelog
- API version in URL: /api/v1/...

---

## 12. Documentation Rules

### 12.1 Code Documentation
- JSDoc for all public functions
- README.md in every module
- Inline comments for complex logic only
- Keep comments current (outdated comments are bugs)

### 12.2 API Documentation
- OpenAPI/Swagger spec for all endpoints
- Include example requests and responses
- Document error codes and meanings
- Update on API changes

### 12.3 Architecture Documentation
- Keep DESIGN.md current
- Document all architectural decisions (ADRs)
- Include diagrams (Mermaid or ASCII)
- Review quarterly

---

## 13. Prohibited Technologies & Practices

### 13.1 Do Not Use
- MongoDB (prefer PostgreSQL with JSONB)
- Express.js (prefer Fastify for performance)
- JavaScript (use TypeScript everywhere)
- console.log (use structured logging)
- Any (use proper types)
- var (use const/let)
- == (use ===)
- Callbacks (use async/await)

### 13.2 Avoid
- Heavy ORMs with complex mappings (use Prisma)
- Microservices (start modular monolith)
- Over-engineering (YAGNI principle)
- Premature optimization (measure first)
- Feature flags in early stages
- Multiple languages (stick to TypeScript stack)

---

## 14. Decision Log

| Date | Decision | Rationale | Status |
|------|----------|-----------|--------|
| 2026-02-04 | Node.js + TypeScript | Team expertise, ecosystem | Approved |
| 2026-02-04 | Fastify over Express | Performance, modern features | Approved |
| 2026-02-04 | Next.js for frontend | Full-stack, SSR, React | Approved |
| 2026-02-04 | PostgreSQL + Pinecone | Relational + vector search | Approved |
| 2026-02-04 | OpenAI GPT-4 primary | Best quality for content | Approved |
| 2026-02-04 | Docker + Kubernetes | Scalable, portable | Approved |

---

## 15. Appendix

### A. Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/db
REDIS_URL=redis://localhost:6379

# LLM
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=...

# Security
JWT_PRIVATE_KEY=...
JWT_PUBLIC_KEY=...
ENCRYPTION_KEY=...

# App
NODE_ENV=development|staging|production
PORT=3000
LOG_LEVEL=info
```

### B. Useful Commands
```bash
# Development
pnpm dev              # Start dev server
pnpm test             # Run all tests
pnpm test:watch       # Run tests in watch mode
pnpm db:migrate       # Run database migrations
pnpm db:seed          # Seed database

# Production
pnpm build            # Build for production
pnpm start            # Start production server
pnpm db:deploy        # Deploy migrations
```
