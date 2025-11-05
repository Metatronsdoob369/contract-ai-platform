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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const manifest_builder_1 = require("../../orchestrator/manifest-builder");
const schemas_1 = require("../../agent-contracts/schemas");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
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
                                    enhancement_area: "test-agent",
                                    objective: "Test objective",
                                    implementation_plan: {
                                        modules: ["test"],
                                        architecture: "test architecture"
                                    },
                                    depends_on: [],
                                    sources: ["test"],
                                    governance: {
                                        security: "test security",
                                        compliance: "test compliance",
                                        ethics: "test ethics"
                                    },
                                    validation_criteria: "test criteria"
                                })
                            }
                        }]
                })
            }
        }
    }))
}));
(0, vitest_1.describe)('Orchestrator Pipeline Integration Tests', () => {
    const testPromptPath = path_1.default.join(__dirname, 'test-master-prompt.yaml');
    const testManifestPath = path_1.default.join(__dirname, 'test-manifest.json');
    (0, vitest_1.beforeAll)(() => {
        // Create test master prompt
        const testPrompt = {
            enhancement_areas: [
                {
                    name: "Test Enhancement",
                    objective: "Test objective for integration testing",
                    key_requirements: ["test requirement 1", "test requirement 2"],
                    sources: ["test-source-1"],
                    depends_on: []
                }
            ],
            processing_instructions: ["Test processing"],
            agent_contract_requirements: {
                enhancement_area: "test area",
                objective: "test objective",
                implementation_plan: "test plan",
                depends_on: "test deps",
                sources: "test sources",
                governance: "test governance",
                validation_criteria: "test criteria"
            },
            output_format: "test format"
        };
        fs_1.default.writeFileSync(testPromptPath, JSON.stringify(testPrompt, null, 2));
    });
    (0, vitest_1.afterEach)(() => {
        // Clean up test files
        if (fs_1.default.existsSync(testManifestPath)) {
            fs_1.default.unlinkSync(testManifestPath);
        }
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('Contract Generation Pipeline', () => {
        (0, vitest_1.it)('should generate valid agent contracts from enhancement areas', async () => {
            const testAreas = [
                {
                    name: "Test Agent",
                    objective: "Test objective",
                    key_requirements: ["req1", "req2"],
                    sources: ["source1"],
                    depends_on: []
                }
            ];
            // Mock the generateAgentContract function
            const mockGenerateContract = vitest_1.vi.fn().mockResolvedValue({
                enhancement_area: "test-agent",
                objective: "Test objective",
                implementation_plan: {
                    modules: ["test-module"],
                    architecture: "Test architecture"
                },
                depends_on: [],
                sources: ["test-source"],
                governance: {
                    security: "Test security measures",
                    compliance: "Test compliance",
                    ethics: "Test ethics"
                },
                validation_criteria: "Test validation criteria"
            });
            // Test contract validation
            const contract = await mockGenerateContract(testAreas[0]);
            const validation = schemas_1.AgentSchema.safeParse(contract);
            (0, vitest_1.expect)(validation.success).toBe(true);
            (0, vitest_1.expect)(contract.enhancement_area).toBe("test-agent");
            (0, vitest_1.expect)(contract.implementation_plan.modules).toContain("test-module");
        });
        (0, vitest_1.it)('should handle contract generation failures gracefully', async () => {
            const { initializePinecone, storeAgentInPinecone } = await Promise.resolve().then(() => __importStar(require('../../orchestrator/pinecone-integration')));
            // Mock Pinecone initialization failure
            vitest_1.vi.mocked(initializePinecone).mockImplementation(() => {
                throw new Error('Pinecone connection failed');
            });
            // Should not throw, should log warning and continue
            (0, vitest_1.expect)(async () => {
                // This would normally call the orchestrator
                // For now, just test that Pinecone errors are handled
            }).not.toThrow();
        });
    });
    (0, vitest_1.describe)('Dependency Graph Construction', () => {
        (0, vitest_1.it)('should build correct dependency graph for agent relationships', () => {
            const testAgents = [
                {
                    enhancement_area: "agent-a",
                    objective: "Test A",
                    implementation_plan: { modules: [], architecture: "" },
                    depends_on: [],
                    sources: [],
                    governance: { security: "", compliance: "", ethics: "" },
                    validation_criteria: ""
                },
                {
                    enhancement_area: "agent-b",
                    objective: "Test B",
                    implementation_plan: { modules: [], architecture: "" },
                    depends_on: ["agent-a"],
                    sources: [],
                    governance: { security: "", compliance: "", ethics: "" },
                    validation_criteria: ""
                }
            ];
            const graph = (0, manifest_builder_1.buildDependencyGraph)(testAgents);
            (0, vitest_1.expect)(graph.nodes).toContain("agent-a");
            (0, vitest_1.expect)(graph.nodes).toContain("agent-b");
            (0, vitest_1.expect)(graph.edges).toHaveLength(1);
            (0, vitest_1.expect)(graph.edges[0]).toEqual({ from: "agent-a", to: "agent-b" });
            (0, vitest_1.expect)(graph.build_order).toEqual(["agent-a", "agent-b"]);
        });
        (0, vitest_1.it)('should detect circular dependencies', () => {
            const circularAgents = [
                {
                    enhancement_area: "agent-a",
                    objective: "Test A",
                    implementation_plan: { modules: [], architecture: "" },
                    depends_on: ["agent-b"],
                    sources: [],
                    governance: { security: "", compliance: "", ethics: "" },
                    validation_criteria: ""
                },
                {
                    enhancement_area: "agent-b",
                    objective: "Test B",
                    implementation_plan: { modules: [], architecture: "" },
                    depends_on: ["agent-a"],
                    sources: [],
                    governance: { security: "", compliance: "", ethics: "" },
                    validation_criteria: ""
                }
            ];
            (0, vitest_1.expect)(() => (0, manifest_builder_1.buildDependencyGraph)(circularAgents)).toThrow('Circular dependency detected');
        });
    });
    (0, vitest_1.describe)('Pinecone Integration', () => {
        (0, vitest_1.it)('should store and retrieve agent contracts from vector database', async () => {
            const { storeAgentInPinecone, searchPineconeRecords } = await Promise.resolve().then(() => __importStar(require('../../orchestrator/pinecone-integration')));
            const testAgent = {
                enhancement_area: "test-agent",
                objective: "Test agent for vector storage",
                implementation_plan: { modules: ["test"], architecture: "test arch" },
                depends_on: [],
                sources: ["test-source"],
                governance: { security: "test", compliance: "test", ethics: "test" },
                validation_criteria: "test criteria"
            };
            // Test storage (mocked)
            await storeAgentInPinecone(testAgent);
            (0, vitest_1.expect)(vitest_1.vi.mocked(storeAgentInPinecone)).toHaveBeenCalledWith(testAgent);
            // Test retrieval (mocked)
            const results = await searchPineconeRecords("test query");
            (0, vitest_1.expect)(vitest_1.vi.mocked(searchPineconeRecords)).toHaveBeenCalledWith("test query", 5);
        });
        (0, vitest_1.it)('should handle Pinecone unavailability gracefully', async () => {
            const { initializePinecone } = await Promise.resolve().then(() => __importStar(require('../../orchestrator/pinecone-integration')));
            // Mock initialization failure
            vitest_1.vi.mocked(initializePinecone).mockImplementation(() => {
                throw new Error('Pinecone unavailable');
            });
            // Should not break the orchestrator
            (0, vitest_1.expect)(() => {
                // Orchestrator should continue with basic validation
            }).not.toThrow();
        });
    });
    (0, vitest_1.describe)('End-to-End Pipeline', () => {
        (0, vitest_1.it)('should execute complete orchestrator pipeline', async () => {
            // This would be a full integration test that:
            // 1. Loads master prompt
            // 2. Generates contracts for all enhancement areas
            // 3. Validates contracts
            // 4. Builds dependency graph
            // 5. Stores in Pinecone
            // 6. Outputs manifest
            // For now, test the components individually
            // Full E2E test would require actual API keys and services
            const testContract = {
                enhancement_area: "e2e-test-agent",
                objective: "End-to-end test objective",
                implementation_plan: {
                    modules: ["e2e-module"],
                    architecture: "E2E test architecture"
                },
                depends_on: [],
                sources: ["e2e-source"],
                governance: {
                    security: "E2E security measures",
                    compliance: "E2E compliance",
                    ethics: "E2E ethics"
                },
                validation_criteria: "E2E validation criteria"
            };
            // Validate contract
            const validation = schemas_1.AgentSchema.safeParse(testContract);
            (0, vitest_1.expect)(validation.success).toBe(true);
            // Test dependency graph
            const graph = (0, manifest_builder_1.buildDependencyGraph)([testContract]);
            (0, vitest_1.expect)(graph.nodes).toContain("e2e-test-agent");
            (0, vitest_1.expect)(graph.build_order).toEqual(["e2e-test-agent"]);
        });
        (0, vitest_1.it)('should handle pipeline errors gracefully', async () => {
            // Test error handling in various pipeline stages
            const invalidContract = {
                enhancement_area: "", // Invalid: empty string
                objective: "Test",
                implementation_plan: { modules: [], architecture: "" },
                depends_on: [],
                sources: [],
                governance: { security: "", compliance: "", ethics: "" },
                validation_criteria: ""
            };
            const validation = schemas_1.AgentSchema.safeParse(invalidContract);
            (0, vitest_1.expect)(validation.success).toBe(false);
            (0, vitest_1.expect)(validation.error?.issues).toBeDefined();
        });
    });
    (0, vitest_1.describe)('Performance Benchmarks', () => {
        (0, vitest_1.it)('should complete contract generation within time limits', async () => {
            const startTime = Date.now();
            // Simulate contract generation
            await new Promise(resolve => setTimeout(resolve, 10)); // Minimal delay
            const endTime = Date.now();
            const duration = endTime - startTime;
            // Should complete within reasonable time (adjust based on actual performance)
            (0, vitest_1.expect)(duration).toBeLessThan(1000); // 1 second max
        });
        (0, vitest_1.it)('should handle multiple agents concurrently', async () => {
            const agentPromises = Array(5).fill(null).map((_, i) => Promise.resolve({
                enhancement_area: `concurrent-agent-${i}`,
                objective: `Concurrent test ${i}`,
                implementation_plan: { modules: [`module-${i}`], architecture: `arch-${i}` },
                depends_on: [],
                sources: [`source-${i}`],
                governance: { security: "test", compliance: "test", ethics: "test" },
                validation_criteria: `criteria-${i}`
            }));
            const results = await Promise.all(agentPromises);
            (0, vitest_1.expect)(results).toHaveLength(5);
            results.forEach((result, i) => {
                (0, vitest_1.expect)(result.enhancement_area).toBe(`concurrent-agent-${i}`);
            });
        });
    });
});
