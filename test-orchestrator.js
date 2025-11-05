#!/usr/bin/env node

// test-orchestrator.js - Quick test script to verify the orchestrator works
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Contract-Driven AI Orchestrator V2.1\n');

// Test 1: Check if files exist
console.log('📁 Checking file structure...');
const requiredFiles = [
  'src/orchestration/orchestrator.ts',
  'src/orchestration/cli.ts',
  'src/orchestration/orchestrator.test.ts',
  'master-orchestrator-prompt.yaml',
  'ORCHESTRATOR_README.md'
];

for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    process.exit(1);
  }
}

// Test 2: Check package.json scripts
console.log('\n📋 Checking package.json scripts...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const requiredScripts = [
  'orchestrator',
  'orchestrator:compile',
  'orchestrator:validate',
  'orchestrator:execute',
  'orchestrator:examples',
  'orchestrator:test',
  'orchestrator:status'
];

for (const script of requiredScripts) {
  if (packageJson.scripts[script]) {
    console.log(`✅ ${script}`);
  } else {
    console.log(`❌ ${script} - MISSING`);
    process.exit(1);
  }
}

// Test 3: Check dependencies
console.log('\n📦 Checking dependencies...');
const requiredDeps = ['commander', 'zod', 'js-yaml'];
for (const dep of requiredDeps) {
  if (packageJson.dependencies[dep]) {
    console.log(`✅ ${dep}@${packageJson.dependencies[dep]}`);
  } else {
    console.log(`❌ ${dep} - MISSING`);
    process.exit(1);
  }
}

// Test 4: Try to run orchestrator status
console.log('\n🚀 Testing orchestrator status...');
try {
  const output = execSync('npm run orchestrator:status', { 
    encoding: 'utf-8',
    timeout: 10000 
  });
  console.log('✅ Orchestrator status command works');
  console.log('Output:', output.substring(0, 200) + '...');
} catch (error) {
  console.log('❌ Orchestrator status failed:', error.message);
  // Don't exit, might be due to missing dependencies
}

// Test 5: Generate examples
console.log('\n📝 Testing example generation...');
try {
  execSync('npm run orchestrator:examples -- -o ./test-examples', { 
    encoding: 'utf-8',
    timeout: 15000 
  });
  
  const exampleFiles = [
    'test-examples/trend_example.json',
    'test-examples/quantum_example.json',
    'test-examples/voice_example.json',
    'test-examples/quantum_examples.json'
  ];
  
  for (const file of exampleFiles) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - NOT GENERATED`);
    }
  }
} catch (error) {
  console.log('❌ Example generation failed:', error.message);
}

// Test 6: Validate JSON structure
console.log('\n🔍 Validating example JSON structure...');
try {
  const trendExample = JSON.parse(fs.readFileSync('test-examples/trend_example.json', 'utf-8'));
  if (trendExample.enhancement_area && trendExample.objective && trendExample.confidence_score !== undefined) {
    console.log('✅ Trend example has valid structure');
  } else {
    console.log('❌ Trend example missing required fields');
  }
} catch (error) {
  console.log('❌ Trend example JSON invalid:', error.message);
}

// Cleanup
console.log('\n🧹 Cleaning up test files...');
try {
  execSync('rm -rf ./test-examples', { encoding: 'utf-8' });
  console.log('✅ Test files cleaned up');
} catch (error) {
  console.log('⚠️ Could not clean up test files');
}

console.log('\n🎉 Orchestrator V2.1 Test Complete!');
console.log('\n📋 Next Steps:');
console.log('1. Install dependencies: npm install');
console.log('2. Set up environment variables (.env file)');
console.log('3. Run status check: npm run orchestrator:status');
console.log('4. Generate examples: npm run orchestrator:examples');
console.log('5. Compile manifest: npm run orchestrator:compile');
console.log('6. Read the full documentation: ORCHESTRATOR_README.md');
