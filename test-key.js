#!/usr/bin/env node

const OpenAI = require('openai');
require('dotenv').config();

async function testKey() {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    console.log('🔑 Testing your OpenAI API key...');

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Say "API key works!" and nothing else.' }],
      max_tokens: 10,
    });

    console.log('✅ SUCCESS! API key is valid!');
    console.log('🤖 Response:', response.choices[0].message.content);
    console.log('\n🚀 Ready to run: npm run orchestrate');

  } catch (error) {
    console.log('❌ API key invalid:', error.message);
    console.log('\n🔄 Get a new key from: https://platform.openai.com/api-keys');
  }
}

testKey();
