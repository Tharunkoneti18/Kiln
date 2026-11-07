import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Badges are pills (the third radius in the lock). Evidence variants map
 * one-to-one onto the five skill states, so a colour always means the same
 * thing anywhere in the product: green is proven, blue is supported, amber is
 * transferable, red is a gap, grey is unknown.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[11.5px] leading-none font-medium whitespace-nowrap [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        neutral: "bg-gray-3 text-gray-11",
        outline: "border border-border text-gray-11",
        primary: "bg-brand-soft text-brand-text",
        brand: "bg-brand-soft text-brand-text",
        demonstrated: "bg-success-soft text-success",
        supported: "bg-info-soft text-info",
        transferable: "bg-warning-soft text-warning",
        gap: "bg-danger-soft text-danger",
        unknown: "bg-gray-3 text-gray-10",
        success: "bg-success-soft text-success",
        info: "bg-info-soft text-info",
        warning: "bg-warning-soft text-warning",
        danger: "bg-danger-soft text-danger",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export function Badge({ className, variant, ...props }: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
