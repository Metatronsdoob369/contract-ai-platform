# Data Correction Runbook
# Last Updated: 2025-10-23
# Owner: Data Engineering Team

## Scenario: Schema Validation Failures

### Detection
- **Alert**: Nightly validation job reports Zod parse failures
- **Location**: `logs/validation-job/YYYY-MM-DD.json`
- **Impact**: Data quality degradation, potential agent failures

### Response Steps

1. **Assess Scope**:
   ```bash
   # Check validation report
   jq '.failures | length' logs/validation-job/$(date +%Y-%m-%d).json
   ```

2. **Quarantine Failing Records**:
   ```sql
   -- Mark records as quarantined
   UPDATE metrics SET status = 'quarantined', quarantined_at = NOW()
   WHERE id IN (SELECT id FROM validation_failures WHERE date = CURRENT_DATE);

   -- Create quarantine table for review
   CREATE TABLE IF NOT EXISTS quarantine_metrics AS
   SELECT * FROM metrics WHERE status = 'quarantined';
   ```

3. **Data Correction Options**:

   **Option A: Automated Fix (Preferred)**
   ```typescript
   // scripts/fix-schema-violations.ts
   import { z } from "zod";
   import { Client } from "pg";

   const fixZ = z.object({
     // Add missing fields with defaults
     dimensions: z.array(z.string()).default([]),
     notes: z.array(z.string()).default([]),
   });

   async function fixViolations() {
     const pg = new Client();
     await pg.connect();

     const violations = await pg.query(`
       SELECT id, data FROM metrics WHERE status = 'quarantined'
     `);

     for (const row of violations.rows) {
       try {
         const fixed = fixZ.parse(row.data);
         await pg.query(`
           UPDATE metrics SET data = $1, status = 'active' WHERE id = $2
         `, [fixed, row.id]);
       } catch (e) {
         // Manual review required
         await pg.query(`
           UPDATE metrics SET status = 'needs_review' WHERE id = $1
         `, [row.id]);
       }
     }

     await pg.end();
   }
   ```

   **Option B: Source Re-ingestion**
   ```bash
   # Re-run ingestion pipeline for affected sources
   ./scripts/reingest-source.sh --source-id "sprout_2025_metrics"
   ```

4. **Verification**:
   ```bash
   # Re-run validation on fixed records
   npm run validate:data -- --table metrics --ids $(cat fixed_ids.txt)
   ```

---

## Scenario: Pinecone Drift

### Detection
- **Alert**: Semantic search returning irrelevant results
- **Cause**: Vector embeddings out of sync with source data

### Response Steps

1. **Identify Affected Records**:
   ```sql
   -- Find records modified since last embedding
   SELECT id FROM metrics
   WHERE updated_at > (SELECT MAX(embedded_at) FROM embedding_log);
   ```

2. **Re-embed and Update**:
   ```typescript
   // scripts/repair-embeddings.ts
   import { Pinecone } from "@pinecone-database/pinecone";

   async function repairEmbeddings() {
     const pc = new Pinecone();
     const index = pc.index("social-knowledge");

     // Get records needing re-embedding
     const records = await sql.query(`
       SELECT id, data->>'definition' as text FROM metrics
       WHERE embedding_version < (SELECT MAX(version) FROM schema_versions)
     `);

     // Batch update embeddings
     const vectors = await Promise.all(
       records.map(async (r) => ({
         id: r.id,
         values: await embed(r.text),
         metadata: { type: "metric", version: "1.0.0" }
       }))
     );

     await index.upsert(vectors);
   }
   ```

3. **Update Embedding Metadata**:
   ```sql
   UPDATE metrics SET embedding_version = '1.0.0', embedded_at = NOW()
   WHERE id IN (SELECT id FROM reembedded_records);
   ```

---

## Scenario: Source License Violation

### Detection
- **Alert**: License validation fails during ingestion
- **Impact**: Legal compliance risk

### Response Steps

1. **Immediate Block**:
   ```yaml
   # sources.yaml - Mark source as blocked
   - id: "problematic_source"
     status: "blocked"
     block_reason: "license_violation"
   ```

2. **Data Removal**:
   ```sql
   -- Soft delete with audit trail
   UPDATE metrics SET
     status = 'license_violation',
     deleted_at = NOW(),
     deletion_reason = 'source_license_violation'
   WHERE sources @> '[{"id": "problematic_source"}]';
   ```

3. **Legal Review**: Escalate to legal team for final disposition

---

## Prevention Measures

### Automated Validation
- **Daily**: Full table scans with Zod validation
- **Pre-deployment**: Schema compatibility checks
- **Post-ingestion**: Source license validation

### Monitoring
- **Data quality metrics**: Track validation failure rates
- **Embedding freshness**: Alert on stale embeddings
- **License compliance**: Automated license checking

### Backup Strategy
- **Daily snapshots**: Full data exports
- **Point-in-time recovery**: PostgreSQL PITR enabled
- **Embedding backups**: Pinecone index snapshots
