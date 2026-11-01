import { z } from 'zod';

export const LearningEventTypeEnum = z.enum([
  'lesson.started',
  'lesson.paused',
  'lesson.completed',
  'lesson.check_submitted',
]);

export type LearningEventType = z.infer<typeof LearningEventTypeEnum>;

export const LearningEventPayloadSchema = z.object({
  lesson_id: z.string().min(1),
  lesson_version: z.number().int().default(1),
  skill_ids: z.array(z.string()).default([]),
  segment_id: z.string().optional(),
  position_ms: z.number().optional(),
  score: z.number().min(0).max(1).optional(),
  check_id: z.string().optional(),
  evidence_type: z.string().default('assessment'),
}).passthrough();

export const LearningEventSchema = z.object({
  event_id: z.string().uuid(),
  event_type: LearningEventTypeEnum,
  schema_version: z.number().int().default(1),
  user_id: z.string().uuid(),
  aggregate_id: z.string().min(1),
  occurred_at: z.string(),
  idempotency_key: z.string().min(1),
  payload: LearningEventPayloadSchema,
});

export type LearningEvent = z.infer<typeof LearningEventSchema>;
