import { describe, expect, it } from "vitest";
import lesson from "../../../content/lessons/sql-foundations.v1.json";
import { parseLessonManifest } from "./manifest";
import { PlaybackController } from "./playback";

const parsed = parseLessonManifest(lesson);

describe("PlaybackController", () => {
  it("advances from one segment to the next and remains paused at the final boundary", () => {
    const player = new PlaybackController(parsed);
    player.play(1000);
    player.advance(32000);
    expect(player.getSnapshot()).toMatchObject({ segment_id: "first-query", position_ms: 1000 });
    player.advance(77000);
    expect(player.getSnapshot()).toMatchObject({ segment_id: "first-query", position_ms: 45000, playing: false });
  });

  it("pause freezes progress and resume continues from the same position", () => {
    const player = new PlaybackController(parsed);
    player.play(1000);
    player.advance(6000);
    player.pause(6000);
    player.advance(16000);
    expect(player.getSnapshot().position_ms).toBe(5000);
    player.play(16000);
    player.advance(19000);
    expect(player.getSnapshot().position_ms).toBe(8000);
  });

  it("seeking reconstructs board and preserves learner quiz answers", () => {
    const player = new PlaybackController(parsed);
    player.setQuizAnswer("select-purpose", 0);
    player.seek(12000);
    expect(player.getSnapshot()).toMatchObject({ position_ms: 12000, quiz_state: { "select-purpose": 0 } });
    expect(player.getSnapshot().board_snapshot.events).toHaveLength(5);
  });

  it("replays a completed lesson from the first segment", () => {
    const player = new PlaybackController(parsed);
    player.restore({ lesson_id: parsed.lesson_id, lesson_version: parsed.version, segment_id: "first-query", position_ms: 45000 });
    player.restart(1000);
    expect(player.getSnapshot()).toMatchObject({ segment_id: "why-sql", position_ms: 0, playing: true });
  });
});
