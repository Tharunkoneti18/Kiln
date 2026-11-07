"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Bell, Briefcase, CalendarCheck, ChartLineUp, Check, Checks, ClipboardText, Exam, Microphone, Sparkle, Trophy, Warning, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Hint } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/common/states";
import { Segmented } from "@/components/system/segmented";
import { PageHeader, PageShell, Rise } from "@/components/shell/page-header";
import { notifications as seed } from "@/lib/mock/data";
import type { Notification } from "@/lib/mock/types";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

const kindMeta: Record<Notification["kind"], { label: string; icon: typeof Bell }> = {
  learning: { label: "Learning", icon: CalendarCheck },
  assessment: { label: "Assessment", icon: Exam },
  assignment: { label: "Assignment", icon: ClipboardText },
  interview: { label: "Interview", icon: Microphone },
  application: { label: "Application", icon: Briefcase },
  milestone: { label: "Milestone", icon: Trophy },
  recovery: { label: "Schedule", icon: Warning },
  opportunity: { label: "Opportunity", icon: Sparkle },
  summary: { label: "Summary", icon: ChartLineUp },
};

/** "8:00" and "Yesterday" are recent; anything with a date or "days ago" is earlier. */
function isRecent(time: string) {
  return /^\d{1,2}:\d{2}$/.test(time) || time === "Yesterday";
}

export function NotificationsView() {
  const reduce = useReducedMotion();
  const [items, setItems] = useState(seed);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const unread = items.filter((item) => !item.read).length;
  const visible = items.filter((item) => filter === "all" || !item.read);
  const groups = [
    { label: "Recent", items: visible.filter((item) => isRecent(item.time)) },
    { label: "Earlier", items: visible.filter((item) => !isRecent(item.time)) },
  ].filter((group) => group.items.length > 0);

  const markRead = (id: string) => setItems((prev) => prev.map((entry) => (entry.id === id ? { ...entry, read: true } : entry)));
  const dismiss = (id: string) => setItems((prev) => prev.filter((entry) => entry.id !== id));

  return (
    <PageShell width="narrow">
      <PageHeader
        context={unread ? unread + " unread" : "All caught up"}
        title="Notifications"
        description="Reminders, results, deadlines and milestones. Tuned to keep momentum without piling up."
        actions={
          <>
            <Button variant="ghost" asChild>
              <Link href="/settings">Preferences</Link>
            </Button>
            <Button variant="secondary" disabled={unread === 0} onClick={() => setItems((prev) => prev.map((item) => ({ ...item, read: true })))}>
              <Checks /> Mark all read
            </Button>
          </>
        }
      />

      <Rise className="flex flex-col gap-6">
        <Segmented
          label="Filter"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All", count: items.length },
            { value: "unread", label: "Unread", count: unread },
          ]}
          className="self-start"
        />

        {visible.length === 0 ? (
          <EmptyState icon={Bell} title="You are all caught up" description="New reminders, results and milestones will show up here as they happen." />
        ) : (
          groups.map((group) => (
            <section key={group.label} className="flex flex-col gap-2">
              <h2 className="text-gray-10 px-1 text-[12.5px] font-medium">{group.label}</h2>
              <Card className="overflow-hidden">
                <ul className="divide-y divide-border">
                  <AnimatePresence initial={false}>
                    {group.items.map((item) => {
                      const meta = kindMeta[item.kind];
                      return (
                        <motion.li
                          key={item.id}
                          layout={!reduce}
                          exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0, transition: { duration: 0.2, ease: ease.in } }}
                          className="group relative overflow-hidden"
                        >
                          <Link
                            href={item.href}
                            onClick={() => markRead(item.id)}
                            className="hover:bg-gray-2 flex items-start gap-3.5 px-4 py-3.5 pr-24 transition-colors"
                          >
                            <span className={cn("relative grid size-8 shrink-0 place-items-center rounded-[8px]", item.read ? "bg-gray-3 text-gray-10" : "bg-brand-soft text-brand-text")}>
                              <meta.icon size={16} weight={item.read ? "regular" : "fill"} />
                              {!item.read && <span className="bg-brand ring-card absolute -top-0.5 -right-0.5 size-2 rounded-full ring-2" aria-label="Unread" />}
                            </span>
                            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                              <span className="flex items-baseline gap-2">
                                <span className={cn("text-[13.5px]", item.read ? "text-gray-11" : "font-medium text-foreground")}>{item.title}</span>
                                <span className="text-gray-9 text-[12px]">{meta.label}</span>
                              </span>
                              <span className="text-gray-10 text-[13px] leading-relaxed">{item.body}</span>
                            </span>
                          </Link>
                          <span className="text-gray-9 pointer-events-none absolute top-4 right-4 text-[12px] tabular transition-opacity group-focus-within:opacity-0 group-hover:opacity-0">{item.time}</span>
                          <div className="absolute top-3 right-3 flex gap-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                            {!item.read && (
                              <Hint label="Mark read">
                                <Button variant="ghost" size="icon-xs" aria-label={"Mark read: " + item.title} onClick={() => markRead(item.id)}>
                                  <Check />
                                </Button>
                              </Hint>
                            )}
                            <Hint label="Dismiss">
                              <Button variant="ghost" size="icon-xs" aria-label={"Dismiss: " + item.title} onClick={() => dismiss(item.id)}>
                                <X />
                              </Button>
                            </Hint>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              </Card>
            </section>
          ))
        )}
      </Rise>
    </PageShell>
  );
}
