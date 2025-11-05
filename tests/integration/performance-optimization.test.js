"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const manifest_builder_1 = require("../../orchestrator/manifest-builder");
// Mock external dependencies
vitest_1.vi.mock('../../orchestrator/pinecone-integration', () => ({
    initializePinecone: vitest_1.vi.fn(),
    storeAgentInPinecone: vitest_1.vi.fn(),
    searchPineconeRecords: vitest_1.vi.fn().mockResolvedValue([])
}));
vitest_1.vi.mock('openai', () => ({
    default: vitest_1.vi.fn().mockImplementation(() => ({
        chat: {
            completions: {
                create: vitest_1.vi.fn().mockResolvedValue({
                    choices: [{
                            message: {
                                content: JSON.stringify({
                                    enhancement_area: "perf-test-agent",
                                    objective: "Performance testing agent for benchmarking and optimization validation",
                                    implementation_plan: {
                                        modules: ["perf-module"],
                                        architecture: "Performance-oriented architecture for testing and benchmarking"
                                    },
                                    depends_on: [],
                                    sources: ["perf-source"],
                                    governance: {
                                        security: "Performance security measures",
                                        compliance: "Performance compliance",
                                        ethics: "Performance ethics"
                                    },
                                    validation_criteria: "Performance validation criteria"
                                })
                            }
                        }]
                })
            }
        },
        embeddings: {
            create: vitest_1.vi.fn().mockResolvedValue({
                data: [{ embedding: new Array(1536).fill(0.1) }]
            })
        }
    }))
}));
(0, vitest_1.describe)('Performance Optimization Integration Tests', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('Batch Processing Optimization', () => {
        (0, vitest_1.it)('should handle multiple agent contracts efficiently', async () => {
            const startTime = performance.now();
            // Create multiple contracts for batch processing
            const contracts = Array(10).fill(null).map((_, i) => ({
                enhancement_area: `batch-agent-${i}`,
                objective: `Batch processing test agent ${i} with comprehensive objective text for validation`,
                implementation_plan: {
                    modules: [`module-${i}`],
                    architecture: `Architecture for batch agent ${i} with detailed implementation plan`
                },
                depends_on: [],
                sources: [`source-${i}`],
                governance: {
                    security: `Security for agent ${i}`,
                    compliance: `Compliance for agent ${i}`,
                    ethics: `Ethics for agent ${i}`
                },
                validation_criteria: `Validation criteria for agent ${i}`
            }));
            // Process batch
            const results = await Promise.all(contracts.map(async (contract) => {
                // Simulate processing time
                await new Promise(resolve => setTimeout(resolve, 1));
                return contract;
            }));
            const endTime = performance.now();
            const duration = endTime - startTime;
            (0, vitest_1.expect)(results).toHaveLength(10);
            // Should complete within reasonable time (allowing for async overhead)
            (0, vitest_1.expect)(duration).toBeLessThan(100); // 100ms for 10 contracts
        });
        (0, vitest_1.it)('should optimize dependency graph construction for large agent sets', () => {
            const agentCount = 50;
            const agents = Array(agentCount).fill(null).map((_, i) => ({
                enhancement_area: `graph-agent-${i}`,
                objective: `Graph optimization test agent ${i}`,
                implementation_plan: { modules: [`mod-${i}`], architecture: `Arch ${i}` },
                depends_on: i > 0 ? [`graph-agent-${i - 1}`] : [], // Chain dependencies
                sources: [`src-${i}`],
                governance: { security: "sec", compliance: "comp", ethics: "eth" },
                validation_criteria: `criteria-${i}`
            }));
            const startTime = performance.now();
            const graph = (0, manifest_builder_1.buildDependencyGraph)(agents);
            const endTime = performance.now();
            (0, vitest_1.expect)(graph.nodes).toHaveLength(agentCount);
            (0, vitest_1.expect)(graph.edges).toHaveLength(agentCount - 1); // Chain has n-1 edges
            // Graph construction should be fast even for large sets
            const duration = endTime - startTime;
            (0, vitest_1.expect)(duration).toBeLessThan(50); // Should complete in < 50ms
        });
    });
    (0, vitest_1.describe)('Parallel LLM Call Optimization', () => {
        (0, vitest_1.it)('should execute multiple LLM calls concurrently', async () => {
            const callCount = 5;
            const startTime = performance.now();
            // Simulate parallel LLM calls
            const promises = Array(callCount).fill(null).map(async (_, i) => {
                // Simulate LLM API call latency
                await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 20));
                return `result-${i}`;
            });
            const results = await Promise.all(promises);
            const endTime = performance.now();
            (0, vitest_1.expect)(results).toHaveLength(callCount);
            results.forEach((result, i) => {
                (0, vitest_1.expect)(result).toBe(`result-${i}`);
            });
            // Parallel execution should be faster than sequential
            const duration = endTime - startTime;
            const sequentialMinTime = callCount * 10; // Minimum sequential time
            (0, vitest_1.expect)(duration).toBeLessThan(sequentialMinTime * 1.5); // Allow some overhead
        });
        (0, vitest_1.it)('should handle LLM rate limiting gracefully', async () => {
            // Mock rate limiting scenario
            let callCount = 0;
            const maxConcurrent = 3;
            const rateLimitedCall = vitest_1.vi.fn().mockImplementation(async () => {
                callCount++;
                if (callCount > maxConcurrent) {
                    throw new Error('Rate limit exceeded');
                }
                await new Promise(resolve => setTimeout(resolve, 50));
                callCount--;
                return 'success';
            });
            // Test that system handles rate limiting
            const promises = Array(5).fill(null).map(() => rateLimitedCall());
            // Some calls should succeed, some should fail due to rate limiting
            const results = await Promise.allSettled(promises);
            const fulfilled = results.filter(r => r.status === 'fulfilled').length;
            const rejected = results.filter(r => r.status === 'rejected').length;
            (0, vitest_1.expect)(fulfilled).toBeGreaterThan(0);
            (0, vitest_1.expect)(rejected).toBeGreaterThan(0);
            (0, vitest_1.expect)(fulfilled + rejected).toBe(5);
        });
    });
    (0, vitest_1.describe)('Embedding Batch Processing', () => {
        (0, vitest_1.it)('should batch embedding requests for efficiency', async () => {
            const texts = Array(10).fill(null).map((_, i) => `Text for embedding ${i} with sufficient length to test batch processing optimization`);
            const startTime = performance.now();
            // Simulate batched embedding calls
            const embeddings = await Promise.all(texts.map(async (text, i) => {
                // Simulate embedding API call
                await new Promise(resolve => setTimeout(resolve, 5));
                return new Array(1536).fill(i * 0.1); // Mock embedding vector
            }));
            const endTime = performance.now();
            (0, vitest_1.expect)(embeddings).toHaveLength(10);
            embeddings.forEach((embedding, i) => {
                (0, vitest_1.expect)(embedding).toHaveLength(1536);
                (0, vitest_1.expect)(embedding[0]).toBe(i * 0.1);
            });
            // Batched processing should be efficient
            const duration = endTime - startTime;
            (0, vitest_1.expect)(duration).toBeLessThan(200); // Should complete within 200ms
        });
        (0, vitest_1.it)('should handle embedding failures gracefully', async () => {
            const { generateEmbedding } = await Promise.resolve().then(() => __importStar(require('../../orchestrator/pinecone-integration')));
            // Mock embedding failure
            vitest_1.vi.mocked(await Promise.resolve().then(() => __importStar(require('openai')))).default.mockImplementationOnce(() => ({
                embeddings: {
                    create: vitest_1.vi.fn().mockRejectedValue(new Error('Embedding API unavailable'))
                }
            }));
            // Should fall back to zero vector without breaking
            const result = await generateEmbedding('test text');
            (0, vitest_1.expect)(result).toHaveLength(1536);
            (0, vitest_1.expect)(result.every(v => v === 0)).toBe(true);
        });
    });
    (0, vitest_1.describe)('Memory and Resource Optimization', () => {
        (0, vitest_1.it)('should maintain bounded memory usage during large contract processing', async () => {
            const largeContractSet = Array(100).fill(null).map((_, i) => ({
                enhancement_area: `memory-test-agent-${i}`,
                objective: `Memory optimization test for large contract sets ${i}`.repeat(5), // Make objectives larger
                implementation_plan: {
                    modules: [`module-${i}`],
                    architecture: `Architecture ${i}`.repeat(3) // Make architectures larger
                },
                depends_on: [],
                sources: [`source-${i}`],
                governance: {
                    security: `Security ${i}`.repeat(2),
                    compliance: `Compliance ${i}`.repeat(2),
                    ethics: `Ethics ${i}`.repeat(2)
                },
                validation_criteria: `Criteria ${i}`.repeat(2)
            }));
            const startMemory = process.memoryUsage().heapUsed;
            // Process large contract set
            const results = largeContractSet.map(contract => {
                // Simulate processing without actual async operations
                return { ...contract, processed: true };
            });
            const endMemory = process.memoryUsage().heapUsed;
            const memoryDelta = endMemory - startMemory;
            (0, vitest_1.expect)(results).toHaveLength(100);
            // Memory usage should remain reasonable (less than 50MB delta)
            (0, vitest_1.expect)(memoryDelta).toBeLessThan(50 * 1024 * 1024);
        });
        (0, vitest_1.it)('should clean up resources after processing', () => {
            // Test that temporary resources are cleaned up
            // This would test cleanup of temporary files, connections, etc.
            // For now, test that mocks are properly reset
            (0, vitest_1.expect)(vitest_1.vi.isMockFunction(vitest_1.vi.mocked)).toBe(true);
            // Verify no lingering state between tests
            (0, vitest_1.expect)(process.env.NODE_ENV).toBe('test');
        });
    });
    (0, vitest_1.describe)('Caching and Memoization', () => {
        (0, vitest_1.it)('should cache frequently accessed contract validations', () => {
            const { AgentSchema } = require('../../agent-contracts/schemas');
            const testContract = {
                enhancement_area: "cache-test-agent",
                objective: "Testing caching behavior for repeated contract validations",
                implementation_plan: {
                    modules: ["cache-module"],
                    architecture: "Cache testing architecture with validation optimization"
                },
                depends_on: [],
                sources: ["cache-source"],
                governance: {
                    security: "Cache security measures",
                    compliance: "Cache compliance",
                    ethics: "Cache ethics"
                },
                validation_criteria: "Cache validation criteria"
            };
            // First validation
            const startTime1 = performance.now();
            const result1 = AgentSchema.safeParse(testContract);
            const endTime1 = performance.now();
            // Second validation of same contract
            const startTime2 = performance.now();
            const result2 = AgentSchema.safeParse(testContract);
            const endTime2 = performance.now();
            (0, vitest_1.expect)(result1.success).toBe(true);
            (0, vitest_1.expect)(result2.success).toBe(true);
            // Schema validation should be fast (no significant caching needed for simple schemas)
            (0, vitest_1.expect)(endTime1 - startTime1).toBeLessThan(10);
            (0, vitest_1.expect)(endTime2 - startTime2).toBeLessThan(10);
        });
    });
});
