import { AgentSchema } from '../agent-contracts/schemas';
import { readFileSync } from 'fs';
import { ZodError } from 'zod';

export function validateAgentContract(contractPath: string) {
  const contract = JSON.parse(readFileSync(contractPath, 'utf-8'));

  try {
    const validated = AgentSchema.parse(contract);
    console.log(`✅ Valid contract: ${validated.enhancement_area}`);
    return { valid: true, contract: validated };
  } catch (error) {
    console.error(`❌ Invalid contract: ${contractPath}`);
    if (error instanceof ZodError) {
      console.error(error.errors);
      return { valid: false, errors: error.errors };
    } else {
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