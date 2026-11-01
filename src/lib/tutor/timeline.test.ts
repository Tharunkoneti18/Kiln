import { describe, expect, it } from "vitest";
import lesson from "../../../content/lessons/sql-foundations.v1.json";
import { parseLessonManifest } from "./manifest";
import { boardAt, checkpointAt } from "./timeline";

const parsed = parseLessonManifest(lesson);

describe("board timeline replay", () => {
  it("replays events at or before the requested time and clears prior ink", () => {
    const state = boardAt(parsed, "why-sql", 5000);
    expect(state.events.map((event) => event.id)).toEqual(["why-title", "table-outline", "table-columns"]);
    expect(state.cursor).toBe(3);
  });

  it("reconstructs an earlier board after seeking backwards", () => {
    expect(boardAt(parsed, "why-sql", 20000).events).toHaveLength(6);
    expect(boardAt(parsed, "why-sql", 3000).events.map((event) => event.id)).toEqual(["why-title", "table-outline"]);
  });

  it("restores a pinned lesson version with a matching board snapshot", () => {
    expect(checkpointAt(parsed, "why-sql", 4000)).toMatchObject({
      lesson_id: "sql-foundations", lesson_version: 1, segment_id: "why-sql", position_ms: 4000, event_cursor: 3,
    });
  });
});
