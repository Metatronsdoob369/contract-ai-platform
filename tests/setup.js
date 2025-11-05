"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Test setup for OpenAI Agents SDK
const vitest_1 = require("vitest");
// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.OPENAI_API_KEY = 'test-key';
process.env.PINECONE_API_KEY = 'test-pinecone-key';
// Global test setup
(0, vitest_1.beforeAll)(() => {
    // Set up any global test configuration
    console.log('🧪 Setting up test environment...');
});
(0, vitest_1.afterAll)(() => {
    // Clean up after all tests
    console.log('🧹 Cleaning up test environment...');
    vitest_1.vi.clearAllMocks();
});
// Mock console methods to reduce noise during testing
const originalConsole = { ...console };
(0, vitest_1.beforeAll)(() => {
    console.log = vitest_1.vi.fn();
    console.warn = vitest_1.vi.fn();
    console.error = vitest_1.vi.fn();
});
(0, vitest_1.afterAll)(() => {
    // Restore original console methods
    Object.assign(console, originalConsole);
});
