"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Bell, Briefcase, CalendarCheck, ChartLineUp, Checks, ClipboardText, Exam, Microphone, Sparkle, Trophy, Warning } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/states";
import { PageHeader, PageShell } from "@/components/shell/page-header";
import { notifications as seed } from "@/lib/mock/data";
import type { Notification } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

const kindMeta: Record<Notification["kind"], { label: string; icon: typeof Bell }> = {
  learning: { label: "Learning", icon: CalendarCheck },
  assessment: { label: "Assessment", icon: Exam },
  assignment: { label: "Assignment", icon: ClipboardText },
  interview: { label: "Interview", icon: Microphone },
  application: { label: "Application", icon: Briefcase },
  milestone: { label: "Milestone", icon: Trophy },
  recovery: { label: "Recovery", icon: Warning },
  opportunity: { label: "Opportunity", icon: Sparkle },
  summary: { label: "Summary", icon: ChartLineUp },
};

export function NotificationsView() {
  const reduce = useReducedMotion();
  const [items, setItems] = useState(seed);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const visible = items.filter((item) => filter === "all" || !item.read);

  return (
    <PageShell className="flex flex-col gap-6">
      <PageHeader
        icon="bell"
        context={items.filter((item) => !item.read).length + " unread"}
        title="Notifications and Reminders"
        description="Learning reminders, assessments, interviews, follow-ups, milestones and opportunities. Designed to keep you consistent without forcing a rigid schedule."
        actions={<><Button variant="secondary" size="sm" onClick={() => setItems((prev) => prev.map((item) => ({ ...item, read: true })))}><Checks size={14} /> Mark all read</Button><Button variant="ghost" size="sm" asChild><Link href="/settings">Preferences</Link></Button></>}
      />
      <div className="bg-raised flex self-start rounded-md p-1">
        {(["all", "unread"] as const).map((option) => (
          <button key={option} type="button" onClick={() => setFilter(option)} aria-pressed={filter === option} className="relative rounded-[6px] px-3 py-1.5 text-[12px] font-semibold capitalize">
            {filter === option && <motion.span layoutId="nf-filter" className="bg-card absolute inset-0 rounded-[6px] shadow-sm" />}
            <span className="relative">{option}</span>
          </button>
        ))}
      </div>
      {visible.length === 0 ? <EmptyState icon={Bell} title="You are all caught up" description="New reminders and alerts will appear here." /> : (
        <ul className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {visible.map((item, index) => {
              const meta = kindMeta[item.kind];
              return (
                <motion.li key={item.id} layout initial={reduce ? false : { opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ delay: index * 0.03 }}>
                  <Link href={item.href} onClick={() => setItems((prev) => prev.map((entry) => entry.id === item.id ? { ...entry, read: true } : entry))}
                    className={cn("bg-card hover:border-primary/40 flex items-start gap-3 rounded-xl border p-4 transition-colors", !item.read && "border-primary/30 bg-primary/[0.04]")}>
                    <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", item.read ? "bg-raised text-muted-foreground" : "bg-brand text-primary-foreground")}><meta.icon size={16} weight="fill" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2"><span className="text-[13px] font-bold">{item.title}</span><span className="text-muted-foreground text-[10.5px] font-semibold">{meta.label}</span></span>
                      <span className="text-muted-foreground block text-[12.5px]">{item.body}</span>
                    </span>
                    <span className="text-muted-foreground shrink-0 text-[11px]">{item.time}</span>
                  </Link>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </PageShell>
  );
}
