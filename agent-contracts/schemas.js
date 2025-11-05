"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentArraySchema = exports.AgentSchema = void 0;
const zod_1 = require("zod");
exports.AgentSchema = zod_1.z.object({
    enhancement_area: zod_1.z.string()
        .min(3, 'Enhancement area must be at least 3 characters')
        .max(100, 'Enhancement area too long'),
    objective: zod_1.z.string()
        .min(20, 'Objective must be descriptive (min 20 chars)')
        .max(500, 'Objective too verbose'),
    implementation_plan: zod_1.z.object({
        modules: zod_1.z.array(zod_1.z.string())
            .min(1, 'At least one module required')
            .max(10, 'Too many modules - consider decomposition'),
        architecture: zod_1.z.string()
            .min(10, 'Architecture description required')
    }),
    depends_on: zod_1.z.array(zod_1.z.string())
        .default([]),
    sources: zod_1.z.array(zod_1.z.string())
        .min(1, 'At least one source required for traceability'),
    governance: zod_1.z.object({
        security: zod_1.z.string().min(10),
        compliance: zod_1.z.string().min(10),
        ethics: zod_1.z.string().min(10)
    }),
    validation_criteria: zod_1.z.string()
        .min(20, 'Clear validation criteria required')
});
// Add refinement for circular dependency prevention
exports.AgentArraySchema = zod_1.z.array(exports.AgentSchema)
    .refine((agents) => {
    const areas = new Set(agents.map(a => a.enhancement_area));
    for (const agent of agents) {
        for (const dep of agent.depends_on) {
            if (!areas.has(dep)) {
                return false; // Dependency doesn't exist
            }
        }
    }
    return true;
}, {
    message: 'Invalid dependency: references non-existent enhancement area'
});
