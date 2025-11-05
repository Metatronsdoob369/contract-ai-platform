#!/usr/bin/env ts-node

/**
 * @file test-domain-orchestrator.ts
 * @description Test script for the complete Policy-Authoritative Orchestrator flow
 */

import { runPolicyAuthoritativeOrchestrator, demonstrateCompleteFlow } from './domain-agent-orchestrator';

async function main() {
  console.log('🧪 Testing Complete Policy-Authoritative Orchestration Flow...\n');

  try {
    // Test 1: Demonstrate the complete flow from client prompt
    console.log('='.repeat(60));
    console.log('🧪 TEST 1: Complete Client Prompt → Phase-1 → Orchestration Flow');
    console.log('='.repeat(60));

    await demonstrateCompleteFlow();

    console.log('\n\n' + '='.repeat(60));
    console.log('🧪 TEST 2: Traditional YAML-based Orchestration');
    console.log('='.repeat(60));

    // Test 2: Traditional YAML-based orchestration
    await runPolicyAuthoritativeOrchestrator();

    console.log('\n✅ All orchestration tests completed successfully!');

  } catch (error) {
    console.error('❌ Orchestration test failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
