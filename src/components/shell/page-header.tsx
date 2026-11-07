"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ease, riseItem, staggerParent } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
   Page layout.

   Content sits directly on the canvas inside a max-width column. There is no
   page-sized card around it: the old wrapper put every section inside a box
   inside a box, which flattened hierarchy. Sections are separated by space
   and a heading, and only units that genuinely group (a lesson, a job) get a
   Card.
--------------------------------------------------------------------------- */

export function PageShell({
  className,
  children,
  width = "default",
}: {
  className?: string;
  children: ReactNode;
  width?: "default" | "narrow" | "wide";
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      variants={staggerParent(0.06, 0.02)}
      initial={reduce ? false : "hidden"}
      animate="show"
      className={cn(
        "mx-auto w-full px-4 pt-6 pb-20 sm:px-6 lg:px-10 lg:pt-9",
        width === "narrow" ? "max-w-[880px]" : width === "wide" ? "max-w-[1440px]" : "max-w-[1200px]",
        "flex flex-col gap-10",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

/**
 * Page title block. The serif title carries the brand voice; everything else
 * is set in the UI sans. `highlight` underlines one phrase with a brand
 * stroke that draws in on load: one signature moment per page, no more.
 * `icon` is accepted for backwards compatibility and intentionally ignored.
 */
export function PageHeader({
  context,
  title,
  highlight,
  description,
  actions,
  meta,
}: {
  icon?: string;
  context?: string;
  title: string;
  highlight?: string;
  description?: string;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  const reduce = useReducedMotion();
  const parts = highlight && title.includes(highlight) ? title.split(highlight) : null;

  return (
    <motion.header variants={riseItem} className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="flex min-w-0 max-w-[720px] flex-col gap-2.5">
        {context && <span className="text-[12.5px] font-medium text-brand-text">{context}</span>}
        <h1 className="type-title text-foreground">
          {parts ? (
            <>
              {parts[0]}
              <span className="relative inline-block whitespace-nowrap">
                {highlight}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 200 12"
                  preserveAspectRatio="none"
                  className="absolute -bottom-1.5 left-0 h-[0.32em] w-full overflow-visible"
                >
                  <motion.path
                    d="M2 8 C 40 3, 90 3, 130 6 S 185 9, 198 4"
                    fill="none"
                    stroke="var(--brand)"
                    strokeWidth={3.2}
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.9, delay: 0.35, ease: ease.out }}
                  />
                </svg>
              </span>
              {parts[1]}
            </>
          ) : (
            title
          )}
        </h1>
        {description && <p className="text-muted-foreground max-w-[62ch] text-[14.5px] leading-relaxed">{description}</p>}
        {meta && <div className="mt-1 flex flex-wrap items-center gap-2">{meta}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </motion.header>
  );
}

/**
 * Section: a heading row plus content, separated from the next section by
 * whitespace rather than a container. `badge` is kept for compatibility and
 * renders as a quiet count/label beside the title.
 */
export function SectionHeading({
  title,
  description,
  actions,
  badge,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  badge?: string;
  className?: string;
}) {
  return (
    // Title row and actions share a fixed 32px line, so headings in adjacent
    // columns line up whether or not a section has an action button.
    <div className={cn("mb-3 flex items-start justify-between gap-4", className)}>
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex h-8 items-center gap-2">
          <h2 className="type-heading text-foreground">{title}</h2>
          {badge && <span className="bg-gray-3 text-gray-11 rounded-full px-2 py-0.5 text-[11.5px] font-medium">{badge}</span>}
        </div>
        {description && <p className="text-muted-foreground max-w-[68ch] text-[13px] leading-relaxed">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
    </div>
  );
}

/** A page section that takes part in the page's entrance stagger. */
export function Section({
  title,
  description,
  actions,
  badge,
  className,
  children,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  badge?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.section variants={riseItem} className={cn("min-w-0", className)}>
      {title && <SectionHeading title={title} description={description} actions={actions} badge={badge} />}
      {children}
    </motion.section>
  );
}

/** Wrap any block so it joins the page entrance stagger. */
export function Rise({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <motion.div variants={riseItem} className={className}>
      {children}
    </motion.div>
  );
}
