import type { Transition, Variants } from "motion/react";

/**
 * Motion vocabulary for Career OS.
 *
 * Every animation in the product picks from this file, so the whole app moves
 * with one personality: quick to respond, soft to settle. The rule of thumb:
 *
 *   feedback  (press, toggle, hover)        -> `spring.snappy`, < 150ms feel
 *   layout    (sliding indicators, reorder) -> `spring.layout`
 *   enter     (panels, cards, rows)         -> `ease.out` over `duration.enter`
 *   overlay   (dialogs, sheets, palette)    -> `spring.overlay`
 *
 * Nothing animates width/height/top/left directly. Size changes go through
 * `layout` (which Motion turns into transforms) or `scaleX`.
 */

export const ease = {
  /** Expo-out. Fast start, long soft landing. The default for entrances. */
  out: [0.16, 1, 0.3, 1] as const,
  /** Symmetric, for things that loop or travel and return. */
  inOut: [0.65, 0, 0.35, 1] as const,
  /** Leaving the screen: accelerate away, do not linger. */
  in: [0.5, 0, 0.75, 0] as const,
};

export const duration = {
  instant: 0.12,
  fast: 0.2,
  enter: 0.42,
  slow: 0.7,
  /** Data drawing itself in (rings, bars, sparklines). Long enough to read. */
  draw: 1.1,
};

export const spring = {
  snappy: { type: "spring", stiffness: 520, damping: 36, mass: 0.7 } satisfies Transition,
  layout: { type: "spring", stiffness: 420, damping: 38 } satisfies Transition,
  overlay: { type: "spring", stiffness: 380, damping: 34, mass: 0.9 } satisfies Transition,
  gentle: { type: "spring", stiffness: 220, damping: 28 } satisfies Transition,
  /** For numbers counting up: slightly overdamped so digits never overshoot. */
  counter: { type: "spring", stiffness: 90, damping: 22, mass: 1 } satisfies Transition,
};

/** Parent that sequences its children. Pair with `riseItem`. */
export const staggerParent = (stagger = 0.045, delay = 0.02): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

/** Child that rises 8px and fades in. Small travel reads as "settling". */
export const riseItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: duration.enter, ease: ease.out } },
};

/** Child that only fades: for dense rows where travel would be noisy. */
export const fadeItem: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: duration.enter, ease: ease.out } },
};

/** Overlay surfaces scale up from 96% so they feel anchored, not dropped. */
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 6 },
  show: { opacity: 1, scale: 1, y: 0, transition: spring.overlay },
  exit: { opacity: 0, scale: 0.98, y: 4, transition: { duration: 0.14, ease: ease.in } },
};
