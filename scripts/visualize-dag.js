"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMermaidDiagram = generateMermaidDiagram;
const manifest_builder_1 = require("../orchestrator/manifest-builder");
const fs_1 = require("fs");
function generateMermaidDiagram(graph) {
    let mermaid = 'graph TD\n';
    // Add nodes with levels
    for (const [node, level] of graph.levels) {
        const sanitized = node.replace(/[^a-zA-Z0-9]/g, '_');
        mermaid += `  ${sanitized}["${node}<br/>Level ${level}"]\n`;
    }
    // Add edges
    for (const edge of graph.edges) {
        const from = edge.from.replace(/[^a-zA-Z0-9]/g, '_');
        const to = edge.to.replace(/[^a-zA-Z0-9]/g, '_');
        mermaid += `  ${from} --> ${to}\n`;
    }
    return mermaid;
}
// Auto-generate and save to docs
if (require.main === module) {
    const manifest = require('../enhancements_manifest.json');
    const graph = (0, manifest_builder_1.buildDependencyGraph)(manifest.enhancements);
    const diagram = generateMermaidDiagram(graph);
    const docsDir = './docs';
    // Ensure docs directory exists
    try {
        (0, fs_1.writeFileSync)(`${docsDir}/dependency-graph.md`, `# Dependency Graph\n\n\`\`\`mermaid\n${diagram}\n\`\`\``);
        console.log('✅ Generated dependency-graph.md');
    }
    catch (error) {
        console.error('Failed to write diagram:', error);
    }
}
