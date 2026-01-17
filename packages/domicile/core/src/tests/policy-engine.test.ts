// src/orchestration/tests/policy-engine.test.ts
import { describe, it, expect } from 'vitest';
import { PolicyEngine } from '../policy-engine';
import { AgentMeta } from '../agent-registry';

describe('PolicyEngine', () => {
  it('routes to HUMAN when domain is sensitive and no compliance', () => {
    const input = {
      domainResult: { domain: 'healthcare', confidence: 0.9 },
      agents:,
      phase1: { analysis: { nonFunctional: {} } }
    } as any;
    const decision = PolicyEngine.decide(input);
    expect(decision.route).toBe('HUMAN');
  });

  it('routes to AGENT when trustScore >= threshold', () => {
    const input = {
      domainResult: { domain: 'social-media', confidence: 0.9 },
      agents:,
      phase1: { analysis: { nonFunctional: {} } }
    } as any;
    const decision = PolicyEngine.decide(input);
    expect(decision.route).toBe('AGENT');
    expect(decision.agentId).toBe('qsv2');
  });

  it('falls back to LLM when top agent trust below threshold', () => {
    const input = {
      domainResult: { domain: 'social-media', confidence: 0.9 },
      agents:,
      phase1: {}
    } as any;
    const decision = PolicyEngine.decide(input);
    expect(decision.route).toBe('LLM');
  });
});