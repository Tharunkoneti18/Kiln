"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Route transition. A template re-mounts on every navigation, so each screen
 * eases in rather than snapping. Opacity and a small rise only: anything
 * larger makes moving between eight related screens feel slow.
 */
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
