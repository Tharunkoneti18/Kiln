import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Surfaces.
 *
 * A Card is used only when elevation means something: it groups content that
 * acts as one unit. Lists inside a card are divided with hairlines, never with
 * nested cards. That single rule removes most of the "box in a box" noise.
 */
export function Card({ className, interactive, ...props }: ComponentProps<"div"> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground rounded-[var(--radius-surface)] border border-border shadow-xs",
        interactive &&
          "transition-[border-color,box-shadow] duration-200 ease-[var(--ease-out)] hover:border-border-strong hover:shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex items-start justify-between gap-3 px-5 pt-4.5 pb-0", className)} {...props} />;
}

export function CardTitle({ className, ...props }: ComponentProps<"h3">) {
  return <h3 className={cn("type-heading text-foreground", className)} {...props} />;
}

export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("text-muted-foreground mt-0.5 text-[12.5px] leading-relaxed", className)} {...props} />;
}

export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("p-5", className)} {...props} />;
}

export function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex items-center gap-3 border-t border-border px-5 py-3", className)} {...props} />;
}
