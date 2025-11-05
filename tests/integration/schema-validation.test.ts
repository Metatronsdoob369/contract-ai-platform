import { describe, it, expect } from 'vitest';
import { AgentSchema, AgentArraySchema } from '../../agent-contracts/schemas';

describe('Schema Validation Integration Tests', () => {
  describe('Individual Agent Contract Validation', () => {
    it('should validate a complete, correct agent contract', () => {
      const validContract = {
        enhancement_area: "test-agent",
        objective: "A comprehensive objective that is definitely longer than twenty characters to satisfy validation requirements",
        implementation_plan: {
          modules: ["module1", "module2", "module3"],
          architecture: "A detailed architecture description that meets the minimum length requirement for proper validation"
        },
        depends_on: [],
        sources: ["source1", "source2"],
        governance: {
          security: "Comprehensive security measures including encryption, access controls, and audit logging",
          compliance: "Full compliance with GDPR, CCPA, and industry-specific regulations",
          ethics: "Ethical AI practices including bias mitigation, transparency, and human oversight"
        },
        validation_criteria: "Measurable success metrics including accuracy rates, performance benchmarks, and user satisfaction scores"
      };

      const result = AgentSchema.safeParse(validContract);
      expect(result.success).toBe(true);
      expect(result.data.enhancement_area).toBe("test-agent");
    });

    it('should reject contracts with missing required fields', () => {
      const invalidContract = {
        // Missing enhancement_area
        objective: "Valid objective text that meets length requirements",
        implementation_plan: {
          modules: ["module1"],
          architecture: "Valid architecture description"
        },
        depends_on: [],
        sources: ["source1"],
        governance: {
          security: "Security measures",
          compliance: "Compliance measures",
          ethics: "Ethical measures"
        },
        validation_criteria: "Validation criteria"
      };

      const result = AgentSchema.safeParse(invalidContract);
      expect(result.success).toBe(false);
      expect(result.error?.issues.some(issue => issue.path.includes('enhancement_area'))).toBe(true);
    });

    it('should reject contracts with invalid field lengths', () => {
      const invalidContract = {
        enhancement_area: "test-agent",
        objective: "Too short", // Less than 20 characters
        implementation_plan: {
          modules: ["module1"],
          architecture: "Short" // Less than 10 characters
        },
        depends_on: [],
        sources: ["source1"],
        governance: {
          security: "Security",
          compliance: "Compliance",
          ethics: "Ethics"
        },
        validation_criteria: "Criteria"
      };

      const result = AgentSchema.safeParse(invalidContract);
      expect(result.success).toBe(false);
      expect(result.error?.issues.length).toBeGreaterThan(0);
    });

    it('should validate contracts with complex dependency relationships', () => {
      const contracts = [
        {
          enhancement_area: "foundation-agent",
          objective: "Provides foundational capabilities for other agents with sufficient length",
          implementation_plan: {
            modules: ["core", "utils"],
            architecture: "Foundational architecture that supports dependent agents"
          },
          depends_on: [],
          sources: ["foundation-source"],
          governance: {
            security: "Foundation security measures",
            compliance: "Foundation compliance",
            ethics: "Foundation ethics"
          },
          validation_criteria: "Foundation validation criteria"
        },
        {
          enhancement_area: "dependent-agent",
          objective: "Depends on foundation agent for core functionality and operations",
          implementation_plan: {
            modules: ["advanced", "integration"],
            architecture: "Advanced architecture building on foundation capabilities"
          },
          depends_on: ["foundation-agent"],
          sources: ["dependent-source"],
          governance: {
            security: "Dependent security measures",
            compliance: "Dependent compliance",
            ethics: "Dependent ethics"
          },
          validation_criteria: "Dependent validation criteria"
        }
      ];

      const result = AgentArraySchema.safeParse(contracts);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should reject contracts with circular dependencies', () => {
      const circularContracts = [
        {
          enhancement_area: "agent-a",
          objective: "Agent A with circular dependency issue in validation testing",
          implementation_plan: {
            modules: ["module-a"],
            architecture: "Architecture for agent A in circular dependency test"
          },
          depends_on: ["agent-b"],
          sources: ["source-a"],
          governance: {
            security: "Security A",
            compliance: "Compliance A",
            ethics: "Ethics A"
          },
          validation_criteria: "Criteria A"
        },
        {
          enhancement_area: "agent-b",
          objective: "Agent B with circular dependency creating validation failure",
          implementation_plan: {
            modules: ["module-b"],
            architecture: "Architecture for agent B in circular dependency scenario"
          },
          depends_on: ["agent-a"],
          sources: ["source-b"],
          governance: {
            security: "Security B",
            compliance: "Compliance B",
            ethics: "Ethics B"
          },
          validation_criteria: "Criteria B"
        }
      ];

      const result = AgentArraySchema.safeParse(circularContracts);
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Invalid dependency');
    });

    it('should validate contracts with maximum allowed modules', () => {
      const maxModulesContract = {
        enhancement_area: "max-modules-agent",
        objective: "Testing maximum module limit validation in agent contract schema",
        implementation_plan: {
          modules: ["mod1", "mod2", "mod3", "mod4", "mod5", "mod6", "mod7", "mod8", "mod9", "mod10"], // Exactly 10 modules
          architecture: "Architecture supporting maximum allowed modules for comprehensive functionality"
        },
        depends_on: [],
        sources: ["max-source"],
        governance: {
          security: "Maximum security for max modules",
          compliance: "Maximum compliance coverage",
          ethics: "Maximum ethical considerations"
        },
        validation_criteria: "Maximum validation criteria coverage"
      };

      const result = AgentSchema.safeParse(maxModulesContract);
      expect(result.success).toBe(true);
    });

    it('should reject contracts exceeding maximum modules', () => {
      const tooManyModulesContract = {
        enhancement_area: "too-many-modules",
        objective: "Testing rejection of contracts with too many modules",
        implementation_plan: {
          modules: Array(11).fill("module"), // 11 modules - exceeds limit
          architecture: "Architecture that would support too many modules"
        },
        depends_on: [],
        sources: ["excess-source"],
        governance: {
          security: "Security for excess modules",
          compliance: "Compliance for excess modules",
          ethics: "Ethics for excess modules"
        },
        validation_criteria: "Validation for excess modules"
      };

      const result = AgentSchema.safeParse(tooManyModulesContract);
      expect(result.success).toBe(false);
    });
  });

  describe('Batch Contract Validation', () => {
    it('should validate arrays of mixed valid and invalid contracts', () => {
      const mixedContracts = [
        // Valid contract
        {
          enhancement_area: "valid-agent",
          objective: "A properly formed objective that meets all validation requirements",
          implementation_plan: {
            modules: ["valid-module"],
            architecture: "Valid architecture description meeting length requirements"
          },
          depends_on: [],
          sources: ["valid-source"],
          governance: {
            security: "Valid security measures",
            compliance: "Valid compliance measures",
            ethics: "Valid ethical measures"
          },
          validation_criteria: "Valid validation criteria"
        },
        // Invalid contract (missing objective)
        {
          enhancement_area: "invalid-agent",
          implementation_plan: {
            modules: ["invalid-module"],
            architecture: "Invalid architecture"
          },
          depends_on: [],
          sources: ["invalid-source"],
          governance: {
            security: "Invalid security",
            compliance: "Invalid compliance",
            ethics: "Invalid ethics"
          },
          validation_criteria: "Invalid criteria"
        }
      ];

      const result = AgentArraySchema.safeParse(mixedContracts);
      expect(result.success).toBe(false); // Should fail due to invalid contract
    });

    it('should handle empty contract arrays', () => {
      const result = AgentArraySchema.safeParse([]);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });
  });

  describe('Schema Evolution and Backwards Compatibility', () => {
    it('should maintain backwards compatibility with previous schema versions', () => {
      // Test contracts that might be from earlier versions
      const legacyContract = {
        enhancement_area: "legacy-agent",
        objective: "Legacy contract from earlier schema version with full compatibility",
        implementation_plan: {
          modules: ["legacy-module"],
          architecture: "Legacy architecture that should still validate correctly"
        },
        depends_on: [],
        sources: ["legacy-source"],
        governance: {
          security: "Legacy security approach",
          compliance: "Legacy compliance framework",
          ethics: "Legacy ethical guidelines"
        },
        validation_criteria: "Legacy validation methodology"
      };

      const result = AgentSchema.safeParse(legacyContract);
      expect(result.success).toBe(true);
    });
  });
});