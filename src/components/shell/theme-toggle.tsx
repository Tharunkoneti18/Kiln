"use client";

import { Monitor, Moon, Sun } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useTheme } from "./theme-provider";

const options = [
  { value: "light", label: "Light theme", icon: Sun },
  { value: "system", label: "Match system theme", icon: Monitor },
  { value: "dark", label: "Dark theme", icon: Moon },
] as const;

/**
 * Three states rather than a binary flip, so "follow my system" stays
 * reachable. The sliding thumb is the only motion here.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { choice, setChoice } = useTheme();
  const reduce = useReducedMotion();

  return (
    <div role="radiogroup" aria-label="Colour theme" className={cn("bg-gray-4/70 flex shrink-0 items-center rounded-[7px] p-[2px]", className)}>
      {options.map((option) => {
        const active = choice === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={option.label}
            title={option.label}
            onClick={() => setChoice(option.value)}
            className={cn(
              "relative grid size-6 place-items-center rounded-[5px] transition-colors",
              active ? "text-foreground" : "text-gray-10 hover:text-gray-12",
            )}
          >
            {active && (
              <motion.span
                layoutId={reduce ? undefined : "theme-thumb"}
                transition={spring.snappy}
                className="bg-card absolute inset-0 rounded-[5px] shadow-[0_1px_2px_rgb(0_0_0/0.1)] dark:bg-gray-6"
              />
            )}
            <option.icon size={13} weight={active ? "fill" : "regular"} className="relative" />
          </button>
        );
      })}
    </div>
  );
}
