# Agent Usage Patterns & Best Practices
# Last Updated: 2025-10-23
# Owner: Agent Development Team

## Core Principles

### Deterministic Reads (Preferred)
When you know the specific field names, always prefer `metrics.get(platform, names)` over search:

```typescript
// ✅ GOOD: Deterministic, fast, cached
const metrics = await client.getMetrics('twitter', ['engagement_rate', 'reach']);

// ❌ AVOID: Expensive, variable latency, less reliable
const results = await client.searchMetrics('engagement rate formula', 'twitter');
```

### Cache Etiquette
- Honor `cache_ttl_s` from responses
- Add jitter (±10%) to refresh timing
- Don't hammer the API with unnecessary requests

```typescript
// ✅ GOOD: Respect cache TTL with jitter
const cacheKey = `metrics:${platform}:${names.join(',')}`;
if (!isExpired(cache[cacheKey], response.cache_ttl_s)) {
  return cache[cacheKey];
}

// ❌ AVOID: Immediate refresh on expiration
if (Date.now() > cache[cacheKey].expiresAt) {
  return await fetchFresh();
}
```

### Retry Budget
Exponential backoff only on `429` (rate limit) or `503` (service unavailable):
- Base delay: 100ms
- Max delay: 1600ms (1.6s)
- Max attempts: 4
- **Never retry on 4xx** (client errors are permanent)

```typescript
async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let attempt = 0;
  while (attempt < 4) {
    try {
      return await fn();
    } catch (error) {
      if (error.status >= 400 && error.status < 500) {
        throw error; // Don't retry client errors
      }
      if (attempt === 3) throw error;

      const delay = Math.min(100 * Math.pow(1.6, attempt), 1600);
      const jitter = delay * 0.1 * (Math.random() - 0.5);
      await sleep(delay + jitter);
      attempt++;
    }
  }
}
```

## Pattern: Batch Operations

### Multi-Metric Fetch
```typescript
// ✅ GOOD: Single request for multiple metrics
const metrics = await client.getMetrics('twitter', [
  'engagement_rate',
  'impressions',
  'click_through_rate',
  'conversion_rate'
]);
```

### Platform-Aware Queries
```typescript
// ✅ GOOD: Platform-specific logic
const platforms = ['twitter', 'instagram', 'tiktok'];
const results = await Promise.all(
  platforms.map(platform =>
    client.getRateLimits(platform).catch(() => null) // Graceful degradation
  )
);
```

## Pattern: Circuit Breaker Integration

```typescript
class KnowledgeCircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private readonly threshold = 5;
  private readonly timeout = 60000; // 1 minute

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error('Circuit breaker is OPEN');
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private isOpen(): boolean {
    return this.failures >= this.threshold &&
           Date.now() - this.lastFailureTime < this.timeout;
  }

  private onSuccess(): void {
    this.failures = 0;
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
  }
}
```

## Pattern: Fallback Strategies

### Cache-First with Fallback
```typescript
async function getMetricsWithFallback(platform: string, names: string[]) {
  // Try cache first
  const cached = await getFromCache(`metrics:${platform}:${names.join(',')}`);
  if (cached && !isExpired(cached)) {
    return cached;
  }

  // Try primary API
  try {
    return await client.getMetrics(platform, names);
  } catch (error) {
    // Fallback to local defaults or degraded mode
    console.warn(`Failed to fetch ${platform} metrics, using defaults`);
    return getDefaultMetrics(platform, names);
  }
}
```

### Graceful Degradation
```typescript
async function analyzePost(post: Post, useKnowledge = true) {
  if (!useKnowledge) {
    return basicAnalysis(post); // Simple heuristics only
  }

  try {
    const metrics = await client.getMetrics(post.platform, ['engagement_rate']);
    return enhancedAnalysis(post, metrics);
  } catch (error) {
    // Log but don't fail - use basic analysis
    console.warn('Knowledge layer unavailable, falling back to basic analysis');
    return basicAnalysis(post);
  }
}
```

## Pattern: Bulk Operations for Training

```typescript
async function buildTrainingDataset(platforms: string[]) {
  const dataset = [];

  for (const platform of platforms) {
    // Get all metrics for platform
    const metrics = await client.getMetrics(platform);

    // Get compliance rules
    const compliance = await client.getComplianceRules(platform);

    // Build training examples
    for (const metric of metrics) {
      dataset.push({
        instruction: `Explain the ${metric.name} metric on ${platform}`,
        input: { platform, metric: metric.name },
        output: {
          definition: metric.definition,
          formula: metric.formula,
          unit: metric.unit,
          compliance_notes: compliance.filter(c =>
            c.description.toLowerCase().includes(metric.name.toLowerCase())
          )
        },
        sources: metric.sources
      });
    }
  }

  return dataset;
}
```

## Anti-Patterns to Avoid

### ❌ Don't Hammer the API
```typescript
// ❌ BAD: Individual requests in a loop
for (const metric of metricNames) {
  const result = await client.getMetrics(platform, [metric]); // N requests!
}

// ✅ GOOD: Single batched request
const results = await client.getMetrics(platform, metricNames);
```

### ❌ Don't Ignore Errors
```typescript
// ❌ BAD: Silent failures
try {
  const data = await client.searchMetrics(query);
  return processData(data);
} catch (error) {
  return null; // Agents get confused by null responses
}

// ✅ GOOD: Explicit error handling
try {
  const data = await client.searchMetrics(query);
  return processData(data);
} catch (error) {
  if (error.status === 429) {
    return { error: 'rate_limited', retry_after: error.retry_after_s };
  }
  throw new Error(`Knowledge query failed: ${error.message}`);
}
```

### ❌ Don't Cache Aggressively
```typescript
// ❌ BAD: Cache everything forever
const cache = new Map();
if (cache.has(key)) return cache.get(key);

// ✅ GOOD: Respect TTL with jitter
const cached = cache.get(key);
if (cached && Date.now() < cached.expiresAt) {
  return cached.data;
}
```

## Monitoring & Observability

### Agent-Side Metrics
```typescript
class KnowledgeClientWithMetrics extends SocialKnowledgeClient {
  async getMetrics(platform: string, names?: string[]) {
    const start = Date.now();
    try {
      const result = await super.getMetrics(platform, names);
      this.recordLatency('getMetrics', Date.now() - start);
      this.recordSuccess('getMetrics');
      return result;
    } catch (error) {
      this.recordError('getMetrics', error);
      throw error;
    }
  }

  private recordLatency(operation: string, ms: number) {
    // Send to your metrics system
    console.log(`knowledge.${operation}.latency:${ms}|ms`);
  }

  private recordSuccess(operation: string) {
    console.log(`knowledge.${operation}.success:1|c`);
  }

  private recordError(operation: string, error: any) {
    console.log(`knowledge.${operation}.error:1|c`);
  }
}
```

### Cache Hit Ratios
Track cache effectiveness:
```typescript
const cacheStats = {
  hits: 0,
  misses: 0,
  get hitRatio() { return this.hits / (this.hits + this.misses); }
};

// Log every 100 requests
if ((cacheStats.hits + cacheStats.misses) % 100 === 0) {
  console.log(`knowledge.cache.hit_ratio:${cacheStats.hitRatio}`);
}
```

## Integration with Agent Frameworks

### CrewAI Integration
```typescript
import { Task, Agent } from 'crewai';
import { SocialKnowledgeClient } from '@your-org/knowledge-client';

const knowledgeClient = new SocialKnowledgeClient();

const researchTask = Task.create({
  name: 'social_media_research',
  description: 'Research current social media metrics and compliance rules',
  agent: researcherAgent,
  async execute() {
    const [metrics, compliance] = await Promise.all([
      knowledgeClient.getMetrics('twitter'),
      knowledgeClient.getComplianceRules('global')
    ]);

    return {
      metrics,
      compliance,
      timestamp: new Date().toISOString(),
      sources: [...metrics.flatMap(m => m.sources), ...compliance.flatMap(c => c.references)]
    };
  }
});
```

This ensures your agents are **knowledge-powered** rather than **guesswork-powered**.
