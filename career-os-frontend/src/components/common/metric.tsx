"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Metrics are laid out on hairlines rather than in cards. At this density a
 * card around every number adds a border for no hierarchy, and four cards in
 * a row is the most tired layout in product UI.
 */
export function MetricRow({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <dl
      className={cn(
        "divide-border grid grid-cols-2 divide-y sm:grid-cols-4 sm:divide-x sm:divide-y-0",
        className,
      )}
    >
      {children}
    </dl>
  );
}

export function Metric({
  label,
  value,
  unit,
  detail,
  tone = "default",
}: {
  label: string;
  value: string | number;
  unit?: string;
  detail?: string;
  tone?: "default" | "primary";
}) {
  return (
    <div className="flex flex-col gap-1 px-0 py-3 first:pl-0 sm:px-5 sm:py-1">
      <dt className="text-muted-foreground text-[11.5px] font-semibold tracking-wide">{label}</dt>
      <dd className="flex items-baseline gap-1">
        <span
          className={cn(
            "numeric text-[25px] leading-none font-bold",
            tone === "primary" && "text-primary",
          )}
        >
          {value}
        </span>
        {unit && <span className="text-muted-foreground text-[12px] font-semibold">{unit}</span>}
      </dd>
      {detail && <p className="text-muted-foreground text-[11.5px] leading-snug">{detail}</p>}
    </div>
  );
}

/**
 * Counts up when it first scrolls into view. Motivated: the number is the
 * headline of the dashboard, and the count draws the eye to it once. It never
 * re-runs, and reduced motion renders the final value immediately.
 */
export function CountUp({
  value,
  durationMs = 900,
  className,
}: {
  value: number;
  durationMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (reduceMotion) {
      setShown(value);
      return;
    }
    if (!inView) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      // Same easing curve as the CSS transitions elsewhere.
      const eased = 1 - Math.pow(1 - progress, 3);
      setShown(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [durationMs, inView, reduceMotion, value]);

  return (
    <span ref={ref} className={cn("numeric", className)}>
      {shown}
    </span>
  );
}
