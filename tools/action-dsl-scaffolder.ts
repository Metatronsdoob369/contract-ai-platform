// action-dsl-scaffolder.ts
// CLI that reads ACTION DSL lines and scaffolds FastAPI + React TSX + tests + security stubs.
// Usage:
//   npx ts-node action-dsl-scaffolder.ts actions.txt
// Repo layout assumed:
//   /app    (frontend)
//   /backend (FastAPI backend)
//   /tests  (Playwright/E2E)

import * as fs from 'fs';
import * as path from 'path';

// -----------------------------
// Helpers
// -----------------------------
function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}
function writeFileSafe(fp: string, content: string) {
  ensureDir(path.dirname(fp));
  if (!fs.existsSync(fp)) {
    fs.writeFileSync(fp, content, 'utf8');
    console.log('✏️  created', fp);
  } else {
    console.log('⏭️  skip (exists)', fp);
  }
}
function parseLine(line: string): { action: string; args: Record<string, string> } | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;
  const [head, ...rest] = trimmed.split(' ');
  if (head !== 'PLAN' && head !== 'CREATE_COMPONENT' && head !== 'DEFINE_API' && head !== 'MIGRATE_UI' && head !== 'ADD_TESTS' && head !== 'ENFORCE_SECURITY' && head !== 'SCHEDULE_TASK' && head !== 'LINK_DATA' && head !== 'NOTE') {
    if (!head.startsWith('ACTION')) {
      // support optional 'ACTION' prefix
      // e.g., ACTION CREATE_COMPONENT NAME=...
      const parts = trimmed.split(' ');
      if (parts[0] === 'ACTION') {
        parts.shift();
        const action = parts.shift() || '';
        const args: Record<string, string> = {};
        const kv = parts.join(' ');
        kv.match(/(\w+)=\"[^\"]*\"|(\w+)=\S+/g)?.forEach((m) => {
          const [k, v] = m.split('=');
          args[k] = v?.replace(/^\"|\"$/g, '') || '';
        });
        return { action, args };
      }
      return null;
    }
  }
  const action = head;
  const args: Record<string, string> = {};
  rest.join(' ').match(/(\w+)=\"[^\"]*\"|(\w+)=\S+/g)?.forEach((m) => {
    const [k, v] = m.split('=');
    args[k] = (v || '').replace(/^\"|\"$/g, '');
  });
  return { action, args };
}

// -----------------------------
// Templates
// -----------------------------
function reactComponentTemplate(name: string) {
  return `import React from 'react';

export default function ${name}(): JSX.Element {
  // TODO: add props + state as needed
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold">${name}</h3>
    </div>
  );
}
`;
}

function fastapiRouterTemplate(name: string, method: string, routePath: string, reqShape: string, resShape: string) {
  const funcName = name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const m = method.toUpperCase();
  const reqModel = reqShape && reqShape !== '-' ? `\nclass ${name}Request(BaseModel):\n    # TODO: refine request schema parsed from: ${reqShape}\n    payload: dict | None = None\n` : '';
  const resModel = resShape && resShape !== '-' ? `\nclass ${name}Response(BaseModel):\n    # TODO: refine response schema parsed from: ${resShape}\n    data: list | dict | None = None\n` : '';
  const bodyParam = m === 'POST' ? (reqShape && reqShape !== '-' ? `req: ${name}Request` : 'req: dict') : '';
  return `from fastapi import APIRouter, Depends
from pydantic import BaseModel

router = APIRouter(prefix="", tags=["${name}"])
${reqModel}${resModel}

@router.${m === 'GET' ? 'get' : m === 'POST' ? 'post' : 'get'}("${routePath}")
async def ${funcName}(${bodyParam}):
    """Auto-generated stub for ${name}."""
    # TODO: implement business logic
    return {"ok": True}
`;
}

function playwrightTestTemplate(scope: string, criteria: string) {
  return `import { test, expect } from '@playwright/test';

test('${scope} meets criteria', async ({ page }) => {
  // TODO: navigate to the page under test
  // await page.goto('http://localhost:3000');
  // Add assertions derived from criteria:
  // ${criteria}
  expect(true).toBeTruthy();
});
`;
}

function securityMiddlewareTemplate(mitigations: string, secrets: string, rate: string) {
  return `# security_middleware.py — generated from ENFORCE_SECURITY
from fastapi import Request, Response

# TODO: integrate real CSP, input validation, authz, etc.
MITIGATIONS = "${mitigations}"
SECRETS = "${secrets}"
RATE_LIMIT = "${rate}"

async def security_hook(request: Request, call_next):
    # naive placeholder middleware
    response: Response = await call_next(request)
    response.headers['X-Policy-Mitigation'] = MITIGATIONS
    return response
`;
}

// -----------------------------
// Generators per ACTION
// -----------------------------
function handleCreateComponent(args: Record<string, string>) {
  const type = args['TYPE'];
  const name = args['NAME'] || 'Component';
  const outPath = args['PATH'] || `/app/components/${name}.tsx`;
  if (type === 'react') {
    writeFileSafe(path.join(process.cwd(), outPath), reactComponentTemplate(name));
  } else if (type === 'api') {
    // defer to DEFINE_API for full routes, but generate a placeholder
    const fp = path.join(process.cwd(), outPath.endsWith('.py') ? outPath : `/backend/routes/${name}.py`);
    writeFileSafe(fp, fastapiRouterTemplate(name, 'GET', `/api/${name.toLowerCase()}`, '-', '-'));
  } else if (type === 'schema') {
    const fp = path.join(process.cwd(), outPath.endsWith('.ts') ? outPath : `/app/schema/${name}.ts`);
    writeFileSafe(fp, `// ${name} schema placeholder\nexport type ${name} = Record<string, unknown>;\n`);
  } else if (type === 'job') {
    const fp = path.join(process.cwd(), outPath.endsWith('.ts') ? outPath : `/backend/jobs/${name}.ts`);
    writeFileSafe(fp, `// ${name} job placeholder\nexport async function run() {\n  // TODO: implement job logic\n}\n`);
  }
}

function handleDefineApi(args: Record<string, string>) {
  const name = args['NAME'] || 'ApiEndpoint';
  const method = args['METHOD'] || 'GET';
  const route = args['PATH'] || `/api/${name.toLowerCase()}`;
  const req = args['REQ'] || '-';
  const res = args['RES'] || '-';
  const fp = path.join(process.cwd(), `/backend/routes/${name}.py`);
  writeFileSafe(fp, fastapiRouterTemplate(name, method, route, req, res));
}

function handleMigrateUi(args: Record<string, string>) {
  const src = args['SRC'];
  const dest = args['DEST'] || '/app/pages/Migrated.tsx';
  const notes = args['NOTES'] || 'preserve styling';
  writeFileSafe(path.join(process.cwd(), dest), `// Migrated from ${src}\n// Notes: ${notes}\nexport default function Migrated() {\n  return <div>TODO: port HTML from ${src}</div>;\n}\n`);
}

function handleAddTests(args: Record<string, string>) {
  const scope = args['SCOPE'] || 'feature';
  const kind = args['KIND'] || 'e2e';
  const criteria = args['CRITERIA'] || 'TBD';
  const fp = path.join(process.cwd(), `/tests/${scope}.${kind}.spec.ts`);
  writeFileSafe(fp, playwrightTestTemplate(scope, criteria));
}

function handleEnforceSecurity(args: Record<string, string>) {
  const mitigations = args['MITIGATIONS'] || 'input-validation';
  const secrets = args['SECRETS'] || 'env';
  const rate = args['RATELIMIT'] || '60rpm';
  const fp = path.join(process.cwd(), `/backend/security/security_middleware.py`);
  writeFileSafe(fp, securityMiddlewareTemplate(mitigations, secrets, rate));
}

// -----------------------------
// Main
// -----------------------------
const file = process.argv[2];
if (!file) {
  console.error('Usage: npx ts-node action-dsl-scaffolder.ts <actions.txt>');
  process.exit(1);
}

const input = fs.readFileSync(path.resolve(process.cwd(), file), 'utf8').split('\n');
for (const line of input) {
  const parsed = parseLine(line);
  if (!parsed) continue;
  const { action, args } = parsed;
  switch (action) {
    case 'CREATE_COMPONENT':
      handleCreateComponent(args); break;
    case 'DEFINE_API':
      handleDefineApi(args); break;
    case 'MIGRATE_UI':
      handleMigrateUi(args); break;
    case 'ADD_TESTS':
      handleAddTests(args); break;
    case 'ENFORCE_SECURITY':
      handleEnforceSecurity(args); break;
    case 'PLAN':
    case 'SCHEDULE_TASK':
    case 'LINK_DATA':
    case 'NOTE':
      // not generating files, but could log/context-store
      console.log('🗒️ ', action, args);
      break;
    default:
      console.warn('⚠️ unknown action:', action);
  }
}

console.log('✅ Scaffolding pass complete.');
