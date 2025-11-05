import { AgentSchema } from '../agent-contracts/schemas';
import { load } from 'js-yaml';
import { initializePinecone, storeAgentInPinecone, searchPineconeRecords } from './pinecone-integration';
import { performanceOptimizer } from '../src/performance-optimizer';
import { monitoringDashboard } from '../src/monitoring-dashboard';
import OpenAI from 'openai';

// Define types for Pinecone results
interface PineconeSearchResult {
  id: string;
  score: number;
  metadata?: {
    depends_on?: string[];
    [key: string]: any;
  };
}

// Pinecone MCP integration
const PINECONE_INDEX = "agent-enhancements";
const PINECONE_NAMESPACE = "social-media-agent";

// Structured prompt interface
interface EnhancementArea {
  name: string;
  objective: string;
  key_requirements: string[];
  sources: string[];
  depends_on?: string[];
}

interface MasterPrompt {
  enhancement_areas: EnhancementArea[];
  processing_instructions: string[];
  agent_contract_requirements: Record<string, string>;
  output_format: string;
}

export async function buildManifestWithPinecone(agents: unknown[]) {
  const validatedAgents: any[] = [];

  for (const agent of agents) {
    try {
      // Pre-validate against existing work
      const validation = await validateAgainstExistingPinecone(agent);
      if (!validation.isValid) {
        console.warn(`⚠️ Skipping ${JSON.parse(JSON.stringify(agent)).enhancement_area}: ${validation.reason}`);
        continue;
      }

      const validated = AgentSchema.parse(agent);
      validatedAgents.push(validated);

      // Store in Pinecone
      await storeAgentInPinecone(validated);
      console.log(`✅ Stored: ${validated.enhancement_area}`);

    } catch (error) {
      console.error(`❌ Failed to process agent:`, error);
    }
  }

  return {
    enhancements: validatedAgents,
    roadmap: buildDependencyGraph(validatedAgents)
  };
}

async function validateAgainstExistingPinecone(agent: any) {
  try {
    // Search for similar enhancements
    const searchResults: PineconeSearchResult[] = await searchPineconeRecords(agent.objective || agent.enhancement_area);

    // Check for high similarity scores (potential duplicates)
    const duplicates = searchResults.filter((result) => result.score > 0.85);

    if (duplicates.length > 0) {
      return {
        isValid: false,
        reason: `Similar enhancement exists: ${duplicates[0].id} (score: ${duplicates[0].score})`
      };
    }

    // Check dependency conflicts
    const conflicts = searchResults.filter((result) =>
      result.metadata?.depends_on?.includes(agent.enhancement_area)
    );

    if (conflicts.length > 0) {
      return {
        isValid: false,
        reason: `Dependency conflict with: ${conflicts.map((c) => c.id).join(', ')}`
      };
    }

    return { isValid: true };

  } catch (error) {
    console.warn(`Pinecone validation failed, proceeding:`, error);
    return { isValid: true }; // Fail open
  }
}

// storeAgentInPinecone is now imported from pinecone-integration.ts

// searchPineconeRecords is now imported from pinecone-integration.ts

export function buildDependencyGraph(agents: any[]) {
  // Kahn's algorithm for topological sorting
  const graph = new Map<string, string[]>(); // adjacency list: node -> [dependencies]
  const inDegree = new Map<string, number>(); // in-degree count for each node
  const agentMap = new Map<string, any>(); // name -> agent object

  // Initialize graph and in-degree counts
  for (const agent of agents) {
    const name = agent.enhancement_area;
    agentMap.set(name, agent);
    graph.set(name, agent.depends_on || []);
    inDegree.set(name, 0);
  }

  // Calculate in-degrees (number of dependencies for each node)
  for (const [node, deps] of graph) {
    for (const dep of deps) {
      // Only count dependencies that actually exist in our agent set
      if (agentMap.has(dep)) {
        inDegree.set(node, (inDegree.get(node) || 0) + 1);
      }
    }
  }

  // Kahn's algorithm: start with nodes that have no dependencies
  const queue: string[] = [];
  const buildOrder: string[] = [];
  const edges: Array<{from: string, to: string}> = [];

  // Initialize queue with nodes having in-degree 0
  for (const [node, degree] of inDegree) {
    if (degree === 0) {
      queue.push(node);
    }
  }

  // Build edges list for visualization
  for (const [to, deps] of graph) {
    for (const from of deps) {
      if (agentMap.has(from)) {
        edges.push({ from, to });
      }
    }
  }

  // Process queue
  while (queue.length > 0) {
    const node = queue.shift()!;
    buildOrder.push(node);

    // For each node that depends on this one, reduce their in-degree
    // We need to check reverse dependencies
    for (const [otherNode, deps] of graph) {
      if (deps.includes(node) && agentMap.has(otherNode)) {
        const newDegree = (inDegree.get(otherNode) || 0) - 1;
        inDegree.set(otherNode, newDegree);

        // If in-degree becomes 0, add to queue
        if (newDegree === 0) {
          queue.push(otherNode);
        }
      }
    }
  }

  // Cycle detection: if not all nodes are in buildOrder, there's a cycle
  if (buildOrder.length !== agents.length) {
    const missing = agents.filter(a => !buildOrder.includes(a.enhancement_area));
    throw new Error(`Circular dependency detected in agent graph. Problematic agents: ${missing.map(a => a.enhancement_area).join(', ')}`);
  }

  return {
    nodes: Array.from(agentMap.keys()),
    edges: edges,
    build_order: buildOrder
  };
}

// Legacy function for backward compatibility
export function buildManifest(agents: unknown[]) {
  return {
    enhancements: agents.map((agent) => AgentSchema.parse(agent)),
    roadmap: buildDependencyGraph(agents)
  };
}

// Main orchestrator execution
async function main() {
  console.log('🤖 Starting Contract-Driven Multi-Agent Orchestrator...\n');

  // Start monitoring dashboard
  monitoringDashboard.start();
  console.log('📊 Monitoring dashboard started');

  // Initialize Pinecone
  const pineconeApiKey = process.env.PINECONE_API_KEY;
  if (pineconeApiKey) {
    initializePinecone(pineconeApiKey);
    monitoringDashboard.setPineconeStatus('healthy');
    console.log('🌲 Pinecone initialized');
  } else {
    monitoringDashboard.setPineconeStatus('down');
    console.warn('⚠️ PINECONE_API_KEY not set, Pinecone features disabled');
  }

  const startTime = Date.now();

  try {
    // Read master orchestrator prompt (now YAML)
    const fs = require('fs');
    const path = require('path');

    const promptPath = path.join(__dirname, '..', 'master-orchestrator-prompt.yaml');
    const promptContent = fs.readFileSync(promptPath, 'utf-8');

    console.log('📋 Read master orchestrator prompt (YAML)');
    console.log('🔍 Parsing enhancement areas...\n');

    // Parse enhancement areas from YAML (deterministic!)
    const promptData: MasterPrompt = load(promptContent) as MasterPrompt;
    const areas = promptData.enhancement_areas;

    console.log(`🎯 Found ${areas.length} enhancement areas:`);
    areas.forEach((area, i) => console.log(`  ${i + 1}. ${area.name}`));
    console.log('');

    // Generate contracts for each area using parallel processing
    console.log(`🚀 Generating ${areas.length} contracts with parallel processing...`);
    const contractPromises = areas.map(async (area) => {
      console.log(`🧬 Spawning agent for: ${area.name}`);
      const contract = await generateAgentContract(area);
      console.log(`✅ Generated contract: ${contract.enhancement_area}`);
      return contract;
    });

    const contracts = await Promise.all(contractPromises);

    console.log(`\n📊 Generated ${contracts.length} agent contracts`);

    // Build manifest with Pinecone integration
    console.log('🏗️ Building manifest with Pinecone validation...');
    const manifest = await buildManifestWithPinecone(contracts);

    // Write manifest to file
    const manifestPath = path.join(__dirname, '..', 'enhancements_manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    const executionTime = Date.now() - startTime;
    monitoringDashboard.recordOrchestratorRun(true, executionTime);

    console.log('💾 Saved enhancements_manifest.json');
    console.log(`📋 Manifest contains ${manifest.enhancements.length} validated agents`);
    console.log('🎉 Orchestration complete!');

  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    monitoringDashboard.recordOrchestratorRun(false, executionTime);
    monitoringDashboard.recordError('orchestrator_failure', error.message, error.stack);

    console.error('❌ Orchestration failed:', error);
    process.exit(1);
  }
}

// Legacy parseEnhancementAreas function removed - now using YAML parsing

// Generate agent contract using performance-optimized LLM calls
async function generateAgentContract(area: any): Promise<any> {
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
    // Validate against schema
    return AgentSchema.parse(contract);
  } catch (error) {
    console.error('Failed to parse LLM response:', content);
    throw new Error('Invalid contract generated by LLM');
  }
}

// Run orchestrator if called directly
if (require.main === module) {
  main();
}