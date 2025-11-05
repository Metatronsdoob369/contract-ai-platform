"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const schemas_1 = require("../agent-contracts/schemas");
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
(0, vitest_1.describe)('Agent Contract Validation', () => {
    (0, vitest_1.it)('should accept valid contract', () => {
        (0, vitest_1.expect)(() => schemas_1.AgentSchema.parse(validContract)).not.toThrow();
    });
    (0, vitest_1.it)('should reject empty objective', () => {
        const invalid = { ...validContract, objective: '' };
        (0, vitest_1.expect)(() => schemas_1.AgentSchema.parse(invalid)).toThrow();
    });
    (0, vitest_1.it)('should reject short objective', () => {
        const invalid = { ...validContract, objective: 'Too short' };
        (0, vitest_1.expect)(() => schemas_1.AgentSchema.parse(invalid)).toThrow();
    });
    (0, vitest_1.it)('should reject missing governance', () => {
        const invalid = { ...validContract };
        delete invalid.governance;
        (0, vitest_1.expect)(() => schemas_1.AgentSchema.parse(invalid)).toThrow();
    });
    (0, vitest_1.it)('should reject empty modules array', () => {
        const invalid = {
            ...validContract,
            implementation_plan: {
                ...validContract.implementation_plan,
                modules: []
            }
        };
        (0, vitest_1.expect)(() => schemas_1.AgentSchema.parse(invalid)).toThrow();
    });
    (0, vitest_1.it)('should reject missing sources', () => {
        const invalid = { ...validContract, sources: [] };
        (0, vitest_1.expect)(() => schemas_1.AgentSchema.parse(invalid)).toThrow();
    });
    (0, vitest_1.it)('should reject short security description', () => {
        const invalid = {
            ...validContract,
            governance: {
                ...validContract.governance,
                security: 'Short'
            }
        };
        (0, vitest_1.expect)(() => schemas_1.AgentSchema.parse(invalid)).toThrow();
    });
    (0, vitest_1.it)('should reject short validation criteria', () => {
        const invalid = { ...validContract, validation_criteria: 'Short' };
        (0, vitest_1.expect)(() => schemas_1.AgentSchema.parse(invalid)).toThrow();
    });
    (0, vitest_1.it)('should accept contract with dependencies', () => {
        const withDeps = { ...validContract, depends_on: ['Base Module'] };
        (0, vitest_1.expect)(() => schemas_1.AgentSchema.parse(withDeps)).not.toThrow();
    });
    (0, vitest_1.it)('should reject too long enhancement area', () => {
        const invalid = {
            ...validContract,
            enhancement_area: 'A'.repeat(101) // 101 characters
        };
        (0, vitest_1.expect)(() => schemas_1.AgentSchema.parse(invalid)).toThrow();
    });
    (0, vitest_1.it)('should reject too short enhancement area', () => {
        const invalid = { ...validContract, enhancement_area: 'AB' };
        (0, vitest_1.expect)(() => schemas_1.AgentSchema.parse(invalid)).toThrow();
    });
    (0, vitest_1.it)('should reject too many modules', () => {
        const invalid = {
            ...validContract,
            implementation_plan: {
                ...validContract.implementation_plan,
                modules: Array.from({ length: 11 }, (_, i) => `module-${i}`)
            }
        };
        (0, vitest_1.expect)(() => schemas_1.AgentSchema.parse(invalid)).toThrow();
    });
    (0, vitest_1.it)('should reject too long objective', () => {
        const invalid = {
            ...validContract,
            objective: 'A'.repeat(501) // 501 characters
        };
        (0, vitest_1.expect)(() => schemas_1.AgentSchema.parse(invalid)).toThrow();
    });
});
