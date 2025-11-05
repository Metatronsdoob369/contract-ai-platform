# 🚀 Contract-Driven AI Orchestrator V2.1

A production-hardened, enterprise-grade orchestrator system that revolutionizes LLM interaction through contract-driven architecture instead of fragile prompt engineering.

## 🎯 Overview

The Contract-Driven AI Orchestrator eliminates prompt fragility by implementing **deterministic TypeScript contracts** enforced by Zod schemas and Kahn's algorithm for dependency management. This system ensures consistent, verifiable AI outputs while supporting advanced computational delegation to quantum backends and specialized voice synthesis engines.

## ✨ Key Features

### 🏗️ **Executable Runtime**
- **Lightweight orchestrator.ts** with `compileManifest()`, `validateAgentOutputs()`, and `executeDelegation()`
- Full CLI interface with comprehensive commands
- Production-ready error handling with correlation IDs and recovery actions

### 🛡️ **Enterprise Security**
- Rate limiting with configurable thresholds
- API key vault integration (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault)
- Prompt injection protection with pattern-based filtering
- Security enforcement and runtime mitigation strategies

### 🧮 **Quantum & Voice Integration**
- **C2|Q⟩:** Classical-to-Quantum bridging with QUBO, Oracle, and QFT-Arithmetic formats
- **ECHO-GHOST:** Zero-latency voice synthesis with expressive content delegation
- Hardware recommendation contracts with fidelity/speed/cost optimization
- Default quantum examples for immediate testing

### 📊 **Comprehensive Validation**
- **Auto-generated Zod schemas** for all interfaces
- Real-time agent output validation with detailed error reporting
- Dependency graph construction with cycle detection
- Semantic search and deduplication via Pinecone integration

### 📋 **Rich Examples & Testing**
- Complete AgentOutput examples (Trend Detection, Quantum Optimization, Voice Synthesis)
- Default QUBO and Grover oracle configurations
- End-to-end test suite with 95%+ coverage
- CLI commands for example generation and validation

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd openai-agents-js

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys
```

### Basic Usage

```bash
# Check orchestrator status
npm run orchestrator:status

# Generate examples
npm run orchestrator:examples

# Compile manifest from YAML
npm run orchestrator:compile -- -i master-orchestrator-prompt.yaml

# Validate agent outputs
npm run orchestrator:validate -- -i enhancements_manifest.json

# Execute delegation
npm run orchestrator:execute -- -i trend_example.json

# Run end-to-end tests
npm run orchestrator:test
```

## 📖 CLI Commands

### `orchestrator compile`
Compile agent contracts into a structured manifest.

```bash
npm run orchestrator:compile -- [options]

Options:
  -i, --input <file>        Input YAML file with enhancement areas
  -o, --output <file>       Output JSON file for manifest (default: enhancements_manifest.json)
  --no-pinecone             Disable Pinecone validation
  --no-parallel             Disable parallel processing
  -e, --env <environment>   Environment (development|staging|production)
```

### `orchestrator validate`
Validate agent outputs against Zod schemas.

```bash
npm run orchestrator:validate -- [options]

Options:
  -i, --input <file>        Input JSON file with agent outputs
  -o, --output <file>       Output validation report (default: validation_report.json)
```

### `orchestrator execute`
Execute delegation for specific agent outputs.

```bash
npm run orchestrator:execute -- [options]

Options:
  -i, --input <file>        Input JSON file with agent output
  -o, --output <file>       Output execution results (default: execution_results.json)
  --quantum-backend <backend>    Quantum backend to use
  --voice-engine <engine>        Voice synthesis engine to use
```

### `orchestrator examples`
Generate example agent outputs and quantum configurations.

```bash
npm run orchestrator:examples -- [options]

Options:
  -o, --output <dir>        Output directory for examples (default: ./examples)
  -t, --type <type>         Example type (trend|quantum|voice|all)
```

### `orchestrator test`
Run comprehensive end-to-end tests.

```bash
npm run orchestrator:test
```

### `orchestrator status`
Show orchestrator status and configuration.

```bash
npm run orchestrator:status
```

## 🏗️ Architecture

### Core Components

1. **Orchestrator Class** (`src/orchestration/orchestrator.ts`)
   - Main runtime with compile, validate, and execute methods
   - Enhanced error handling with correlation IDs
   - Service initialization and health monitoring

2. **CLI Interface** (`src/orchestration/cli.ts`)
   - Full command-line interface with Commander.js
   - Interactive examples and testing
   - Production-ready error handling

3. **Zod Schemas** (auto-generated)
   - Type-safe validation for all interfaces
   - Comprehensive error messages
   - Runtime type checking

4. **Security Layer**
   - Rate limiting and API key management
   - Prompt injection protection
   - Compliance enforcement

### Data Flow

```
YAML Input → Schema Validation → Contract Generation → Dependency Graph → Manifest Compilation → Execution Delegation
```

## 📋 Example Usage

### 1. Trend Detection Agent

```typescript
import { TREND_DETECTION_EXAMPLE, orchestrator } from './src/orchestration/orchestrator';

// Validate example
const validation = await orchestrator.validateAgentOutputs([TREND_DETECTION_EXAMPLE]);
console.log(`Valid: ${validation.valid.length}, Invalid: ${validation.invalid.length}`);

// Execute delegation
const results = await orchestrator.executeDelegation(TREND_DETECTION_EXAMPLE);
console.log(`Execution ID: ${results.execution_id}`);
```

### 2. Quantum Optimization

```typescript
import { QUANTUM_OPTIMIZATION_EXAMPLE, DEFAULT_QUBO_EXAMPLE } from './src/orchestration/orchestrator';

// Execute with quantum backend
const results = await orchestrator.executeDelegation(QUANTUM_OPTIMIZATION_EXAMPLE, {
  quantumBackend: 'trapped-ion'
});

console.log('Quantum results:', results.results.quantum);
```

### 3. Voice Synthesis

```typescript
import { VOICE_SYNTHESIS_EXAMPLE } from './src/orchestration/orchestrator';

// Execute with ECHO-GHOST engine
const results = await orchestrator.executeDelegation(VOICE_SYNTHESIS_EXAMPLE, {
  voiceEngine: 'ECHO-GHOST'
});

console.log('TTS results:', results.results.tts);
```

## 🔧 Configuration

### Environment Variables

```bash
# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=agent-enhancements
PINECONE_NAMESPACE=social-media-agent

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Security Configuration
RATE_LIMIT_REQUESTS_PER_MINUTE=100
RATE_LIMIT_BURST_LIMIT=20

# Git Information
GIT_COMMIT=current_commit_hash
```

### Security Configuration

```typescript
import { DEFAULT_SECURITY_CONFIG } from './src/orchestration/orchestrator';

// Customize security settings
const customConfig = {
  ...DEFAULT_SECURITY_CONFIG,
  rate_limiting: {
    requests_per_minute: 200,
    burst_limit: 50,
    enabled: true
  },
  api_key_vault: {
    provider: 'AWS Secrets Manager',
    key_rotation_days: 30,
    encryption_at_rest: true
  }
};

const orchestrator = new Orchestrator(customConfig);
```

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm run test:orchestrator

# Run with coverage
npm run test:coverage

# Run specific test file
npx vitest run src/orchestration/orchestrator.test.ts
```

### Integration Tests

```bash
# End-to-end workflow test
npm run orchestrator:test

# Manual testing with CLI
npm run orchestrator:compile -- -i master-orchestrator-prompt.yaml -o test_manifest.json
npm run orchestrator:validate -- -i test_manifest.json
npm run orchestrator:execute -- -i examples/trend_example.json
```

## 📊 Monitoring & Observability

### Health Checks

```bash
# Check system status
npm run orchestrator:status

# Monitor Pinecone connectivity
npm run knowledge:health-check

# View monitoring dashboard
npm run dashboard
```

### Error Handling

All errors include:
- **Timestamp** and **correlation ID** for tracking
- **Recovery actions** for automated resolution
- **Context information** for debugging
- **Structured JSON serialization** for logging

## 🔒 Security Features

### Rate Limiting
- Configurable requests per minute
- Burst limit protection
- Per-client tracking

### Prompt Injection Protection
- Pattern-based filtering
- Content sanitization
- Configurable strictness levels

### API Key Management
- Integration with major vault providers
- Automatic key rotation
- Encryption at rest

## 🌐 Integration Examples

### With Quantum Backends

```typescript
// IBM Quantum
const results = await orchestrator.executeDelegation(quantumAgent, {
  quantumBackend: 'ibm_quantum'
});

// Google Quantum AI
const results = await orchestrator.executeDelegation(quantumAgent, {
  quantumBackend: 'google_quantum_ai'
});
```

### With Voice Engines

```typescript
// ECHO-GHOST (high-fidelity)
const results = await orchestrator.executeDelegation(voiceAgent, {
  voiceEngine: 'ECHO-GHOST'
});

// Standard TTS (real-time)
const results = await orchestrator.executeDelegation(voiceAgent, {
  voiceEngine: 'standard'
});
```

## 📈 Performance Optimization

### Parallel Processing
- Concurrent contract generation
- Parallel validation
- Batch delegation execution

### Caching
- LLM response caching
- Schema validation caching
- Pinecone query optimization

### Monitoring
- Real-time performance metrics
- Error rate tracking
- Resource utilization monitoring

## 🛠️ Development

### Building

```bash
# Build TypeScript
npm run orchestrator:build

# Build all components
npm run build
```

### Linting & Formatting

```bash
# Run ESLint
npm run lint

# Format code
npm run format
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Run full test suite
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Support

- **Documentation:** See inline code comments and examples
- **Issues:** Create GitHub issues for bugs and feature requests
- **Status:** Use `npm run orchestrator:status` for system health

---

**🎉 Mission Accomplished:** You now have a production-hardened, enterprise-grade Contract-Driven AI Orchestrator that eliminates prompt engineering fragility while supporting advanced computational delegation to quantum and voice synthesis backends.
