"use client";

import * as LabelPrimitive from "@radix-ui/react-label";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Labels sit above their control. Never a placeholder standing in for one. */
export function Label({ className, ...props }: ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn(
        "text-foreground text-[12.5px] font-semibold tracking-wide select-none",
        className,
      )}
      {...props}
    />
  );
}
