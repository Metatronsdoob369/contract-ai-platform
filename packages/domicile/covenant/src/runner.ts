import { PurityBoundaryOracle } from '../oracles/purity.js';
import { IntegrityOracle } from '../oracles/integrity.js';
import { DensityOracle } from '../oracles/density.js';
import { IOracleResult } from '../oracles/types.js';
import * as fs from 'fs';

// Registry
const ORACLE_REGISTRY: Record<string, any> = {
    'purity_boundary': PurityBoundaryOracle,
    'covenant_integrity': IntegrityOracle,
    'density_metric': DensityOracle
};

interface IManifest {
    agent_id: string;
    protocol: string;
    task_id: string;
    oracles: string[];
    targets: string[];
}

function parseArgs() {
    const args = process.argv.slice(2);
    const config: Partial<IManifest> = {};
    args.forEach(arg => {
        const [key, value] = arg.split('=');
        if (key === '--target') config.targets = config.targets ? [...config.targets, value] : [value];
        if (key === '--only') config.oracles = [value];
        if (key === '--task') config.task_id = value;
    });
    return config;
}

async function runCovenant() {
    const cliConfig = parseArgs();
    console.log("Starting Covenant Verification...");
    
    const manifest: IManifest = {
        agent_id: "clay-i",
        protocol: "covenant.agent@v1.2", 
        task_id: cliConfig.task_id || "ci-enforcement-001",
        oracles: cliConfig.oracles || ['purity_boundary', 'covenant_integrity', 'density_metric'],
        targets: cliConfig.targets || ['./src/runner.ts', './package.json'] 
    };

    const results: IOracleResult[] = [];
    let systemDegraded = false;

    for (const oracleName of manifest.oracles) {
        const OracleClass = ORACLE_REGISTRY[oracleName];
        if (!OracleClass) {
            console.warn(`[WARN] SKIPPING UNKNOWN ORACLE: ${oracleName}`);
            continue;
        }

        const oracle = new OracleClass();
        console.log(`\n--- ORACLE: ${oracleName.toUpperCase()} ---`);
        
        for (const target of manifest.targets) {
            if (!fs.existsSync(target)) {
                 console.warn(`[SKIP] Target not found: ${target}`);
                 continue;
            }

            const result = await oracle.verify(target);
            results.push(result);

            if (!result.passed) {
                systemDegraded = true;
                console.error(`\x1b[31m[FAIL] ${target} -> ${result.stdout}\x1b[0m`);
            } else {
                console.log(`\x1b[32m[PASS] ${target} -> ${result.stdout}\x1b[0m`);
            }
        }
    }

    const outputArtifact = {
        agent_id: manifest.agent_id,
        timestamp: new Date().toISOString(),
        status: systemDegraded ? "SYSTEM_DEGRADED" : "success",
        results: results
    };

    fs.writeFileSync('covenant-report.json', JSON.stringify(outputArtifact, null, 2));

    if (systemDegraded) {
        console.error("\n\x1b[41m COVENANT BROKEN \x1b[0m");
        process.exit(1);
    }
    console.log("\n\x1b[42m COVENANT SEALED \x1b[0m");
}

runCovenant().catch(err => {
    console.error("FATAL RUNNER ERROR", err);
    process.exit(1);
});
