# ContentPipe

Automated Content Creation System - Transform research into publishable content with AI-powered automation.

## Overview

ContentPipe streamlines the transformation of raw research materials into publication-ready content with minimal manual intervention. The system prioritizes speed, quality, and iterative refinement while maintaining full attribution and decision history.

## Architecture

- **Backend**: Fastify (Node.js) with TypeScript
- **Frontend**: Next.js 14 with Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Storage**: MinIO (S3-compatible)
- **AI/ML**: OpenAI GPT-4 + Pinecone vector database

## Prerequisites

- Node.js 20.x
- pnpm 8.x
- Docker & Docker Compose

## Quick Start

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Start infrastructure services:**

   ```bash
   pnpm docker:up
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Run database migrations:**

   ```bash
   pnpm db:migrate
   ```

5. **Start development servers:**

   ```bash
   pnpm dev
   ```

   - API: http://localhost:3000
   - Web: http://localhost:3001

## Project Structure

```
contentpipe/
├── apps/
│   ├── api/              # Fastify backend
│   └── web/              # Next.js frontend
├── packages/
│   ├── shared/           # Shared utilities
│   └── types/            # Shared TypeScript types
├── docs/                 # Documentation
├── docker-compose.yml    # Infrastructure services
└── package.json          # Root workspace config
```

## Features

- **Multi-Format Input**: Upload PDFs, DOCX, HTML, URLs, and notes
- **AI Distillation**: Automatically extract key insights and themes
- **Draft Generation**: Create coherent drafts with citations
- **Iterative Refinement**: Context-aware revisions with feedback
- **Export**: Markdown, DOCX, HTML, PDF formats

## Development

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all applications
- `pnpm test` - Run all tests
- `pnpm lint` - Run linting
- `pnpm typecheck` - Type check all packages

## Documentation

- [Product Requirements (docs/PRD.md)](./docs/PRD.md)
- [Design Document (docs/DESIGN.md)](./docs/DESIGN.md)
- [Technical Rules (docs/TECH-RULES.md)](./docs/TECH-RULES.md)

## License

MIT
