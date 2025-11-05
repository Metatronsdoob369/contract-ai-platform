import { z } from 'zod';

export const AgentSchema = z.object({
  enhancement_area: z.string()
    .min(3, 'Enhancement area must be at least 3 characters')
    .max(100, 'Enhancement area too long'),

  objective: z.string()
    .min(20, 'Objective must be descriptive (min 20 chars)')
    .max(500, 'Objective too verbose'),

  implementation_plan: z.object({
    modules: z.array(z.string())
      .min(1, 'At least one module required')
      .max(10, 'Too many modules - consider decomposition'),
    architecture: z.string()
      .min(10, 'Architecture description required')
  }),

  depends_on: z.array(z.string())
    .default([]),

  sources: z.array(z.string())
    .min(1, 'At least one source required for traceability'),

  governance: z.object({
    security: z.string().min(10),
    compliance: z.string().min(10),
    ethics: z.string().min(10)
  }),

  validation_criteria: z.string()
    .min(20, 'Clear validation criteria required')
});

// Add refinement for circular dependency prevention
export const AgentArraySchema = z.array(AgentSchema)
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