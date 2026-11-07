"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * The thumb travels on a slight-overshoot curve and stretches while pressed,
 * the same physical cue iOS uses, so the toggle feels like it has mass.
 */
export function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "group/switch inline-flex h-5 w-[34px] shrink-0 cursor-pointer items-center rounded-full p-[2px] transition-colors duration-200",
        "bg-gray-6 data-[state=checked]:bg-brand",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-[0_1px_2px_rgb(0_0_0/0.2)]",
          "transition-[transform,width] duration-200 ease-[cubic-bezier(0.34,1.4,0.64,1)]",
          "data-[state=checked]:translate-x-[14px] group-active/switch:w-[19px] data-[state=checked]:group-active/switch:translate-x-[11px]",
        )}
      />
    </SwitchPrimitive.Root>
  );
}
