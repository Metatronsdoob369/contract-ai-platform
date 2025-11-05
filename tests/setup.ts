// Test setup for OpenAI Agents SDK
import { beforeAll, afterAll, vi } from 'vitest';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.OPENAI_API_KEY = 'test-key';
process.env.PINECONE_API_KEY = 'test-pinecone-key';

// Global test setup
beforeAll(() => {
  // Set up any global test configuration
  console.log('🧪 Setting up test environment...');
});

afterAll(() => {
  // Clean up after all tests
  console.log('🧹 Cleaning up test environment...');
  vi.clearAllMocks();
});

// Mock console methods to reduce noise during testing
const originalConsole = { ...console };
beforeAll(() => {
  console.log = vi.fn();
  console.warn = vi.fn();
  console.error = vi.fn();
});

afterAll(() => {
  // Restore original console methods
  Object.assign(console, originalConsole);
});