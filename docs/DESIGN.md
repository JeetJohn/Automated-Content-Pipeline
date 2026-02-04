# Design Document

## Automated Content Creation System

**Version:** 1.0  
**Status:** Draft  
**Last Updated:** 2026-02-04

---

## 1. System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  (Web Interface / CLI / API Consumers)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway                             │
│  (Authentication / Rate Limiting / Request Routing)          │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        ▼                              ▼
┌─────────────────┐          ┌──────────────────┐
│  Job Queue      │          │  WebSocket       │
│  (Processing)   │          │  (Real-time      │
│                 │          │   Updates)       │
└────────┬────────┘          └────────┬─────────┘
         │                            │
         └────────────┬───────────────┘
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Core Processing Engine                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Ingestion   │  │Distillation │  │  Draft Generator    │  │
│  │   Service   │→ │   Service   │→ │     Service         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│         │                                    │               │
│         ▼                                    ▼               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Refinement & Context Engine              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │   │
│  │  │  Feedback   │  │   Context   │  │  Version    │   │   │
│  │  │  Processor  │  │    Store    │  │  Control    │   │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Project    │  │   Source    │  │   LLM Context       │  │
│  │   Store     │  │   Cache     │  │     Cache           │  │
│  │  (PostgreSQL)│  │   (Redis)   │  │   (Vector DB)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Component Design

### 2.1 Ingestion Service

**Responsibilities:**
- Accept multi-format input files
- Extract text and metadata
- Normalize content structure
- Store raw sources with provenance

**Data Flow:**
```
User Upload → Format Detection → Text Extraction → 
Metadata Parsing → Source Validation → Storage → 
Queue for Distillation
```

**Key Components:**
- File format adapters (PDF, DOCX, HTML, TXT)
- Web scraper for URLs
- Metadata extractor
- Source deduplication engine

---

### 2.2 Distillation Service

**Responsibilities:**
- Compress and summarize source materials
- Extract key themes, entities, facts
- Build knowledge graph of relationships
- Maintain source attribution

**Process Pipeline:**
```
Raw Sources → Chunking → Embedding → 
Semantic Clustering → Key Extraction → 
Theme Identification → Context Map Generation
```

**Key Components:**
- Text chunking engine
- Embedding generator
- Semantic similarity analyzer
- Fact extraction module
- Contradiction detector

---

### 2.3 Draft Generator

**Responsibilities:**
- Generate coherent narrative from distilled content
- Insert citations appropriately
- Structure content for target format
- Apply tone and style preferences

**Generation Flow:**
```
Context Map + User Preferences → 
Outline Generation → Section Drafting → 
Citation Insertion → Coherence Check → 
Quality Scoring → Output
```

**Key Components:**
- Outline generator
- Section writer
- Citation manager
- Coherence checker
- Quality evaluator

---

### 2.4 Refinement Engine

**Responsibilities:**
- Process user feedback
- Generate revision options
- Apply selected changes
- Track decision history
- Maintain narrative continuity

**Refinement Cycle:**
```
Current Draft + Feedback → 
Intent Analysis → Change Planning → 
Alternative Generation → User Selection → 
Application + History Logging
```

**Key Components:**
- Feedback parser
- Intent analyzer
- Change planner
- Alternative generator
- Decision tracker
- Rollback manager

---

### 2.5 Context Store

**Responsibilities:**
- Maintain project state across iterations
- Store user preferences and constraints
- Track rejected alternatives
- Enable intent preservation

**Data Model:**
```
Project Context:
├── User Preferences (tone, style, constraints)
├── Active Decisions (accepted changes + rationale)
├── Rejected Alternatives (for future reference)
├── Knowledge Graph (entities, relationships)
├── Source Attribution Map
└── Narrative Constraints (must-haves, must-avoids)
```

---

## 3. Data Models

### 3.1 Core Entities

#### Project
```
Project {
  id: UUID
  user_id: UUID
  title: String
  status: Enum [draft, refining, completed, archived]
  content_type: Enum [blog, article, report, summary]
  tone_preference: Enum [formal, casual, technical, persuasive]
  target_length: Integer
  created_at: Timestamp
  updated_at: Timestamp
  version_count: Integer
  current_version_id: UUID
}
```

#### Source
```
Source {
  id: UUID
  project_id: UUID
  source_type: Enum [file, url, note, transcript]
  original_path: String
  extracted_text: Text
  metadata: JSON {
    title: String
    author: String
    date: Date
    url: String
    file_type: String
    file_size: Integer
  }
  extracted_insights: Array<Insight>
  processing_status: Enum [pending, processing, completed, failed]
  created_at: Timestamp
}
```

#### Insight
```
Insight {
  id: UUID
  source_id: UUID
  content: Text
  insight_type: Enum [fact, quote, theme, statistic, claim]
  confidence_score: Float (0-1)
  embedding: Vector
  related_insights: Array<UUID>
  extracted_at: Timestamp
}
```

#### Draft
```
Draft {
  id: UUID
  project_id: UUID
  version_number: Integer
  content: Text
  outline: JSON
  citations: Array<Citation>
  quality_score: Float
  generation_time: Integer (seconds)
  created_at: Timestamp
  parent_draft_id: UUID (nullable)
}
```

#### Revision
```
Revision {
  id: UUID
  draft_id: UUID
  feedback: Text
  feedback_type: Enum [inline, general, structural, tone]
  change_summary: Text
  alternatives_generated: Integer
  alternative_selected: Integer
  intent_preserved: Boolean
  changes_applied: Array<Change>
  created_at: Timestamp
}
```

#### Change
```
Change {
  id: UUID
  revision_id: UUID
  change_type: Enum [add, remove, modify, reorder]
  location: JSON {start_line, end_line, section}
  before_state: Text
  after_state: Text
  rationale: Text
  user_approved: Boolean
  created_at: Timestamp
}
```

---

## 4. API Design

### 4.1 Core Endpoints

#### Projects
```
POST   /api/v1/projects              # Create new project
GET    /api/v1/projects              # List user projects
GET    /api/v1/projects/{id}         # Get project details
PUT    /api/v1/projects/{id}         # Update project settings
DELETE /api/v1/projects/{id}         # Delete project
```

#### Sources
```
POST   /api/v1/projects/{id}/sources              # Upload sources
GET    /api/v1/projects/{id}/sources              # List sources
GET    /api/v1/projects/{id}/sources/{source_id}  # Get source details
DELETE /api/v1/projects/{id}/sources/{source_id}  # Remove source
```

#### Drafts
```
POST   /api/v1/projects/{id}/drafts               # Generate initial draft
GET    /api/v1/projects/{id}/drafts               # List all drafts
GET    /api/v1/projects/{id}/drafts/{draft_id}   # Get specific draft
POST   /api/v1/projects/{id}/drafts/{draft_id}/refine  # Submit feedback & refine
```

#### Export
```
POST   /api/v1/projects/{id}/export               # Export final content
GET    /api/v1/projects/{id}/history              # Get revision history
GET    /api/v1/projects/{id}/decisions          # Get decision log
```

### 4.2 WebSocket Events

```
connect          → {project_id}                  # Join project room
source_progress  ← {source_id, progress, status}  # Source processing updates
draft_progress   ← {draft_id, stage, progress}    # Draft generation updates
refinement_ready ← {revision_id, alternatives}    # Refinement options ready
```

---

## 5. State Management

### 5.1 Project Lifecycle States

```
[CREATED] → [SOURCES_UPLOADING] → [DISTILLING] → 
[DRAFT_GENERATING] → [DRAFT_READY] → [REFINING] → 
[REFINEMENT_READY] → [ACCEPTED / REJECTED] → 
[COMPLETED] / [REFINING] (loop)
                    ↓
              [ARCHIVED]
```

### 5.2 Draft Version Tree

```
Draft v1.0
├── Draft v1.1 (refinement 1)
│   ├── Draft v1.1.1 (refinement 2 - accepted)
│   └── Draft v1.1.2 (alternative rejected)
├── Draft v1.2 (alternative refinement 1)
└── Draft v1.3 (alternative refinement 1)
    └── Draft v1.3.1 (refinement 2)
        └── Draft v1.3.1.1 (refinement 3 - FINAL)
```

---

## 6. Error Handling Strategy

### 6.1 Error Categories

| Category | Examples | Handling |
|----------|----------|----------|
| Input Errors | Invalid file format, corrupted PDF | Immediate user notification, retry guidance |
| Processing Errors | OCR failure, LLM timeout | Automatic retry (3x), fallback to alternative method |
| Content Errors | Contradictory sources, low confidence | Flag to user, request clarification |
| System Errors | Database connection, queue failure | Automatic recovery, admin alerting |

### 6.2 User-Facing Error Messages

- Clear, actionable language
- Suggest next steps
- Provide support contact for unrecoverable errors

---

## 7. Security Design

### 7.1 Authentication & Authorization

- JWT-based authentication
- Role-based access control (RBAC)
- API key support for programmatic access
- Session management with automatic expiration

### 7.2 Data Protection

- AES-256 encryption at rest
- TLS 1.3 for data in transit
- Source isolation per user/project
- Automatic PII detection and optional redaction

---

## 8. Scalability Considerations

### 8.1 Horizontal Scaling

- Stateless API servers (auto-scaling)
- Job queue for async processing
- Read replicas for database
- CDN for static assets

### 8.2 Performance Optimizations

- Caching: Source embeddings, common queries
- Batch processing for multiple sources
- Lazy loading for large projects
- Compression for long-term storage

---

## 9. Monitoring & Observability

### 9.1 Key Metrics

- Processing time per stage
- Draft quality scores
- User iteration counts
- Error rates by category
- LLM token usage and costs

### 9.2 Logging

- Structured JSON logs
- Correlation IDs across services
- User action audit trail
- Performance profiling

---

## 10. Deployment Architecture

### 10.1 Environment Strategy

```
Development → Staging → Production
     ↓            ↓          ↓
Local/CI    Integration    Live
```

### 10.2 Infrastructure

- Containerized services (Docker)
- Kubernetes for orchestration
- Managed PostgreSQL + Redis
- Vector database (Pinecone/Weaviate)
- Object storage (S3-compatible)

---

## 11. Appendix

### A. Technology Stack (See tech-rules.md)
### B. API Reference (See api-spec.yaml)
### C. Database Schema (See schema.sql)
