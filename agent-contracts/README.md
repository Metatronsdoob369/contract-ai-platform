# Contract-Driven Multi-Agent System

This folder contains the core components of the **Contract-Driven Multi-Agent System** for orchestrating agent enhancements.

## 📁 Folder Structure

```
agent-contracts/
├── docs/
│   └── architecture-diagram.md    # Complete system architecture
├── schemas.ts                     # Zod validation schemas
├── templates/                     # Per-agent prompt templates
└── examples/                      # Sample valid agent outputs
```

## 🎯 System Overview

This system implements a **JSON-only contract discipline** where specialized agents return machine-readable enhancement specifications that get validated, merged, and automatically processed into implementation artifacts.

### Key Features:
- **Strict JSON Contracts**: Agents return structured data only (no prose)
- **Schema Validation**: Zod schemas ensure contract compliance
- **Semantic Deduplication**: Pinecone prevents redundant work
- **Dependency Resolution**: Topological sorting for build order
- **Auto-Generation**: Code stubs, tests, and documentation from manifests

## 🚀 Quick Start

1. **Define Enhancement Areas** in templates (see `/templates/`)
2. **Generate Agent Contracts** using LLM prompts
3. **Validate Contracts**: `pnpm validate path/to/agent.json`
4. **Run Orchestrator**: `pnpm orchestrate *.json`
5. **Search History**: `pnpm search-enhancements "query"`

## 📋 Architecture

See [`docs/architecture-diagram.md`](./docs/architecture-diagram.md) for the complete system flow diagram.

### Core Flow:
1. **Prompt Templates** → Structured agent generation
2. **JSON Validation** → Schema compliance + semantic uniqueness
3. **DAG Construction** → Dependency resolution + build ordering
4. **Manifest Generation** → Machine-readable roadmap
5. **Pinecone Storage** → Historical learning + search
6. **Code Generation** → Automatic implementation stubs

## 🔧 Development

### Adding New Enhancement Areas:
1. Create template in `/templates/[area].md`
2. Add to schema if needed
3. Generate agent contract via LLM
4. Validate and orchestrate

### Schema Updates:
- Modify `schemas.ts` with new fields
- Update validation logic
- Regenerate existing contracts if breaking changes

## 📚 References

- **Master Prompt**: See project root for the orchestrator prompt
- **Pinecone Integration**: Vector storage for semantic search
- **Manifest Format**: `enhancements_manifest.json` specification
- **Code Generation**: `/scripts/codegen/` for implementation stubs

## 🤝 Contributing

When adding new agent contracts:
- Follow the JSON-only discipline
- Include all required security/governance/ops sections
- Test validation with `pnpm validate`
- Ensure dependencies are correctly specified
