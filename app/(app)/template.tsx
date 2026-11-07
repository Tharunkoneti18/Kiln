"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Route transition. A template re-mounts on every navigation; the incoming
 * screen fades in while `PageShell` staggers its sections upward. Keeping the
 * route-level move to opacity only avoids two competing rises.
 */
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  );
}
