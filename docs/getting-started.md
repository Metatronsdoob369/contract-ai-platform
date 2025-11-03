# Getting Started

Welcome to the Contract-Driven AI Platform! This guide will get you up and running in 5 minutes.

## Prerequisites

- **Node.js 22+** - Required runtime
- **OpenAI API Key** - For LLM capabilities
- **Pinecone API Key** - Optional, for vector storage features

## Installation

```bash
# Install the platform
npm install @yourorg/contract-ai-platform

# Or clone the repository for development
git clone https://github.com/yourorg/contract-ai-platform.git
cd contract-ai-platform
npm install
```

## Environment Setup

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Configure API keys in `.env`:**
   ```bash
   OPENAI_API_KEY=your_openai_key_here
   PINECONE_API_KEY=your_pinecone_key_here  # Optional
   ```

3. **Test configuration:**
   ```bash
   npm run test:env
   ```

## Your First Contract

Let's build a simple social media management system:

```typescript
import { BuilderAgent } from '@yourorg/contract-ai-platform';

async function main() {
  const builder = new BuilderAgent();

  const requirement = {
    description: "Build a social media content calendar system",
    scale: 'mvp' as const,
    domain: 'social-media'
  };

  console.log('🚀 Building your system...');
  const manifest = await builder.build(requirement);

  console.log('✅ System built successfully!');
  console.log('📋 Project ID:', manifest.projectId);
  console.log('🏗️ Architecture:', manifest.architecture.pattern);
  console.log('🤖 Generated contracts:', manifest.contracts.length);
}

main().catch(console.error);
```

**Expected Output:**
```
🚀 Building your system...
📝 Phase 0: Enhancing prompt into Phase-1 Analysis Contract...
🔍 Detecting domain independently...
⚖️ Policy Engine evaluating routing decision...
🤖 Orchestrating agent: social-media-agent
✅ Enterprise Build Complete! Manifest generated for: build-123456
🏗️ Architecture: microservices
🤖 Agent Used: social-media-agent
📋 Audited Decision: High-confidence social media domain detected
```

## Understanding the Output

The platform generates a complete **Build Manifest** containing:

- **Enhancement Areas**: Modular requirements broken down
- **System Architecture**: Optimal technical design
- **Agent Contracts**: Detailed implementation specifications
- **Code Artifacts**: Generated frontend, backend, and infrastructure code
- **Deployment Config**: Production-ready deployment specifications

## Orchestrating Existing Contracts

Use the policy-authoritative orchestrator for existing YAML configurations:

```typescript
import { PolicyAuthoritativeOrchestrator } from '@yourorg/contract-ai-platform';

async function orchestrate() {
  const orchestrator = new PolicyAuthoritativeOrchestrator();

  // Load from YAML file
  const contracts = await orchestrator.orchestrateFromClientPrompt(
    "Create an audience segmentation system with psychographic analysis"
  );

  console.log(`Generated ${contracts.length} validated contracts`);

  // View audit trail
  const auditTrail = orchestrator.getAuditTrail();
  console.log('📊 Decisions made:', auditTrail.length);
}

orchestrate();
```

## Next Steps

1. **Explore Examples**: Check `examples/` directory for working code
2. **Read Concepts**: Understand [contracts](concepts/contracts.md) and [policies](concepts/policies.md)
3. **Build Custom Agents**: Follow the [agent creation guide](guides/creating-domain-agents.md)
4. **Deploy to Production**: See the [deployment guide](../DEPLOYMENT_GUIDE.md)

## Troubleshooting

### Common Issues

**"OpenAI API Key not found"**
- Ensure `OPENAI_API_KEY` is set in `.env`
- Check API key validity at [OpenAI Platform](https://platform.openai.com/api-keys)

**"Pinecone connection failed"**
- Pinecone is optional - remove `PINECONE_API_KEY` to disable vector features
- Verify API key at [Pinecone Console](https://www.pinecone.io/)

**"Build timeout"**
- Complex requirements may take time
- Check system resources and network connectivity
- Use smaller `scale` setting for faster builds

### Getting Help

- **GitHub Issues**: Report bugs and request features
- **Discussions**: Ask questions and share ideas
- **Documentation**: Comprehensive guides in this `docs/` directory

## What's Next?

Now that you have a working system, explore:

- [Core Concepts](concepts/) - Understand the platform deeply
- [Guides](guides/) - Step-by-step tutorials
- [API Reference](api/) - Complete technical documentation
- [Examples](../examples/) - Working code samples

Welcome to the future of AI orchestration! 🎉