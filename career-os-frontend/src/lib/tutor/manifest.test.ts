import { describe, expect, it } from "vitest";
import lesson from "../../../content/lessons/sql-foundations.v1.json";
import { parseLessonManifest } from "./manifest";

describe("parseLessonManifest", () => {
  it("accepts the published, versioned SQL lesson", () => {
    expect(parseLessonManifest(lesson)).toMatchObject({
      lesson_id: "sql-foundations",
      version: 1,
      segments: expect.arrayContaining([
        expect.objectContaining({ segment_id: "why-sql" }),
        expect.objectContaining({ segment_id: "first-query" }),
      ]),
    });
  });

  it("rejects a lesson without an immutable positive version", () => {
    expect(() => parseLessonManifest({ ...lesson, version: 0 })).toThrow();
  });

  it("rejects board events without accessible descriptions", () => {
    const invalid = structuredClone(lesson);
    invalid.segments[0].board_events[0].accessible_text = "";
    expect(() => parseLessonManifest(invalid)).toThrow();
  });

  it("rejects unknown event kinds and normalized coordinates outside 0–1", () => {
    const unknown = structuredClone(lesson);
    unknown.segments[0].board_events[0].kind = "magic";
    expect(() => parseLessonManifest(unknown)).toThrow();

    const outside = structuredClone(lesson);
    outside.segments[0].board_events[0].payload.x = 1.5;
    expect(() => parseLessonManifest(outside)).toThrow();
  });

  it("allows prepared local lesson images and rejects unsafe image URLs", () => {
    const valid = structuredClone(lesson);
    valid.segments[0].board_events[0] = {
      ...valid.segments[0].board_events[0], kind: "image",
      payload: { x: 0.1, y: 0.1, width: 0.2, height: 0.2, src: "/lessons/applications-table.svg" },
    };
    expect(() => parseLessonManifest(valid)).not.toThrow();
    valid.segments[0].board_events[0].payload.src = "javascript:alert(1)";
    expect(() => parseLessonManifest(valid)).toThrow();
  });

  it("rejects board shapes whose normalized width or height exceeds the canvas", () => {
    const invalid = structuredClone(lesson);
    invalid.segments[0].board_events[1].payload.width = 1.5;
    expect(() => parseLessonManifest(invalid)).toThrow();
  });

  it("rejects timeline offsets that move backwards", () => {
    const invalid = structuredClone(lesson);
    invalid.segments[0].board_events[1].offset_ms = -1;
    expect(() => parseLessonManifest(invalid)).toThrow();
  });
});
