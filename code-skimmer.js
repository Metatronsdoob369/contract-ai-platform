#!/usr/bin/env node

/**
 * Code Skimmer - AI-Powered Code Analysis Tool
 * Extracts templates, patterns, and structures from codebases
 * Outputs structured JSON for LLM consumption
 *
 * Usage: node code-skimmer.js <directory> [options]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CodeSkimmer {
  constructor() {
    this.templates = {
      classes: [],
      functions: [],
      components: [],
      apis: [],
      models: [],
      tests: [],
      infrastructure: []
    };

    this.patterns = {
      imports: new Map(),
      dependencies: new Map(),
      architectures: [],
      conventions: []
    };

    this.stats = {
      filesAnalyzed: 0,
      linesOfCode: 0,
      languages: new Set(),
      complexity: 0
    };
  }

  async skimDirectory(directory, options = {}) {
    console.log(`🔍 Starting code skim of: ${directory}`);
    console.log('=' .repeat(50));

    const files = this.getCodeFiles(directory);
    console.log(`📁 Found ${files.length} code files to analyze\n`);

    for (const file of files) {
      await this.analyzeFile(file, options);
    }

    this.generateInsights();
    this.outputResults();

    return this.templates;
  }

  getCodeFiles(directory) {
    const files = [];

    function scan(dir) {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Skip common non-code directories
          if (!['node_modules', '.git', 'dist', 'build', '__pycache__'].includes(item)) {
            scan(fullPath);
          }
        } else {
          const ext = path.extname(item);
          if (['.js', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.h'].includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    }

    scan(directory);
    return files;
  }

  async analyzeFile(filePath, options) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const ext = path.extname(filePath);
      const language = this.getLanguageFromExt(ext);

      this.stats.filesAnalyzed++;
      this.stats.linesOfCode += content.split('\n').length;
      this.stats.languages.add(language);

      console.log(`📄 Analyzing: ${path.relative(process.cwd(), filePath)} (${language})`);

      // Analyze based on language
      switch (language) {
        case 'typescript':
        case 'javascript':
          this.analyzeJavaScript(content, filePath);
          break;
        case 'python':
          this.analyzePython(content, filePath);
          break;
        default:
          this.analyzeGeneric(content, filePath);
      }

    } catch (error) {
      console.warn(`⚠️  Error analyzing ${filePath}: ${error.message}`);
    }
  }

  getLanguageFromExt(ext) {
    const map = {
      '.js': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.java': 'java',
      '.cpp': 'cpp',
      '.c': 'c',
      '.h': 'c'
    };
    return map[ext] || 'unknown';
  }

  analyzeJavaScript(content, filePath) {
    const filename = path.basename(filePath);

    // Extract class definitions
    const classMatches = content.match(/class\s+(\w+)[\s\S]*?(?=class|\n\n|$)/g);
    if (classMatches) {
      for (const classDef of classMatches) {
        const classMatch = classDef.match(/class\s+(\w+)/);
        if (classMatch) {
          this.templates.classes.push({
            name: classMatch[1],
            language: 'typescript',
            pattern: this.extractClassPattern(classDef),
            file: filename,
            complexity: this.calculateComplexity(classDef)
          });
        }
      }
    }

    // Extract function definitions
    const funcMatches = content.match(/(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)[\s\S]*?(?=function|class|const|\n\n|$)/g);
    if (funcMatches) {
      for (const funcDef of funcMatches) {
        const funcMatch = funcDef.match(/(?:export\s+)?(?:async\s+)?function\s+(\w+)/);
        if (funcMatch) {
          this.templates.functions.push({
            name: funcMatch[1],
            language: 'typescript',
            pattern: this.extractFunctionPattern(funcDef),
            file: filename,
            async: funcDef.includes('async'),
            params: this.extractParameters(funcDef)
          });
        }
      }
    }

    // Extract React components (if TSX)
    if (filename.endsWith('.tsx')) {
      this.analyzeReactComponent(content, filename);
    }

    // Extract imports
    const importMatches = content.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g);
    if (importMatches) {
      for (const importStmt of importMatches) {
        const match = importStmt.match(/from\s+['"]([^'"]+)['"]/);
        if (match) {
          const module = match[1];
          this.patterns.imports.set(module, (this.patterns.imports.get(module) || 0) + 1);
        }
      }
    }
  }

  analyzePython(content, filePath) {
    const filename = path.basename(filePath);

    // Extract class definitions
    const classMatches = content.match(/class\s+(\w+)[^:]*:/g);
    if (classMatches) {
      for (const classMatch of classMatches) {
        const className = classMatch.match(/class\s+(\w+)/)[1];
        this.templates.classes.push({
          name: className,
          language: 'python',
          pattern: 'class_template',
          file: filename
        });
      }
    }

    // Extract function definitions
    const funcMatches = content.match(/def\s+(\w+)\s*\([^)]*\):/g);
    if (funcMatches) {
      for (const funcMatch of funcMatches) {
        const funcName = funcMatch.match(/def\s+(\w+)/)[1];
        this.templates.functions.push({
          name: funcName,
          language: 'python',
          pattern: 'function_template',
          file: filename,
          params: this.extractPythonParameters(funcMatch)
        });
      }
    }

    // Extract imports
    const importMatches = content.match(/^(?:from\s+\w+\s+)?import\s+.*$/gm);
    if (importMatches) {
      for (const importStmt of importMatches) {
        this.patterns.imports.set(importStmt.trim(), (this.patterns.imports.get(importStmt.trim()) || 0) + 1);
      }
    }
  }

  analyzeGeneric(content, filePath) {
    // Basic analysis for other languages
    const lines = content.split('\n');
    this.stats.complexity += lines.length;
  }

  analyzeReactComponent(content, filename) {
    // Look for React component patterns
    const componentMatches = content.match(/(?:export\s+)?(?:const|function)\s+(\w+)\s*(?:\([^)]*\))?\s*=>\s*{[\s\S]*?}|\bfunction\s+(\w+)\s*\([^)]*\)\s*{[\s\S]*?return\s*\([\s\S]*?<[\s\S]*?<\/[\s\S]*?\);?[\s\S]*?}/g);

    if (componentMatches) {
      for (const component of componentMatches) {
        const nameMatch = component.match(/(?:const|function)\s+(\w+)/) ||
                         component.match(/function\s+(\w+)/);
        if (nameMatch) {
          this.templates.components.push({
            name: nameMatch[1],
            language: 'typescript',
            pattern: 'react_component',
            file: filename,
            props: this.extractReactProps(component),
            hooks: this.extractReactHooks(component)
          });
        }
      }
    }
  }

  extractClassPattern(classDef) {
    // Extract constructor, methods, properties
    const hasConstructor = /constructor\s*\(/.test(classDef);
    const methods = (classDef.match(/(?:async\s+)?(\w+)\s*\([^)]*\)\s*{/g) || []).length;
    const properties = (classDef.match(/this\.\w+\s*=/g) || []).length;

    if (hasConstructor && methods > 3) return 'complex_class';
    if (methods > 0) return 'standard_class';
    return 'simple_class';
  }

  extractFunctionPattern(funcDef) {
    const isAsync = funcDef.includes('async');
    const params = (funcDef.match(/\w+\s*:/g) || []).length;
    const complexity = funcDef.split('\n').length;

    if (isAsync && complexity > 10) return 'complex_async_function';
    if (isAsync) return 'async_function';
    if (params > 3) return 'multi_param_function';
    return 'simple_function';
  }

  extractParameters(funcDef) {
    const paramMatch = funcDef.match(/\(([^)]*)\)/);
    if (paramMatch) {
      return paramMatch[1].split(',').map(p => p.trim()).filter(p => p);
    }
    return [];
  }

  extractPythonParameters(funcDef) {
    const paramMatch = funcDef.match(/\(([^)]*)\)/);
    if (paramMatch) {
      return paramMatch[1].split(',').map(p => p.trim()).filter(p => p);
    }
    return [];
  }

  extractReactProps(component) {
    const propMatches = component.match(/\{\s*(\w+)\s*\}/g);
    return propMatches ? propMatches.map(m => m.replace(/[{}]/g, '').trim()) : [];
  }

  extractReactHooks(component) {
    const hooks = [];
    if (component.includes('useState')) hooks.push('useState');
    if (component.includes('useEffect')) hooks.push('useEffect');
    if (component.includes('useContext')) hooks.push('useContext');
    if (component.includes('useReducer')) hooks.push('useReducer');
    return hooks;
  }

  calculateComplexity(code) {
    const lines = code.split('\n').length;
    const conditionals = (code.match(/\bif\b|\belse\b|\bswitch\b/g) || []).length;
    const loops = (code.match(/\bfor\b|\bwhile\b|\bdo\b/g) || []).length;
    return Math.min(10, Math.floor((lines / 10) + conditionals + loops));
  }

  generateInsights() {
    console.log('\n🧠 Generating Code Insights...');

    // Analyze architecture patterns
    if (this.templates.classes.length > 0) {
      this.patterns.architectures.push('object_oriented');
    }
    if (this.templates.functions.length > this.templates.classes.length) {
      this.patterns.architectures.push('functional');
    }
    if (this.templates.components.length > 0) {
      this.patterns.architectures.push('component_based');
    }

    // Analyze coding conventions
    const importPatterns = Array.from(this.patterns.imports.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    this.patterns.conventions = importPatterns.map(([module, count]) => ({
      pattern: `imports from ${module}`,
      frequency: count
    }));
  }

  outputResults() {
    const output = {
      metadata: {
        timestamp: new Date().toISOString(),
        directory: process.cwd(),
        stats: {
          filesAnalyzed: this.stats.filesAnalyzed,
          linesOfCode: this.stats.linesOfCode,
          languages: Array.from(this.stats.languages),
          averageComplexity: Math.round(this.stats.complexity / Math.max(1, this.stats.filesAnalyzed))
        }
      },
      templates: this.templates,
      patterns: {
        architectures: this.patterns.architectures,
        conventions: this.patterns.conventions,
        topImports: Object.fromEntries(
          Array.from(this.patterns.imports.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
        )
      },
      insights: {
        primaryArchitecture: this.patterns.architectures[0] || 'unknown',
        codeMaturity: this.assessCodeMaturity(),
        recommendations: this.generateRecommendations()
      }
    };

    // Write to file
    const outputFile = 'code-skimmer-results.json';
    fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));

    console.log(`\n✅ Code skimming complete!`);
    console.log(`📊 Results saved to: ${outputFile}`);
    console.log(`📈 Analyzed ${this.stats.filesAnalyzed} files, ${this.stats.linesOfCode} lines of code`);
    console.log(`🏗️  Primary architecture: ${output.insights.primaryArchitecture}`);
    console.log(`📋 Found ${this.templates.classes.length} classes, ${this.templates.functions.length} functions, ${this.templates.components.length} components`);
  }

  assessCodeMaturity() {
    let score = 0;
    if (this.templates.tests.length > 0) score += 2;
    if (this.templates.classes.length > this.templates.functions.length) score += 2;
    if (this.stats.linesOfCode > 1000) score += 2;
    if (this.patterns.architectures.includes('component_based')) score += 2;
    return Math.min(10, score);
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.templates.tests.length === 0) {
      recommendations.push('Add comprehensive test coverage');
    }

    if (this.templates.components.length > 0 && !this.patterns.architectures.includes('microservices')) {
      recommendations.push('Consider microservices architecture for scalability');
    }

    if (this.stats.languages.size > 2) {
      recommendations.push('Standardize on primary language or use polyglot architecture');
    }

    return recommendations;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const directory = args[0] || '.';

  if (!fs.existsSync(directory)) {
    console.error(`❌ Directory not found: ${directory}`);
    process.exit(1);
  }

  const skimmer = new CodeSkimmer();
  await skimmer.skimDirectory(directory);

  console.log('\n🎯 Ready for LLM consumption!');
  console.log('The structured JSON output contains:');
  console.log('• Code templates and patterns');
  console.log('• Architecture insights');
  console.log('• Implementation recommendations');
  console.log('• Statistical analysis');
  console.log('\n🚀 Feed this to an LLM for code generation system synthesis!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = CodeSkimmer;
