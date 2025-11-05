// scripts/load.metrics.sample.ts - Sample data loader for metrics
import { Client } from "pg";
import { randomUUID } from "crypto";
import { z } from "zod";

const rowZ = z.object({
  platform: z.enum(["twitter","instagram","tiktok","facebook","linkedin","youtube","threads","pinterest"]),
  name: z.string(),
  display_name: z.string(),
  definition: z.string(),
  formula: z.string().optional(),
  unit: z.enum(["ratio","percent","count","ms","s"]),
  window: z.string().optional(),
  dimensions: z.array(z.string()).default([]),
  notes: z.array(z.string()).default([]),
  sources: z.array(z.object({
    id: z.string(), title: z.string(), url: z.string().url().optional(), retrieved_at: z.string()
  })).min(1),
  updated_at: z.string(),
  version: z.string(),
}).strict();

async function main() {
  const pg = new Client({ connectionString: process.env.DATABASE_URL });
  await pg.connect();

  // Sample normalized rows
  const samples = [
    {
      platform: "twitter" as const,
      name: "engagement_rate",
      display_name: "Engagement Rate",
      definition: "Total interactions divided by impressions for a post.",
      formula: "(likes + replies + retweets + quotes) / impressions",
      unit: "ratio" as const,
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
      platform: "instagram" as const,
      name: "reach",
      display_name: "Reach",
      definition: "Number of unique accounts that have seen the post.",
      unit: "count" as const,
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
