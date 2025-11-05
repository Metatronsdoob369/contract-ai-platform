"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAgentContract = validateAgentContract;
const schemas_1 = require("../agent-contracts/schemas");
const fs_1 = require("fs");
const zod_1 = require("zod");
function validateAgentContract(contractPath) {
    const contract = JSON.parse((0, fs_1.readFileSync)(contractPath, 'utf-8'));
    try {
        const validated = schemas_1.AgentSchema.parse(contract);
        console.log(`✅ Valid contract: ${validated.enhancement_area}`);
        return { valid: true, contract: validated };
    }
    catch (error) {
        console.error(`❌ Invalid contract: ${contractPath}`);
        if (error instanceof zod_1.ZodError) {
            console.error(error.errors);
            return { valid: false, errors: error.errors };
        }
        else {
            console.error('Unknown validation error:', error);
            return { valid: false, errors: [{ message: 'Unknown error' }] };
        }
    }
}
// CLI runner
if (require.main === module) {
    const contractPath = process.argv[2];
    if (!contractPath) {
        console.log('Usage: ts-node validate-agent.ts <path-to-contract.json>');
        process.exit(1);
    }
    const result = validateAgentContract(contractPath);
    process.exit(result.valid ? 0 : 1);
}
