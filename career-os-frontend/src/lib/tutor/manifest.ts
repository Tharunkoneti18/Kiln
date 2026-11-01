import { z } from "zod";
import { boardEventKinds, type LessonManifest } from "./types";

const event = z.object({
  id: z.string().min(1),
  offset_ms: z.number().int().nonnegative(),
  duration_ms: z.number().int().nonnegative(),
  kind: z.enum(boardEventKinds),
  z_index: z.number().int().nonnegative(),
  payload: z.record(z.string(), z.unknown()),
  accessible_text: z.string().trim().min(1),
}).superRefine((value, context) => {
  if (value.kind === "image") {
    const src = value.payload.src;
    if (typeof src !== "string" || !src.startsWith("/lessons/") || src.includes("..") || src.startsWith("//")) {
      context.addIssue({ code: "custom", path: ["payload", "src"], message: "Lesson images must use a local /lessons/ asset path." });
    }
  }
});

const segment = z.object({
  segment_id: z.string().min(1),
  title: z.string().min(1),
  duration_ms: z.number().int().positive(),
  narration_text: z.string().min(1),
  board_events: z.array(event),
  materials: z.array(z.object({ label: z.string().min(1), kind: z.string().min(1), description: z.string().min(1), uri: z.string().min(1).optional() })),
  checkpoint: z.object({ prompt: z.string().min(1), answer: z.string().min(1) }).optional(),
}).superRefine((value, context) => {
  const ids = new Set<string>();
  let priorOffset = -1;
  value.board_events.forEach((boardEvent, index) => {
    if (ids.has(boardEvent.id)) context.addIssue({ code: "custom", path: ["board_events", index, "id"], message: "Event ids must be unique within a segment." });
    ids.add(boardEvent.id);
    if (boardEvent.offset_ms < priorOffset || boardEvent.offset_ms >= value.duration_ms) {
      context.addIssue({ code: "custom", path: ["board_events", index, "offset_ms"], message: "Events must be ordered and start before the segment ends." });
    }
    priorOffset = boardEvent.offset_ms;
    Object.entries(boardEvent.payload).forEach(([key, coordinate]) => {
      if ((key === "x" || key === "y" || key === "to_x" || key === "to_y" || key === "width" || key === "height") && (typeof coordinate !== "number" || coordinate < 0 || coordinate > 1)) {
        context.addIssue({ code: "custom", path: ["board_events", index, "payload", key], message: "Board coordinates and sizes must be normalized between 0 and 1." });
      }
    });
  });
});

const manifest = z.object({
  lesson_id: z.string().min(1),
  version: z.number().int().positive(),
  title: z.string().min(1),
  objective: z.string().min(1),
  estimated_seconds: z.number().int().positive(),
  skill_ids: z.array(z.string().min(1)).min(1),
  segments: z.array(segment).min(1),
  quiz: z.array(z.object({ id: z.string().min(1), prompt: z.string().min(1), options: z.array(z.string().min(1)).min(2), answer_index: z.number().int().nonnegative(), explanation: z.string().min(1) })).default([]),
  accessibility: z.object({ transcript: z.boolean(), captions: z.boolean(), descriptions: z.array(z.string().min(1)), reduced_motion_fallback: z.boolean() }),
  sources: z.array(z.object({ label: z.string().min(1), url: z.string().url(), accessed_at: z.string().date() })).min(1),
}).superRefine((value, context) => {
  if (new Set(value.segments.map((part) => part.segment_id)).size !== value.segments.length) {
    context.addIssue({ code: "custom", path: ["segments"], message: "Segment ids must be unique." });
  }
  value.quiz.forEach((question, index) => {
    if (question.answer_index >= question.options.length) context.addIssue({ code: "custom", path: ["quiz", index, "answer_index"], message: "Quiz answer must refer to an option." });
  });
});

export function parseLessonManifest(input: unknown): LessonManifest {
  return manifest.parse(input) as LessonManifest;
}
