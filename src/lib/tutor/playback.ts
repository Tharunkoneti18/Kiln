import { boardAt, checkpointAt } from "./timeline";
import type { LessonManifest, PlaybackCheckpoint } from "./types";

export type PlaybackSnapshot = PlaybackCheckpoint & { playing: boolean; total_ms: number; absolute_position_ms: number };
type Listener = (snapshot: PlaybackSnapshot) => void;

export class PlaybackController {
  private segmentIndex = 0;
  private positionMs = 0;
  private playing = false;
  private lastTickMs = 0;
  private quizState: Record<string, number> = {};
  private listeners = new Set<Listener>();

  constructor(private readonly lesson: LessonManifest) {}

  getSnapshot(): PlaybackSnapshot {
    const current = this.lesson.segments[this.segmentIndex];
    const total_ms = this.lesson.segments.reduce((sum, item) => sum + item.duration_ms, 0);
    const absolute_position_ms = this.lesson.segments.slice(0, this.segmentIndex).reduce((sum, item) => sum + item.duration_ms, 0) + this.positionMs;
    return { ...checkpointAt(this.lesson, current.segment_id, this.positionMs, this.quizState), playing: this.playing, total_ms, absolute_position_ms };
  }

  subscribe(listener: Listener): () => void { this.listeners.add(listener); return () => this.listeners.delete(listener); }
  private publish() { const snapshot = this.getSnapshot(); for (const listener of this.listeners) listener(snapshot); }

  restore(checkpoint: Partial<PlaybackCheckpoint>) {
    if (checkpoint.lesson_id && checkpoint.lesson_id !== this.lesson.lesson_id) throw new Error("Progress belongs to another lesson.");
    if (checkpoint.lesson_version && checkpoint.lesson_version !== this.lesson.version) throw new Error("Progress references another lesson version.");
    const index = this.lesson.segments.findIndex((part) => part.segment_id === checkpoint.segment_id);
    if (index < 0) return;
    this.segmentIndex = index;
    this.positionMs = Math.max(0, Math.min(checkpoint.position_ms ?? 0, this.lesson.segments[index].duration_ms));
    this.quizState = { ...(checkpoint.quiz_state ?? {}) };
    this.playing = false;
    this.publish();
  }

  play(now = performance.now()) { if (this.segmentIndex >= this.lesson.segments.length - 1 && this.positionMs >= this.lesson.segments[this.segmentIndex].duration_ms) return; this.playing = true; this.lastTickMs = now; this.publish(); }
  restart(now = performance.now()) { this.segmentIndex = 0; this.positionMs = 0; this.playing = true; this.lastTickMs = now; this.publish(); }
  pause(now = performance.now()) { if (this.playing) this.advance(now); this.playing = false; this.publish(); }

  advance(now = performance.now()) {
    if (!this.playing) return;
    let elapsed = Math.max(0, now - this.lastTickMs);
    this.lastTickMs = now;
    while (elapsed > 0 && this.playing) {
      const segment = this.lesson.segments[this.segmentIndex];
      const remaining = segment.duration_ms - this.positionMs;
      if (elapsed < remaining) { this.positionMs += elapsed; elapsed = 0; }
      else {
        elapsed -= remaining;
        if (this.segmentIndex < this.lesson.segments.length - 1) { this.segmentIndex += 1; this.positionMs = 0; }
        else { this.positionMs = segment.duration_ms; this.playing = false; }
      }
    }
    this.publish();
  }

  seek(positionMs: number) { this.positionMs = Math.max(0, Math.min(positionMs, this.lesson.segments[this.segmentIndex].duration_ms)); this.publish(); }
  nextSegment() { if (this.segmentIndex < this.lesson.segments.length - 1) { this.segmentIndex += 1; this.positionMs = 0; this.publish(); } }
  setQuizAnswer(questionId: string, answerIndex: number) { this.quizState[questionId] = answerIndex; this.publish(); }
  getBoard() { const segment = this.lesson.segments[this.segmentIndex]; return boardAt(this.lesson, segment.segment_id, this.positionMs); }
}
