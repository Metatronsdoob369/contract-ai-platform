import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { buildDependencyGraph } from '../orchestrator/manifest-builder';

function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toPascalCase(str: string): string {
  return str
    .split(/[\s\-_]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

function renderTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\$\{([^}]+)\}/g, (match, key) => variables[key] || match);
}

export async function generateFromManifest(manifestPath: string) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  const graph = buildDependencyGraph(manifest.enhancements);

  // Generate in dependency order
  for (const area of graph.build_order) {
    const agent = manifest.enhancements.find((a: any) => a.enhancement_area === area);

    const moduleName = toKebabCase(area);
    const pascalCase = toPascalCase(area);

    const modulePath = `./src/extensions/${moduleName}`;
    mkdirSync(modulePath, { recursive: true });

    // Load templates
    const moduleTemplate = readFileSync('./scripts/codegen/templates/module.template.ts', 'utf-8');
    const testTemplate = readFileSync('./scripts/codegen/templates/test.template.ts', 'utf-8');
    const readmeTemplate = readFileSync('./scripts/codegen/templates/readme.template.md', 'utf-8');

    // Prepare variables
    const variables = {
      enhancement_area: agent.enhancement_area,
      objective: agent.objective,
      module_name: moduleName,
      pascal_case: pascalCase,
      architecture: agent.implementation_plan.architecture,
      validation_criteria: agent.validation_criteria,
      sources: agent.sources.map((s: string) => `Source ${s}`).join(', '),
      dependencies_list: agent.depends_on.length > 0
        ? agent.depends_on.map((dep: string) => `- ${dep}`).join('\n')
        : 'None',
      sources_list: agent.sources.map((s: string) => `- [${s}]`).join('\n')
    };

    // Generate module
    const moduleContent = renderTemplate(moduleTemplate, variables);
    writeFileSync(`${modulePath}/index.ts`, moduleContent);

    // Generate tests
    const testContent = renderTemplate(testTemplate, variables);
    writeFileSync(`${modulePath}/__tests__/index.test.ts`, testContent);

    // Generate README
    const readmeContent = renderTemplate(readmeTemplate, variables);
    writeFileSync(`${modulePath}/README.md`, readmeContent);

    console.log(`✅ Generated: ${modulePath}`);
  }
}

// CLI runner
if (require.main === module) {
  const manifestPath = process.argv[2] || './enhancements_manifest.json';
  generateFromManifest(manifestPath);
}