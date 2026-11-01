// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import lessonData from "../../../content/lessons/sql-foundations.v1.json";
import { parseLessonManifest } from "../../lib/tutor/manifest";
import { TutorRoom } from "./TutorRoom";

const lesson = parseLessonManifest(lessonData);
afterEach(cleanup);

describe("TutorRoom", () => {
  it("renders lesson context, outline, readable board descriptions, and cited source", async () => {
    render(<TutorRoom lesson={lesson} />);
    expect(screen.getByRole("heading", { name: lesson.title })).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Lesson outline" })).toBeTruthy();
    expect(screen.getByText(/PostgreSQL SELECT documentation/)).toBeTruthy();
    expect(screen.getByLabelText("Lesson transcript")).toBeTruthy();
  });

  it("pauses playback and confirms the checkpoint before showing saved status", async () => {
    render(<TutorRoom lesson={lesson} />);
    fireEvent.click(screen.getByRole("button", { name: "Play lesson" }));
    fireEvent.click(screen.getByRole("button", { name: "Pause lesson" }));
    await waitFor(() => expect(screen.getByText(/Saved on this device/)).toBeTruthy());
  });

  it("lets the learner answer a check and preserves that answer in local progress", async () => {
    render(<TutorRoom lesson={lesson} />);
    fireEvent.click(screen.getAllByLabelText("SELECT")[0]);
    await waitFor(() => expect(screen.getAllByText("Answer saved")).toHaveLength(lesson.quiz.length));
  });

  it("renders every lesson check and exposes captions, volume, and playback speed controls", () => {
    render(<TutorRoom lesson={lesson} />);
    expect(screen.getAllByRole("group").filter((group) => group.tagName === "FIELDSET")).toHaveLength(lesson.quiz.length);
    expect(screen.getByRole("button", { name: /captions/i })).toBeTruthy();
    expect(screen.getByRole("slider", { name: /volume/i })).toBeTruthy();
    expect(screen.getByRole("combobox", { name: /playback speed/i })).toBeTruthy();
  });

  it("shows a save failure and lets the learner retry without losing their place", async () => {
    let attempts = 0;
    const progressStore = {
      load: async () => null,
      save: async () => { attempts += 1; if (attempts === 1) throw new Error("offline"); return { confirmed: true as const, savedAt: "2026-10-31T10:00:00.000Z" }; },
    };
    render(<TutorRoom lesson={lesson} progressStore={progressStore} />);
    fireEvent.click(screen.getByRole("button", { name: "Play lesson" }));
    fireEvent.click(screen.getByRole("button", { name: "Pause lesson" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Progress wasn’t saved"));
    fireEvent.click(screen.getByRole("button", { name: "Retry save" }));
    await waitFor(() => expect(screen.getByText("Saved on this device")).toBeTruthy());
    expect(attempts).toBeGreaterThanOrEqual(2);
  });
});
