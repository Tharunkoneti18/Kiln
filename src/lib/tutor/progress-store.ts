import type { PlaybackCheckpoint } from "./types";

export type SaveResult = { confirmed: true; savedAt: string };

export interface ProgressStore {
  load(userId: string, lessonId: string): Promise<PlaybackCheckpoint | null>;
  save(userId: string, checkpoint: PlaybackCheckpoint): Promise<SaveResult>;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export class LocalProgressStore implements ProgressStore {
  constructor(private readonly storage: StorageLike) {}

  private key(userId: string, lessonId: string) { return `career-os:tutor-progress:${userId}:${lessonId}`; }

  async load(userId: string, lessonId: string): Promise<PlaybackCheckpoint | null> {
    const raw = this.storage.getItem(this.key(userId, lessonId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || (parsed as PlaybackCheckpoint).lesson_id !== lessonId) throw new Error("Saved progress is invalid.");
    return parsed as PlaybackCheckpoint;
  }

  async save(userId: string, checkpoint: PlaybackCheckpoint): Promise<SaveResult> {
    const key = this.key(userId, checkpoint.lesson_id);
    this.storage.setItem(key, JSON.stringify(checkpoint));
    const confirmed = await this.load(userId, checkpoint.lesson_id);
    if (!confirmed || confirmed.updated_at !== checkpoint.updated_at) throw new Error("Could not confirm saved lesson progress.");
    return { confirmed: true, savedAt: confirmed.updated_at };
  }

  async clear(userId: string, lessonId: string) { this.storage.removeItem(this.key(userId, lessonId)); }
}

export class ApiProgressStore implements ProgressStore {
  constructor(private readonly baseUrl: string, private readonly request: typeof fetch = fetch) {}

  private url(lessonId: string) { return `${this.baseUrl.replace(/\/$/, "")}/api/v1/lessons/${encodeURIComponent(lessonId)}/progress`; }

  async load(_userId: string, lessonId: string): Promise<PlaybackCheckpoint | null> {
    const response = await this.request(this.url(lessonId), { method: "GET", credentials: "include", headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Progress could not be loaded (${response.status}).`);
    const body = await response.json() as { progress?: (PlaybackCheckpoint & { version?: number }) | null };
    if (!body.progress) return null;
    const version = body.progress.lesson_version ?? body.progress.version;
    if (!Number.isInteger(version) || (version ?? 0) < 1) throw new Error("Saved progress has no valid lesson version.");
    return { ...body.progress, lesson_version: version };
  }

  async save(_userId: string, checkpoint: PlaybackCheckpoint): Promise<SaveResult> {
    const stableKey = `${checkpoint.lesson_id}:v${checkpoint.lesson_version}:${checkpoint.segment_id}:${checkpoint.position_ms}:${checkpoint.updated_at}`;
    const response = await this.request(this.url(checkpoint.lesson_id), {
      method: "PUT", credentials: "include", headers: { "Content-Type": "application/json", "Idempotency-Key": stableKey },
      body: JSON.stringify({ version: checkpoint.lesson_version, segment_id: checkpoint.segment_id, position_ms: checkpoint.position_ms, event_cursor: checkpoint.event_cursor, board_snapshot: checkpoint.board_snapshot, quiz_state: checkpoint.quiz_state, preferences: checkpoint.preferences, updated_at: checkpoint.updated_at }),
    });
    if (!response.ok) throw new Error(`Progress could not be saved (${response.status}).`);
    return { confirmed: true, savedAt: checkpoint.updated_at };
  }

}
