// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Instructor } from "./Instructor";

vi.mock("@react-three/fiber", () => ({ Canvas: () => { throw new Error("WebGL unavailable"); } }));
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("Instructor fallback", () => {
  it("shows an accessible static instructor if WebGL cannot initialize", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    window.matchMedia = (() => ({ matches: false, addEventListener: () => undefined, removeEventListener: () => undefined })) as unknown as typeof window.matchMedia;
    render(<Instructor speaking={false} />);
    expect(await screen.findByRole("img", { name: "Career OS instructor, ready to teach" })).toBeTruthy();
  });
});
