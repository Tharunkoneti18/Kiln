import type { BoardEvent, BoardState, LessonManifest, PlaybackCheckpoint } from "./types";

export function boardAt(lesson: LessonManifest, segmentId: string, positionMs: number): BoardState {
  const segment = lesson.segments.find((part) => part.segment_id === segmentId);
  if (!segment) throw new Error(`Unknown lesson segment: ${segmentId}`);
  const time = Math.max(0, Math.min(positionMs, segment.duration_ms));
  const applied: BoardEvent[] = [];
  let cursor = 0;
  for (const event of segment.board_events) {
    if (event.offset_ms > time) break;
    cursor += 1;
    if (event.kind === "clear") applied.length = 0;
    else if (event.kind === "erase" && typeof event.payload.target_id === "string") {
      const target = event.payload.target_id;
      for (let index = applied.length - 1; index >= 0; index -= 1) {
        if (applied[index].id === target) applied.splice(index, 1);
      }
    } else applied.push(event);
  }
  return { segment_id: segmentId, position_ms: time, cursor, events: [...applied].sort((a, b) => a.z_index - b.z_index) };
}

export function checkpointAt(
  lesson: LessonManifest,
  segmentId: string,
  positionMs: number,
  quizState: Record<string, number> = {},
  updatedAt = new Date().toISOString(),
): PlaybackCheckpoint {
  const board = boardAt(lesson, segmentId, positionMs);
  return {
    lesson_id: lesson.lesson_id,
    lesson_version: lesson.version,
    segment_id: segmentId,
    position_ms: board.position_ms,
    event_cursor: board.cursor,
    board_snapshot: board,
    quiz_state: { ...quizState },
    updated_at: updatedAt,
  };
}
