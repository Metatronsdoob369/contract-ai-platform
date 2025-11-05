# Environment Setup Guide

This guide covers setting up the required environment variables for the OpenAI Agents SDK, with special focus on the contract-driven orchestrator for philosophy transformation.

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your API keys:**
   ```bash
   # Edit .env with your actual keys
   nano .env
   ```

3. **Verify setup:**
   ```bash
   node -e "console.log('OPENAI_KEY:', !!process.env.OPENAI_API_KEY, 'PINECONE_KEY:', !!process.env.PINECONE_API_KEY)"
   ```

## Required Environment Variables

### OPENAI_API_KEY (Required)
- **Purpose**: Powers the LLM for agent contract generation and embeddings
- **Get it**: https://platform.openai.com/api-keys
- **Usage**: Contract generation, semantic search embeddings
- **Impact if missing**: Orchestrator will throw error and exit

### PINECONE_API_KEY (Optional but Recommended)
- **Purpose**: Vector database for knowledge deduplication and retrieval
- **Get it**: https://www.pinecone.io/
- **Usage**: Prevents duplicate agent contracts, stores research findings
- **Impact if missing**: Graceful fallback to basic validation only

## Philosophy Transformation Setup

For transforming the core philosophy directory from semantic rhetoric to data-backed content:

### 1. OpenAI Configuration
```bash
# Required for all LLM operations
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4  # Recommended for complex research tasks
```

### 2. Pinecone Configuration (Recommended)
```bash
# Prevents duplicate research across philosophy files
PINECONE_API_KEY=your-pinecone-key-here
PINECONE_INDEX=philosophy-transformations  # Custom index for this project
PINECONE_NAMESPACE=awakening-protocol      # Namespace for philosophy work
```

### 3. Environment-Specific Settings
```bash
NODE_ENV=development
LOG_LEVEL=info
DEBUG=true  # Enable for troubleshooting agent generation
```

## Environment File Structure

```bash
# .env (your actual keys - NEVER commit)
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...

# .env.example (template - safe to commit)
OPENAI_API_KEY=sk-your-openai-api-key-here
PINECONE_API_KEY=your-pinecone-api-key-here
```

## Validation Commands

### Test OpenAI Connection
```bash
node -e "
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
openai.models.list().then(() => console.log('✅ OpenAI connected')).catch(console.error);
"
```

### Test Pinecone Connection
```bash
node -e "
const { Pinecone } = require('@pinecone-database/pinecone');
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
pinecone.listIndexes().then(() => console.log('✅ Pinecone connected')).catch(console.error);
"
```

### Full Environment Test
```bash
npm run test:env  # Add this script to package.json
```

## Security Best Practices

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Use environment-specific keys** - Different keys for dev/staging/prod
3. **Rotate keys regularly** - Especially for production deployments
4. **Monitor usage** - Set up billing alerts on OpenAI/Pinecone dashboards
5. **Use secret management** - Consider tools like Vault for production

## Troubleshooting

### "OPENAI_API_KEY environment variable is required"
- Check `.env` file exists and is properly formatted
- Verify key starts with `sk-`
- Ensure no extra spaces or quotes

### Pinecone features disabled
- This is normal if `PINECONE_API_KEY` is not set
- Orchestrator will work but without knowledge deduplication
- Add the key to enable full functionality

### Embedding generation fails
- OpenAI key might be invalid or expired
- Check OpenAI dashboard for key status
- Verify sufficient credits/quota

## Production Deployment

For production philosophy transformation:

1. **Use production API keys** with higher rate limits
2. **Set up monitoring** for API usage and costs
3. **Configure proper logging** and error handling
4. **Use environment-specific configurations**
5. **Set up automated key rotation**

## Cost Estimation

### OpenAI Costs (per philosophy file transformation):
- Contract generation: ~$0.01-0.05 per file
- Embedding generation: ~$0.0001 per search/query
- Total per file: ~$0.02-0.06

### Pinecone Costs:
- Storage: ~$0.10/month per 1M vectors
- Queries: Very low cost (~$0.001 per 100 queries)

### Total estimated cost for full philosophy transformation:
- 20 files × $0.04 = ~$0.80 (one-time research cost)
- Monthly maintenance: <$0.50