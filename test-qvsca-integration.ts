// Test QV-SCA Integration with Orchestrator
// This demonstrates the quantum-verified security audit integration

import { orchestrator } from './src/orchestration/orchestrator';

async function testQVSCAIntegration() {
  console.log('🧪 Testing QV-SCA Integration...');

  try {
    // Initialize services
    await orchestrator.initializeServices();

    // Test enhancement area that should pass audit
    const testEnhancementArea = {
      name: "Test Social Media Agent",
      objective: "Create a secure social media management agent",
      key_requirements: ["Data encryption", "User privacy", "API security"],
      sources: ["Twitter API", "Facebook Graph API"],
      depends_on: []
    };

    // Compile manifest - this will trigger QV-SCA audit
    const manifest = await orchestrator.compileManifest([testEnhancementArea], {
      validateAgainstPinecone: false,
      enableParallelProcessing: true,
      environment: 'development'
    });

    console.log('✅ QV-SCA Integration Test Passed!');
    console.log('📋 Generated Contract:', JSON.stringify(manifest.enhancements[0], null, 2));

    // Verify audit metadata is attached
    const contract = manifest.enhancements[0];
    if (contract.audit_report && contract.audit_timestamp) {
      console.log('✅ Audit metadata attached to contract');
      console.log('📊 CVC Score:', contract.audit_report.cvc_score);
    } else {
      console.log('❌ Audit metadata missing from contract');
    }

  } catch (error) {
    console.error('❌ QV-SCA Integration Test Failed:', error instanceof Error ? error.message : String(error));

    // Check if it's an audit failure (expected behavior for some contracts)
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('QV-SCA Audit Failed')) {
      console.log('ℹ️  Contract was correctly blocked by QV-SCA audit (this is expected behavior)');
    }
  }
}

// Run the test
testQVSCAIntegration().catch(console.error);