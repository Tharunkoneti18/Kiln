import type { EvidenceState } from "@/lib/mock/types";

/**
 * Scene colours for the WebGL surfaces.
 *
 * Hex on purpose: Three.js cannot parse `oklch()`, and Chrome's computed style
 * keeps oklch values in their own colour space, so reading the CSS custom
 * properties at runtime yields black materials. Values are hand-matched to the
 * tokens in app/globals.css; change both together.
 *
 * Scenes follow the same rule as the DOM: neutral slate forms, the burnt
 * orange accent as a single warm key light, and a cool counter light so the
 * forms have depth without a second accent colour.
 */
export interface ScenePalette {
  base: string;
  fog: string;
  key: string;
  /** The accent, used as a warm rim light and for the current step. */
  rim: string;
  /** Cool neutral counter light. */
  violet: string;
  figure: string;
  figureDark: string;
  skin: string;
  hair: string;
  ink: string;
  board: string;
  state: Record<EvidenceState, string>;
}

export const scenePalettes: Record<"light" | "dark", ScenePalette> = {
  light: {
    base: "#f6f6f7",
    fog: "#e4e5e8",
    key: "#fff8ee",
    rim: "#2f6ff2",
    violet: "#6b7a99",
    figure: "#2f3646",
    figureDark: "#4a5263",
    skin: "#d9a584",
    hair: "#24262c",
    ink: "#1b1d22",
    board: "#ffffff",
    state: {
      demonstrated: "#2f56b0",
      supported: "#6e7d99",
      transferable: "#a87a1c",
      gap: "#c0343f",
      unknown: "#8b8d93",
    },
  },
  dark: {
    base: "#19191c",
    fog: "#26272b",
    key: "#ffe6cc",
    rim: "#7aa7ff",
    violet: "#8a9bbf",
    figure: "#4a5568",
    figureDark: "#353b47",
    skin: "#c7936f",
    hair: "#1d1f24",
    ink: "#ececee",
    board: "#222327",
    state: {
      demonstrated: "#7d9cf0",
      supported: "#9aa6bd",
      transferable: "#e3b25a",
      gap: "#f07a82",
      unknown: "#8b8d93",
    },
  },
};

export function scenePalette(theme: "light" | "dark") {
  return scenePalettes[theme];
}
