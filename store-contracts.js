#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { performanceOptimizer } = require('./dist/src/performance-optimizer');

// Load and store agent contracts in Pinecone for broader agent ecosystem access
async function storeAgentContractsForTraining() {
  try {
    console.log('🤖 Loading agent contracts for training data integration...\n');

    // Read the generated manifest
    const manifestPath = path.join(__dirname, 'enhancements_manifest.json');
    const manifestData = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestData);

    console.log(`📋 Found ${manifest.enhancements.length} agent contracts to store\n`);

    // Store each agent contract in Pinecone for retrieval by other agents
    await performanceOptimizer.batchStoreAgents(manifest.enhancements);

    console.log('✅ Agent contracts stored in Pinecone vector database');
    console.log('🎯 Now available for:');
    console.log('   • Clay-I oracle queries');
    console.log('   • PATHsassin execution planning');
    console.log('   • Cross-agent knowledge sharing');
    console.log('   • Training data for new agent development');
    console.log('\n🔗 Integration complete - agents can now access this knowledge!');

  } catch (error) {
    console.error('❌ Failed to store agent contracts:', error.message);
    process.exit(1);
  }
}

storeAgentContractsForTraining();
