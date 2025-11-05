#!/usr/bin/env node

/**
 * Environment Configuration Test Script
 * Tests all required and optional environment variables for the OpenAI Agents SDK
 */

const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');

async function testEnvironment() {
  console.log('🧪 Testing OpenAI Agents SDK Environment Configuration\n');

  const results = {
    openai: { status: 'pending', message: '' },
    pinecone: { status: 'pending', message: '' },
    overall: { status: 'pending', message: '' }
  };

  // Test OpenAI API Key
  console.log('🔑 Testing OpenAI API Key...');
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
      throw new Error('OPENAI_API_KEY does not appear to be a valid OpenAI key (should start with "sk-")');
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Test API connection by listing models
    await openai.models.list();

    results.openai = {
      status: 'success',
      message: '✅ OpenAI API key is valid and connection successful'
    };
    console.log(results.openai.message);

  } catch (error) {
    results.openai = {
      status: 'error',
      message: `❌ OpenAI API test failed: ${error.message}`
    };
    console.log(results.openai.message);
  }

  // Test Pinecone API Key (Optional)
  console.log('\n🌲 Testing Pinecone API Key...');
  try {
    if (!process.env.PINECONE_API_KEY) {
      results.pinecone = {
        status: 'warning',
        message: '⚠️ PINECONE_API_KEY not set - Pinecone features will be disabled (this is optional)'
      };
      console.log(results.pinecone.message);
    } else {
      const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

      // Test API connection by listing indexes
      await pinecone.listIndexes();

      results.pinecone = {
        status: 'success',
        message: '✅ Pinecone API key is valid and connection successful'
      };
      console.log(results.pinecone.message);
    }

  } catch (error) {
    results.pinecone = {
      status: 'error',
      message: `❌ Pinecone API test failed: ${error.message}`
    };
    console.log(results.pinecone.message);
  }

  // Overall Assessment
  console.log('\n📊 Environment Test Summary:');

  const hasOpenAI = results.openai.status === 'success';
  const hasPinecone = results.pinecone.status === 'success';
  const pineconeOptional = results.pinecone.status === 'warning';

  if (hasOpenAI && (hasPinecone || pineconeOptional)) {
    results.overall = {
      status: 'success',
      message: '✅ Environment is properly configured for OpenAI Agents SDK'
    };
  } else if (hasOpenAI && !hasPinecone && !pineconeOptional) {
    results.overall = {
      status: 'warning',
      message: '⚠️ OpenAI configured but Pinecone has issues - basic functionality available'
    };
  } else {
    results.overall = {
      status: 'error',
      message: '❌ Environment configuration incomplete - check API keys'
    };
  }

  console.log(results.overall.message);

  // Philosophy Transformation Readiness
  console.log('\n🎓 Philosophy Transformation Readiness:');
  if (hasOpenAI) {
    console.log('✅ Ready to generate agent contracts for philosophy transformation');
    if (hasPinecone) {
      console.log('✅ Knowledge deduplication enabled - will prevent duplicate research');
    } else {
      console.log('⚠️ Knowledge deduplication disabled - may generate duplicate research');
    }
  } else {
    console.log('❌ Not ready - OpenAI API key required for philosophy transformation');
  }

  // Exit with appropriate code
  const exitCode = results.overall.status === 'error' ? 1 : 0;
  process.exit(exitCode);
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught exception during environment test:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled rejection during environment test:', reason);
  process.exit(1);
});

// Run the test
testEnvironment().catch((error) => {
  console.error('💥 Environment test failed with error:', error);
  process.exit(1);
});