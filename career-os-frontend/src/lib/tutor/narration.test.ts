import { describe, expect, it } from "vitest";
import { narrationFromPosition } from "./narration";

describe("narration resume", () => {
  it("starts from the next sentence boundary for a saved playback position", () => {
    expect(narrationFromPosition("First idea. Second idea. Third idea.", 45, 100)).toBe("Third idea.");
  });

  it("returns the whole narration at the beginning and nothing at the end", () => {
    const text = "First idea. Second idea.";
    expect(narrationFromPosition(text, 0, 100)).toBe(text);
    expect(narrationFromPosition(text, 100, 100)).toBe("");
  });
});
