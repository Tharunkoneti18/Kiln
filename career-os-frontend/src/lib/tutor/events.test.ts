import { describe, expect, it } from "vitest";
import { createLearningEvent, LearningEventOutbox } from "./events";

describe("learning event contract", () => {
  it("creates a stable versioned idempotent envelope without learner content", () => {
    const event = createLearningEvent({
      event_id: "evt-1", event_type: "lesson.completed", user_id: "user-1", aggregate_id: "sql-foundations",
      occurred_at: "2026-10-31T10:00:00.000Z", idempotency_key: "lesson:sql-foundations:v1:completed",
      payload: { lesson_id: "sql-foundations", lesson_version: 1, score: 1 },
    });
    expect(event).toMatchObject({ schema_version: 1, event_id: "evt-1", event_type: "lesson.completed" });
    expect(event.payload).not.toHaveProperty("narration_text");
  });

  it("rejects unsupported event names", () => {
    const unsupported = { event_id: "evt-2", event_type: "profile.changed", user_id: "u", aggregate_id: "x", occurred_at: new Date().toISOString(), idempotency_key: "k", payload: {} } as unknown as Parameters<typeof createLearningEvent>[0];
    expect(() => createLearningEvent(unsupported)).toThrow();
  });

  it("deduplicates a successfully accepted event id within the current session", async () => {
    let calls = 0;
    const outbox = new LearningEventOutbox("", async () => { calls += 1; return new Response(null, { status: 202 }); });
    const event = createLearningEvent({ event_id: "dedupe-1", event_type: "lesson.started", user_id: "user-1", aggregate_id: "sql-foundations", occurred_at: "2026-10-31T10:00:00.000Z", idempotency_key: "start-1", payload: {} });
    await expect(outbox.emit(event)).resolves.toBe(true);
    await expect(outbox.emit(event)).resolves.toBe(false);
    expect(calls).toBe(1);
  });

  it("posts to the configured Part A origin and retains a failed event for retry", async () => {
    const calls: string[] = [];
    let reachable = false;
    const storage = new Map<string, string>();
    const storageAdapter = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => { storage.set(key, value); },
      removeItem: (key: string) => { storage.delete(key); },
    };
    const request: typeof fetch = async (input) => {
      calls.push(String(input));
      if (!reachable) return new Response(null, { status: 503 });
      return new Response(null, { status: 202 });
    };
    const outbox = new LearningEventOutbox("https://api.careeros.example/", request, storageAdapter, "learner-1");
    const event = createLearningEvent({ event_id: "retry-1", event_type: "lesson.completed", user_id: "u", aggregate_id: "lesson", occurred_at: "2026-10-31T10:00:00.000Z", idempotency_key: "lesson:v1:completed", payload: {} });
    await expect(outbox.emit(event)).rejects.toThrow(/not accepted/);
    expect(storageAdapter.getItem("career-os.learning-events:learner-1:v1")).toContain("retry-1");
    reachable = true;
    await expect(outbox.retryPending()).resolves.toBe(1);
    expect(calls).toEqual(["https://api.careeros.example/api/v1/learning-events", "https://api.careeros.example/api/v1/learning-events"]);
    expect(storageAdapter.getItem("career-os.learning-events:learner-1:v1")).toBe("[]");
  });

  it("never retries one learner's queued events in another learner's session", async () => {
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
    const event = createLearningEvent({ event_id: "user-scope-1", event_type: "lesson.completed", user_id: "learner-a", aggregate_id: "lesson", occurred_at: "2026-10-31T10:00:00.000Z", idempotency_key: "done-a", payload: {} });
    const unavailable: typeof fetch = async () => new Response(null, { status: 503 });
    const learnerA = new LearningEventOutbox("", unavailable, storage, "learner-a");
    await expect(learnerA.emit(event)).rejects.toThrow();
    let postedUser: string | undefined;
    const available: typeof fetch = async (_input, init) => { postedUser = JSON.parse(String(init?.body)).user_id; return new Response(null, { status: 202 }); };
    const learnerB = new LearningEventOutbox("", available, storage, "learner-b");
    await expect(learnerB.retryPending()).resolves.toBe(0);
    expect(postedUser).toBeUndefined();
    const resumedLearnerA = new LearningEventOutbox("", available, storage, "learner-a");
    await expect(resumedLearnerA.retryPending()).resolves.toBe(1);
    expect(postedUser).toBe("learner-a");
  });
});
