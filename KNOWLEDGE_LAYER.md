# Social Media Knowledge Access Layer

This is a hardened, hybrid knowledge access layer providing agents with authoritative social media intelligence through MCP servers and fine-tuning datasets.

## 🏗️ Architecture

```
User Requirements → Orchestrator → Agent Contracts → Knowledge Layer
                                                          ↓
[MCP Server] ← Agents (Runtime Queries)    [Train-Pack] → Fine-tuning
     ↓                                              ↓
Pinecone (Semantic)                     JSONL Dataset (Long-horizon)
SQL (Authoritative)
```

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Run MCP Server:**
   ```bash
   pnpm mcp:dev
   ```

3. **Test connection:**
   ```bash
   pnpm knowledge:health-check
   ```

4. **Build train-pack:**
   ```bash
   pnpm knowledge:build-trainpack
   ```

## 📚 MCP Tool Catalog

All tools return structured data with provenance, versioning, and cache hints.

### Metrics Tools
- `metrics.get({ platform, names? })` → Get specific metrics by name
- `metrics.search({ query, platform? })` → Semantic search across metrics

### Platform Tools
- `rate_limits.list({ platform })` → Get API rate limits
- `compliance.list({ platform | "global" })` → Get compliance rules

### Intelligence Tools
- `trends.top({ platform, region?, limit })` → Get trending topics
- `influencers.search({ platform, category?, min_credibility? })` → Find influencers

## 🔧 Agent Integration

```typescript
import { getMetrics, searchMetrics } from './src/knowledge.client';

// In your agent code:
const twitterMetrics = await getMetrics('twitter', ['engagement_rate', 'reach']);
const searchResults = await searchMetrics('sentiment analysis', 'twitter');
```

## 📋 Data Sources

Currently configured for:
- SproutSocial metrics guide
- Databox analytics reports
- Kaggle datasets
- Academic research papers
- Platform API documentation

## 🔒 Security & Governance

- **Input validation:** Zod schemas on all endpoints
- **Rate limiting:** Per-tool limits with circuit breakers
- **Provenance:** Every response includes sources and versions
- **PII stripping:** No personal data in knowledge base
- **Read-only:** All operations are safe for agents

## ✅ Acceptance Criteria

- [x] MCP server starts and responds to health checks
- [x] All tool endpoints validate input and return typed responses
- [x] Train-pack generates valid JSONL with citations
- [x] Agent client can query and cache responses
- [x] Schema validation passes for all data types
- [x] Strict Zod validation with .strict() on all inputs
- [x] Bearer token authentication implemented
- [x] Rate limiting per tool (120-30 rpm based on endpoint)
- [x] Proper error envelopes with typed error responses
- [x] Sample data populated for testing
- [x] Cache-Control headers for proxy/CDN compatibility

## 🎯 Next Steps

1. **Populate knowledge base** with your social media research
2. **Implement storage adapters** (SQL + Pinecone)
3. **Add semantic embeddings** for advanced search
4. **Integrate with agent orchestrator** (depends_on: "Knowledge MCP Server")
5. **Deploy production MCP server** with monitoring

This layer transforms your social media expertise into agent-accessible intelligence, enabling truly knowledgeable social media agents instead of hardcoded heuristics.
