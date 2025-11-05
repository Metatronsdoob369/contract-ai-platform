# Contract-Driven Multi-Agent Architecture

```mermaid
graph TB
    %% Input Sources
    subgraph "Input Sources"
        PROMPT[Master Orchestrator Prompt<br/>📋 Defines agent areas & contracts]
        LLM[LLM Agents<br/>🤖 GPT-4, Claude, etc.]
        DATA[Historical Data<br/>📊 Past manifests & Pinecone]
    end

    %% Template System
    subgraph "Template System"
        TEMPLATES[Agent Templates<br/>📝 Per-area prompt templates<br/>in /agent-contracts/templates/]
        SCHEMA[Contract Schema<br/>📋 Zod validation schemas<br/>in /agent-contracts/schemas.ts]
    end

    %% Agent Generation
    subgraph "Agent Generation"
        SPAWN[Spawn Agents<br/>🧬 One per enhancement area]
        OUTPUT[Generate JSON<br/>📤 Strict contract compliance<br/>JSON-only responses]
    end

    %% Validation Pipeline
    subgraph "Validation Pipeline"
        RECEIVE[Receive Agent JSON<br/>📥 Raw LLM outputs]
        VALIDATE[Validate Contracts<br/>✅ Zod schema validation<br/>scripts/validate-agent.ts]
        PRECHECK[Pre-validate vs History<br/>🔍 Pinecone semantic search<br/>Duplicate detection]
    end

    %% Orchestrator Core
    subgraph "Orchestrator Core"
        COLLECT[Collect Valid Agents<br/>📚 Build agent array]
        DAG[Build Dependency Graph<br/>🔗 Topological sort<br/>Cycle detection]
        ROADMAP[Generate Roadmap<br/>🗺️ Build order + status]
        MANIFEST[Create Manifest<br/>📋 enhancements_manifest.json]
    end

    %% Pinecone Integration
    subgraph "Pinecone Integration"
        STORE[Store in Pinecone<br/>💾 Vector embeddings<br/>agent-enhancements index]
        SEARCH[Semantic Search<br/>🔎 Query historical work<br/>scripts/search-enhancements.ts]
        METADATA[Rich Metadata<br/>📊 Full contract storage<br/>Timestamped history]
    end

    %% Outputs & Consumption
    subgraph "Outputs & Consumption"
        JSON_OUT[JSON Manifest<br/>📄 Dependency-ordered roadmap]
        CODEGEN[Code Generation<br/>🏗️ Auto-generate modules<br/>/src/extensions/]
        CI_CD[CI/CD Integration<br/>⚙️ Build pipeline hooks]
        ARTIFACTS[Generated Artifacts<br/>📦 Stubs, tests, docs]
    end

    %% Flow Connections
    PROMPT --> TEMPLATES
    TEMPLATES --> SCHEMA
    SCHEMA --> SPAWN
    SPAWN --> LLM
    LLM --> OUTPUT
    OUTPUT --> RECEIVE

    RECEIVE --> VALIDATE
    VALIDATE --> PRECHECK
    PRECHECK --> STORE
    PRECHECK --> COLLECT

    COLLECT --> DAG
    DAG --> ROADMAP
    ROADMAP --> MANIFEST

    STORE --> SEARCH
    SEARCH --> DATA
    DATA --> PRECHECK

    MANIFEST --> JSON_OUT
    JSON_OUT --> CODEGEN
    CODEGEN --> ARTIFACTS
    ARTIFACTS --> CI_CD

    %% Styling
    classDef inputClass fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef processClass fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef validationClass fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef coreClass fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef storageClass fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef outputClass fill:#fff8e1,stroke:#f57f17,stroke-width:2px

    class PROMPT,LLM,DATA inputClass
    class TEMPLATES,SCHEMA,SPAWN,OUTPUT processClass
    class RECEIVE,VALIDATE,PRECHECK validationClass
    class COLLECT,DAG,ROADMAP,MANIFEST coreClass
    class STORE,SEARCH,METADATA storageClass
    class JSON_OUT,CODEGEN,CI_CD,ARTIFACTS outputClass
```

## Architecture Overview

This diagram shows the **Contract-Driven Multi-Agent System** with Pinecone integration:

### 🔄 **Core Flow**
1. **Master Prompt** → Defines agent areas and contract requirements
2. **Template System** → Provides structured prompts per enhancement area
3. **Agent Generation** → LLMs spawn one agent per area, outputting strict JSON
4. **Validation Pipeline** → Zod schema validation + semantic duplicate checking
5. **Orchestrator Core** → Builds dependency graph and creates manifest
6. **Pinecone Storage** → Stores all processed agents for future reference
7. **Code Generation** → Consumes manifest to auto-generate implementation stubs

### 🎯 **Key Features**
- **JSON-Only Discipline**: Agents return machine-readable contracts only
- **Semantic Validation**: Pinecone prevents duplicate work via vector search
- **DAG Integrity**: Topological sorting ensures dependency order
- **Self-Learning**: Historical data improves future validations
- **MCP Integration**: Clean Pinecone connectivity via Model Context Protocol

### 📊 **Data Flow**
- **Input**: Enhancement areas, historical data, LLM responses
- **Processing**: Validation, deduplication, dependency resolution
- **Storage**: Vector embeddings with rich metadata
- **Output**: Ordered manifest, generated code artifacts

### 🔧 **Entry Points**
- `pnpm validate` → Contract validation
- `pnpm orchestrate` → Full pipeline with Pinecone
- `pnpm search-enhancements` → Query historical work
- `pnpm setup-pinecone` → Initialize vector database
