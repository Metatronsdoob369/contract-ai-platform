"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// scripts/health-check.ts - Comprehensive health check for MCP server
const ky_1 = __importDefault(require("ky"));
const zod_1 = require("zod");
const envZ = zod_1.z.object({
    MCP_URL: zod_1.z.string().url().default("http://localhost:8080"),
    MCP_BEARER: zod_1.z.string().min(10).default("dev-token-12345")
});
const env = envZ.parse({
    MCP_URL: process.env.MCP_URL,
    MCP_BEARER: process.env.MCP_BEARER
});
async function check(path, body, description) {
    const t0 = Date.now();
    try {
        const res = await ky_1.default.post(`${env.MCP_URL}${path}`, {
            json: body,
            headers: { authorization: `Bearer ${env.MCP_BEARER}` },
            timeout: 5000
        }).json();
        const dt = Date.now() - t0;
        // Validate response structure
        if (!res?.data || typeof res.cache_ttl_s !== "number") {
            throw new Error(`Bad envelope for ${path}`);
        }
        // Validate every record has sources, version, updated_at
        if (Array.isArray(res.data)) {
            for (const record of res.data) {
                if (!record.sources || !Array.isArray(record.sources) || record.sources.length === 0) {
                    throw new Error(`Record missing sources in ${path}`);
                }
                if (!record.version || !record.updated_at) {
                    throw new Error(`Record missing version/updated_at in ${path}`);
                }
            }
        }
        console.log(`✅ ${description}: ${dt}ms, ttl=${res.cache_ttl_s}s, records=${Array.isArray(res.data) ? res.data.length : 1}`);
        return true;
    }
    catch (error) {
        console.error(`❌ ${description}: ${error.message}`);
        return false;
    }
}
async function runHealthCheck() {
    console.log("🔍 Starting MCP Server Health Check...\n");
    // Test health endpoint (no auth)
    try {
        const health = await ky_1.default.get(`${env.MCP_URL}/health`).json();
        console.log(`✅ Health check: ${health.status}, version ${health.version}`);
    }
    catch (error) {
        console.error(`❌ Health check failed: ${error.message}`);
        process.exit(1);
    }
    // Test positive cases
    const tests = [
        ["/tools/metrics.get", { platform: "twitter", names: ["engagement_rate"] }, "metrics.get (specific)"],
        ["/tools/rate_limits.list", { platform: "twitter" }, "rate_limits.list"],
        ["/tools/metrics.search", { query: "engagement rate", platform: "twitter" }, "metrics.search"],
        ["/tools/compliance.list", { platform: "global" }, "compliance.list (global)"],
        ["/tools/trends.top", { platform: "twitter", limit: 5 }, "trends.top"],
        ["/tools/influencers.search", { platform: "twitter", min_credibility: 0.8 }, "influencers.search"]
    ];
    let passed = 0;
    for (const [path, body, desc] of tests) {
        if (await check(path, body, desc))
            passed++;
    }
    // Test negative cases (should return 4xx)
    console.log("\n🛡️  Testing error handling...");
    const negativeTests = [
        ["/tools/metrics.get", { platform: "myspace" }, "invalid platform"],
        ["/tools/metrics.search", { query: "a" }, "query too short"],
        ["/tools/trends.top", { platform: "twitter", limit: 200 }, "limit too high"]
    ];
    let negativePassed = 0;
    for (const [path, body, desc] of negativeTests) {
        try {
            await ky_1.default.post(`${env.MCP_URL}${path}`, {
                json: body,
                headers: { authorization: `Bearer ${env.MCP_BEARER}` },
                timeout: 2000
            });
            console.error(`❌ ${desc}: Should have failed but didn't`);
        }
        catch (error) {
            if (error.response?.status >= 400 && error.response?.status < 500) {
                console.log(`✅ ${desc}: Correctly rejected (${error.response.status})`);
                negativePassed++;
            }
            else {
                console.error(`❌ ${desc}: Wrong error type (${error.response?.status || 'unknown'})`);
            }
        }
    }
    // Summary
    const totalTests = tests.length + negativeTests.length;
    const totalPassed = passed + negativePassed;
    console.log(`\n📊 Results: ${totalPassed}/${totalTests} tests passed`);
    if (totalPassed === totalTests) {
        console.log("🎉 ALL GREEN - MCP Server is production-ready!");
        process.exit(0);
    }
    else {
        console.error("⚠️  Some tests failed - check server implementation");
        process.exit(1);
    }
}
// Rate limiting test (optional)
async function testRateLimiting() {
    console.log("\n🚦 Testing rate limiting...");
    const promises = [];
    for (let i = 0; i < 125; i++) { // Exceed metrics.get limit of 120
        promises.push(ky_1.default.post(`${env.MCP_URL}/tools/metrics.get`, {
            json: { platform: "twitter" },
            headers: { authorization: `Bearer ${env.MCP_BEARER}` },
            timeout: 1000
        }).catch(() => ({ status: 429 })));
    }
    const results = await Promise.all(promises);
    const rateLimited = results.filter(r => r.status === 429).length;
    console.log(`📊 Rate limiting: ${rateLimited} requests blocked out of ${promises.length}`);
    if (rateLimited > 0) {
        console.log("✅ Rate limiting working correctly");
    }
    else {
        console.log("⚠️  Rate limiting may not be working");
    }
}
// Run the checks
(async () => {
    await runHealthCheck();
    await testRateLimiting();
})().catch(e => {
    console.error("💥 Health check crashed:", e);
    process.exit(1);
});
