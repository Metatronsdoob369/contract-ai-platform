#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function exportForCrewAI() {
  const manifestPath = path.join(__dirname, 'enhancements_manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  // Convert to CrewAI format
  const crewAIAgents = manifest.enhancements.map(contract => ({
    name: contract.enhancement_area.replace(/\s+/g, '_').toLowerCase(),
    role: `${contract.enhancement_area} Specialist`,
    goal: `Implement ${contract.enhancement_area} enhancement`,
    backstory: `Expert agent for ${contract.enhancement_area} with implementation plan: ${contract.implementation_plan.modules.join(', ')}`,
    modules: contract.implementation_plan.modules,
    governance: contract.governance,
    validation: contract.validation_criteria
  }));

  // Save as Python importable format
  const outputPath = path.join(__dirname, 'crewai_agents_export.json');
  fs.writeFileSync(outputPath, JSON.stringify(crewAIAgents, null, 2));

  console.log('✅ Exported for CrewAI integration');
  console.log(`📄 Saved to: ${outputPath}`);
  console.log(`🤖 ${crewAIAgents.length} agents ready for CrewAI pipeline`);
}

exportForCrewAI();
