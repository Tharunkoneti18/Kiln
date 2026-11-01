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
    <ProgressPrimitive.Root
      className={cn("bg-raised relative h-1.5 w-full overflow-hidden rounded-full", className)}
      value={value}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "bg-primary h-full w-full flex-1 rounded-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          indicatorClassName,
        )}
        style={{ transform: "translateX(-" + (100 - (value ?? 0)) + "%)" }}
      />
    </ProgressPrimitive.Root>
  );
}
