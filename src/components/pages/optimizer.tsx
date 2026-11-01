"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowsClockwise, Lightning, Star } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { CountUp } from "@/components/common/metric";
import { GrowBar } from "@/components/motion/primitives";
import { PageHeader, PageShell, SectionHeading } from "@/components/shell/page-header";
import { learner, pathRoutes } from "@/lib/mock/data";
import { cn } from "@/lib/utils";

export function OptimizerView() {
  const reduce = useReducedMotion();
  const [routeId, setRouteId] = useState("direct");
  const [hours, setHours] = useState(learner.weeklyHours);
  const [skipKnown, setSkipKnown] = useState(true);
  const [addProject, setAddProject] = useState(false);
  const route = pathRoutes.find((item) => item.id === routeId)!;

  // Scenario simulation: weeks scale with available hours against the 10h baseline.
  const simulate = (weeks: number) => Math.max(1, Math.round(weeks * (learner.weeklyHours / hours) * (skipKnown ? 1 : 1.15) + (addProject ? 1 : 0)));
  const overlap = pathRoutes.map((item) => item.sharedSkills).reduce((acc, list) => acc.filter((skill) => list.includes(skill)));

  return (
    <PageShell className="flex flex-col gap-7">
      <PageHeader
        icon="optimizer"
        context="Recalculated when your goals or the market change"
        title="Career Path Optimizer"
        description="The shortest credible route to your goal. Routes are compared by effort, transferable skill coverage and the prerequisites each one needs, including routes through intermediate roles."
        actions={<Button variant="secondary" size="sm"><ArrowsClockwise size={14} /> Recalculate</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {pathRoutes.map((item) => (
          <button key={item.id} type="button" onClick={() => setRouteId(item.id)} aria-pressed={routeId === item.id}
            className={cn("bg-card relative flex flex-col gap-3 overflow-hidden rounded-xl border p-5 text-left shadow-[var(--shadow-panel)] transition-all", routeId === item.id ? "border-primary ring-primary/25 ring-2" : "hover:border-primary/40 hover:-translate-y-0.5")}>
            {item.recommended && <Badge variant="primary" className="self-start"><Star weight="fill" /> Shortest credible</Badge>}
            <span className="text-[15px] font-bold">{item.title}</span>
            <div className="flex items-baseline gap-1"><span className="numeric text-[30px] leading-none font-bold">{simulate(item.totalWeeks)}</span><span className="text-muted-foreground text-[13px] font-semibold">weeks</span></div>
            <div className="flex flex-col gap-1"><span className="text-muted-foreground text-[11.5px]">Transferable coverage {item.skillCoverage}%</span><GrowBar value={item.skillCoverage} className="h-1.5" /></div>
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-col gap-6">
          <SectionHeading title={route.title} description="Each step is a role you could hold. Intermediate roles let you earn while you keep building." />
          <RouteDiagram key={route.id} steps={route.steps.map((step) => ({ ...step, weeks: step.weeks ? simulate(step.weeks) : 0 }))} reduce={Boolean(reduce)} />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2"><h3 className="text-[12.5px] font-bold">Skills you already bring</h3><div className="flex flex-wrap gap-1.5">{route.sharedSkills.map((skill) => <Badge key={skill} variant="demonstrated">{skill}</Badge>)}</div></div>
            <div className="flex flex-col gap-2"><h3 className="text-[12.5px] font-bold">New skills, in prerequisite order</h3><div className="flex flex-wrap items-center gap-1.5">{route.newSkills.map((skill, index) => <span key={skill} className="flex items-center gap-1.5"><Badge variant="gap">{skill}</Badge>{index < route.newSkills.length - 1 && <span className="text-muted-foreground text-[11px]">then</span>}</span>)}</div></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardContent className="flex flex-col gap-5">
            <SectionHeading title="Simulate a scenario" description="Change your inputs and every route recalculates." />
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-[12.5px]"><label htmlFor="hours" className="font-semibold">Hours per week</label><span className="numeric font-bold">{hours}h</span></div>
              <input id="hours" type="range" min={4} max={25} value={hours} onChange={(event) => setHours(Number(event.target.value))} className="accent-primary w-full" />
            </div>
            <Toggle label="Skip topics I can already demonstrate" checked={skipKnown} onChange={setSkipKnown} />
            <Toggle label="Add a portfolio project to every step" checked={addProject} onChange={setAddProject} />
            <div className="bg-raised flex items-center gap-4 rounded-lg p-4">
              <Lightning size={20} weight="fill" className="text-primary" />
              <span className="text-[13px]">At {hours} hours a week, <b>{route.title.toLowerCase()}</b> takes <AnimatePresence mode="popLayout"><motion.b key={simulate(route.totalWeeks)} initial={reduce ? false : { y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} className="text-primary numeric inline-block">{simulate(route.totalWeeks)} weeks</motion.b></AnimatePresence>.</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-4">
            <SectionHeading title="Strategic skill combinations" />
            <div className="flex flex-col gap-2"><span className="text-[12.5px] font-semibold">Overlap across every route</span><div className="flex flex-wrap gap-1.5">{overlap.map((skill) => <Badge key={skill} variant="primary">{skill}</Badge>)}</div></div>
            <ul className="flex flex-col gap-3 text-[12.5px] leading-relaxed">
              <li><b>RAG + Evaluation</b> appear together in 58% of postings. Learning them back to back is worth more than either alone.</li>
              <li><b>FastAPI + LLM APIs</b> turn your backend experience into the GenAI Developer route at almost no extra cost.</li>
            </ul>
            <div className="flex flex-col gap-1"><span className="text-muted-foreground text-[11.5px]">Weeks saved by your transferable skills</span><span className="text-[26px] font-bold"><CountUp value={6} /> weeks</span></div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

function RouteDiagram({ steps, reduce }: { steps: { role: string; weeks: number }[]; reduce: boolean }) {
  return (
    <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
      {steps.map((step, index) => (
        <div key={step.role} className="flex flex-1 flex-col items-center gap-3 md:flex-row">
          {index > 0 && (
            <div className="relative flex w-full flex-1 flex-col items-center md:min-w-[90px]">
              <span className="numeric text-muted-foreground mb-1 text-[11px] font-bold">{step.weeks} wk</span>
              <div className="bg-border relative h-[2px] w-full overflow-hidden rounded-full">
                <motion.div className="bg-brand absolute inset-0 origin-left" initial={reduce ? false : { scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: index * 0.35 }} />
              </div>
            </div>
          )}
          <motion.div initial={reduce ? false : { opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.35, type: "spring", stiffness: 260, damping: 20 }}
            className={cn("rounded-xl border px-4 py-3 text-center text-[13px] font-bold whitespace-nowrap", index === 0 ? "bg-raised" : index === steps.length - 1 ? "bg-brand text-primary-foreground border-transparent" : "border-primary/40 bg-primary/8")}>
            {step.role}
          </motion.div>
        </div>
      ))}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex items-center justify-between gap-3 text-[12.5px] font-semibold">{label}<Switch checked={checked} onCheckedChange={onChange} /></label>;
}
