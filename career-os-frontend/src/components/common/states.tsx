import type { ReactNode } from "react";
import type { Icon } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Empty state. Always says how to populate the thing that is empty, because an
 * empty screen with no next step is the point most people abandon a product.
 */
export function EmptyState({
  icon: IconGlyph,
  title,
  description,
  action,
  className,
}: {
  icon: Icon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-border flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center",
        className,
      )}
    >
      <span className="bg-raised text-muted-foreground grid size-11 place-items-center rounded-full">
        <IconGlyph size={20} />
      </span>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-[14.5px] font-semibold">{title}</h3>
        <p className="text-muted-foreground mx-auto max-w-[44ch] text-[13px] leading-relaxed">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

/**
 * Shaped loader for a list of rows. Matches the real row height so nothing
 * shifts when the content lands.
 */
export function RowsSkeleton({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)} aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-3 rounded-xl border p-4">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton className="h-3 w-[42%]" />
            <Skeleton className="h-2.5 w-[68%]" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/**
 * Inline, contextual error. Keeps the retry next to the thing that failed
 * rather than in a toast that has already gone by the time it is read.
 */
export function InlineError({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "border-destructive/35 bg-destructive/[0.06] flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <strong className="text-destructive text-[13px] font-semibold">{title}</strong>
        <span className="text-muted-foreground text-[12.5px] leading-snug">{description}</span>
      </div>
      {action}
    </div>
  );
}

/**
 * Provenance line. Every inferred claim in the product carries one of these,
 * so a recommendation can always be traced back to what produced it.
 */
export function SourceNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-muted-foreground text-[11.5px] leading-snug", className)}>{children}</p>
  );
}
