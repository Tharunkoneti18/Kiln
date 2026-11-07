"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { CircleNotch } from "@phosphor-icons/react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Buttons.
 *
 * `primary` is ink on paper: the strongest contrast in the system, reserved for
 * the one action a screen exists for. `brand` (clay) is for brand moments such
 * as "Resume lesson", never more than one per view. Everything else is
 * `secondary` or `ghost`.
 *
 * Press feedback is a 0.98 scale on :active (transform only, so it never
 * shifts layout), and hover is a colour change, not a lift: lifting buttons on
 * hover makes dense toolbars feel jittery.
 */
const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-[var(--radius-control)] font-medium select-none",
    "transition-[background-color,border-color,color,box-shadow,transform,opacity] duration-150 ease-[var(--ease-out)]",
    "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover",
        brand:
          "bg-brand text-white shadow-xs hover:bg-brand-strong dark:text-gray-1",
        secondary:
          "bg-card text-foreground border border-border shadow-xs hover:bg-gray-2 hover:border-border-strong",
        outline:
          "border border-border text-foreground hover:bg-gray-3",
        ghost: "text-muted-foreground hover:bg-gray-3 hover:text-foreground",
        subtle: "bg-gray-3 text-foreground hover:bg-gray-4",
        destructive: "bg-danger text-destructive-foreground shadow-xs hover:opacity-90",
        link: "h-auto px-0 text-foreground underline-offset-4 hover:underline active:scale-100",
        /* Legacy names, mapped onto the system so old call sites stay valid. */
        soft: "bg-brand-soft text-brand-text border border-brand-border hover:bg-brand-soft/70",
        sketch: "bg-card text-foreground border border-border shadow-xs hover:bg-gray-2",
      },
      size: {
        xs: "h-7 px-2.5 text-[12px] [&_svg]:size-3.5",
        sm: "h-8 px-3 text-[12.5px] [&_svg]:size-3.5",
        md: "h-9 px-3.5 text-[13px] [&_svg]:size-4",
        lg: "h-10 px-4.5 text-[14px] [&_svg]:size-4",
        icon: "size-9 [&_svg]:size-4",
        "icon-sm": "size-8 [&_svg]:size-4",
        "icon-xs": "size-7 [&_svg]:size-3.5",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps extends ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Swaps the leading icon for a spinner and blocks repeat clicks. */
  loading?: boolean;
}

export function Button({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";
  return (
    <Component
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={asChild ? undefined : disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading && <CircleNotch className="animate-spin" aria-hidden="true" />}
          {children}
        </>
      )}
    </Component>
  );
}

export { buttonVariants };
