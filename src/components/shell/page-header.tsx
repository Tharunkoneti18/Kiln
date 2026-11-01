import type { ReactNode } from "react";
import { Icon3D, type Icon3DName } from "@/components/common/icon-3d";
import { cn } from "@/lib/utils";

/**
 * Page header in the reference style: a large, heavy headline where one word
 * can be set in the accent blue, a short line of purpose, and an optional
 * lavender info chip or actions on the right.
 */
export function PageHeader({
  context,
  title,
  highlight,
  description,
  actions,
  icon,
}: {
  /** Rendered 3D illustration beside the title, as on the dashboard tiles. */
  icon?: Icon3DName;
  context?: string;
  title: string;
  /** Word or phrase of the title rendered in blue. */
  highlight?: string;
  description: string;
  actions?: ReactNode;
}) {
  const parts = highlight && title.includes(highlight) ? title.split(highlight) : null;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
      {icon && (
        <span className="from-tile to-tile/30 border-tile-border hidden size-[76px] shrink-0 place-items-center rounded-[22px] border bg-gradient-to-b sm:grid">
          <Icon3D name={icon} size={52} />
        </span>
      )}
      <div className="flex min-w-0 flex-col gap-2">
        {context && (
          <span className="bg-chip text-chip-foreground inline-flex w-fit items-center rounded-full px-3 py-1 text-[12px] font-semibold">
            {context}
          </span>
        )}
        <h1 className="text-[30px] leading-[1.1] font-extrabold tracking-tight sm:text-[38px]">
          {parts ? (
            <>
              {parts[0]}
              <span className="text-primary">{highlight}</span>
              {parts[1]}
            </>
          ) : (
            title
          )}
        </h1>
        <p className="text-muted-foreground max-w-[68ch] text-[14px] leading-relaxed">{description}</p>
      </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function PageShell({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1320px] px-3 py-5 sm:px-5 sm:py-6">
      <div className={cn("bg-white/95 rounded-2xl shadow-[0_1px_3px_rgb(14_22_50/0.07),0_8px_32px_rgb(14_22_50/0.07)] px-5 py-7 sm:px-8 sm:py-9", className)}>
        {children}
      </div>
    </div>
  );
}

/** Section title with the reference's blue left bar, as in "| Featured". */
export function SectionHeading({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="border-primary border-l-[3px] pl-3 text-[20px] leading-tight font-bold tracking-tight sm:text-[22px]">
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground max-w-[70ch] pl-[15px] text-[13px] leading-relaxed">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
