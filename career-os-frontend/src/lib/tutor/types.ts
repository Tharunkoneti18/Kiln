export const boardEventKinds = [
  "clear",
  "text",
  "line",
  "arrow",
  "rectangle",
  "circle",
  "grid",
  "image",
  "highlight",
  "erase",
  "pause_prompt",
] as const;

export type BoardEventKind = (typeof boardEventKinds)[number];

export type BoardEvent = {
  id: string;
  offset_ms: number;
  duration_ms: number;
  kind: BoardEventKind;
  z_index: number;
  payload: Record<string, unknown>;
  accessible_text: string;
};

export type LessonSegment = {
  segment_id: string;
  title: string;
  duration_ms: number;
  narration_text: string;
  board_events: BoardEvent[];
  materials: { label: string; kind: string; description: string; uri?: string }[];
  checkpoint?: { prompt: string; answer: string };
};

export type LessonManifest = {
  lesson_id: string;
  version: number;
  title: string;
  objective: string;
  estimated_seconds: number;
  skill_ids: string[];
  segments: LessonSegment[];
  quiz: { id: string; prompt: string; options: string[]; answer_index: number; explanation: string }[];
  accessibility: { transcript: boolean; captions: boolean; descriptions: string[]; reduced_motion_fallback: boolean };
  sources: { label: string; url: string; accessed_at: string }[];
};

export type BoardState = {
  segment_id: string;
  position_ms: number;
  cursor: number;
  events: BoardEvent[];
};

export type PlaybackCheckpoint = {
  lesson_id: string;
  lesson_version: number;
  segment_id: string;
  position_ms: number;
  event_cursor: number;
  board_snapshot: BoardState;
  quiz_state: Record<string, number>;
  preferences?: { captions_enabled: boolean; playback_rate: number; volume: number };
  updated_at: string;
};
