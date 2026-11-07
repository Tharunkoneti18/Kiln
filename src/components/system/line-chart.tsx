"use client";

import { useId, useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { duration, ease, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Small line chart for a handful of points (weekly readiness, session
 * scores). The line draws left to right, then each point pops in with its
 * value, in order, so the reading direction matches time.
 *
 * It is deliberately minimal: a baseline, the line, labelled points. With
 * four to eight points, axes and gridlines add noise rather than precision.
 */
export function LineChart({
  values,
  labels,
  min = 0,
  max,
  format = (value) => value.toFixed(1),
  height = 140,
  className,
  tone = "brand",
}: {
  values: number[];
  labels: string[];
  min?: number;
  max?: number;
  format?: (value: number) => string;
  height?: number;
  className?: string;
  tone?: "brand" | "ink";
}) {
  const ref = useRef<SVGSVGElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const gradientId = useId().replace(/:/g, "");
  const show = reduce || inView;

  const width = 400;
  const padX = 24;
  const padTop = 26;
  const padBottom = 14;
  const top = max ?? Math.max(...values) * 1.1;
  const span = top - min || 1;
  const points = values.map((value, index) => ({
    x: values.length > 1 ? padX + (index / (values.length - 1)) * (width - padX * 2) : width / 2,
    y: padTop + (1 - (value - min) / span) * (height - padTop - padBottom),
    value,
  }));
  const line = points.map((p, i) => (i ? "L" : "M") + p.x.toFixed(1) + " " + p.y.toFixed(1)).join(" ");
  const area = line + ` L ${points.at(-1)!.x} ${height - padBottom} L ${points[0].x} ${height - padBottom} Z`;
  const color = tone === "brand" ? "var(--brand)" : "var(--gray-12)";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <svg
        ref={ref}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full overflow-visible"
        role="img"
        aria-label={labels.map((label, index) => `${label}: ${format(values[index])}`).join(", ")}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.14" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1={padX} x2={width - padX} y1={height - padBottom} y2={height - padBottom} stroke="var(--border)" strokeWidth={1} />
        <motion.path
          d={area}
          fill={`url(#${gradientId})`}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: show ? 1 : 0 }}
          transition={{ duration: 0.6, delay: reduce ? 0 : duration.draw * 0.5 }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: show ? 1 : 0 }}
          transition={{ duration: duration.draw, ease: ease.out }}
        />
        {points.map((point, index) => {
          const last = index === points.length - 1;
          const delay = reduce ? 0 : (index / Math.max(1, points.length - 1)) * duration.draw * 0.85;
          return (
            <motion.g
              key={index}
              initial={reduce ? false : { opacity: 0, scale: 0.4 }}
              animate={show ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
              transition={{ ...spring.snappy, delay }}
              style={{ transformOrigin: `${point.x}px ${point.y}px` }}
            >
              <circle cx={point.x} cy={point.y} r={last ? 4.5 : 3.5} fill={last ? color : "var(--card)"} stroke={color} strokeWidth={2} />
              <text
                x={point.x}
                y={point.y - 11}
                textAnchor="middle"
                fontSize="11.5"
                fontFamily="var(--font-sans)"
                fontWeight={last ? 600 : 450}
                fill={last ? "var(--foreground)" : "var(--gray-10)"}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {format(point.value)}
              </text>
            </motion.g>
          );
        })}
      </svg>
      <div className="text-gray-10 flex justify-between text-[11.5px] tabular" style={{ paddingInline: `${(padX / width) * 100}%` }}>
        {labels.map((label, index) => (
          <span key={index} className="w-0 text-center whitespace-nowrap [&]:flex [&]:justify-center">{label}</span>
        ))}
      </div>
    </div>
  );
}
