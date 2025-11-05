"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// scripts/load.metrics.sample.ts - Sample data loader for metrics
const pg_1 = require("pg");
const zod_1 = require("zod");
const rowZ = zod_1.z.object({
    platform: zod_1.z.enum(["twitter", "instagram", "tiktok", "facebook", "linkedin", "youtube", "threads", "pinterest"]),
    name: zod_1.z.string(),
    display_name: zod_1.z.string(),
    definition: zod_1.z.string(),
    formula: zod_1.z.string().optional(),
    unit: zod_1.z.enum(["ratio", "percent", "count", "ms", "s"]),
    window: zod_1.z.string().optional(),
    dimensions: zod_1.z.array(zod_1.z.string()).default([]),
    notes: zod_1.z.array(zod_1.z.string()).default([]),
    sources: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(), title: zod_1.z.string(), url: zod_1.z.string().url().optional(), retrieved_at: zod_1.z.string()
    })).min(1),
    updated_at: zod_1.z.string(),
    version: zod_1.z.string(),
}).strict();
async function main() {
    const pg = new pg_1.Client({ connectionString: process.env.DATABASE_URL });
    await pg.connect();
    // Sample normalized rows
    const samples = [
        {
            platform: "twitter",
            name: "engagement_rate",
            display_name: "Engagement Rate",
            definition: "Total interactions divided by impressions for a post.",
            formula: "(likes + replies + retweets + quotes) / impressions",
            unit: "ratio",
            window: "per_post",
            dimensions: ["region", "device"],
            notes: ["Normalize by impressions to compare across accounts."],
            sources: [{
                    id: "sprout_2025_metrics",
                    title: "SproutSocial Metrics 2025",
                    url: "https://sproutsocial.com/insights/social-media-metrics/",
                    retrieved_at: "2025-10-10T00:00:00Z"
                }],
            updated_at: "2025-10-15T00:00:00Z",
            version: "1.0.0"
        },
        {
            platform: "instagram",
            name: "reach",
            display_name: "Reach",
            definition: "Number of unique accounts that have seen the post.",
            unit: "count",
            window: "per_post",
            dimensions: ["region", "age_group"],
            sources: [{
                    id: "databox_2024",
                    title: "Social Media Analytics Tools Report",
                    url: "https://databox.com/social-media-metrics-that-matter",
                    retrieved_at: "2025-01-15T00:00:00Z"
                }],
            updated_at: "2025-10-15T00:00:00Z",
            version: "1.0.0"
        }
    ];
    for (const s of samples) {
        const r = rowZ.parse(s);
        const id = `metrics/${r.platform}/${r.name}`;
        await pg.query(`
      INSERT INTO metrics (id,platform,name,display_name,definition,formula,unit,window,dimensions,notes,sources,updated_at,version)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,$11::jsonb,$12,$13)
      ON CONFLICT (id) DO UPDATE SET
        display_name=EXCLUDED.display_name, definition=EXCLUDED.definition, formula=EXCLUDED.formula,
        unit=EXCLUDED.unit, window=EXCLUDED.window, dimensions=EXCLUDED.dimensions, notes=EXCLUDED.notes,
        sources=EXCLUDED.sources, updated_at=EXCLUDED.updated_at, version=EXCLUDED.version
    `, [id, r.platform, r.name, r.display_name, r.definition, r.formula ?? null, r.unit, r.window ?? null,
            JSON.stringify(r.dimensions), JSON.stringify(r.notes), JSON.stringify(r.sources),
            r.updated_at, r.version]);
    }
    await pg.end();
    console.log("Loaded metrics.");
}
main().catch(e => { console.error(e); process.exit(1); });
