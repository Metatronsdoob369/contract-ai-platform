import { Pinecone } from '@pinecone-database/pinecone';
import { performanceOptimizer } from '../src/performance-optimizer';

const PINECONE_INDEX = process.env.PINECONE_INDEX || "agent-enhancements";
const PINECONE_NAMESPACE = process.env.PINECONE_NAMESPACE || "social-media-agent";

let pineconeClient: Pinecone | null = null;

export function initializePinecone(apiKey?: string) {
  const key = apiKey || process.env.PINECONE_API_KEY;
  if (!key) {
    console.warn('No Pinecone API key provided, Pinecone operations will be skipped');
    return;
  }
  pineconeClient = new Pinecone({ apiKey: key });
  console.log(`✅ Initialized Pinecone client for index: ${PINECONE_INDEX}`);
}

// Enhanced upsert for validated agent contracts
export async function upsertValidatedContract(
  contract: any,
  auditEntry: any,
  domain: string = 'general'
): Promise<boolean> {
  if (!pineconeClient) {
    console.warn('Pinecone not initialized, skipping upsert');
    return false;
  }

  try {
    const index = pineconeClient.index(PINECONE_INDEX);
    const namespace = index.namespace(`${PINECONE_NAMESPACE}-${domain}`);

    // Generate embedding for the contract
    const contractText = `${contract.enhancement_area} ${contract.objective} ${contract.implementation_plan?.modules?.join(' ') || ''}`;
    const embeddings = await performanceOptimizer.generateEmbeddingsBatch([contractText]);

    if (embeddings.length === 0) {
      console.error('Failed to generate embedding for contract');
      return false;
    }

    // Create unique ID with timestamp for versioning
    const contractId = `${contract.enhancement_area.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;

    // Prepare record with comprehensive metadata
    const record = {
      id: contractId,
      values: embeddings[0],
      metadata: {
        // Contract data
        enhancement_area: contract.enhancement_area,
        objective: contract.objective,
        modules: contract.implementation_plan?.modules?.join(',') || '',
        architecture: contract.implementation_plan?.architecture || '',
        depends_on: contract.depends_on?.join(',') || '',
        sources: contract.sources?.join(',') || '',
        security: contract.governance?.security || '',
        compliance: contract.governance?.compliance || '',
        ethics: contract.governance?.ethics || '',
        validation_criteria: contract.validation_criteria || '',

        // Audit metadata
        created_by: auditEntry.actor,
        confidence_score: auditEntry.confidence,
        policy_checks_passed: auditEntry.policyChecks.filter((c: any) => c.result === 'pass').length,
        policy_checks_total: auditEntry.policyChecks.length,
        domain_classified: domain,
        human_reviewed: contract.humanReviewed || false,
        review_reason: contract.reviewReason?.join(';') || '',

        // Timestamps
        created_at: auditEntry.timestamp.toISOString(),
        contract_timestamp: contract.timestamp || new Date().toISOString(),

        // Full contract for retrieval
        contract_json: JSON.stringify(contract),
        audit_json: JSON.stringify(auditEntry)
      }
    };

    // Upsert to Pinecone
    await namespace.upsert([record]);

    console.log(`✅ Upserted validated contract: ${contract.enhancement_area} (${contractId})`);
    console.log(`   Domain: ${domain}, Confidence: ${(auditEntry.confidence * 100).toFixed(1)}%`);

    return true;

  } catch (error) {
    console.error('Failed to upsert validated contract:', error);
    return false;
  }
}

// Batch upsert for multiple validated contracts
export async function upsertValidatedContracts(
  contracts: Array<{contract: any, auditEntry: any, domain: string}>
): Promise<{success: number, failed: number}> {
  let success = 0;
  let failed = 0;

  console.log(`📦 Starting batch upsert of ${contracts.length} validated contracts...`);

  for (const item of contracts) {
    const result = await upsertValidatedContract(item.contract, item.auditEntry, item.domain);
    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  console.log(`📊 Batch upsert complete: ${success} success, ${failed} failed`);
  return { success, failed };
}

// Semantic search for similar contracts with audit context
export async function searchSimilarContracts(
  query: string,
  domain: string = 'general',
  topK: number = 5,
  minScore: number = 0.7
): Promise<Array<{
  id: string;
  score: number;
  contract: any;
  auditEntry: any;
  metadata: any;
}>> {
  if (!pineconeClient) {
    console.warn('Pinecone not initialized, returning empty results');
    return [];
  }

  try {
    const index = pineconeClient.index(PINECONE_INDEX);
    const namespace = index.namespace(`${PINECONE_NAMESPACE}-${domain}`);

    // Generate query embedding
    const queryEmbeddings = await performanceOptimizer.generateEmbeddingsBatch([query]);
    if (queryEmbeddings.length === 0) {
      return [];
    }

    const results = await namespace.query({
      topK: topK * 2, // Get more results for filtering
      includeMetadata: true,
      vector: queryEmbeddings[0],
      filter: {
        domain_classified: { $eq: domain }
      }
    });

    // Filter and format results
    const formattedResults = (results.matches || [])
      .filter(match => (match.score || 0) >= minScore)
      .slice(0, topK)
      .map(match => ({
        id: match.id,
        score: match.score || 0,
        contract: match.metadata?.contract_json ? JSON.parse(match.metadata.contract_json as string) : null,
        auditEntry: match.metadata?.audit_json ? JSON.parse(match.metadata.audit_json as string) : null,
        metadata: match.metadata
      }));

    console.log(`🔍 Found ${formattedResults.length} similar contracts for query: "${query}"`);
    return formattedResults;

  } catch (error) {
    console.error('Failed to search similar contracts:', error);
    return [];
  }
}

// Get contract by ID with full audit trail
export async function getContractById(
  contractId: string,
  domain: string = 'general'
): Promise<{
  contract: any;
  auditEntry: any;
  metadata: any;
} | null> {
  if (!pineconeClient) {
    console.warn('Pinecone not initialized');
    return null;
  }

  try {
    const index = pineconeClient.index(PINECONE_INDEX);
    const namespace = index.namespace(`${PINECONE_NAMESPACE}-${domain}`);

    const results = await namespace.fetch([contractId]);

    if (!results.records || !results.records[contractId]) {
      return null;
    }

    const record = results.records[contractId];
    const metadata = record.metadata as any;

    return {
      contract: metadata?.contract_json ? JSON.parse(metadata.contract_json) : null,
      auditEntry: metadata?.audit_json ? JSON.parse(metadata.audit_json) : null,
      metadata
    };

  } catch (error) {
    console.error('Failed to fetch contract by ID:', error);
    return null;
  }
}

// Legacy function - kept for backward compatibility
export async function storeAgentInPinecone(agent: any) {
  await performanceOptimizer.batchStoreAgents([agent]);
}

async function generateEmbedding(text: string): Promise<number[]> {
  // Use performance optimizer for batch processing and caching
  const embeddings = await performanceOptimizer.generateEmbeddingsBatch([text]);
  return embeddings[0] || new Array(1536).fill(0);
}

export async function searchPineconeRecords(query: string, topK: number = 5): Promise<PineconeSearchResult[]> {
  return await performanceOptimizer.optimizedSearch(query, topK);
}

interface PineconeSearchResult {
  id: string;
  score: number;
  metadata?: {
    depends_on?: string[];
    [key: string]: any;
  };
}

// Initialize on module load if API key is available
if (process.env.PINECONE_API_KEY) {
  initializePinecone();
}