"use client";

import { useEffect, useId, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { duration, ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
   Data display primitives.

   Every one of these animates for the same reason: to show that a value was
   measured, not typed in. Numbers count up, bars fill, lines draw. Each runs
   once, when it first scrolls into view, and settles; nothing loops. Under
   reduced motion they render their final state immediately.
--------------------------------------------------------------------------- */

/**
 * A number that counts to its value when it enters the viewport.
 *
 * Driven by a motion value and written straight to the DOM node, so the
 * count never re-renders React (a 60fps setState would).
 */
export function AnimatedNumber({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
  durationSeconds = 1.1,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  durationSeconds?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const format = (n: number) => prefix + n.toFixed(decimals) + suffix;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reduce) {
      node.textContent = format(value);
      return;
    }
    if (!inView) return;
    const controls = animate(0, value, {
      duration: durationSeconds,
      ease: ease.out,
      onUpdate: (latest) => {
        node.textContent = format(latest);
      },
    });
    return () => controls.stop();
    // `format` is derived from the props listed here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, value, decimals, prefix, suffix, durationSeconds]);

  return (
    <span ref={ref} className={cn("tabular", className)}>
      {format(reduce ? value : 0)}
    </span>
  );
}

/**
 * Horizontal meter. The fill is a `scaleX` transform from the left edge, so
 * it animates on the compositor and never triggers layout.
 */
export function Meter({
  value,
  max = 100,
  tone = "brand",
  size = "md",
  className,
  delay = 0,
  label,
}: {
  value: number;
  max?: number;
  tone?: "brand" | "ink" | "success" | "info" | "warning" | "danger" | "muted";
  size?: "sm" | "md" | "lg";
  className?: string;
  delay?: number;
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const ratio = Math.min(1, Math.max(0, value / max));
  const fill = {
    brand: "bg-brand",
    ink: "bg-gray-12",
    success: "bg-success",
    info: "bg-info",
    warning: "bg-warning",
    danger: "bg-danger",
    muted: "bg-gray-8",
  }[tone];

  return (
    <div
      ref={ref}
      role="meter"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className={cn(
        "bg-gray-4 w-full overflow-hidden rounded-full",
        size === "sm" ? "h-1" : size === "lg" ? "h-2.5" : "h-1.5",
        className,
      )}
    >
      <motion.div
        className={cn("h-full w-full origin-left rounded-full", fill)}
        initial={reduce ? false : { scaleX: 0 }}
        animate={reduce || inView ? { scaleX: ratio } : { scaleX: 0 }}
        style={reduce ? { scaleX: ratio } : undefined}
        transition={{ duration: duration.draw, delay, ease: ease.out }}
      />
    </div>
  );
}

/** Circular progress that draws itself. For evidence-backed values only. */
export function Ring({
  value,
  size = 56,
  stroke = 5,
  tone = "brand",
  children,
  className,
}: {
  value: number;
  size?: number;
  stroke?: number;
  tone?: "brand" | "ink" | "success";
  children?: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const target = circumference * (1 - Math.min(100, Math.max(0, value)) / 100);
  const color = { brand: "var(--brand)", ink: "var(--gray-12)", success: "var(--success)" }[tone];

  return (
    <div ref={ref} className={cn("relative grid shrink-0 place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--gray-4)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={reduce ? false : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: reduce || inView ? target : circumference }}
          transition={{ duration: duration.draw * 1.2, ease: ease.out }}
        />
      </svg>
      {children && <div className="absolute inset-0 grid place-items-center">{children}</div>}
    </div>
  );
}

/**
 * Sparkline: a trend at a glance, no axes. The stroke draws left to right via
 * `pathLength`, then the area fill fades in underneath it.
 */
export function Sparkline({
  points,
  width = 120,
  height = 36,
  tone = "brand",
  className,
  showEnd = true,
}: {
  points: number[];
  width?: number;
  height?: number;
  tone?: "brand" | "ink" | "success" | "muted";
  className?: string;
  showEnd?: boolean;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const gradientId = useId().replace(/:/g, "");
  if (points.length < 2) return null;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const pad = 3;
  const xy = points.map((p, i) => [
    pad + (i / (points.length - 1)) * (width - pad * 2),
    pad + (1 - (p - min) / span) * (height - pad * 2),
  ]);
  const line = xy.map(([x, y], i) => (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1)).join(" ");
  const area = line + ` L ${xy.at(-1)![0].toFixed(1)} ${height} L ${xy[0][0].toFixed(1)} ${height} Z`;
  const color = { brand: "var(--brand)", ink: "var(--gray-12)", success: "var(--success)", muted: "var(--gray-9)" }[tone];
  const shown = reduce || inView;

  return (
    <svg ref={ref} width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={cn("overflow-visible", className)} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={area}
        fill={`url(#${gradientId})`}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: shown ? 1 : 0 }}
        transition={{ duration: 0.6, delay: reduce ? 0 : duration.draw * 0.6 }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: shown ? 1 : 0 }}
        transition={{ duration: duration.draw, ease: ease.out }}
      />
      {showEnd && (
        <motion.circle
          cx={xy.at(-1)![0]}
          cy={xy.at(-1)![1]}
          r={2.75}
          fill={color}
          initial={reduce ? false : { scale: 0 }}
          animate={{ scale: shown ? 1 : 0 }}
          transition={{ delay: reduce ? 0 : duration.draw * 0.9, type: "spring", stiffness: 500, damping: 20 }}
        />
      )}
    </svg>
  );
}

/** Delta chip: +4 / -2 with direction colour. Positive is not always good, so tone is explicit. */
export function Delta({ value, suffix = "", good = "up", className }: { value: number; suffix?: string; good?: "up" | "down"; className?: string }) {
  const positive = value > 0;
  const isGood = value === 0 ? null : (positive && good === "up") || (!positive && good === "down");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[12px] font-medium tabular",
        isGood === null ? "text-gray-10" : isGood ? "text-success" : "text-danger",
        className,
      )}
    >
      <span aria-hidden="true">{value === 0 ? "±" : positive ? "↑" : "↓"}</span>
      {Math.abs(value)}
      {suffix}
    </span>
  );
}

/** Motion value helper re-exported for pages that compose their own counters. */
export { useMotionValue, useTransform };
