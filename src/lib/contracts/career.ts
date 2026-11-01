import { z } from 'zod';

export const SkillStateEnum = z.enum([
  'Demonstrated',
  'Supported',
  'Transferable',
  'Gap',
  'Unknown',
]);

export type SkillState = z.infer<typeof SkillStateEnum>;

export const RequiredSkillSchema = z.object({
  skill_id: z.string(),
  canonical_name: z.string(),
  importance: z.number().default(1.0),
  source_ref: z.string().optional(),
});

export const TargetRoleFixtureSchema = z.object({
  id: z.string(),
  title: z.string(),
  region: z.string().default('US'),
  level: z.string().default('mid'),
  description: z.string(),
  source_url: z.string().optional(),
  required_skills: z.array(RequiredSkillSchema).min(1),
});

export type TargetRoleFixture = z.infer<typeof TargetRoleFixtureSchema>;

export const WeeklyPlanTaskSchema = z.object({
  id: z.string(),
  week: z.number().int().positive(),
  title: z.string(),
  objective: z.string(),
  skill_ids: z.array(z.string()).default([]),
  lesson_id: z.string().optional(),
  estimated_minutes: z.number().int().default(60),
  status: z.enum(['queued', 'in_progress', 'completed', 'skipped', 'blocked']).default('queued'),
  evidence_required: z.string().optional(),
  completion_criteria: z.array(z.string()).default([]),
  rationale: z.string().optional(),
});

export type WeeklyPlanTask = z.infer<typeof WeeklyPlanTaskSchema>;
