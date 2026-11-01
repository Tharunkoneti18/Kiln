import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Pills use `rounded-full`. The evidence variants map one-to-one onto the
 * five skill states in the PRD, so a colour always means the same thing.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11.5px] font-semibold whitespace-nowrap [&_svg]:size-3",
  {
    variants: {
      variant: {
        neutral: "bg-raised text-muted-foreground border-border",
        outline: "text-foreground border-border",
        primary: "bg-primary/10 text-primary border-primary/25",
        demonstrated: "bg-demonstrated/12 text-demonstrated border-demonstrated/30",
        supported: "bg-supported/12 text-supported border-supported/30",
        transferable: "bg-transferable/14 text-transferable border-transferable/35",
        gap: "bg-gap/12 text-gap border-gap/30",
        unknown: "bg-unknown/12 text-unknown border-unknown/30",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
