"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFromManifest = generateFromManifest;
const fs_1 = require("fs");
const manifest_builder_1 = require("../orchestrator/manifest-builder");
function toKebabCase(str) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
function toPascalCase(str) {
    return str
        .split(/[\s\-_]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
}
function renderTemplate(template, variables) {
    return template.replace(/\$\{([^}]+)\}/g, (match, key) => variables[key] || match);
}
async function generateFromManifest(manifestPath) {
    const manifest = JSON.parse((0, fs_1.readFileSync)(manifestPath, 'utf-8'));
    const graph = (0, manifest_builder_1.buildDependencyGraph)(manifest.enhancements);
    // Generate in dependency order
    for (const area of graph.build_order) {
        const agent = manifest.enhancements.find((a) => a.enhancement_area === area);
        const moduleName = toKebabCase(area);
        const pascalCase = toPascalCase(area);
        const modulePath = `./src/extensions/${moduleName}`;
        (0, fs_1.mkdirSync)(modulePath, { recursive: true });
        // Load templates
        const moduleTemplate = (0, fs_1.readFileSync)('./scripts/codegen/templates/module.template.ts', 'utf-8');
        const testTemplate = (0, fs_1.readFileSync)('./scripts/codegen/templates/test.template.ts', 'utf-8');
        const readmeTemplate = (0, fs_1.readFileSync)('./scripts/codegen/templates/readme.template.md', 'utf-8');
        // Prepare variables
        const variables = {
            enhancement_area: agent.enhancement_area,
            objective: agent.objective,
            module_name: moduleName,
            pascal_case: pascalCase,
            architecture: agent.implementation_plan.architecture,
            validation_criteria: agent.validation_criteria,
            sources: agent.sources.map((s) => `Source ${s}`).join(', '),
            dependencies_list: agent.depends_on.length > 0
                ? agent.depends_on.map((dep) => `- ${dep}`).join('\n')
                : 'None',
            sources_list: agent.sources.map((s) => `- [${s}]`).join('\n')
        };
        // Generate module
        const moduleContent = renderTemplate(moduleTemplate, variables);
        (0, fs_1.writeFileSync)(`${modulePath}/index.ts`, moduleContent);
        // Generate tests
        const testContent = renderTemplate(testTemplate, variables);
        (0, fs_1.writeFileSync)(`${modulePath}/__tests__/index.test.ts`, testContent);
        // Generate README
        const readmeContent = renderTemplate(readmeTemplate, variables);
        (0, fs_1.writeFileSync)(`${modulePath}/README.md`, readmeContent);
        console.log(`✅ Generated: ${modulePath}`);
    }
}
// CLI runner
if (require.main === module) {
    const manifestPath = process.argv[2] || './enhancements_manifest.json';
    generateFromManifest(manifestPath);
}
