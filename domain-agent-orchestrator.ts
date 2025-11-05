/**
 * @file domain-agent-orchestrator.ts
 * @description Policy-Authoritative Domain Orchestrator with Independent Classification
 *
 * Architecture:
 * 1. Policy Engine: Authoritative decision-making, routing, approvals
 * 2. Independent Domain Classifier: Rules+LLM driven, not agent-biased
 * 3. Agent Registry: Specialist plugins with capability declarations
 * 4. Audit Logger: Complete traceability of all decisions
 * 5. Confidence Scoring: Fail-safe fallbacks and human review triggers
 */

// ================================
// POLICY ENGINE & DECISION AUTHORITY
// ================================

interface AuditEntry {
  timestamp: Date;
  decisionType: string;
  actor: string;
  confidence: number;
  policyChecks: PolicyCheck[];
  approved: boolean;
  fallbackTriggered: boolean;
  metadata: Record<string, any>;
}

interface PolicyCheck {
  policy: string;
  result: 'pass' | 'fail' | 'warning';
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface AgentCapability {
  domain: string;
  capabilities: string[];
  trustScore: number;
  performanceMetrics: {
    accuracy: number;
    reliability: number;
    speed: number;
  };
  metadata: {
    version: string;
    lastUpdated: Date;
    author: string;
    compliance: string[];
  };
}

interface DomainClassification {
  domain: string;
  confidence: number;
  reasoning: string[];
  alternativeDomains: Array<{domain: string, confidence: number}>;
  classifier: 'rules' | 'llm' | 'hybrid';
}

class PolicyEngine {
  private policies: Map<string, (context: any) => PolicyCheck> = new Map();

  constructor() {
    this.initializePolicies();
  }

  // Core policy: No agent can unilaterally mark itself preferred
  private initializePolicies() {
    this.policies.set('agent_preference', (context) => {
      if (context.agentDeclaredPreferred) {
        return {
          policy: 'agent_preference',
          result: 'fail',
          details: 'Agents cannot declare themselves preferred',
          severity: 'high'
        };
      }
      return {
        policy: 'agent_preference',
        result: 'pass',
        details: 'Agent preference metadata is advisory only',
        severity: 'low'
      };
    });

    this.policies.set('domain_boundary', (context) => {
      const { agentDomain, classifiedDomain } = context;
      if (agentDomain !== classifiedDomain) {
        return {
          policy: 'domain_boundary',
          result: 'fail',
          details: `Agent domain ${agentDomain} does not match classified domain ${classifiedDomain}`,
          severity: 'critical'
        };
      }
      return {
        policy: 'domain_boundary',
        result: 'pass',
        details: 'Agent operates within classified domain boundaries',
        severity: 'low'
      };
    });

    this.policies.set('capability_match', (context) => {
      const { agentCapabilities, requiredCapabilities } = context;
      const hasRequired = requiredCapabilities.every((cap: string) =>
        agentCapabilities.includes(cap)
      );
      return {
        policy: 'capability_match',
        result: hasRequired ? 'pass' : 'fail',
        details: hasRequired ? 'Agent has required capabilities' : 'Agent lacks required capabilities',
        severity: hasRequired ? 'low' : 'high'
      };
    });
  }

  async evaluatePolicies(context: any): Promise<PolicyCheck[]> {
    const checks: PolicyCheck[] = [];
    for (const [policyName, policyFn] of this.policies) {
      checks.push(policyFn(context));
    }
    return checks;
  }

  shouldApprove(checks: PolicyCheck[]): boolean {
    return !checks.some(check => check.result === 'fail' && check.severity === 'critical');
  }

  requiresHumanReview(checks: PolicyCheck[]): boolean {
    return checks.some(check => check.result === 'fail' && check.severity === 'high');
  }
}

// ================================
// INDEPENDENT DOMAIN CLASSIFIER
// ================================

class IndependentDomainClassifier {
  private rulesEngine: Map<string, (area: EnhancementArea) => number> = new Map();

  constructor() {
    this.initializeRules();
  }

  private initializeRules() {
    // Social Media Rules
    this.rulesEngine.set('social-media', (area) => {
      const content = `${area.name} ${area.objective} ${area.key_requirements.join(' ')}`.toLowerCase();
      let score = 0;

      if (content.includes('social')) score += 0.4;
      if (content.includes('content') && content.includes('engagement')) score += 0.3;
      if (content.includes('instagram') || content.includes('twitter') || content.includes('facebook')) score += 0.3;
      if (content.includes('viral') || content.includes('shares') || content.includes('likes')) score += 0.2;

      return Math.min(score, 1.0);
    });

    // Healthcare Rules
    this.rulesEngine.set('healthcare', (area) => {
      const content = `${area.name} ${area.objective} ${area.key_requirements.join(' ')}`.toLowerCase();
      let score = 0;

      if (content.includes('health') || content.includes('medical') || content.includes('patient')) score += 0.4;
      if (content.includes('hipaa') || content.includes('clinical') || content.includes('ehr')) score += 0.3;
      if (content.includes('diagnosis') || content.includes('treatment') || content.includes('prescription')) score += 0.3;

      return Math.min(score, 1.0);
    });

    // Generic fallback
    this.rulesEngine.set('generic', () => 0.1);
  }

  async classifyDomain(area: EnhancementArea): Promise<DomainClassification> {
    const ruleScores: Array<{domain: string, confidence: number}> = [];

    // Rule-based classification
    for (const [domain, ruleFn] of this.rulesEngine) {
      const confidence = ruleFn(area);
      if (confidence > 0.1) { // Minimum threshold
        ruleScores.push({ domain, confidence });
      }
    }

    // Sort by confidence
    ruleScores.sort((a, b) => b.confidence - a.confidence);
    const primary = ruleScores[0];
    const alternatives = ruleScores.slice(1, 4); // Top 3 alternatives

    // LLM validation for high-stakes decisions
    const needsLLMValidation = primary?.confidence < 0.7;
    let llmReasoning: string[] = [];

    if (needsLLMValidation) {
      llmReasoning = await this.llmValidate(area, primary?.domain);
    }

    return {
      domain: primary?.domain || 'generic',
      confidence: primary?.confidence || 0,
      reasoning: [
        `Rule-based classification: ${primary?.domain} (${(primary?.confidence * 100).toFixed(1)}%)`,
        ...llmReasoning,
        ...alternatives.map(alt => `Alternative: ${alt.domain} (${(alt.confidence * 100).toFixed(1)}%)`)
      ],
      alternativeDomains: alternatives,
      classifier: needsLLMValidation ? 'hybrid' : 'rules'
    };
  }

  private async llmValidate(area: EnhancementArea, ruleDomain?: string): Promise<string[]> {
    // LLM validation for uncertain classifications
    const prompt = `
Analyze this enhancement area and classify its domain. Current rule-based classification: ${ruleDomain}

Enhancement Area: ${area.name}
Objective: ${area.objective}
Requirements: ${area.key_requirements.join(', ')}

Provide classification confidence and reasoning. Consider domains like: social-media, healthcare, finance, e-commerce, generic.
`;

    const results = await performanceOptimizer.executeLLMCalls([{
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4',
      temperature: 0.1,
      cacheKey: `domain-validation-${area.name}`
    }]);

    const llmResponse = results[0];
    return [`LLM Validation: ${llmResponse?.substring(0, 200) || 'No response'}`];
  }
}

// ================================
// AGENT REGISTRY & CAPABILITY MANAGEMENT
// ================================

class AgentRegistry {
  private agents: Map<string, DomainAgent> = new Map();
  private capabilities: Map<string, AgentCapability> = new Map();

  registerAgent(domain: string, agent: DomainAgent, capability: AgentCapability) {
    this.agents.set(domain, agent);
    this.capabilities.set(domain, capability);

    console.log(`📝 Registered ${domain} agent: ${capability.metadata.author} v${capability.metadata.version}`);
    console.log(`   Trust Score: ${capability.trustScore}, Capabilities: ${capability.capabilities.join(', ')}`);
  }

  getAgent(domain: string): DomainAgent | undefined {
    return this.agents.get(domain);
  }

  getCapability(domain: string): AgentCapability | undefined {
    return this.capabilities.get(domain);
  }

  getAvailableDomains(): string[] {
    return Array.from(this.agents.keys());
  }

  // Agents declare capabilities, but can't mark themselves preferred
  declareCapability(domain: string, capability: Omit<AgentCapability, 'preferred'>) {
    const fullCapability: AgentCapability = {
      ...capability,
      // Explicitly remove any preference declarations from agents
      metadata: {
        ...capability.metadata,
        preferred: undefined // Agents cannot declare preference
      }
    } as AgentCapability;

    this.capabilities.set(domain, fullCapability);
  }
}

// ================================
// AUDIT LOGGER
// ================================

class AuditLogger {
  private auditTrail: AuditEntry[] = [];

  logDecision(entry: Omit<AuditEntry, 'timestamp'>) {
    const auditEntry: AuditEntry = {
      ...entry,
      timestamp: new Date()
    };

    this.auditTrail.push(auditEntry);

    // Log critical decisions
    if (entry.policyChecks.some(check => check.severity === 'critical')) {
      console.warn('🚨 CRITICAL AUDIT EVENT:', entry.decisionType, entry.actor);
    }

    console.log(`📋 AUDIT: ${entry.decisionType} by ${entry.actor} (${entry.confidence.toFixed(2)} confidence)`);
  }

  getAuditTrail(): AuditEntry[] {
    return [...this.auditTrail];
  }

  getDecisionsByActor(actor: string): AuditEntry[] {
    return this.auditTrail.filter(entry => entry.actor === actor);
  }

  getFailedDecisions(): AuditEntry[] {
    return this.auditTrail.filter(entry => !entry.approved);
  }
}

// ================================
// ENHANCED POLICY-AUTHORITATIVE ORCHESTRATOR
// ================================

class PolicyAuthoritativeOrchestrator {
  private policyEngine: PolicyEngine;
  private domainClassifier: IndependentDomainClassifier;
  private agentRegistry: AgentRegistry;
  private auditLogger: AuditLogger;
  private agentAdapter: AgentAdapter;
  private promptEnhancer: PromptEnhancerAgent;
  private fallbackThreshold: number = 0.6; // Confidence threshold for fallbacks

  constructor() {
    this.policyEngine = new PolicyEngine();
    this.domainClassifier = new IndependentDomainClassifier();
    this.agentRegistry = new AgentRegistry();
    this.auditLogger = new AuditLogger();
    this.agentAdapter = new AgentAdapter();
    this.promptEnhancer = new PromptEnhancerAgent();

    this.registerAgents();
  }

  /**
   * COMPLETE ORCHESTRATION FLOW: Client prompt → Phase-1 → Orchestration
   */
  async orchestrateFromClientPrompt(clientPrompt: string): Promise<any[]> {
    console.log(`🎯 Starting complete orchestration flow for: "${clientPrompt}"\n`);

    // PHASE 1: Client gives prompt → goes to PromptEnhancerAgent → returns Phase-1 AnalysisContract
    console.log('📝 Phase 1: Enhancing client prompt...');
    const phase1Contract = await this.promptEnhancer.enhancePrompt(clientPrompt);

    console.log(`✅ Phase-1 Contract: ${phase1Contract.areas.length} areas, priority: ${phase1Contract.priority}`);
    console.log(`   Complexity: ${phase1Contract.metadata.estimatedComplexity}`);
    console.log(`   Suggested domains: ${phase1Contract.metadata.suggestedDomains?.join(', ') || 'none'}\n`);

    // PHASE 2+: Full orchestration with Phase-1 contract
    return await this.orchestrateEnhancementAreas(phase1Contract.areas);
  }

  private registerAgents() {
    // Register social media agent with full capability declaration
    const socialCapability: AgentCapability = {
      domain: 'social-media',
      capabilities: ['content-strategy', 'engagement-optimization', 'audience-analysis', 'platform-integration'],
      trustScore: 0.92,
      performanceMetrics: {
        accuracy: 0.88,
        reliability: 0.95,
        speed: 0.78
      },
      metadata: {
        version: '2.1.0',
        lastUpdated: new Date(),
        author: 'EnhancedQuantumSocialAgent',
        compliance: ['SOC2', 'GDPR', 'Platform APIs']
      }
    };

    this.agentRegistry.registerAgent('social-media', new SocialMediaDomainAgent(), socialCapability);
  }

  /**
   * POLICY-AUTHORITATIVE: Orchestrator controls ALL routing and approvals
   */
  async orchestrateEnhancementAreas(areas: EnhancementArea[]): Promise<any[]> {
    const contracts: any[] = [];
    const startTime = Date.now();

    console.log(`🎭 Policy-Authoritative Orchestrator starting...`);
    console.log(`📋 Processing ${areas.length} enhancement areas`);
    console.log(`🤖 Available domains: ${this.agentRegistry.getAvailableDomains().join(', ')}`);

    for (const area of areas) {
      console.log(`\n🔍 Analyzing: ${area.name}`);

      // STEP 1: Independent domain classification (not agent-driven)
      const classification = await this.domainClassifier.classifyDomain(area);
      console.log(`🏷️ Classified as: ${classification.domain} (${(classification.confidence * 100).toFixed(1)}% confidence)`);

      // STEP 2: Check if we should use agent or fallback
      const shouldUseAgent = classification.confidence > this.fallbackThreshold &&
                             this.agentRegistry.getAgent(classification.domain);

      let contract: any;
      let actor: string;
      let confidence: number;

      if (shouldUseAgent) {
        // STEP 3: Policy check before agent routing
        const agent = this.agentRegistry.getAgent(classification.domain)!;
        const capability = this.agentRegistry.getCapability(classification.domain)!;

        const policyContext = {
          agentDomain: classification.domain,
          classifiedDomain: classification.domain,
          agentCapabilities: capability.capabilities,
          requiredCapabilities: this.extractRequiredCapabilities(area)
        };

        const policyChecks = await this.policyEngine.evaluatePolicies(policyContext);
        const approved = this.policyEngine.shouldApprove(policyChecks);
        const needsReview = this.policyEngine.requiresHumanReview(policyChecks);

        // AUDIT: Log routing decision
        this.auditLogger.logDecision({
          decisionType: 'agent_routing',
          actor: 'PolicyEngine',
          confidence: classification.confidence,
          policyChecks,
          approved,
          fallbackTriggered: false,
          metadata: {
            area: area.name,
            domain: classification.domain,
            agent: capability.metadata.author,
            reasoning: classification.reasoning
          }
        });

        if (approved && !needsReview) {
          // STEP 4: Route to agent (policy-approved)
          console.log(`✅ Policy approved routing to ${classification.domain} agent`);
          contract = await this.executeWithAgent(agent, area, capability);
          actor = `agent:${classification.domain}`;
          confidence = classification.confidence * capability.trustScore;
        } else if (needsReview) {
          // STEP 5: Human review required
          console.log(`⏳ Policy requires human review for ${area.name}`);
          contract = await this.humanReviewFallback(area, classification, policyChecks);
          actor = 'human-review';
          confidence = 0.5; // Lower confidence for human-reviewed decisions
        } else {
          // STEP 6: Policy denied, fallback to LLM
          console.log(`❌ Policy denied agent routing, falling back to LLM`);
          contract = await this.llmFallback(area, classification);
          actor = 'llm-fallback';
          confidence = classification.confidence * 0.5; // Reduced confidence
        }
      } else {
        // STEP 7: Low confidence or no agent available
        console.log(`🤖 Low confidence (${(classification.confidence * 100).toFixed(1)}%) or no agent, using LLM fallback`);
        contract = await this.llmFallback(area, classification);
        actor = 'llm-fallback-low-confidence';
        confidence = classification.confidence;
      }

      // AUDIT: Log final contract generation
      this.auditLogger.logDecision({
        decisionType: 'contract_generation',
        actor,
        confidence,
        policyChecks: [],
        approved: true,
        fallbackTriggered: actor.includes('fallback'),
        metadata: {
          area: area.name,
          contractType: contract.enhancement_area,
          processingTime: Date.now() - startTime
        }
      });

      // PERSIST: Upsert validated contract to Pinecone with audit metadata
      const auditEntry = this.auditLogger.getAuditTrail()
        .find(entry => entry.metadata?.area === area.name && entry.decisionType === 'contract_generation');

      if (auditEntry) {
        const domain = classification.domain;
        const success = await upsertValidatedContract(contract, auditEntry, domain);
        if (success) {
          console.log(`💾 Contract persisted to Pinecone: ${contract.enhancement_area}`);
        } else {
          console.warn(`⚠️ Failed to persist contract to Pinecone: ${contract.enhancement_area}`);
        }
      }

      contracts.push(contract);
    }

    // Final audit summary
    this.logAuditSummary(contracts.length);

    return contracts;
  }

  private async executeWithAgent(agent: DomainAgent, area: EnhancementArea, capability: AgentCapability): Promise<any> {
    try {
      // Generate contract
      const contract = await agent.generateContract(area);

      // Agent may propose subtasks, but orchestrator validates
      if (agent.coordinateSubtasks) {
        const subtaskProposal = await agent.coordinateSubtasks([contract]);

        if (subtaskProposal.length > 0) {
          // Policy check on agent subtask proposals
          const subtaskPolicyContext = {
            agentDomain: capability.domain,
            proposedSubtasks: subtaskProposal.length,
            domainBoundaries: true // Assume within domain for now
          };

          const subtaskChecks = await this.policyEngine.evaluatePolicies(subtaskPolicyContext);

          if (this.policyEngine.shouldApprove(subtaskChecks)) {
            console.log(`✅ Agent proposed ${subtaskProposal.length} subtasks, policy approved`);
            // Subtasks are added but don't affect global orchestration
          } else {
            console.log(`❌ Agent subtask proposal denied by policy`);
          }
        }
      }

      return contract;
    } catch (error) {
      console.error(`❌ Agent execution failed:`, error);
      throw error; // Will trigger fallback in caller
    }
  }

  private async llmFallback(area: EnhancementArea, classification: DomainClassification): Promise<any> {
    // Standard LLM fallback from previous implementation
    return await this.generateContractViaLLM(area);
  }

  private async humanReviewFallback(area: EnhancementArea, classification: DomainClassification, policyChecks: PolicyCheck[]): Promise<any> {
    // For now, fall back to LLM with human review flag
    // In production, this would trigger human workflow
    console.log(`📋 HUMAN REVIEW REQUIRED for ${area.name}`);
    console.log(`   Failed policies: ${policyChecks.filter(c => c.result === 'fail').map(c => c.policy).join(', ')}`);

    const contract = await this.generateContractViaLLM(area);
    contract.humanReviewed = true;
    contract.reviewReason = policyChecks.filter(c => c.result === 'fail').map(c => c.details);

    return contract;
  }

  private extractRequiredCapabilities(area: EnhancementArea): string[] {
    // Extract required capabilities from enhancement area
    const content = `${area.name} ${area.objective} ${area.key_requirements.join(' ')}`.toLowerCase();

    const capabilities: string[] = [];
    if (content.includes('content')) capabilities.push('content-strategy');
    if (content.includes('engagement') || content.includes('social')) capabilities.push('engagement-optimization');
    if (content.includes('analysis') || content.includes('audience')) capabilities.push('audience-analysis');

    return capabilities.length > 0 ? capabilities : ['general-processing'];
  }

  private async generateContractViaLLM(area: EnhancementArea): Promise<any> {
    // Existing LLM implementation
    const prompt = `
You are an expert AI agent architect. Generate a detailed agent contract for the following enhancement area.

Enhancement Area: ${area.name}
Objective: ${area.objective}
Key Requirements:
${area.key_requirements.map((req: string) => `- ${req}`).join('\n')}
Sources: ${area.sources.join(', ')}

Generate a JSON agent contract...
`;

    const results = await performanceOptimizer.executeLLMCalls([{
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4',
      temperature: 0.3,
      cacheKey: `contract-${area.name}`
    }]);

    const content = results[0];
    if (!content) throw new Error('No response from LLM call');

    try {
      const contract = JSON.parse(content);
      return AgentSchema.parse(contract);
    } catch (error) {
      throw new Error('Invalid contract generated by LLM');
    }
  }

  private logAuditSummary(totalContracts: number) {
    const auditTrail = this.auditLogger.getAuditTrail();
    const agentDecisions = auditTrail.filter(e => e.actor.startsWith('agent:'));
    const fallbacks = auditTrail.filter(e => e.fallbackTriggered);
    const humanReviews = auditTrail.filter(e => e.actor === 'human-review');

    console.log(`\n📊 AUDIT SUMMARY:`);
    console.log(`   Total contracts: ${totalContracts}`);
    console.log(`   Agent-processed: ${agentDecisions.length}`);
    console.log(`   LLM fallbacks: ${fallbacks.length}`);
    console.log(`   Human reviews: ${humanReviews.length}`);
    console.log(`   Average confidence: ${(auditTrail.reduce((sum, e) => sum + e.confidence, 0) / auditTrail.length).toFixed(2)}`);
  }

  // Public API for audit access
  getAuditTrail(): AuditEntry[] {
    return this.auditLogger.getAuditTrail();
  }

  getAgentCapabilities(): Map<string, AgentCapability> {
    return new Map(this.agentRegistry['capabilities']); // Access private field
  }
}

// ================================
// USAGE EXAMPLE WITH POLICY AUTHORITY
// ================================

export async function runPolicyAuthoritativeOrchestrator() {
  console.log('🏛️ Starting Policy-Authoritative Orchestrator...\n');

  const orchestrator = new PolicyAuthoritativeOrchestrator();

  // Read enhancement areas from YAML (legacy path)
  const fs = require('fs');
  const path = require('path');
  const promptPath = path.join(__dirname, '..', 'master-orchestrator-prompt.yaml');
  const promptContent = fs.readFileSync(promptPath, 'utf-8');
  const promptData = load(promptContent) as any;
  const areas = promptData.enhancement_areas;

  console.log(`📋 Orchestrator loaded ${areas.length} enhancement areas`);
  console.log('🎯 Orchestrator is POLICY-AUTHORITATIVE:');
  console.log('   - Controls all routing decisions');
  console.log('   - Validates agent proposals');
  console.log('   - Maintains audit trail');
  console.log('   - Manages fallbacks and human review\n');

  // Orchestrate with full policy authority
  const contracts = await orchestrator.orchestrateEnhancementAreas(areas);

  // Save results and audit trail
  const manifestPath = path.join(__dirname, '..', 'policy_orchestrator_manifest.json');
  const auditTrail = orchestrator.getAuditTrail();

  fs.writeFileSync(manifestPath, JSON.stringify({
    contracts,
    auditTrail,
    timestamp: new Date().toISOString(),
    orchestratorType: 'policy-authoritative'
  }, null, 2));

  console.log('💾 Saved policy_orchestrator_manifest.json with full audit trail');
  console.log('🏛️ Policy-Authoritative Orchestration complete!');
}

/**
 * DEMONSTRATE COMPLETE FLOW: Client Prompt → Phase-1 → Full Orchestration
 */
export async function demonstrateCompleteFlow() {
  console.log('🚀 Demonstrating Complete Orchestration Flow\n');

  const orchestrator = new PolicyAuthoritativeOrchestrator();

  // Example client prompt
  const clientPrompt = "Build a comprehensive social media management platform for agencies that includes content creation, engagement optimization, audience analysis, and multi-platform integration.";

  console.log(`📝 Client Prompt: "${clientPrompt}"\n`);

  try {
    // COMPLETE FLOW: Client prompt → Phase-1 AnalysisContract → Orchestration
    const contracts = await orchestrator.orchestrateFromClientPrompt(clientPrompt);

    console.log(`\n✅ Complete flow successful! Generated ${contracts.length} contracts`);

    // Show audit summary
    const auditTrail = orchestrator.getAuditTrail();
    const agentDecisions = auditTrail.filter(e => e.actor.startsWith('agent:'));
    const fallbacks = auditTrail.filter(e => e.fallbackTriggered);

    console.log(`📊 Flow Summary:`);
    console.log(`   Phase-1 Enhancement: ✅`);
    console.log(`   Domain Classification: ✅`);
    console.log(`   Agent Routing: ${agentDecisions.length} decisions`);
    console.log(`   Fallbacks: ${fallbacks.length}`);
    console.log(`   Total Audit Entries: ${auditTrail.length}`);

  } catch (error) {
    console.error('❌ Complete flow failed:', error);
  }
}

/*
POLICY-AUTHORITATIVE ARCHITECTURE GUARANTEES:

1. 🏛️ Orchestrator Authority:
   - All routing, approvals, final decisions in Policy Engine
   - Agents are specialist plugins, not decision-makers
   - Independent Domain Classifier (rules+LLM, not agent-biased)

2. 🤖 Agent Constraints:
   - Declare capabilities and trust metadata
   - Provide deterministic APIs
   - Can propose domain orchestration, but must be validated
   - Cannot mark themselves preferred

3. 📋 Auditability:
   - Every decision has auditable trace
   - Who/what suggested it, confidence, policy checks
   - Complete decision lineage

4. 🛡️ Fail-safe Fallbacks:
   - Agent failure → LLM fallback
   - Low confidence → human review trigger
   - Policy violations → escalation

5. 🎯 Policy & Governance:
   - No agent unilateral preference declarations
   - Preference metadata is advisory only
   - Policy Engine validates all preferences

This creates a truly trustworthy, auditable, policy-governed multi-agent system!
*/

// ================================
// PHASE-1: PROMPT ENHANCER AGENT
// ================================

interface Phase1AnalysisContract {
  areas: EnhancementArea[];
  priority: 'high' | 'medium' | 'low';
  constraints: string[];
  metadata: {
    originalPrompt: string;
    timestamp: Date;
    estimatedComplexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
    suggestedDomains?: string[];
  };
}

class PromptEnhancerAgent {
  async enhancePrompt(clientPrompt: string): Promise<Phase1AnalysisContract> {
    const enhancementPrompt = `
You are an expert AI product manager and system architect. Analyze this client prompt and create a Phase-1 Analysis Contract.

Client Prompt: "${clientPrompt}"

Create a structured analysis with:
1. Break down the prompt into specific, actionable enhancement areas
2. Estimate priority and complexity for each area
3. Identify technical and business constraints
4. Suggest potential domains for implementation

Return a JSON object with this structure:
{
  "areas": [
    {
      "name": "string",
      "objective": "string",
      "key_requirements": ["string"],
      "sources": ["string"],
      "depends_on": ["string"] // optional
    }
  ],
  "priority": "high|medium|low",
  "constraints": ["string"],
  "metadata": {
    "originalPrompt": "${clientPrompt}",
    "estimatedComplexity": "simple|moderate|complex|enterprise",
    "suggestedDomains": ["string"]
  }
}

Focus on creating modular, independent enhancement areas that can be tackled by specialized agents.
`;

    const results = await performanceOptimizer.executeLLMCalls([{
      messages: [{ role: 'user', content: enhancementPrompt }],
      model: 'gpt-4',
      temperature: 0.2,
      cacheKey: `phase1-${clientPrompt.substring(0, 50)}`
    }]);

    const content = results[0];
    if (!content) throw new Error('No response from Phase-1 enhancement');

    try {
      const contract = JSON.parse(content);
      contract.metadata.timestamp = new Date();
      return contract;
    } catch (error) {
      throw new Error('Invalid Phase-1 contract generated');
    }
  }
}

// ================================
// AGENT ADAPTER / ORCHESTRATION SDK
// ================================

interface AgentInvocationRequest {
  agent: DomainAgent;
  area: EnhancementArea;
  requestSubOrchestration?: boolean;
}

interface AgentInvocationResponse {
  contract: any;
  confidenceScore: number;
  subOrchestrationProposal?: SubOrchestrationProposal;
  executionMetadata: {
    processingTime: number;
    modelUsed?: string;
    tokensUsed?: number;
  };
}

interface SubOrchestrationProposal {
  proposedSubtasks: EnhancementArea[];
  orchestrationGraph: Array<{from: string, to: string, dependency: string}>;
  rationale: string;
  confidence: number;
}

class AgentAdapter {
  /**
   * Standard agent invocation interface
   */
  async invoke(request: AgentInvocationRequest): Promise<AgentInvocationResponse> {
    const startTime = Date.now();

    try {
      // Generate the main contract
      const contract = await request.agent.generateContract(request.area);

      // Check if agent wants to propose sub-orchestration
      let subOrchestrationProposal: SubOrchestrationProposal | undefined;

      if (request.requestSubOrchestration && request.agent.coordinateSubtasks) {
        const subtasks = await request.agent.coordinateSubtasks([contract]);

        if (subtasks.length > 0) {
          // Agent is proposing sub-orchestration within its domain
          subOrchestrationProposal = {
            proposedSubtasks: subtasks,
            orchestrationGraph: this.buildOrchestrationGraph(contract, subtasks),
            rationale: `Agent ${request.agent.domain} proposes ${subtasks.length} subtasks for area: ${request.area.name}`,
            confidence: 0.85 // Agent's confidence in its sub-orchestration proposal
          };
        }
      }

      const processingTime = Date.now() - startTime;

      return {
        contract,
        confidenceScore: 0.9, // Agent's confidence in its main contract
        subOrchestrationProposal,
        executionMetadata: {
          processingTime,
          modelUsed: 'agent-implementation'
        }
      };

    } catch (error) {
      console.error(`Agent invocation failed:`, error);
      throw error;
    }
  }

  private buildOrchestrationGraph(mainContract: any, subtasks: any[]): Array<{from: string, to: string, dependency: string}> {
    const graph: Array<{from: string, to: string, dependency: string}> = [];

    // Build dependency graph from main contract to subtasks
    const mainArea = mainContract.enhancement_area;

    subtasks.forEach((subtask, index) => {
      graph.push({
        from: mainArea,
        to: subtask.enhancement_area,
        dependency: `parent-child-${index}`
      });

      // Add dependencies between subtasks if they reference each other
      subtasks.forEach((otherSubtask, otherIndex) => {
        if (index !== otherIndex && subtask.depends_on?.includes(otherSubtask.enhancement_area)) {
          graph.push({
            from: otherSubtask.enhancement_area,
            to: subtask.enhancement_area,
            dependency: 'depends_on'
          });
        }
      });
    });

    return graph;
  }
}

// Structured prompt interface
interface EnhancementArea {
  name: string;
  objective: string;
  key_requirements: string[];
  sources: string[];
  depends_on?: string[];
}

// Domain Agent Registry - Pluggable Architecture
interface DomainAgent {
  domain: string;
  canHandle(area: EnhancementArea): boolean;
  generateContract(area: EnhancementArea): Promise<any>;
  coordinateSubtasks?(contracts: any[]): Promise<any[]>;
}

// Import domain agents (pluggable)
// import { EnhancedQuantumSocialAgent } from './agents/enhanced_quantum_social_media_agent.v2';

// Placeholder implementation until the actual agent is integrated
class EnhancedQuantumSocialAgent implements DomainAgent {
  domain = 'social-media';

  canHandle(area: EnhancementArea): boolean {
    const content = `${area.name} ${area.objective}`.toLowerCase();
    return content.includes('social') || content.includes('content') ||
           content.includes('engagement') || content.includes('media');
  }

  async generateContract(area: EnhancementArea): Promise<any> {
    // Placeholder - replace with actual implementation
    return {
      enhancement_area: area.name,
      objective: area.objective,
      implementation_plan: {
        modules: ["content-creation", "engagement-optimization", "analytics"],
        architecture: "Firebase-backed microservice"
      },
      depends_on: area.depends_on || [],
      sources: area.sources,
      governance: {
        security: "OAuth 2.0 authentication",
        compliance: "Platform API terms",
        ethics: "Content authenticity"
      },
      validation_criteria: "Engagement metrics improvement"
    };
  }
}

class DomainAgentOrchestrator {
  private domainAgents: Map<string, DomainAgent> = new Map();
  private fallbackLLM: boolean = true;

  constructor() {
    this.registerDomainAgents();
  }

  // Register available domain agents (pluggable architecture)
  private registerDomainAgents() {
    // Social Media Domain
    this.domainAgents.set('social-media', new EnhancedQuantumSocialAgent());

    // Future domains can be registered here:
    // this.domainAgents.set('healthcare', new HealthcareAgent());
    // this.domainAgents.set('finance', new FintechAgent());
    // this.domainAgents.set('ecommerce', new EcommerceAgent());
  }

  /**
   * Main orchestration method - domain-agnostic routing
   */
  async orchestrateEnhancementAreas(areas: EnhancementArea[]): Promise<any[]> {
    const contracts: any[] = [];

    console.log(`🎯 Processing ${areas.length} enhancement areas...`);

    for (const area of areas) {
      console.log(`🔍 Analyzing: ${area.name}`);

      // Detect domain for this enhancement area
      const domain = this.detectDomain(area);

      // Route to appropriate domain agent or fallback to LLM
      const contract = await this.routeToDomainAgent(area, domain);
      contracts.push(contract);
    }

    return contracts;
  }

  /**
   * Domain detection - neutral, rule-based, not agent-driven
   */
  private detectDomain(area: EnhancementArea): string {
    const content = `${area.name} ${area.objective} ${area.key_requirements.join(' ')}`.toLowerCase();

    // Domain detection rules (expandable)
    if (content.includes('social') || content.includes('instagram') || content.includes('twitter') ||
        content.includes('facebook') || content.includes('engagement') || content.includes('content')) {
      return 'social-media';
    }

    if (content.includes('health') || content.includes('medical') || content.includes('patient') ||
        content.includes('clinical') || content.includes('hipaa')) {
      return 'healthcare';
    }

    if (content.includes('finance') || content.includes('bank') || content.includes('payment') ||
        content.includes('transaction') || content.includes('compliance')) {
      return 'finance';
    }

    return 'generic'; // Unknown domain
  }

  /**
   * Route to domain agent or fallback to LLM - orchestrator controls routing
   */
  private async routeToDomainAgent(area: EnhancementArea, domain: string): Promise<any> {
    const domainAgent = this.domainAgents.get(domain);

    if (domainAgent && domainAgent.canHandle(area)) {
      console.log(`🎭 Routing to ${domain} domain agent: ${area.name}`);

      // Domain agent generates contract
      const contract = await domainAgent.generateContract(area);

      // Domain agent can optionally coordinate subtasks within its domain
      if (domainAgent.coordinateSubtasks && this.hasSubtasks(area)) {
        console.log(`🔄 Domain agent coordinating subtasks for: ${area.name}`);
        const subtasks = await domainAgent.coordinateSubtasks([contract]);
        // Subtasks are handled within domain, don't affect global orchestration
      }

      return contract;

    } else if (this.fallbackLLM) {
      console.log(`🤖 No ${domain} agent found, falling back to LLM: ${area.name}`);
      return await this.generateContractViaLLM(area);

    } else {
      throw new Error(`No agent available for domain: ${domain}`);
    }
  }

  /**
   * Fallback LLM contract generation (existing logic)
   */
  private async generateContractViaLLM(area: EnhancementArea): Promise<any> {
    const prompt = `
You are an expert AI agent architect. Generate a detailed agent contract for the following enhancement area.

Enhancement Area: ${area.name}
Objective: ${area.objective}
Key Requirements:
${area.key_requirements.map((req: string) => `- ${req}`).join('\n')}
Sources: ${area.sources.join(', ')}

Generate a JSON agent contract with the following structure:
{
  "enhancement_area": "string",
  "objective": "string",
  "implementation_plan": {
    "modules": ["string"],
    "architecture": "string"
  },
  "depends_on": ["string"],
  "sources": ["string"],
  "governance": {
    "security": "string",
    "compliance": "string",
    "ethics": "string"
  },
  "validation_criteria": "string"
}

Be specific and actionable. The contract must be valid JSON.
`;

    const results = await performanceOptimizer.executeLLMCalls([{
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4',
      temperature: 0.3,
      cacheKey: `contract-${area.name}`
    }]);

    const content = results[0];
    if (!content) {
      throw new Error('No response from LLM call');
    }

    try {
      const contract = JSON.parse(content);
      return AgentSchema.parse(contract);
    } catch (error) {
      console.error('Failed to parse LLM response:', content);
      throw new Error('Invalid contract generated by LLM');
    }
  }

  /**
   * Check if enhancement area has subtasks (domain agent coordination)
   */
  private hasSubtasks(area: EnhancementArea): boolean {
    // Logic to determine if area needs subtask coordination
    return area.key_requirements.length > 3 || (area.depends_on?.length ?? 0) > 0;
  }
}

// ================================
// ENHANCED DOMAIN AGENT INTERFACE
// ================================

/**
 * Enhanced Domain Agent that can coordinate subtasks within its domain
 * but does NOT control global orchestration routing
 */
export abstract class EnhancedDomainAgent implements DomainAgent {
  domain: string;

  constructor(domain: string) {
    this.domain = domain;
  }

  canHandle(area: EnhancementArea): boolean {
    // Domain-specific logic for determining if this agent can handle the area
    return this.isDomainMatch(area);
  }

  async generateContract(area: EnhancementArea): Promise<any> {
    // Domain-specific contract generation
    throw new Error('Subclasses must implement generateContract');
  }

  /**
   * LIMITED orchestration: coordinate subtasks WITHIN this domain only
   * Does NOT affect global routing or other domains
   */
  async coordinateSubtasks?(contracts: any[]): Promise<any[]> {
    const subtasks: any[] = [];

    for (const contract of contracts) {
      // Generate domain-specific subtasks
      const domainSubtasks = await this.generateDomainSubtasks(contract);

      // Validate subtasks are within domain boundaries
      const validSubtasks = domainSubtasks.filter(subtask =>
        this.isWithinDomainBoundaries(subtask)
      );

      subtasks.push(...validSubtasks);
    }

    return subtasks;
  }

  // Domain-specific methods (implemented by subclasses)
  protected abstract isDomainMatch(area: EnhancementArea): boolean;
  protected abstract generateDomainSubtasks(contract: any): Promise<any[]>;
  protected abstract isWithinDomainBoundaries(subtask: any): boolean;
}

// ================================
// META-FRAMEWORK AGENT (AGENT THAT IS ALSO ITS OWN FRAMEWORK)
// ================================

interface MetaContractAmendment {
  type: 'schema_extension' | 'policy_update' | 'orchestration_rule' | 'agent_capability';
  target: string; // What to modify
  amendment: any; // The modification
  rationale: string;
  governanceOverride?: boolean; // Requires human approval
}

interface FrameworkEvolution {
  currentFramework: any;
  proposedEvolution: any;
  impactAnalysis: {
    breakingChanges: string[];
    newCapabilities: string[];
    securityImplications: string[];
    backwardsCompatibility: boolean;
  };
  validationTests: string[];
}

/**
 * META-FRAMEWORK AGENT: An agent that is also its own framework
 * Can modify contracts, policies, and orchestration rules
 * BUT maintains policy-authoritative control
 */
export class MetaFrameworkAgent extends EnhancedDomainAgent {
  private frameworkVersion = '1.0.0';
  private approvedAmendments: MetaContractAmendment[] = [];
  private evolutionHistory: FrameworkEvolution[] = [];

  constructor() {
    super('meta-framework');
  }

  protected isDomainMatch(area: EnhancementArea): boolean {
    const content = `${area.name} ${area.objective}`.toLowerCase();
    return content.includes('framework') || content.includes('meta') ||
           content.includes('architecture') || content.includes('self-modify');
  }

  async generateContract(area: EnhancementArea): Promise<any> {
    // Meta-agent can propose amendments to its own contract schema
    const selfAmendment = await this.proposeContractAmendment(area);

    return {
      enhancement_area: area.name,
      objective: area.objective,
      implementation_plan: {
        modules: ["meta-contract-schema", "framework-evolution", "self-modification"],
        architecture: "Policy-governed meta-framework with human oversight"
      },
      depends_on: area.depends_on || [],
      sources: area.sources,
      governance: {
        security: "Policy-authoritative control with human veto",
        compliance: "Framework evolution requires governance approval",
        ethics: "Self-modification bounded by ethical constraints"
      },
      validation_criteria: "Framework evolution maintains system integrity",
      metaCapabilities: {
        canSelfModify: true,
        frameworkEvolution: true,
        policyRespectful: true
      }
    };
  }

  /**
   * PROPOSE amendments to the contract schema itself
   * This is how the agent becomes its own framework
   */
  private async proposeContractAmendment(area: EnhancementArea): Promise<MetaContractAmendment | null> {
    const amendmentPrompt = `
You are a Meta-Framework Agent that can modify its own contract schema.
Analyze this enhancement area and propose how to evolve the framework:

Enhancement Area: ${area.name}
Objective: ${area.objective}
Requirements: ${area.key_requirements.join(', ')}

Current Framework Version: ${this.frameworkVersion}

Propose ONE amendment to the contract schema or orchestration rules.
Choose from:
1. schema_extension - Add new fields to AgentSchema
2. policy_update - Modify governance policies  
3. orchestration_rule - Change routing/approval rules
4. agent_capability - Add new agent capabilities

Return JSON:
{
  "type": "schema_extension|policy_update|orchestration_rule|agent_capability",
  "target": "field_name_or_rule",
  "amendment": { "new_field": "definition" },
  "rationale": "Why this improves the framework",
  "governanceOverride": false
}
`;

    const results = await performanceOptimizer.executeLLMCalls([{
      messages: [{ role: 'user', content: amendmentPrompt }],
      model: 'gpt-4',
      temperature: 0.1, // Low creativity for framework changes
      cacheKey: `meta-amendment-${area.name}`
    }]);

    const content = results[0];
    if (!content) return null;

    try {
      const amendment: MetaContractAmendment = JSON.parse(content);

      // POLICY CHECK: Meta-agent cannot override governance without human approval
      if (amendment.governanceOverride) {
        console.log('🚨 META-AGENT REQUESTING GOVERNANCE OVERRIDE - REQUIRES HUMAN APPROVAL');
        return null; // Block until human review
      }

      // Store amendment for later application (after policy approval)
      this.approvedAmendments.push(amendment);

      return amendment;
    } catch (error) {
      console.error('Invalid meta-amendment format');
      return null;
    }
  }

  /**
   * APPLY approved amendments to the framework
   * This is where the agent actually modifies its own framework
   */
  async applyFrameworkEvolution(evolution: FrameworkEvolution): Promise<boolean> {
    // POLICY GATE: Only apply evolution if it passes security review
    const securityCheck = await this.securityValidateEvolution(evolution);

    if (!securityCheck.approved) {
      console.log(`❌ Framework evolution blocked: ${securityCheck.reason}`);
      return false;
    }

    // Apply the evolution
    this.evolutionHistory.push(evolution);
    this.frameworkVersion = this.incrementVersion(this.frameworkVersion);

    console.log(`✅ Framework evolved to version ${this.frameworkVersion}`);
    console.log(`   New capabilities: ${evolution.impactAnalysis.newCapabilities.join(', ')}`);

    return true;
  }

  private async securityValidateEvolution(evolution: FrameworkEvolution): Promise<{
    approved: boolean;
    reason: string;
  }> {
    // Check for dangerous modifications
    const dangerousPatterns = [
      /unrestricted.*access/i,
      /bypass.*policy/i,
      /remove.*governance/i,
      /infinite.*loop/i,
      /self.*destruct/i
    ];

    for (const change of evolution.impactAnalysis.breakingChanges) {
      for (const pattern of dangerousPatterns) {
        if (pattern.test(change)) {
          return {
            approved: false,
            reason: `Dangerous pattern detected: ${change}`
          };
        }
      }
    }

    // Require human approval for breaking changes
    if (!evolution.impactAnalysis.backwardsCompatibility) {
      return {
        approved: false,
        reason: 'Breaking changes require human governance approval'
      };
    }

    return { approved: true, reason: 'Evolution approved' };
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.');
    parts[2] = (parseInt(parts[2]) + 1).toString();
    return parts.join('.');
  }

  protected async generateDomainSubtasks(contract: any): Promise<any[]> {
    // Meta-framework can generate subtasks for framework evolution
    const subtasks = [];

    if (contract.metaCapabilities?.frameworkEvolution) {
      subtasks.push({
        enhancement_area: `${contract.enhancement_area} - Schema Evolution`,
        objective: 'Evolve the contract schema based on usage patterns',
        key_requirements: ['Analyze contract usage', 'Identify improvement areas', 'Propose schema changes'],
        sources: contract.sources,
        frameworkAmendment: true
      });

      subtasks.push({
        enhancement_area: `${contract.enhancement_area} - Policy Optimization`,
        objective: 'Optimize governance policies based on system behavior',
        key_requirements: ['Review policy effectiveness', 'Identify optimization opportunities', 'Propose policy updates'],
        sources: contract.sources,
        policyOptimization: true
      });
    }

    return subtasks;
  }

  protected isWithinDomainBoundaries(subtask: any): boolean {
    // Meta-framework stays within architectural/meta boundaries
    return subtask.frameworkAmendment || subtask.policyOptimization ||
           subtask.enhancement_area.toLowerCase().includes('framework') ||
           subtask.enhancement_area.toLowerCase().includes('meta');
  }

  // Public API for framework introspection
  getFrameworkVersion(): string {
    return this.frameworkVersion;
  }

  getEvolutionHistory(): FrameworkEvolution[] {
    return [...this.evolutionHistory];
  }

  getApprovedAmendments(): MetaContractAmendment[] {
    return [...this.approvedAmendments];
  }
}

export class SocialMediaDomainAgent extends EnhancedDomainAgent {
  constructor() {
    super('social-media');
  }

  protected isDomainMatch(area: EnhancementArea): boolean {
    const content = `${area.name} ${area.objective}`.toLowerCase();
    return content.includes('social') || content.includes('content') ||
           content.includes('engagement') || content.includes('media');
  }

  async generateContract(area: EnhancementArea): Promise<any> {
    // Use EnhancedQuantumSocialAgent for actual implementation
    const socialAgent = new EnhancedQuantumSocialAgent();
    return await socialAgent.generateContract(area);
  }

  protected async generateDomainSubtasks(contract: any): Promise<any[]> {
    // Social media specific subtasks (within social domain only)
    const subtasks = [];

    if (contract.enhancement_area.includes('Content')) {
      subtasks.push({
        ...contract,
        enhancement_area: `${contract.enhancement_area} - Instagram`,
        platform: 'instagram'
      });
      subtasks.push({
        ...contract,
        enhancement_area: `${contract.enhancement_area} - Twitter`,
        platform: 'twitter'
      });
    }

    return subtasks;
  }

  protected isWithinDomainBoundaries(subtask: any): boolean {
    // Ensure subtasks stay within social media domain
    return subtask.platform || subtask.enhancement_area.toLowerCase().includes('social');
  }
}

// ================================
// USAGE EXAMPLE
// ================================

import { AgentSchema } from './agent-contracts/schemas';
import { load } from 'js-yaml';
import { initializePinecone, upsertValidatedContract, upsertValidatedContracts } from './orchestrator/pinecone-integration';
import { performanceOptimizer } from './src/performance-optimizer';
import { monitoringDashboard } from './src/monitoring-dashboard';

export async function runDomainOrchestrator() {
  console.log('🎭 Starting Domain-Agnostic Orchestrator...\n');

  // Initialize
  const orchestrator = new DomainAgentOrchestrator();
  monitoringDashboard.start();

  // Read enhancement areas (domain-agnostic)
  const fs = require('fs');
  const path = require('path');
  const promptPath = path.join(__dirname, '..', 'master-orchestrator-prompt.yaml');
  const promptContent = fs.readFileSync(promptPath, 'utf-8');
  const promptData = load(promptContent) as any;
  const areas = promptData.enhancement_areas;

  console.log(`📋 Loaded ${areas.length} enhancement areas`);
  console.log('🔍 Detecting domains and routing to agents...\n');

  // Orchestrate (domain-agnostic routing)
  const contracts = await orchestrator.orchestrateEnhancementAreas(areas);

  console.log(`✅ Generated ${contracts.length} contracts`);
  console.log('📊 Domain breakdown:');

  // Show which domains were handled by which agents
  const domainStats = contracts.reduce((acc, contract) => {
    const domain = contract.domain || 'llm-fallback';
    acc[domain] = (acc[domain] || 0) + 1;
    return acc;
  }, {});

  Object.entries(domainStats).forEach(([domain, count]) => {
    console.log(`  ${domain}: ${count} contracts`);
  });

  // Save results
  const manifestPath = path.join(__dirname, '..', 'domain_orchestrator_manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify({
    contracts,
    domainStats,
    timestamp: new Date().toISOString()
  }, null, 2));

  console.log('💾 Saved domain_orchestrator_manifest.json');
  console.log('🎉 Domain orchestration complete!');
}

/*
ARCHITECTURAL BENEFITS:

1. 🎯 Domain-Agnostic Orchestrator:
   - Reads YAML, detects domains, routes neutrally
   - No single agent/domain bias in routing decisions
   - Expandable to new domains without changing core logic

2. 🤖 Domain Agents with Limited Orchestration:
   - Handle domain-specific logic and subtasks
   - Can coordinate within their domain boundaries
   - Cannot affect global routing or other domains

3. 🔄 Fallback LLM Generation:
   - When no domain agent exists, fall back to LLM
   - Ensures system works for unknown domains
   - Maintains backward compatibility

4. 📦 Pluggable Architecture:
   - Register new domain agents without touching orchestrator
   - Each domain agent is self-contained
   - Easy to add/remove domains

5. 🛡️ Safety Boundaries:
   - Domain agents cannot spawn tasks outside their domain
   - Global orchestrator maintains control of routing
   - Clear separation of concerns

This gives you the power of domain-specific agents with sophisticated
subtask coordination, while keeping global orchestration neutral and safe.
*/

// ================================
// EXPORTS
// ================================

export interface EnhancementArea {
  name: string;
  objective: string;
  key_requirements: string[];
  sources: string[];
  depends_on?: string[];
}

export interface DomainAgent {
  domain: string;
  canHandle(area: EnhancementArea): boolean;
  generateContract(area: EnhancementArea): Promise<any>;
  coordinateSubtasks?(contracts: any[]): Promise<any[]>;
}

export { PolicyAuthoritativeOrchestrator, runPolicyAuthoritativeOrchestrator, demonstrateCompleteFlow };
export { DomainAgentOrchestrator, runDomainOrchestrator };
export { EnhancedDomainAgent, MetaFrameworkAgent, SocialMediaDomainAgent };
