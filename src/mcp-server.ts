// mcp-server.ts - MCP server for social media knowledge access
import Fastify from "fastify";
import { z } from "zod";
import type { MetricDef, RateLimit, ComplianceRule, TrendSignal, InfluencerNode, PlatformId, MCPToolResponse } from "./knowledge.types";

const fastify = Fastify({ logger: true });

// ---- Zod guards with strict validation
const platformZ = z.enum(["twitter","instagram","tiktok","facebook","linkedin","youtube","threads","pinterest"]);
const metricsGetZ = z.object({ platform: platformZ, names: z.array(z.string()).optional() }).strict();
const metricsSearchZ = z.object({ query: z.string().min(2), platform: platformZ.optional() }).strict();
const rateLimitsListZ = z.object({ platform: platformZ }).strict();
const complianceListZ = z.object({ platform: z.union([platformZ, z.literal("global")]) }).strict();
const trendsTopZ = z.object({
  platform: platformZ,
  region: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20)
}).strict();
const influencersSearchZ = z.object({
  platform: platformZ,
  category: z.string().optional(),
  min_credibility: z.number().min(0).max(1).default(0.6)
}).strict();

// ---- Response envelope helper
const envelope = <T>(data: T, ttl: number = 900): MCPToolResponse<T> => ({
  data,
  cache_ttl_s: ttl,
  version: "1.0.0",
  sources: [] // TODO: Include sources from data
});

// ---- Error handler with typed errors
fastify.setErrorHandler((err, req, reply) => {
  const statusCode = err.validation ? 400 : 500;
  const errorType = err.validation ? "validation_error" : "internal_error";

  reply.status(statusCode).send({
    error: {
      type: errorType,
      message: err.message,
      ...(err.validation && { details: err.validation })
    }
  });
});

// ---- Authentication hook
fastify.addHook("onRequest", async (req, reply) => {
  // Skip auth for health endpoint
  if (req.url === "/health") return;

  const auth = req.headers["authorization"];
  if (!auth || !auth.toString().startsWith("Bearer ")) {
    return reply.code(401).send({
      error: { type: "unauthorized", message: "Missing or invalid bearer token" }
    });
  }

  // TODO: Verify HMAC or static token via environment
  const token = auth.toString().replace("Bearer ", "");
  const expectedToken = process.env.MCP_BEARER_TOKEN || "dev-token-12345";

  if (token !== expectedToken) {
    return reply.code(401).send({
      error: { type: "unauthorized", message: "Invalid bearer token" }
    });
  }
});

// ---- Rate limiting (simple in-memory for now)
const rateLimits = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMITS = {
  "metrics.get": { rpm: 120, window: 60 * 1000 },
  "metrics.search": { rpm: 120, window: 60 * 1000 },
  "rate_limits.list": { rpm: 60, window: 60 * 1000 },
  "compliance.list": { rpm: 60, window: 60 * 1000 },
  "trends.top": { rpm: 60, window: 60 * 1000 },
  "influencers.search": { rpm: 30, window: 60 * 1000 }
};

function checkRateLimit(toolName: string, clientId: string): boolean {
  const key = `${toolName}:${clientId}`;
  const now = Date.now();
  const limit = RATE_LIMITS[toolName as keyof typeof RATE_LIMITS];

  if (!limit) return true; // No limit defined

  const record = rateLimits.get(key);
  if (!record || now > record.resetTime) {
    rateLimits.set(key, { count: 1, resetTime: now + limit.window });
    return true;
  }

  if (record.count >= limit.rpm) {
    return false; // Rate limit exceeded
  }

  record.count++;
  return true;
}

// ---- Storage adapters (placeholder - replace with real implementations)
import { sampleMetrics, sampleRateLimits, sampleComplianceRules, sampleTrends, sampleInfluencers } from "./sample-data";

const sql = {
  metricsGet: async (platform: PlatformId, names?: string[]): Promise<MetricDef[]> => {
    // TODO: Implement SQL fetch with optional name filtering
    console.log(`📊 Fetching metrics for ${platform}${names ? ` with names: ${names.join(',')}` : ''}`);
    let results = sampleMetrics.filter(m => m.platform === platform);
    if (names && names.length > 0) {
      results = results.filter(m => names.includes(m.name));
    }
    return results;
  },
  rateLimitsList: async (platform: PlatformId): Promise<RateLimit[]> => {
    console.log(`⚡ Fetching rate limits for ${platform}`);
    return sampleRateLimits.filter(r => r.platform === platform);
  },
  complianceList: async (platformOrGlobal: PlatformId | "global"): Promise<ComplianceRule[]> => {
    console.log(`📋 Fetching compliance rules for ${platformOrGlobal}`);
    return sampleComplianceRules.filter(c => c.platform === platformOrGlobal);
  },
  trendsTop: async (platform: PlatformId, region?: string, limit: number = 20): Promise<TrendSignal[]> => {
    console.log(`📈 Fetching top ${limit} trends for ${platform}${region ? ` in ${region}` : ''}`);
    let results = sampleTrends.filter(t => t.platform === platform);
    return results.slice(0, limit);
  },
  influencersSearchByCategory: async (
    platform: PlatformId, category?: string, minCred: number = 0.6
  ): Promise<InfluencerNode[]> => {
    console.log(`👥 Searching influencers on ${platform}${category ? ` in ${category}` : ''} with min credibility ${minCred}`);
    let results = sampleInfluencers.filter(i => i.platform === platform && i.credibility_score >= minCred);
    if (category) {
      results = results.filter(i => i.categories.includes(category));
    }
    return results;
  },
};

// ---- Pinecone semantic search (placeholder)
async function metricSemanticSearch(query: string, platform?: PlatformId): Promise<MetricDef[]> {
  // TODO: Implement Pinecone vector search
  console.log(`🔍 Semantic search: "${query}"${platform ? ` on ${platform}` : ''}`);
  return [];
}

// ---- Chaos Engineering (Fault Injection)
function shouldInjectFault(toolName: string, query?: any): boolean {
  const faultFlag = query?.fail;
  if (!faultFlag) return false;

  // Only inject faults in staging/development
  if (process.env.NODE_ENV === 'production') return false;

  switch (faultFlag) {
    case 'pc_timeout':
      return toolName === 'metrics.search'; // Simulate Pinecone timeout
    case 'db_timeout':
      return ['metrics.get', 'rate_limits.list'].includes(toolName); // Simulate DB timeout
    case 'random_5xx':
      return Math.random() < 0.1; // 10% chance of random 5xx
    default:
      return false;
  }
}

async function injectFault(faultType: string): Promise<never> {
  switch (faultType) {
    case 'pc_timeout':
      await new Promise(resolve => setTimeout(resolve, 31000)); // > 30s timeout
      throw new Error('Pinecone timeout');
    case 'db_timeout':
      await new Promise(resolve => setTimeout(resolve, 31000)); // > 30s timeout
      throw new Error('Database timeout');
    case 'random_5xx':
      throw new Error('Random service failure');
    default:
      throw new Error('Unknown fault injection');
  }
}

// ---- MCP Tool Routes (read-only, validated, rate-limited, chaos-ready)
fastify.post("/tools/metrics.get", async (req, reply) => {
  // Rate limiting
  if (!checkRateLimit("metrics.get", req.ip)) {
    return reply.code(429).send({
      error: { type: "rate_limited", message: "Rate limit exceeded", retry_after_s: 60 }
    });
  }

  const { platform, names } = metricsGetZ.parse(req.body);
  const data = await sql.metricsGet(platform, names);
  const response = envelope(data, 3600); // 1 hour

  reply.header("Cache-Control", "public, max-age=300, stale-while-revalidate=120");
  return reply.send(response);
});

fastify.post("/tools/metrics.search", async (req, reply) => {
  // Chaos Engineering: Fault injection
  if (shouldInjectFault("metrics.search", req.body)) {
    await injectFault(req.body.fail);
  }

  // Rate limiting
  if (!checkRateLimit("metrics.search", req.ip)) {
    return reply.code(429).send({
      error: { type: "rate_limited", message: "Rate limit exceeded", retry_after_s: 60 }
    });
  }

  const { query, platform } = metricsSearchZ.parse(req.body);
  const data = await metricSemanticSearch(query, platform);
  const response = envelope(data, 900); // 15 minutes

  reply.header("Cache-Control", "public, max-age=300, stale-while-revalidate=120");
  return reply.send(response);
});

fastify.post("/tools/rate_limits.list", async (req, reply) => {
  // Rate limiting
  if (!checkRateLimit("rate_limits.list", req.ip)) {
    return reply.code(429).send({
      error: { type: "rate_limited", message: "Rate limit exceeded", retry_after_s: 60 }
    });
  }

  const { platform } = rateLimitsListZ.parse(req.body);
  const data = await sql.rateLimitsList(platform);
  const response = envelope(data, 86400); // 24 hours

  reply.header("Cache-Control", "public, max-age=3600, stale-while-revalidate=7200");
  return reply.send(response);
});

fastify.post("/tools/compliance.list", async (req, reply) => {
  // Rate limiting
  if (!checkRateLimit("compliance.list", req.ip)) {
    return reply.code(429).send({
      error: { type: "rate_limited", message: "Rate limit exceeded", retry_after_s: 60 }
    });
  }

  const { platform } = complianceListZ.parse(req.body);
  const data = await sql.complianceList(platform);
  const response = envelope(data, 604800); // 7 days

  reply.header("Cache-Control", "public, max-age=86400, stale-while-revalidate=43200");
  return reply.send(response);
});

fastify.post("/tools/trends.top", async (req, reply) => {
  // Rate limiting
  if (!checkRateLimit("trends.top", req.ip)) {
    return reply.code(429).send({
      error: { type: "rate_limited", message: "Rate limit exceeded", retry_after_s: 60 }
    });
  }

  const body = trendsTopZ.parse(req.body);
  const data = await sql.trendsTop(body.platform, body.region, body.limit);
  const response = envelope(data, 300); // 5 minutes

  reply.header("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
  return reply.send(response);
});

fastify.post("/tools/influencers.search", async (req, reply) => {
  // Rate limiting
  if (!checkRateLimit("influencers.search", req.ip)) {
    return reply.code(429).send({
      error: { type: "rate_limited", message: "Rate limit exceeded", retry_after_s: 60 }
    });
  }

  const body = influencersSearchZ.parse(req.body);
  const data = await sql.influencersSearchByCategory(body.platform, body.category, body.min_credibility);
  const response = envelope(data, 3600); // 1 hour

  reply.header("Cache-Control", "public, max-age=300, stale-while-revalidate=120");
  return reply.send(response);
});

// Health check (no auth required)
fastify.get("/health", async (req, reply) => {
  return reply.send({
    status: "healthy",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    features: ["metrics", "rate_limits", "compliance", "trends", "influencers"]
  });
});

// Start server
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 8080;
    const host = process.env.HOST || "0.0.0.0";
    await fastify.listen({ port, host });
    console.log(`🚀 Social Media Knowledge MCP Server running on http://${host}:${port}`);
    console.log(`🔐 Bearer token required for all endpoints except /health`);
    console.log(`📊 Rate limiting enabled per tool`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
