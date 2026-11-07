"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowsLeftRight, Clock, Lightning } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfidenceMeter, EvidenceBadge, evidenceMeta } from "@/components/common/evidence";
import { Meter } from "@/components/system/data";
import { Segmented } from "@/components/system/segmented";
import { PageHeader, PageShell, Rise } from "@/components/shell/page-header";
import { skillById, skills, targetRole } from "@/lib/mock/data";
import type { Skill } from "@/lib/mock/types";
import { ease, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

type GroupKey = "all" | "missing" | "weak" | "unverified" | "transferable";

const groups: { key: Exclude<GroupKey, "all">; title: string; hint: string; match: (s: Skill) => boolean }[] = [
  { key: "missing", title: "Missing", hint: "Required, no evidence yet", match: (s) => s.state === "gap" },
  { key: "weak", title: "Weak", hint: "Shown below the needed level", match: (s) => s.demonstrated > 0 && s.demonstrated < 3 && s.state !== "gap" },
  { key: "unverified", title: "Unverified", hint: "Claimed more than shown", match: (s) => s.claimed > s.demonstrated },
  { key: "transferable", title: "Transferable", hint: "Adjacent evidence, named bridge", match: (s) => s.state === "transferable" },
];

export function GapsView() {
  const reduce = useReducedMotion();
  const [selectedId, setSelectedId] = useState("rag");
  const [group, setGroup] = useState<GroupKey>("all");
  const [requirement, setRequirement] = useState<"all" | "mandatory" | "preferred">("all");
  const selected = skillById(selectedId)!;

  const ranked = useMemo(() => {
    const groupMatch = groups.find((entry) => entry.key === group)?.match;
    return skills
      .filter((skill) => skill.state !== "demonstrated")
      .filter((skill) => requirement === "all" || skill.requirement === requirement)
      .filter((skill) => !groupMatch || groupMatch(skill))
      .sort((a, b) => b.priority - a.priority);
  }, [group, requirement]);
  const totalEffort = ranked.reduce((sum, skill) => sum + skill.effortHours, 0);

  return (
    <PageShell>
      <PageHeader
        context={"Measured against " + targetRole.title}
        title="What stands between you and the role"
        highlight="the role"
        description="Every capability the role asks for that your evidence does not yet support, ranked by priority, with the effort to close it."
        actions={
          <Button asChild>
            <Link href="/plan">
              Turn gaps into a plan <ArrowRight weight="bold" />
            </Link>
          </Button>
        }
      />

      <Rise>
        <Card className="grid grid-cols-2 overflow-hidden lg:grid-cols-4">
          {groups.map((entry, index) => {
            const count = skills.filter(entry.match).length;
            const active = group === entry.key;
            return (
              <button
                key={entry.key}
                type="button"
                aria-pressed={active}
                onClick={() => setGroup(active ? "all" : entry.key)}
                className={cn(
                  "relative flex flex-col gap-1 border-border p-5 text-left transition-colors outline-none focus-visible:bg-gray-2",
                  index % 2 === 0 && "border-r",
                  index < 2 && "border-b lg:border-b-0",
                  index === 1 && "lg:border-r",
                  index === 2 && "lg:border-r",
                  active ? "bg-gray-2" : "hover:bg-gray-2",
                )}
              >
                {active && (
                  <motion.span layoutId={reduce ? undefined : "gap-group"} transition={spring.layout} className="bg-gray-12 absolute inset-x-0 top-0 h-[2px]" />
                )}
                <span className="text-gray-11 text-[12.5px] font-medium">{entry.title}</span>
                <span className="type-stat tabular">{count}</span>
                <span className="text-gray-10 text-[12px]">{entry.hint}</span>
              </button>
            );
          })}
        </Card>
      </Rise>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-x-8 gap-y-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <Rise className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <h2 className="type-heading">Ranked gaps</h2>
              <span className="text-gray-10 text-[12.5px] tabular">
                {ranked.length} skills · about {totalEffort}h to close
              </span>
            </div>
            <Segmented
              label="Requirement"
              size="sm"
              value={requirement}
              onChange={setRequirement}
              options={[
                { value: "all", label: "All" },
                { value: "mandatory", label: "Required" },
                { value: "preferred", label: "Preferred" },
              ]}
            />
          </div>

          <Card className="overflow-hidden">
            <div className="text-gray-10 hidden grid-cols-[24px_minmax(0,1fr)_150px_56px] items-center gap-4 border-b border-border px-4 py-2 text-[11.5px] sm:grid">
              <span>#</span>
              <span>Skill</span>
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1"><span className="border-gray-11 size-2 rounded-full border-[1.5px]" /> Claimed</span>
                <span className="flex items-center gap-1"><span className="bg-gray-12 size-2 rounded-full" /> Proven</span>
              </span>
              <span className="text-right">Effort</span>
            </div>
            <LayoutGroup>
              <ul>
                <AnimatePresence initial={false} mode="popLayout">
                  {ranked.map((skill, index) => {
                    const isSelected = selectedId === skill.id;
                    return (
                      <motion.li
                        key={skill.id}
                        layout={reduce ? false : "position"}
                        initial={reduce ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.12 } }}
                        transition={spring.layout}
                        className="border-b border-border last:border-b-0"
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedId(skill.id)}
                          aria-pressed={isSelected}
                          className={cn(
                            "relative grid w-full grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-4 px-4 py-3.5 text-left transition-colors outline-none sm:grid-cols-[24px_minmax(0,1fr)_150px_56px]",
                            isSelected ? "bg-gray-2" : "hover:bg-gray-2 focus-visible:bg-gray-2",
                          )}
                        >
                          {isSelected && (
                            <motion.span layoutId={reduce ? undefined : "gap-row"} transition={spring.layout} className="bg-brand absolute inset-y-2 left-0 w-[3px] rounded-r-full" />
                          )}
                          <span className="text-gray-9 text-[12.5px] tabular">{index + 1}</span>
                          <span className="flex min-w-0 flex-col gap-0.5">
                            <span className="flex items-center gap-2">
                              <span className="truncate text-[13.5px] font-medium text-foreground">{skill.label}</span>
                              <EvidenceBadge state={skill.state} withIcon={false} className="hidden md:inline-flex" />
                            </span>
                            <span className="text-gray-10 text-[12px]">
                              {skill.requirement === "mandatory" ? "Required" : "Preferred"} · priority {skill.priority}
                            </span>
                          </span>
                          <Dumbbell claimed={skill.claimed} proven={skill.demonstrated} delay={index * 0.04} />
                          <span className="text-gray-11 hidden text-right text-[12.5px] tabular sm:block">{skill.effortHours}h</span>
                        </button>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            </LayoutGroup>
            {ranked.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-[13.5px] font-medium text-foreground">Nothing in this filter</p>
                <p className="text-gray-10 mt-1 text-[12.5px]">Every skill in this group is already proven, or none match the requirement filter.</p>
              </div>
            )}
          </Card>
        </Rise>

        <Rise className="lg:sticky lg:top-[72px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={selected.id}
              initial={reduce ? false : { opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              transition={{ duration: 0.28, ease: ease.out }}
            >
              <Inspector skill={selected} onSelect={setSelectedId} />
            </motion.div>
          </AnimatePresence>
        </Rise>
      </div>
    </PageShell>
  );
}

/**
 * Claimed vs proven on a 0-5 scale. The hollow dot is what you claim, the
 * filled dot is what evidence shows; the bar between them is the gap.
 */
function Dumbbell({ claimed, proven, delay = 0 }: { claimed: number; proven: number; delay?: number }) {
  const reduce = useReducedMotion();
  const low = Math.min(claimed, proven);
  const high = Math.max(claimed, proven);
  const pct = (value: number) => (value / 5) * 100 + "%";
  return (
    <div className="relative hidden h-4 sm:block" aria-label={`Claimed ${claimed} of 5, proven ${proven} of 5`} role="img">
      <div className="bg-gray-4 absolute top-1/2 right-0 left-0 h-px -translate-y-1/2" />
      {[1, 2, 3, 4].map((tick) => (
        <span key={tick} className="bg-gray-5 absolute top-1/2 h-1.5 w-px -translate-y-1/2" style={{ left: pct(tick) }} />
      ))}
      <motion.div
        className="bg-gray-8 absolute top-1/2 h-[3px] origin-left -translate-y-1/2 rounded-full"
        style={{ left: pct(low), width: `calc(${pct(high)} - ${pct(low)})` }}
        initial={reduce ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.2 + delay, duration: 0.6, ease: ease.out }}
      />
      <motion.span
        className="bg-gray-12 ring-card absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2"
        style={{ left: pct(proven) }}
        initial={reduce ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15 + delay, ...spring.snappy }}
      />
      <motion.span
        className="border-gray-11 bg-card absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px]"
        style={{ left: pct(claimed) }}
        initial={reduce ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.35 + delay, ...spring.snappy }}
      />
    </div>
  );
}

function Inspector({ skill, onSelect }: { skill: Skill; onSelect: (id: string) => void }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[19px] leading-tight font-semibold tracking-[-0.02em] text-foreground">{skill.label}</h2>
          <EvidenceBadge state={skill.state} />
        </div>
        <p className="text-gray-11 text-[13.5px] leading-relaxed">{evidenceMeta[skill.state].meaning}</p>
      </div>

      <dl className="grid grid-cols-3 border-y border-border">
        {[
          { label: "Importance", value: skill.importance },
          { label: "Priority", value: skill.priority },
          { label: "Effort", value: skill.effortHours + "h" },
        ].map((item, index) => (
          <div key={item.label} className={cn("flex flex-col gap-1 px-5 py-3.5", index < 2 && "border-r border-border")}>
            <dt className="text-gray-10 text-[12px]">{item.label}</dt>
            <dd className="text-[18px] font-semibold tracking-tight text-foreground tabular">{item.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[12.5px]">
            <span className="text-gray-11">Proven level</span>
            <span className="text-foreground tabular">
              {skill.demonstrated} of 5 <span className="text-gray-10">(claimed {skill.claimed})</span>
            </span>
          </div>
          <Meter value={skill.demonstrated} max={5} tone="ink" label="Proven level" />
        </div>
        <div className="flex items-center justify-between text-[12.5px]">
          <span className="text-gray-11">Assessment confidence</span>
          <ConfidenceMeter confidence={skill.confidence} />
        </div>
        <div className="flex items-center justify-between text-[12.5px]">
          <span className="text-gray-11">Requirement</span>
          <Badge variant={skill.requirement === "mandatory" ? "danger" : "neutral"}>{skill.requirement === "mandatory" ? "Required" : "Preferred"}</Badge>
        </div>

        {skill.bridge && (
          <div className="bg-warning-soft/70 flex gap-3 rounded-[10px] border border-warning/25 p-3.5">
            <ArrowsLeftRight size={16} className="text-warning mt-0.5 shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-medium text-foreground">Bridge from what you already know</span>
              <span className="text-gray-11 text-[13px] leading-relaxed">{skill.bridge}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <span className="text-gray-11 text-[12.5px]">Prerequisites</span>
          {skill.dependsOn.length ? (
            <ul className="flex flex-col gap-1">
              {skill.dependsOn.map((id) => {
                const dep = skillById(id)!;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => onSelect(id)}
                      className="hover:bg-gray-3 -mx-2 flex w-[calc(100%+16px)] items-center justify-between rounded-md px-2 py-1.5 text-left text-[13px] transition-colors"
                    >
                      <span className="text-foreground">{dep.label}</span>
                      <EvidenceBadge state={dep.state} withIcon={false} />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-10 flex items-center gap-1.5 text-[13px]">
              <Lightning size={14} /> No blockers. This can be scheduled now.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3">
        <span className="text-gray-10 flex items-center gap-1.5 text-[12.5px]">
          <Clock size={13} /> About {skill.effortHours} hours
        </span>
        <Button asChild variant="secondary" size="sm">
          <Link href="/plan">
            Schedule <ArrowRight />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
