"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Segmented control: a small set of mutually exclusive views or filters.
 * The selected thumb is a shared-layout element, so it slides between
 * options instead of jumping. Semantics are a radio group.
 */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  size = "md",
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly { value: T; label: React.ReactNode; count?: number }[];
  label: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const id = useId();
  const reduce = useReducedMotion();
  return (
    <div role="radiogroup" aria-label={label} className={cn("bg-gray-3 inline-flex items-center gap-0.5 rounded-[var(--radius-control)] p-[3px]", className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative inline-flex items-center gap-1.5 rounded-[6px] font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              size === "sm" ? "h-6 px-2.5 text-[12px]" : "h-7 px-3 text-[13px]",
              active ? "text-foreground" : "text-gray-11 hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId={reduce ? undefined : "seg-" + id}
                transition={spring.layout}
                className="bg-card absolute inset-0 rounded-[6px] shadow-[0_1px_2px_rgb(0_0_0/0.06),0_0_0_1px_var(--border)] dark:bg-gray-5"
              />
            )}
            <span className="relative">{option.label}</span>
            {option.count !== undefined && <span className="text-gray-10 relative tabular">{option.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
