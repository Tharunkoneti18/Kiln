import { z } from 'zod';

export const BoardEventTypeEnum = z.enum([
  'clear',
  'text',
  'line',
  'arrow',
  'rectangle',
  'circle',
  'grid',
  'image',
  'highlight',
  'erase',
  'pause_prompt',
]);

export const BoardEventSchema = z.object({
  event_id: z.string(),
  segment_id: z.string(),
  offset_ms: z.number().int().nonnegative(),
  type: BoardEventTypeEnum,
  payload: z.record(z.any()),
  accessible_text: z.string(),
  duration_ms: z.number().int().nonnegative().optional(),
  z_index: z.number().int().optional(),
});

export const AvatarStateEnum = z.enum(['idle', 'speaking', 'pointing', 'listening']);

export const AvatarGestureEventSchema = z.object({
  offset_ms: z.number().int().nonnegative(),
  state: AvatarStateEnum,
  target: z.object({ x: z.number(), y: z.number() }).optional(),
  duration_ms: z.number().int().positive().optional(),
  expression: z.enum(['neutral', 'encouraging', 'thoughtful', 'emphasizing']).optional(),
});

export const LessonSegmentSchema = z.object({
  segment_id: z.string(),
  title: z.string(),
  narration_text: z.string(),
  audio_asset: z.string().optional(),
  duration_ms: z.number().int().positive(),
  board_events: z.array(BoardEventSchema).default([]),
  avatar_gestures: z.array(AvatarGestureEventSchema).default([]),
  checkpoint: z.boolean().optional(),
});

export const QuizQuestionSchema = z.object({
  question_id: z.string(),
  prompt: z.string(),
  options: z.array(z.string()).min(2),
  correct_option_index: z.number().int().nonnegative(),
  explanation: z.string().optional(),
});

export const LessonManifestSchema = z.object({
  lesson_id: z.string(),
  version: z.number().int().default(1),
  title: z.string(),
  objective: z.string(),
  estimated_seconds: z.number().int().default(1800),
  skill_ids: z.array(z.string()).default([]),
  segments: z.array(LessonSegmentSchema).min(1),
  quiz: z.array(QuizQuestionSchema).default([]),
  accessibility: z
    .object({
      transcript: z.string().optional(),
      descriptions: z.array(z.string()).optional(),
      captions_asset: z.string().optional(),
    })
    .optional(),
  sources: z
    .array(
      z.object({
        label: z.string(),
        url: z.string().optional(),
        accessed_at: z.string().optional(),
      })
    )
    .optional(),
  checksum: z.string().optional(),
});

export type LessonManifest = z.infer<typeof LessonManifestSchema>;
export type LessonSegment = z.infer<typeof LessonSegmentSchema>;
export type BoardEvent = z.infer<typeof BoardEventSchema>;
export type AvatarGestureEvent = z.infer<typeof AvatarGestureEventSchema>;
export type AvatarState = z.infer<typeof AvatarStateEnum>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
