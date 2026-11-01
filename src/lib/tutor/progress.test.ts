import { describe, expect, it } from "vitest";
import { ApiProgressStore, LocalProgressStore } from "./progress-store";
import type { PlaybackCheckpoint } from "./types";

const checkpoint: PlaybackCheckpoint = {
  lesson_id: "sql-foundations", lesson_version: 1, segment_id: "first-query", position_ms: 12000,
  event_cursor: 4,
  board_snapshot: { segment_id: "first-query", position_ms: 12000, cursor: 4, events: [] },
  quiz_state: { "select-purpose": 0 }, preferences: { captions_enabled: false, playback_rate: 1.25, volume: 0.7 }, updated_at: "2026-10-31T10:00:00.000Z",
};

describe("Tutor progress stores", () => {
  it("confirms local save only after the checkpoint can be read back", async () => {
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } };
    const store = new LocalProgressStore(storage);
    await expect(store.save("learner-1", checkpoint)).resolves.toMatchObject({ confirmed: true });
    await expect(store.load("learner-1", "sql-foundations")).resolves.toMatchObject({ segment_id: "first-query", quiz_state: { "select-purpose": 0 }, preferences: { captions_enabled: false, playback_rate: 1.25, volume: 0.7 } });
  });

  it("surfaces storage errors instead of claiming progress was saved", async () => {
    const storage = { getItem: () => null, setItem: () => { throw new Error("quota exceeded"); }, removeItem: () => undefined };
    const store = new LocalProgressStore(storage);
    await expect(store.save("learner-1", checkpoint)).rejects.toThrow("quota exceeded");
  });

  it("uses the Part A progress contract with credentialed idempotent requests", async () => {
    const requests: { url: string; init?: RequestInit }[] = [];
    const request = async (url: string | URL | Request, init?: RequestInit) => {
      requests.push({ url: String(url), init });
      return new Response(JSON.stringify({ progress: checkpoint }), { status: 200, headers: { "Content-Type": "application/json" } });
    };
    const store = new ApiProgressStore("https://api.example.test", request as typeof fetch);
    await store.save("learner-1", checkpoint);
    expect(requests[0].url).toContain("/api/v1/lessons/sql-foundations/progress");
    expect(requests[0].init?.method).toBe("PUT");
    expect(requests[0].init?.credentials).toBe("include");
    expect(new Headers(requests[0].init?.headers).get("Idempotency-Key")).toContain("sql-foundations");
    expect(JSON.parse(String(requests[0].init?.body)).preferences).toEqual(checkpoint.preferences);
  });

  it("maps the shared database version field to the Tutor checkpoint version", async () => {
    const { lesson_version: _lessonVersion, ...row } = checkpoint;
    const request = async () => new Response(JSON.stringify({ progress: { ...row, version: 1 } }), { status: 200 });
    const store = new ApiProgressStore("https://api.example.test", request as typeof fetch);
    await expect(store.load("learner-1", "sql-foundations")).resolves.toMatchObject({ lesson_version: 1 });
  });
});
