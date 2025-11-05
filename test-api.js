#!/usr/bin/env node

const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testAPI() {
  try {
    console.log('🔗 Testing OpenAI API connection...');

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'user', content: 'Say "Hello from OpenAI Agents!" and nothing else.' }
      ],
      max_tokens: 50,
    });

    console.log('✅ API connection successful!');
    console.log('🤖 Response:', response.choices[0].message.content);
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPI();
