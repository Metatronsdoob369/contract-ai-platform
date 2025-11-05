"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/orchestration/test-orch.ts
const orchestrator_sample_1 = require("./orchestrator-sample");
// Simple LLM fallback stub
async function llmFallback(area) {
    return { type: 'LLMPlan', payload: { stub: true, areaName: area.name } };
}
(async () => {
    const phase1 = {
        requirement: 'Promote a coffee product on social channels and sell subscriptions',
        analysis: {
            domain: 'social-media',
            complexity: 'mvp',
            capabilities: ['product_catalog', 'subscription', 'payment_processing'],
            nonFunctional: { compliance: ['GDPR'] }
        }
    };
    await (0, orchestrator_sample_1.sampleOrchestratorRun)(phase1, llmFallback);
})();
