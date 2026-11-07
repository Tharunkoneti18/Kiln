"use client";

import { useResolvedTheme } from "@/components/shell/theme-provider";

/**
 * Rough.js writes concrete `stroke`/`fill` attributes into the SVG at draw
 * time, so CSS custom properties never reach it. Any sketch surface that
 * carries its own fill therefore needs the resolved colour in JS, plus a
 * redraw when the theme flips.
 *
 * Ink is declared alongside each paper colour so a tinted surface can never
 * inherit `--foreground` and end up light-on-light (or dark-on-dark).
 */

export type SketchSurface = {
  /** Paper fill behind the content. */
  fill: string;
  /** Hand-drawn border stroke. */
  stroke: string;
  /** Guaranteed-contrast body ink for content sitting on `fill`. */
  ink: string;
  /** Slightly stronger ink for the title line. */
  titleInk: string;
  /** Masking-tape / accent chip colour. */
  accent: string;
};

export type StickyColor = "yellow" | "lavender" | "blue" | "green" | "orange";
export type CalloutVariant = "note" | "tip" | "warning" | "insight";

const STICKY_LIGHT: Record<StickyColor, SketchSurface> = {
  yellow:   { fill: "#FEF7D6", stroke: "#D9C66F", ink: "#4A3F15", titleInk: "#3A3110", accent: "#FDE68A" },
  lavender: { fill: "#EDE8F8", stroke: "#B9ABDC", ink: "#3C3158", titleInk: "#2F2646", accent: "#DDD6FE" },
  blue:     { fill: "#E4F0FB", stroke: "#8FB9E0", ink: "#1F3D57", titleInk: "#182F44", accent: "#BFDBFE" },
  green:    { fill: "#EDF3E4", stroke: "#A6BD8C", ink: "#33421F", titleInk: "#273318", accent: "#CBE3B4" },
  orange:   { fill: "#FDF0EA", stroke: "#E0A188", ink: "#61331F", titleInk: "#4D2817", accent: "#FED7AA" },
};

/**
 * Dark paper rather than bright paper with dark ink: a luminous sticky note on
 * a #181816 canvas glares badly and reads as a bug, not as an accent.
 */
const STICKY_DARK: Record<StickyColor, SketchSurface> = {
  yellow:   { fill: "#36301A", stroke: "#8A7A3C", ink: "#F0E6C2", titleInk: "#FBF3D8", accent: "#6E6130" },
  lavender: { fill: "#2D2838", stroke: "#6C5D93", ink: "#DED5F5", titleInk: "#ECE5FC", accent: "#4C4169" },
  blue:     { fill: "#1E2B38", stroke: "#4E7A9E", ink: "#D3E4F4", titleInk: "#E4F0FB", accent: "#39536B" },
  green:    { fill: "#242E1E", stroke: "#5B7246", ink: "#D8E6C9", titleInk: "#E8F2DD", accent: "#41542F" },
  orange:   { fill: "#36241C", stroke: "#9A6246", ink: "#F3D9CB", titleInk: "#FBE8DE", accent: "#6B4130" },
};

const CALLOUT_LIGHT: Record<CalloutVariant, SketchSurface> = {
  note:    { fill: "#F2F7FC", stroke: "#6A9BCC", ink: "#2C4457", titleInk: "#1F3D57", accent: "#6A9BCC" },
  tip:     { fill: "#F3F7EF", stroke: "#788C5D", ink: "#3A472A", titleInk: "#2C3720", accent: "#788C5D" },
  warning: { fill: "#FAF4F1", stroke: "#D97757", ink: "#5C3627", titleInk: "#73402B", accent: "#D97757" },
  insight: { fill: "#F7F3FA", stroke: "#9C7BB5", ink: "#433251", titleInk: "#53407A", accent: "#9C7BB5" },
};

const CALLOUT_DARK: Record<CalloutVariant, SketchSurface> = {
  note:    { fill: "#1D2833", stroke: "#82AFDC", ink: "#CFE1F4", titleInk: "#A8CDEC", accent: "#82AFDC" },
  tip:     { fill: "#222B1D", stroke: "#90A873", ink: "#D6E4C6", titleInk: "#B4CC97", accent: "#90A873" },
  warning: { fill: "#32231C", stroke: "#E0876A", ink: "#F0D6CA", titleInk: "#EFA98F", accent: "#E0876A" },
  insight: { fill: "#282134", stroke: "#B79BCD", ink: "#DED2EA", titleInk: "#C9B2DC", accent: "#B79BCD" },
};

export function useStickySurface(color: StickyColor): SketchSurface {
  const theme = useResolvedTheme();
  const table = theme === "dark" ? STICKY_DARK : STICKY_LIGHT;
  return table[color] ?? table.yellow;
}

export function useCalloutSurface(variant: CalloutVariant): SketchSurface {
  const theme = useResolvedTheme();
  const table = theme === "dark" ? CALLOUT_DARK : CALLOUT_LIGHT;
  return table[variant] ?? table.note;
}

/**
 * Line-art defaults (arrows, circled numbers, underlines). These sit on the
 * page background rather than on their own fill, so they only need to shift
 * light/dark, matching the `--sketch-*` tokens in globals.css.
 */
export const SKETCH_INK = {
  light: { orange: "#D97757", blue: "#6A9BCC", green: "#788C5D", graphite: "#62615C", yellow: "#FFE89A" },
  dark:  { orange: "#E0876A", blue: "#82AFDC", green: "#90A873", graphite: "#9E9D95", yellow: "#C8A94E" },
} as const;

export type SketchInkName = keyof typeof SKETCH_INK.light;

/** Resolved line-art palette for the active theme. */
export function useSketchInk() {
  return SKETCH_INK[useResolvedTheme()];
}

/**
 * Chrome for sketch surfaces that mirror ordinary cards (SketchCard,
 * SketchBorder). These mirror `--sketch-border` / `--surface` in globals.css,
 * resolved in JS so Rough.js never has to parse a `var()` string.
 */
const CHROME = {
  light: { border: "#E6E2D9", surface: "#FFFFFF", muted: "#F7F5EE" },
  dark: { border: "#3A3834", surface: "#21211E", muted: "#262522" },
} as const;

export function useSketchChrome() {
  return CHROME[useResolvedTheme()];
}
