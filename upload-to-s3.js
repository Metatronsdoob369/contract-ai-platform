#!/usr/bin/env node

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();

async function uploadAgentManifestToS3() {
  try {
    const manifestPath = path.join(__dirname, 'enhancements_manifest.json');
    const manifestData = fs.readFileSync(manifestPath);

    const bucketName = process.env.AWS_S3_BUCKET || 'agent-manifests-bucket';
    const key = `agent-contracts/enhancements-manifest-${Date.now()}.json`;

    const params = {
      Bucket: bucketName,
      Key: key,
      Body: manifestData,
      ContentType: 'application/json',
      Metadata: {
        'generated-by': 'openai-agents-orchestrator',
        'timestamp': new Date().toISOString(),
        'contract-count': '10'
      }
    };

    const result = await s3.upload(params).promise();

    console.log('✅ Agent manifest uploaded to S3');
    console.log(`📍 S3 Location: ${result.Location}`);
    console.log(`🪣 Bucket: ${bucketName}`);
    console.log(`📄 Key: ${key}`);

    // Also upload to your broader agent ecosystem
    console.log('\n🔗 Ready for integration with:');
    console.log('   • Clay-I knowledge base');
    console.log('   • PATHsassin execution engine');
    console.log('   • Firebase federation layer');
    console.log('   • Training data pipelines');

    return result;

  } catch (error) {
    console.error('❌ S3 upload failed:', error.message);
    console.log('\n💡 Alternative: Contracts stored locally in enhancements_manifest.json');
  }
}

uploadAgentManifestToS3();
