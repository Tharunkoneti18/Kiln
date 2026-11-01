"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Heart } from "@phosphor-icons/react";
import { useState, type ReactNode } from "react";
import { Icon3D, type Icon3DName } from "./icon-3d";
import { cn } from "@/lib/utils";

/**
 * Category tile from the reference: a pale blue rounded card, title at the
 * top, a rendered 3D illustration underneath. The illustration lifts on hover.
 */
export function CategoryTile({ href, label, icon }: { href: string; label: string; icon: Icon3DName }) {
  const reduce = useReducedMotion();
  return (
    <motion.div whileHover={reduce ? undefined : "hover"} initial="rest" animate="rest" className="snap-start">
      <Link
        href={href}
        className="from-tile to-tile/40 border-tile-border hover:border-primary/40 flex h-[150px] w-[136px] shrink-0 flex-col items-center justify-between rounded-[22px] border bg-gradient-to-b px-3 pt-4 pb-3.5 transition-[border-color,box-shadow] hover:shadow-[0_10px_28px_rgb(40_90_220/0.14)]"
      >
        <span className="text-center text-[15px] leading-tight font-semibold">{label}</span>
        <motion.span variants={{ rest: { y: 0, scale: 1, rotate: 0 }, hover: { y: -6, scale: 1.08, rotate: -4 } }} transition={{ type: "spring", stiffness: 320, damping: 16 }}>
          <Icon3D name={icon} size={68} />
        </motion.span>
      </Link>
    </motion.div>
  );
}

/** Small grey outlined pill used for card tags ("Online", "Free"). */
export function TagPill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "blue" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[12px] font-medium",
        tone === "blue" ? "border-primary/30 bg-accent text-accent-foreground" : "text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

/** Heart toggle with a small spring, as on the reference's featured cards. */
export function HeartToggle({ label, defaultOn = false }: { label: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  const reduce = useReducedMotion();
  return (
    <button type="button" aria-pressed={on} aria-label={(on ? "Unsave " : "Save ") + label} onClick={() => setOn((value) => !value)} className="grid size-8 place-items-center rounded-full">
      <motion.span key={String(on)} initial={reduce ? false : { scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 14 }}>
        <Heart size={22} weight={on ? "fill" : "regular"} className={on ? "text-destructive" : "text-foreground/70"} />
      </motion.span>
    </button>
  );
}

export type PosterTheme = "navy" | "blue" | "lavender" | "paper" | "ink";

const posterTheme: Record<PosterTheme, string> = {
  navy: "bg-[linear-gradient(160deg,#0d1b4c,#1a2f7a)] text-white",
  blue: "bg-[linear-gradient(160deg,#1f5fe0,#3b82f6)] text-white",
  lavender: "bg-[linear-gradient(165deg,#ece9ff,#f8f6ff)] text-[#1e1b4b]",
  paper: "bg-[linear-gradient(170deg,#f3f7ff,#ffffff)] text-[#0f172a]",
  ink: "bg-[linear-gradient(160deg,#111827,#1f2937)] text-white",
};

/**
 * Poster card from the reference's Featured row: artwork on top, then tag
 * pills with a heart, then the title. The artwork is drawn from the card's
 * own data rather than an uploaded image.
 */
export function PosterCard({
  href,
  theme,
  kicker,
  headline,
  icon,
  cta,
  tags,
  title,
  footnote,
}: {
  href: string;
  theme: PosterTheme;
  kicker: string;
  headline: string;
  icon: Icon3DName;
  cta: string;
  tags: string[];
  title: string;
  footnote?: string;
}) {
  const reduce = useReducedMotion();
  const dark = theme === "navy" || theme === "blue" || theme === "ink";
  return (
    <motion.article whileHover={reduce ? undefined : { y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 22 }} className="flex w-[244px] shrink-0 snap-start flex-col gap-3">
      <Link href={href} className={cn("relative flex h-[330px] flex-col overflow-hidden rounded-2xl border p-5 shadow-[var(--shadow-panel)]", posterTheme[theme])}>
        <span className={cn("text-[11px] font-bold tracking-[0.14em] uppercase", dark ? "text-white/70" : "text-[#4338ca]")}>{kicker}</span>
        <span className="mt-2 text-[22px] leading-[1.12] font-extrabold tracking-tight">{headline}</span>
        <span className="flex flex-1 items-center justify-center">
          <motion.span animate={reduce ? undefined : { y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
            <Icon3D name={icon} size={112} />
          </motion.span>
        </span>
        {footnote && <span className={cn("mb-3 text-center text-[11.5px]", dark ? "text-white/75" : "text-muted-foreground")}>{footnote}</span>}
        <span className={cn("self-center rounded-full px-4 py-1.5 text-[12px] font-bold", dark ? "bg-white text-[#1d4ed8]" : "bg-primary text-primary-foreground")}>{cta}</span>
      </Link>
      <div className="flex items-center gap-1.5">
        {tags.map((tag) => <TagPill key={tag}>{tag}</TagPill>)}
        <span className="ml-auto"><HeartToggle label={title} /></span>
      </div>
      <h3 className="text-[16.5px] leading-snug font-medium">{title}</h3>
    </motion.article>
  );
}
