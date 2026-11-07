"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Progress({
  className,
  value,
  indicatorClassName,
  ...props
}: ComponentProps<typeof ProgressPrimitive.Root> & { indicatorClassName?: string }) {
  return (
    <ProgressPrimitive.Root className={cn("bg-gray-4 relative h-1.5 w-full overflow-hidden rounded-full", className)} value={value} {...props}>
      <ProgressPrimitive.Indicator
        className={cn("bg-brand h-full w-full rounded-full transition-transform duration-700 ease-[var(--ease-out)]", indicatorClassName)}
        style={{ transform: "translateX(-" + (100 - (value ?? 0)) + "%)" }}
      />
    </ProgressPrimitive.Root>
  );
}
