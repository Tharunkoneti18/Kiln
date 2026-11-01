"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  ChalkboardTeacher,
  Compass,
  MagnifyingGlass,
  SealCheck,
  Target,
  Trophy,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/**
 * The six platform activities as one connected loop: Discover, Analyze, Plan,
 * Learn, Prove, Achieve. A light travels the connecting line toward the
 * current stage, which is the one place on the dashboard the whole journey is
 * visible at once.
 */
const stages = [
  { key: "discover", label: "Discover", href: "/twin", icon: Compass },
  { key: "analyze", label: "Analyze", href: "/gaps", icon: MagnifyingGlass },
  { key: "plan", label: "Plan", href: "/plan", icon: Target },
  { key: "learn", label: "Learn", href: "/tutor", icon: ChalkboardTeacher },
  { key: "prove", label: "Prove", href: "/assessments", icon: SealCheck },
  { key: "achieve", label: "Achieve", href: "/jobs", icon: Trophy },
] as const;

export function JourneyFlow({ current = 3 }: { current?: number }) {
  const reduce = useReducedMotion();
  const progress = current / (stages.length - 1);

  return (
    <div className="relative">
      {/* Track and travelled portion. */}
      <div className="absolute top-5 right-[8%] left-[8%] hidden h-px sm:block">
        <div className="bg-border absolute inset-0" />
        <motion.div
          className="bg-brand absolute inset-y-0 left-0 origin-left"
          style={{ width: progress * 100 + "%" }}
          initial={reduce ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        />
        {!reduce && (
          <motion.span
            className="bg-primary absolute -top-[3px] size-[7px] rounded-full"
            initial={{ left: "0%" }}
            animate={{ left: progress * 100 + "%" }}
            transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 0.6, ease: "easeInOut" }}
          />
        )}
      </div>

      <ol className="relative grid grid-cols-3 gap-y-4 sm:grid-cols-6">
        {stages.map((stage, index) => {
          const state = index < current ? "done" : index === current ? "current" : "next";
          return (
            <li key={stage.key} className="flex justify-center">
              <Link href={stage.href} className="group flex flex-col items-center gap-2 text-center">
                <motion.span
                  className={cn(
                    "relative grid size-10 place-items-center rounded-full border transition-colors",
                    state === "done" && "border-primary/40 bg-primary/12 text-primary",
                    state === "current" && "bg-brand text-primary-foreground border-transparent",
                    state === "next" && "bg-card text-muted-foreground group-hover:text-foreground",
                  )}
                  initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 + index * 0.08, type: "spring", stiffness: 300, damping: 20 }}
                >
                  {state === "current" && !reduce && (
                    <motion.span
                      className="border-primary absolute inset-0 rounded-full border"
                      animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                    />
                  )}
                  <stage.icon size={17} weight={state === "next" ? "regular" : "fill"} />
                </motion.span>
                <span
                  className={cn(
                    "text-[11.5px] font-bold",
                    state === "current" ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {stage.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
