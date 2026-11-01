"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function RadioGroup({
  className,
  ...props
}: ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root className={cn("grid gap-2", className)} {...props} />;
}

export function RadioGroupItem({
  className,
  ...props
}: ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      className={cn(
        "border-input bg-card data-[state=checked]:border-primary grid size-4 shrink-0 place-items-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="bg-primary size-2 rounded-full" />
    </RadioGroupPrimitive.Item>
  );
}

/**
 * The whole row is the hit target, which matters for the lesson knowledge
 * checks where answers are read quickly.
 */
export function RadioOption({
  className,
  checked,
  ...props
}: ComponentProps<"label"> & { checked?: boolean }) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-md border p-3 text-[13px] leading-relaxed transition-colors",
        checked
          ? "border-primary bg-primary/[0.07] text-foreground"
          : "border-border hover:border-primary/35 hover:bg-raised",
        className,
      )}
      {...props}
    />
  );
}
