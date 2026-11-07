"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Star } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Meter } from "@/components/system/data";
import { PageHeader, PageShell, Rise, Section } from "@/components/shell/page-header";
import { learner, pathRoutes } from "@/lib/mock/data";
import { ease, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function OptimizerView() {
  const reduce = useReducedMotion();
  const [routeId, setRouteId] = useState("direct");
  const [hours, setHours] = useState(learner.weeklyHours);
  const [skipKnown, setSkipKnown] = useState(true);
  const [addProject, setAddProject] = useState(false);
  const route = pathRoutes.find((item) => item.id === routeId)!;

  // Scenario model: weeks scale with available hours against the 10h baseline.
  const simulate = (weeks: number) => Math.max(1, Math.round(weeks * (learner.weeklyHours / hours) * (skipKnown ? 1 : 1.15) + (addProject ? 1 : 0)));
  const overlap = pathRoutes.map((item) => item.sharedSkills).reduce((acc, list) => acc.filter((skill) => list.includes(skill)));
  const steps = route.steps.map((step) => ({ ...step, weeks: step.weeks ? simulate(step.weeks) : 0 }));
  const total = simulate(route.totalWeeks);
  const segments = steps.filter((step) => step.weeks > 0);
  const segmentTotal = segments.reduce((sum, step) => sum + step.weeks, 0);

  return (
    <PageShell>
      <PageHeader
        context="Three routes to your target"
        title="Find the shortest credible path"
        description="Each route is solved for total effort, how much of your existing skill transfers, and prerequisite order, including stepping-stone roles along the way."
      />

      <Rise>
        <div role="radiogroup" aria-label="Route" className="grid grid-cols-[minmax(0,1fr)] gap-3 lg:grid-cols-3">
          {pathRoutes.map((item) => {
            const active = item.id === routeId;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setRouteId(item.id)}
                className={cn(
                  "bg-card relative flex flex-col gap-4 rounded-[var(--radius-surface)] border p-5 text-left shadow-xs transition-[border-color,box-shadow] duration-200 outline-none",
                  active ? "border-gray-12 shadow-sm" : "border-border hover:border-border-strong focus-visible:border-border-strong",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[14.5px] font-medium text-foreground">{item.title}</span>
                  <span
                    className={cn("grid size-4 shrink-0 place-items-center rounded-full border transition-colors", active ? "border-gray-12 bg-gray-12" : "border-border-strong")}
                    aria-hidden="true"
                  >
                    {active && <motion.span layoutId={reduce ? undefined : "route-dot"} transition={spring.snappy} className="bg-gray-1 size-1.5 rounded-full" />}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <RollingNumber value={simulate(item.totalWeeks)} className="text-[34px] leading-none font-semibold tracking-[-0.03em] text-foreground" />
                  <span className="text-gray-10 text-[13px]">weeks</span>
                  {item.recommended && (
                    <Badge variant="brand" className="ml-auto">
                      <Star weight="fill" /> Shortest
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-gray-10 flex justify-between text-[12px]">
                    Existing skills that transfer <span className="tabular">{item.skillCoverage}%</span>
                  </span>
                  <Meter value={item.skillCoverage} size="sm" tone={active ? "brand" : "muted"} label="Skill coverage" />
                </div>
              </button>
            );
          })}
        </div>
      </Rise>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-x-8 gap-y-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Section title={route.title} description="Width is time. Intermediate roles earn salary while you keep moving toward the target.">
          <Card className="flex flex-col gap-6 p-5 sm:p-6">
            <div className="flex flex-col gap-3">
              <div className="flex h-10 gap-1 overflow-hidden rounded-[8px]">
                {segments.map((step, index) => (
                  <motion.div
                    key={route.id + step.role}
                    layout={!reduce}
                    initial={reduce ? false : { opacity: 0, scaleY: 0.6 }}
                    animate={{ opacity: 1, scaleY: 1, flexGrow: step.weeks }}
                    transition={{ ...spring.layout, delay: reduce ? 0 : index * 0.08 }}
                    style={{ flexBasis: 0 }}
                    className={cn(
                      "flex min-w-0 items-center justify-center px-2 text-[12.5px] font-medium tabular",
                      index === segments.length - 1 ? "bg-brand text-white" : "bg-gray-12 text-gray-1",
                      index === 0 && segments.length > 1 && "opacity-90",
                    )}
                  >
                    <span className="truncate">{step.weeks}w</span>
                  </motion.div>
                ))}
              </div>
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
                {steps.map((step, index) => (
                  <li key={step.role} className="flex items-center gap-2">
                    <span className={cn(index === steps.length - 1 ? "font-medium text-foreground" : index === 0 ? "text-gray-10" : "text-gray-11")}>{step.role}</span>
                    {index < steps.length - 1 && <ArrowRight size={12} className="text-gray-8" />}
                  </li>
                ))}
              </ol>
              <span className="text-gray-10 text-[12px] tabular">
                {segmentTotal} weeks of work across {segments.length} {segments.length === 1 ? "phase" : "phases"}
              </span>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)] gap-6 border-t border-border pt-5 md:grid-cols-2">
              <div className="flex flex-col gap-2.5">
                <span className="text-gray-11 text-[12.5px] font-medium">Already yours</span>
                <div className="flex flex-wrap gap-1.5">
                  {route.sharedSkills.map((skill) => <Badge key={skill} variant="success">{skill}</Badge>)}
                </div>
              </div>
              <div className="flex flex-col gap-2.5">
                <span className="text-gray-11 text-[12.5px] font-medium">To learn, in order</span>
                <ol className="flex flex-col gap-1.5">
                  {route.newSkills.map((skill, index) => (
                    <li key={skill} className="flex items-center gap-2.5 text-[13px] text-foreground">
                      <span className="text-gray-9 w-3 tabular">{index + 1}</span>
                      {skill}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Card>
        </Section>

        <Section title="What if">
          <Card className="flex flex-col">
            <div className="flex flex-col gap-3 p-5">
              <div className="flex items-baseline justify-between">
                <label htmlFor="hours" className="text-[13.5px] font-medium text-foreground">Hours per week</label>
                <span className="text-[13.5px] font-medium text-foreground tabular">{hours}h</span>
              </div>
              <input
                id="hours"
                type="range"
                min={4}
                max={25}
                value={hours}
                onChange={(event) => setHours(Number(event.target.value))}
                className="h-1.5 w-full cursor-pointer accent-[var(--brand)]"
              />
              <div className="text-gray-9 flex justify-between text-[11.5px] tabular">
                <span>4h</span>
                <span>25h</span>
              </div>
            </div>
            <div className="flex flex-col divide-y divide-border border-t border-border">
              <Toggle label="Skip topics I can already demonstrate" checked={skipKnown} onChange={setSkipKnown} />
              <Toggle label="Add a portfolio project to each phase" checked={addProject} onChange={setAddProject} />
            </div>
            <div className="bg-gray-2 flex items-baseline gap-2 rounded-b-[var(--radius-surface)] border-t border-border p-5">
              <span className="text-gray-11 text-[13px]">Target reached in</span>
              <RollingNumber value={total} className="text-[22px] font-semibold tracking-tight text-foreground" />
              <span className="text-gray-11 text-[13px]">weeks</span>
            </div>
          </Card>

          <div className="mt-6 flex flex-col gap-2.5">
            <span className="text-gray-11 text-[12.5px] font-medium">Core shared by every route</span>
            <div className="flex flex-wrap gap-1.5">
              {overlap.map((skill) => <Badge key={skill} variant="brand">{skill}</Badge>)}
            </div>
            <p className="text-gray-10 text-[12.5px] leading-relaxed">Learn these first: they count toward every route, so the time is never wasted if you change direction.</p>
          </div>
        </Section>
      </div>
    </PageShell>
  );
}

/**
 * A number that rolls vertically when it changes: the old value exits
 * downward, the new one drops in from above. Makes "your change caused this"
 * legible without a separate highlight.
 */
function RollingNumber({ value, className }: { value: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <span className={cn("relative inline-flex overflow-hidden tabular", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={reduce ? false : { y: "-70%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: "70%", opacity: 0 }}
          transition={{ duration: 0.28, ease: ease.out }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 px-5 py-3.5 text-[13.5px] text-foreground">
      {label}
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
