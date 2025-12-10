"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManifestBuilder = void 0;
const policy_engine_1 = require("./policy-engine");
const agent_adapter_1 = require("./agent-adapter");
class ManifestBuilder {
    registry;
    detector;
    audit;
    llmFallback;
    constructor(registry, detector, audit, llmFallback) {
        this.registry = registry;
        this.detector = detector;
        this.audit = audit;
        this.llmFallback = llmFallback;
    }
    buildPromptFromArea(area) {
        const name = area.name || 'Enhancement Area';
        const objective = area.objective || area.description || 'Optimize';
        const reqs = (area.keyRequirements || area.requirements || []).join('; ');
        const constraints = (area.constraints || []).join('; ');
        return `
Enhancement Area: ${name}
Objective: ${objective}
Key Requirements: ${reqs || 'none specified'}
Constraints: ${constraints || 'none specified'}
Please produce an EnhancedSocialMediaPlan including platform/postType/contentSpec/hashtags/algorithmTips/expectedEngagement/confidenceScore.
`.trim();
    }
    async generateAgentContract(area, phase1) {
        // 1) domain detect
        const domainRes = this.detector.classify(phase1.requirement || area.name || '');
        await this.audit.log('domain_detect', { phase1Requirement: phase1.requirement, domainRes });
        // 2) candidate agents
        const candidates = this.registry.listByDomain(domainRes.domain);
        await this.audit.log('candidates', { domain: domainRes.domain, candidates });
        // 3) policy decision
        const decision = policy_engine_1.PolicyEngine.decide({ domainResult: domainRes, agents: candidates, phase1 });
        await this.audit.log('policy_decision', { decision });
        if (decision.route === 'HUMAN') {
            await this.audit.log('action', { msg: 'escalate: human review required' });
            return { route: 'HUMAN' };
        }
        if (decision.route === 'LLM') {
            await this.audit.log('action', { msg: 'LLM fallback chosen' });
            if (!this.llmFallback)
                throw new Error('LLM fallback not configured');
            const llmContract = await this.llmFallback(area);
            await this.audit.log('persist', { method: 'llm', contractSummary: llmContract?.type || 'LLMResult' });
            return { route: 'LLM', contract: llmContract };
        }
        // AGENT path
        const agentMeta = this.registry.get(decision.agentId);
        if (!agentMeta) {
            await this.audit.log('error', { msg: 'agent missing in registry', agentId: decision.agentId });
            if (this.llmFallback) {
                const llmContract = await this.llmFallback(area);
                return { route: 'LLM', contract: llmContract };
            }
            throw new Error('Agent not found');
        }
        // instantiate adapter for known agents
        let adapter;
        if (agentMeta.agentId === 'quantum-social-v2') {
            adapter = new agent_adapter_1.QuantumSocialAdapter(null, 'orchestrator-system');
        }
        else {
            throw new Error(`No adapter implemented for agent ${agentMeta.agentId}`);
        }
        const prompt = this.buildPromptFromArea(area);
        try {
            const { plan, confidence } = await adapter.generatePlan(prompt, phase1);
            await this.audit.log('agent_result', { agentId: agentMeta.agentId, confidence, planSummary: { platform: plan.platform, postType: plan.postType } });
            if (adapter.validate) {
                const v = await adapter.validate(plan);
                if (!v.valid) {
                    await this.audit.log('validation_failed', { issues: v.issues });
                    if (this.llmFallback) {
                        const llmContract = await this.llmFallback(area);
                        return { route: 'LLM', contract: llmContract };
                    }
                    return { route: 'AGENT', agentId: agentMeta.agentId, plan, validation: v, note: 'agent provided invalid plan' };
                }
            }
            await this.audit.log('persist', { method: 'agent', agentId: agentMeta.agentId });
            return { route: 'AGENT', agentId: agentMeta.agentId, plan, confidence };
        }
        catch (err) {
            await this.audit.log('agent_error', { agentId: agentMeta.agentId, error: String(err) });
            if (this.llmFallback) {
                const llmContract = await this.llmFallback(area);
                return { route: 'LLM', contract: llmContract, fallbackError: String(err) };
            }
            throw err;
        }
    }
}
exports.ManifestBuilder = ManifestBuilder;
