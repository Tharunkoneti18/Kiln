"use client";

import { Monitor, Moon, Sun } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";

const options = [
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
  { value: "dark", label: "Dark", icon: Moon },
] as const;

/**
 * Three states rather than a binary flip, so "follow my system" stays
 * reachable. The sliding thumb is the only motion here.
 */
export function ThemeToggle() {
  const { choice, setChoice } = useTheme();
  const reduceMotion = useReducedMotion();

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className="bg-raised flex items-center gap-0.5 rounded-md p-0.5"
    >
      {options.map((option) => {
        const isActive = choice === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={option.label}
            onClick={() => setChoice(option.value)}
            className={cn(
              "relative grid size-7 place-items-center rounded-[6px] transition-colors",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {isActive &&
              (reduceMotion ? (
                <span className="bg-card absolute inset-0 rounded-[6px] shadow-sm" />
              ) : (
                <motion.span
                  layoutId="theme-thumb"
                  className="bg-card absolute inset-0 rounded-[6px] shadow-sm"
                  transition={{ type: "spring", stiffness: 480, damping: 34 }}
                />
              ))}
            <option.icon size={14} weight={isActive ? "fill" : "regular"} className="relative" />
          </button>
        );
      })}
    </div>
  );
}
