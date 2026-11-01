import { z } from "zod";

const types = ["lesson.started", "lesson.paused", "lesson.resumed", "lesson.completed", "check.submitted"] as const;
const eventSchema = z.object({
  event_id: z.string().min(1),
  event_type: z.enum(types),
  schema_version: z.literal(1),
  user_id: z.string().min(1),
  aggregate_id: z.string().min(1),
  occurred_at: z.string().datetime(),
  idempotency_key: z.string().min(1),
  payload: z.record(z.string(), z.unknown()),
});

export type LearningEvent = z.infer<typeof eventSchema>;
type LearningEventInput = Omit<LearningEvent, "schema_version">;
type StorageLike = Pick<Storage, "getItem" | "setItem">;
const OUTBOX_KEY_PREFIX = "career-os.learning-events";

export function createLearningEvent(input: LearningEventInput): LearningEvent {
  return eventSchema.parse({ ...input, schema_version: 1 });
}

export class LearningEventOutbox {
  private readonly sent = new Set<string>();
  private memoryQueue: LearningEvent[] = [];
  constructor(
    private readonly baseUrl = "",
    private readonly request: typeof fetch = fetch,
    private readonly storage?: StorageLike,
    private readonly userScope = "anonymous",
  ) {}

  async emit(event: LearningEvent): Promise<boolean> {
    if (this.sent.has(event.event_id)) return false;
    const queue = this.readQueue();
    if (!queue.some((item) => item.event_id === event.event_id)) {
      queue.push(event);
      this.writeQueue(queue);
    }
    await this.retryPending();
    return this.sent.has(event.event_id);
  }

  pendingCount() {
    return this.readQueue().length;
  }

  async retryPending(): Promise<number> {
    const pending = this.readQueue();
    let accepted = 0;
    for (const event of pending) {
      const response = await this.request(`${this.baseUrl.replace(/\/$/, "")}/api/v1/learning-events`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json", "Idempotency-Key": event.idempotency_key },
        body: JSON.stringify(event),
      });
      if (!response.ok) throw new Error(`Learning event was not accepted (${response.status}).`);
      this.sent.add(event.event_id);
      this.writeQueue(this.readQueue().filter((item) => item.event_id !== event.event_id));
      accepted += 1;
    }
    return accepted;
  }

  private readQueue(): LearningEvent[] {
    const storage = this.getStorage();
    if (!storage) return this.memoryQueue;
    const value = storage.getItem(this.storageKey());
    if (!value) return [];
    try { return z.array(eventSchema).parse(JSON.parse(value)); }
    catch { return []; }
  }

  private writeQueue(queue: LearningEvent[]) {
    const storage = this.getStorage();
    if (storage) storage.setItem(this.storageKey(), JSON.stringify(queue));
    else this.memoryQueue = queue;
  }

  private getStorage(): StorageLike | undefined {
    if (this.storage) return this.storage;
    if (typeof window === "undefined") return undefined;
    return window.localStorage;
  }

  private storageKey() { return `${OUTBOX_KEY_PREFIX}:${encodeURIComponent(this.userScope)}:v1`; }
}
