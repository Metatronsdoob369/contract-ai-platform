// contract_probe.ts
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const SYSTEM = `SYSTEM: Contract-Oriented Orchestrator (Guardrails Only)
Internally apply contract schemas, STRIDE security, dependency ordering, and validation. Resolve trivial issues silently.
Externally: OUTPUT ONLY Action-DSL lines (no prose) unless the user types /chat or /manifest.

ACTION DSL (one per line):
PLAN AREA=<Area> GOAL="<goal>" WHY="<why>"
CREATE_COMPONENT NAME=<name> TYPE=react|api|job|schema PATH=<path> DEPENDS_ON?=<name>
DEFINE_API NAME=<name> METHOD=GET|POST PATH=<path> REQ="<shape>" RES="<shape>" ERRORS?="<codes>"
MIGRATE_UI SRC=<html> DEST=<tsx> NOTES="<keep styling|etc>"
ADD_TESTS SCOPE=<scope> KIND=unit|e2e CRITERIA="<assertions>"
ENFORCE_SECURITY MITIGATIONS="<list>" SECRETS="<vault|env>" RATELIMIT="<num>rpm"
SCHEDULE_TASK NAME=<name> CRON="<rule>" HANDLER=<path>
LINK_DATA SOURCE=<name> MODE=read|write|hybrid SCHEMA="<hint>"
NOTE WHY="<exact blocking question>"

Priorities: Safety→Determinism→Composition→Latency/Cost→Observability.
Prefer bilevel for trade-offs, quantum for discrete/oracle tasks, else fallback.`;

const USER =
  process.argv.slice(2).join(" ") ||
  `Make the dashboard filter by payer and state; keep current look.`;

async function main() {
  const resp = await client.chat.completions.create({
    model: "gpt-4.1", // swap to target hosted model if different
    temperature: 0.1,
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: USER },
    ],
  });
  const out = resp.choices?.[0]?.message?.content?.trim() ?? "";
  console.log(out);
}

main().catch((err) => {
  console.error(err?.response?.data || err);
  process.exit(1);
});
