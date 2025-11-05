import { describe, it, expect } from 'vitest';
import { AgentSchema } from '../agent-contracts/schemas';

const validContract = {
  enhancement_area: 'Sentiment Analysis',
  objective: 'Analyze sentiment of social media posts to understand audience reactions and emotional responses.',
  implementation_plan: {
    modules: ['sentiment-core', 'sentiment-api'],
    architecture: 'Microservice with NLP pipeline and REST API endpoints'
  },
  depends_on: [],
  sources: ['1', '2'],
  governance: {
    security: 'Input sanitization and rate limiting to prevent abuse',
    compliance: 'GDPR compliant data handling with user consent',
    ethics: 'No discriminatory algorithms, bias monitoring in place'
  },
  validation_criteria: 'Accuracy > 85% on test set with balanced classes'
};

describe('Agent Contract Validation', () => {
  it('should accept valid contract', () => {
    expect(() => AgentSchema.parse(validContract)).not.toThrow();
  });

  it('should reject empty objective', () => {
    const invalid = { ...validContract, objective: '' };
    expect(() => AgentSchema.parse(invalid)).toThrow();
  });

  it('should reject short objective', () => {
    const invalid = { ...validContract, objective: 'Too short' };
    expect(() => AgentSchema.parse(invalid)).toThrow();
  });

  it('should reject missing governance', () => {
    const invalid = { ...validContract };
    delete invalid.governance;
    expect(() => AgentSchema.parse(invalid)).toThrow();
  });

  it('should reject empty modules array', () => {
    const invalid = {
      ...validContract,
      implementation_plan: {
        ...validContract.implementation_plan,
        modules: []
      }
    };
    expect(() => AgentSchema.parse(invalid)).toThrow();
  });

  it('should reject missing sources', () => {
    const invalid = { ...validContract, sources: [] };
    expect(() => AgentSchema.parse(invalid)).toThrow();
  });

  it('should reject short security description', () => {
    const invalid = {
      ...validContract,
      governance: {
        ...validContract.governance,
        security: 'Short'
      }
    };
    expect(() => AgentSchema.parse(invalid)).toThrow();
  });

  it('should reject short validation criteria', () => {
    const invalid = { ...validContract, validation_criteria: 'Short' };
    expect(() => AgentSchema.parse(invalid)).toThrow();
  });

  it('should accept contract with dependencies', () => {
    const withDeps = { ...validContract, depends_on: ['Base Module'] };
    expect(() => AgentSchema.parse(withDeps)).not.toThrow();
  });

  it('should reject too long enhancement area', () => {
    const invalid = {
      ...validContract,
      enhancement_area: 'A'.repeat(101) // 101 characters
    };
    expect(() => AgentSchema.parse(invalid)).toThrow();
  });

  it('should reject too short enhancement area', () => {
    const invalid = { ...validContract, enhancement_area: 'AB' };
    expect(() => AgentSchema.parse(invalid)).toThrow();
  });

  it('should reject too many modules', () => {
    const invalid = {
      ...validContract,
      implementation_plan: {
        ...validContract.implementation_plan,
        modules: Array.from({ length: 11 }, (_, i) => `module-${i}`)
      }
    };
    expect(() => AgentSchema.parse(invalid)).toThrow();
  });

  it('should reject too long objective', () => {
    const invalid = {
      ...validContract,
      objective: 'A'.repeat(501) // 501 characters
    };
    expect(() => AgentSchema.parse(invalid)).toThrow();
  });
});