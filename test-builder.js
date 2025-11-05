#!/usr/bin/env node

// Simple test script for Builder Agent
const { BuilderAgent } = require('./dist/builder-agent');

async function testBuilderAgent() {
  console.log('🚀 Testing Builder Agent Enterprise Orchestration...\n');

  const builder = new BuilderAgent();

  const requirement = {
    description: `Enhance the Builder Agent with full industry-competitive code generation capabilities. Replace all placeholder methods (generateFrontendCode, generateBackendCode, generateInfrastructureCode, generateTests, generateDocumentation) with actual implementations that can generate production-ready code for React, Node.js, PostgreSQL, Docker, Kubernetes, and AWS infrastructure.`,
    domain: 'development-tools'
  };

  try {
    console.log('📋 Submitting requirement to Builder Agent...');
    console.log('Description:', requirement.description.substring(0, 100) + '...\n');

    const result = await builder.build(requirement);

    console.log('✅ BUILDER AGENT RESPONSE:');
    console.log('========================');
    console.log('Project ID:', result.projectId);
    console.log('Domain:', result.domain);
    console.log('Architecture Pattern:', result.architecture.pattern);
    console.log('Tech Stack Areas:', Object.keys(result.techStack).join(', '));
    console.log('Enhancement Areas:', result.enhancementAreas.length);
    console.log('Contracts Generated:', result.contracts.length);
    console.log('Code Artifacts:', Object.keys(result.generatedCode).length);
    console.log('Deployment Platform:', result.deployment.platform);

    console.log('\n📊 DETAILED ANALYSIS:');
    console.log('=====================');

    if (result.enhancementAreas.length > 0) {
      console.log('\n🎯 Enhancement Areas:');
      result.enhancementAreas.forEach((area, i) => {
        console.log(`${i+1}. ${area.name || area}`);
      });
    }

    if (result.architecture.components && result.architecture.components.length > 0) {
      console.log('\n🏗️ Architecture Components:');
      result.architecture.components.forEach((comp, i) => {
        console.log(`${i+1}. ${comp.name || comp}: ${comp.type || 'component'}`);
      });
    }

    console.log('\n🎉 Builder Agent Analysis Complete!');

  } catch (error) {
    console.error('❌ Builder Agent Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testBuilderAgent();
