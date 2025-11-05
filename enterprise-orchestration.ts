/**
 * Enterprise Agent Orchestration Architecture
 * Based on LLM Training Data Payload for A-MEM, Multi-Agent Integration, and Robust Safety Measures
 */

import { z } from 'zod';
import { Agent, run } from '@openai/agents';

// =============================================================================
// CORE GOVERNANCE COMPONENTS (From Training Data)
// =============================================================================

// --- Phase-1 Analysis Contract (Deterministic Specification) ---
export interface Phase1AnalysisContract {
  requirement: string;
  domain: string;
  complexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
  challenges: string[];
  capabilities: string[];
  complianceRequirements: string[];
  estimatedEffort: string;
  confidence: number;
}

// --- Policy Engine (Neutral Decision Authority) ---
export interface PolicyDecision {
  route: 'AGENT' | 'LLM' | 'HUMAN';
  agentId?: string;
  explanation: string;
  confidence: number;
  policyRulesApplied: string[];
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    reasons: string[];
  };
}

export class PolicyEngine {
  private rules: Map<string, any> = new Map();

  constructor() {
    this.initializeRules();
  }

  private initializeRules() {
    // Domain-specific routing rules
    this.rules.set('healthcare', {
      requiresCompliance: ['HIPAA', 'GDPR'],
      minTrustScore: 0.9,
      humanReviewThreshold: 0.7
    });

    this.rules.set('finance', {
      requiresCompliance: ['SOX', 'PCI-DSS'],
      minTrustScore: 0.95,
      humanReviewThreshold: 0.8
    });

    this.rules.set('default', {
      requiresCompliance: [],
      minTrustScore: 0.7,
      humanReviewThreshold: 0.5
    });
  }

  async makeDecision(
    domain: string,
    confidence: number,
    agentCandidates: any[],
    contract: Phase1AnalysisContract
  ): Promise<PolicyDecision> {
    const domainRules = this.rules.get(domain) || this.rules.get('default');
    const appliedRules: string[] = [];

    // Compliance check
    if (domainRules.requiresCompliance.some(req => contract.complianceRequirements.includes(req))) {
      appliedRules.push('compliance_required');
      if (confidence < domainRules.humanReviewThreshold) {
        return {
          route: 'HUMAN',
          explanation: `Domain ${domain} requires compliance review for ${domainRules.requiresCompliance.join(', ')}`,
          confidence,
          policyRulesApplied: appliedRules,
          riskAssessment: { level: 'high', reasons: ['compliance_requirements'] }
        };
      }
    }

    // Confidence threshold check
    if (confidence < 0.5) {
      appliedRules.push('low_confidence_fallback');
      return {
        route: 'LLM',
        explanation: 'Low confidence in domain detection, routing to LLM fallback',
        confidence,
        policyRulesApplied: appliedRules,
        riskAssessment: { level: 'medium', reasons: ['low_confidence'] }
      };
    }

    // Agent selection
    const qualifiedAgents = agentCandidates.filter(agent =>
      agent.trustScore >= domainRules.minTrustScore
    );

    if (qualifiedAgents.length === 0) {
      appliedRules.push('no_qualified_agents');
      return {
        route: 'LLM',
        explanation: `No agents meet minimum trust score of ${domainRules.minTrustScore}`,
        confidence,
        policyRulesApplied: appliedRules,
        riskAssessment: { level: 'medium', reasons: ['no_qualified_agents'] }
      };
    }

    // Select highest trust score agent
    const selectedAgent = qualifiedAgents.reduce((best, current) =>
      current.trustScore > best.trustScore ? current : best
    );

    appliedRules.push('agent_selected_by_trust_score');

    return {
      route: 'AGENT',
      agentId: selectedAgent.id,
      explanation: `Selected agent ${selectedAgent.id} with trust score ${selectedAgent.trustScore}`,
      confidence,
      policyRulesApplied: appliedRules,
      riskAssessment: { level: 'low', reasons: [] }
    };
  }
}

// --- Domain Detector (Independent Classifier) ---
export class DomainDetector {
  private domainKeywords: Map<string, string[]> = new Map();

  constructor() {
    this.initializeDomainKeywords();
  }

  private initializeDomainKeywords() {
    this.domainKeywords.set('healthcare', [
      'medical', 'patient', 'clinic', 'hospital', 'health', 'diagnosis',
      'treatment', 'pharmacy', 'ehr', 'hipaa', 'medical device'
    ]);

    this.domainKeywords.set('finance', [
      'trading', 'portfolio', 'investment', 'banking', 'payment',
      'transaction', 'ledger', 'blockchain', 'crypto', 'defi'
    ]);

    this.domainKeywords.set('social-media', [
      'social', 'content', 'posting', 'engagement', 'followers',
      'marketing', 'advertising', 'campaign', 'viral', 'influencer'
    ]);

    this.domainKeywords.set('ecommerce', [
      'store', 'product', 'shopping', 'cart', 'checkout', 'inventory',
      'order', 'shipping', 'retail', 'marketplace'
    ]);
  }

  async detectDomain(requirement: string): Promise<{ domain: string; confidence: number; explanation: string }> {
    const text = requirement.toLowerCase();
    const scores: Map<string, number> = new Map();

    // Calculate relevance scores for each domain
    for (const [domain, keywords] of this.domainKeywords) {
      let score = 0;
      for (const keyword of keywords) {
        const matches = (text.match(new RegExp(keyword, 'g')) || []).length;
        score += matches;
      }
      scores.set(domain, score);
    }

    // Find highest scoring domain
    let maxScore = 0;
    let detectedDomain = 'general';

    for (const [domain, score] of scores) {
      if (score > maxScore) {
        maxScore = score;
        detectedDomain = domain;
      }
    }

    // Calculate confidence based on score differential
    const sortedScores = Array.from(scores.values()).sort((a, b) => b - a);
    const confidence = sortedScores.length > 1 && sortedScores[0] > 0
      ? sortedScores[0] / (sortedScores[0] + sortedScores[1])
      : 0.5;

    return {
      domain: detectedDomain,
      confidence: Math.min(confidence, 1.0),
      explanation: `Detected domain '${detectedDomain}' based on keyword matching (score: ${maxScore})`
    };
  }
}

// --- Agent Registry (Centralized Agent Catalog) ---
export interface AgentMeta {
  id: string;
  name: string;
  domains: string[];
  capabilities: string[];
  trustScore: number;
  complianceCertifications: string[];
  performanceMetrics: {
    successRate: number;
    averageResponseTime: number;
    totalInvocations: number;
  };
}

export class AgentRegistry {
  private agents: Map<string, AgentMeta> = new Map();

  registerAgent(agent: AgentMeta): void {
    this.agents.set(agent.id, agent);
  }

  getAgentsForDomain(domain: string): AgentMeta[] {
    return Array.from(this.agents.values()).filter(agent =>
      agent.domains.includes(domain) || agent.domains.includes('general')
    );
  }

  getAgentById(id: string): AgentMeta | undefined {
    return this.agents.get(id);
  }

  updateTrustScore(agentId: string, newScore: number): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.trustScore = Math.max(0, Math.min(1, newScore));
    }
  }
}

// --- Audit Logger (A-MEM Component) ---
export interface AuditRecord {
  id: string;
  timestamp: Date;
  actor: string;
  action: string;
  decision: PolicyDecision;
  contract: Phase1AnalysisContract;
  agentInvoked?: string;
  result?: any;
  duration: number;
  metadata: Record<string, any>;
}

export class AuditLogger {
  private records: AuditRecord[] = [];

  log(record: Omit<AuditRecord, 'id' | 'timestamp'>): string {
    const auditRecord: AuditRecord = {
      ...record,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    this.records.push(auditRecord);
    console.log(`📋 Audit logged: ${auditRecord.action} by ${auditRecord.actor}`);

    return auditRecord.id;
  }

  getRecordsForContract(contractId: string): AuditRecord[] {
    return this.records.filter(record =>
      record.contract.requirement.includes(contractId) ||
      record.metadata.contractId === contractId
    );
  }

  getRecentRecords(limit: number = 10): AuditRecord[] {
    return this.records.slice(-limit);
  }
}

// --- Phase 0: Prompt Enhancer (The Interviewer) ---
export class PromptEnhancer {
  async enhancePrompt(initialPrompt: string): Promise<Phase1AnalysisContract> {
    const enhancerAgent = new Agent({
      name: 'prompt-enhancer',
      instructions: `You are the revolutionary front-door agent responsible for transforming vague user inputs into detailed, high-quality Phase-1 Analysis Contracts.

Transform vague prompts like "Build me a website" into structured contracts with:
- Clear domain identification
- Specific capabilities required
- Technical complexity assessment
- Compliance requirements
- Challenge identification

Ask clarifying questions if needed, then provide a complete contract.`,
      outputType: z.object({
        requirement: z.string(),
        domain: z.string(),
        complexity: z.enum(['simple', 'moderate', 'complex', 'enterprise']),
        challenges: z.array(z.string()),
        capabilities: z.array(z.string()),
        complianceRequirements: z.array(z.string()),
        estimatedEffort: z.string(),
        confidence: z.number().min(0).max(1)
      })
    });

    const result = await run([enhancerAgent], {
      input: `Enhance this vague requirement into a complete Phase-1 Analysis Contract: "${initialPrompt}"

Focus on:
- Domain identification (healthcare, finance, social-media, ecommerce, general)
- Required capabilities
- Technical challenges
- Compliance requirements (HIPAA, GDPR, SOX, etc.)
- Complexity assessment`
    });

    return result.output as Phase1AnalysisContract;
  }
}
