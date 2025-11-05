import { buildDependencyGraph } from '../orchestrator/manifest-builder';
import { writeFileSync } from 'fs';

export function generateMermaidDiagram(graph: any): string {
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
  const graph = buildDependencyGraph(manifest.enhancements);
  const diagram = generateMermaidDiagram(graph);

  const docsDir = './docs';
  // Ensure docs directory exists
  try {
    writeFileSync(`${docsDir}/dependency-graph.md`, `# Dependency Graph\n\n\`\`\`mermaid\n${diagram}\n\`\`\``);
    console.log('✅ Generated dependency-graph.md');
  } catch (error) {
    console.error('Failed to write diagram:', error);
  }
}