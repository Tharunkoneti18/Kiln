"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowsClockwise,
  BookOpen,
  CalendarBlank,
  CheckCircle,
  Circle,
  ClipboardText,
  Exam,
  FileText,
  Lightbulb,
  Play,
  Sparkle,
  VideoCamera,
  Warning,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProgressRing } from "@/components/motion/primitives";
import { PageHeader, PageShell, SectionHeading } from "@/components/shell/page-header";
import { CareerPath3D, type PathStep } from "@/components/three/career-path";
import { learner, learningPlan, skillById, targetRole } from "@/lib/mock/data";
import type { DailyTask, WeeklyModule } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

const resourceIcon = { docs: FileText, article: BookOpen, video: VideoCamera, generated: Sparkle } as const;
const kindLabel: Record<DailyTask["kind"], string> = {
  lesson: "Tutor lecture", reading: "Reading", exercise: "Practical exercise", assignment: "Weekly assignment",
  revision: "Revision", checkpoint: "Knowledge checkpoint", assessment: "Weekly assessment",
};

export function PlannerView() {
  const reduce = useReducedMotion();
  const [weekNumber, setWeekNumber] = useState(3);
  const [done, setDone] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(learningPlan.flatMap((module) => module.days.map((task) => [task.id, task.done]))),
  );
  const [recoveryApplied, setRecoveryApplied] = useState(false);
  const module = learningPlan.find((item) => item.week === weekNumber)!;
  const totalTasks = learningPlan.flatMap((item) => item.days);
  const completed = totalTasks.filter((task) => done[task.id]).length;

  const steps: PathStep[] = learningPlan.map((item) => ({
    label: "Week " + item.week,
    status: item.status === "completed" ? "completed" : item.status === "in_progress" ? "current" : "upcoming",
    progress: 0,
  }));

  return (
    <PageShell className="flex flex-col gap-7">
      <PageHeader
        icon="plan"
        context={"Personalised for " + targetRole.title + ", " + learner.weeklyHours + " hours a week"}
        title="Personalized Learning Planner"
        description="Your skill gaps turned into a week-by-week plan in prerequisite order. It adapts to your assessment results, your available time and any session you miss."
        actions={<RegenerateDialog />}
      />

      <Card className="overflow-hidden">
        <CardContent className="grid gap-6 p-0 lg:grid-cols-[1fr_280px]">
          <CareerPath3D steps={steps} className="h-[230px] w-full" fallback={<div className="text-muted-foreground grid size-full place-items-center text-[12px]">Week 3 of 8</div>} />
          <div className="flex items-center gap-5 border-t p-5 lg:border-t-0 lg:border-l">
            <ProgressRing value={(completed / totalTasks.length) * 100} size={96} gradientId="plan-ring" label={<span className="numeric text-[18px] font-bold">{Math.round((completed / totalTasks.length) * 100)}%</span>} />
            <div className="flex flex-col gap-1 text-[12px]">
              <span className="text-[13.5px] font-bold">8-week roadmap</span>
              <span className="text-muted-foreground">{completed} of {totalTasks.length} tasks done</span>
              <span className="text-muted-foreground">{learningPlan.reduce((sum, item) => sum + item.hours, 0)} hours planned</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Week selector. */}
      <div className="scroll-slim -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {learningPlan.map((item) => (
          <button key={item.id} type="button" onClick={() => setWeekNumber(item.week)} aria-pressed={weekNumber === item.week}
            className="relative flex min-w-[150px] flex-col gap-1 rounded-xl border px-3.5 py-3 text-left transition-colors">
            {weekNumber === item.week && <motion.span layoutId="week-pill" className="border-primary bg-primary/8 absolute inset-0 rounded-xl border-2" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
            <span className="relative flex items-center justify-between">
              <span className="numeric text-[11px] font-bold">Week {item.week}</span>
              <WeekStatus status={item.status} />
            </span>
            <span className="relative text-[12px] leading-snug font-semibold">{item.objective}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={module.id} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
          <Card>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-[11.5px] font-semibold">Week {module.week} objective, about {module.hours} hours</span>
                  <h2 className="text-[20px] font-bold tracking-tight">{module.objective}</h2>
                </div>
                <div className="flex flex-wrap gap-1">{module.skillIds.map((id) => { const skill = skillById(id); return skill ? <Badge key={id} variant={skill.state}>{skill.label}</Badge> : null; })}</div>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-[12.5px] font-bold">Daily learning objectives</h3>
                {module.days.map((task) => (
                  <div key={task.id} className={cn("flex items-center gap-3 rounded-lg border p-3 transition-colors", done[task.id] && "bg-raised/70")}>
                    <button type="button" aria-label={(done[task.id] ? "Mark not done: " : "Mark done: ") + task.title} onClick={() => setDone((prev) => ({ ...prev, [task.id]: !prev[task.id] }))}>
                      <motion.span key={String(done[task.id])} initial={reduce ? false : { scale: 0.5 }} animate={{ scale: 1 }} className="block">
                        {done[task.id] ? <CheckCircle size={19} weight="fill" className="text-primary" /> : <Circle size={19} className="text-muted-foreground" />}
                      </motion.span>
                    </button>
                    <span className="numeric text-muted-foreground w-8 text-[11px] font-bold">{task.day}</span>
                    <span className="min-w-0 flex-1">
                      <span className={cn("block text-[13px] font-semibold", done[task.id] && "text-muted-foreground line-through")}>{task.title}</span>
                      <span className="text-muted-foreground text-[11px]">{kindLabel[task.kind]}</span>
                    </span>
                    <span className="numeric text-muted-foreground text-[11px]">{task.minutes}m</span>
                    {task.lessonId && <Button size="sm" variant={done[task.id] ? "ghost" : "primary"} asChild><Link href="/tutor"><Play size={12} weight="fill" /> Tutor</Link></Button>}
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <h3 className="text-[12.5px] font-bold">Topics and subtopics</h3>
                  <ol className="flex flex-col gap-1.5">{module.topics.map((topic, index) => <li key={topic} className="flex gap-2 text-[12.5px]"><span className="numeric text-primary font-bold">{module.week}.{index + 1}</span>{topic}</li>)}</ol>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-[12.5px] font-bold">Recommended resources</h3>
                  {module.resources.map((resource) => { const Glyph = resourceIcon[resource.kind]; return <span key={resource.label} className="flex items-center gap-2 text-[12.5px]"><Glyph size={14} className="text-primary shrink-0" />{resource.label}<Badge variant="neutral" className="ml-auto">{resource.kind}</Badge></span>; })}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-5">
            <Card><CardContent className="flex flex-col gap-3">
              <span className="flex items-center gap-2 text-[13.5px] font-bold"><ClipboardText size={15} className="text-primary" /> Weekly assignment</span>
              <p className="text-[12.5px]">{module.assignment}</p>
              <span className="flex items-center gap-2 text-[13.5px] font-bold"><Exam size={15} className="text-primary" /> Checkpoint and assessment</span>
              <p className="text-[12.5px]">{module.checkpoint}</p>
              <Button variant="secondary" size="sm" asChild className="self-start"><Link href="/assessments">Open in Proof Lab</Link></Button>
            </CardContent></Card>

            {module.week === 3 && (
              <Card className="border-transferable/40">
                <CardContent className="flex flex-col gap-3">
                  <span className="flex items-center gap-2 text-[13.5px] font-bold"><Warning size={15} weight="fill" className="text-transferable" /> Missed session recovery</span>
                  <p className="text-[12.5px] leading-relaxed">You missed last Saturday&apos;s revision. A 20-minute catch-up fits Monday without moving anything else.</p>
                  {recoveryApplied ? <Badge variant="demonstrated" className="self-start"><CheckCircle weight="fill" /> Rescheduled to Monday</Badge> : (
                    <div className="flex gap-2"><Button size="sm" onClick={() => setRecoveryApplied(true)}>Reschedule</Button><Button variant="ghost" size="sm">Skip it</Button></div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className="border-glow"><CardContent className="flex flex-col gap-2">
              <span className="flex items-center gap-2 text-[13.5px] font-bold"><Lightbulb size={15} weight="fill" className="text-primary" /> Progress-based adjustment</span>
              <p className="text-[12.5px] leading-relaxed">Your debugging score (48) suggests stale-index issues are unclear. A 25-minute revision lecture has been proposed for week 3, Saturday.</p>
              <div className="flex gap-2"><Button size="sm">Accept</Button><Button variant="ghost" size="sm">Not now</Button></div>
            </CardContent></Card>
          </div>
        </motion.div>
      </AnimatePresence>

      <section>
        <SectionHeading title="Flexible schedule" description={"Tasks only land on your preferred days: " + learner.preferredDays.join(", ") + ". Drag-free: tap a week above to edit it."} />
        <Card className="overflow-x-auto">
          <div className="grid min-w-[620px] grid-cols-[90px_repeat(4,1fr)] text-[12px]">
            <div className="border-b p-3" />
            {learner.preferredDays.map((day) => <div key={day} className="border-b p-3 font-bold">{day}</div>)}
            {learningPlan.map((item) => (
              <ScheduleRow key={item.id} module={item} done={done} active={item.week === weekNumber} />
            ))}
          </div>
        </Card>
      </section>
    </PageShell>
  );
}

function ScheduleRow({ module, done, active }: { module: WeeklyModule; done: Record<string, boolean>; active: boolean }) {
  return (
    <>
      <div className={cn("numeric border-b p-3 font-bold", active && "text-primary")}>Week {module.week}</div>
      {module.days.map((task) => (
        <div key={task.id} className="border-b p-1.5">
          <div className={cn("rounded-md px-2 py-1.5 text-[11px] font-semibold", done[task.id] ? "bg-primary/12 text-primary" : active ? "bg-primary/8 border-primary/30 border" : "bg-raised text-muted-foreground")}>
            {task.title.split(":")[0]}
          </div>
        </div>
      ))}
    </>
  );
}

function WeekStatus({ status }: { status: WeeklyModule["status"] }) {
  if (status === "completed") return <CheckCircle size={14} weight="fill" className="text-primary" />;
  if (status === "in_progress") return <span className="bg-primary size-2 animate-pulse rounded-full" />;
  if (status === "missed") return <Warning size={14} className="text-transferable" />;
  return <Circle size={14} className="text-muted-foreground" />;
}

function RegenerateDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild><Button variant="secondary" size="sm"><ArrowsClockwise size={14} /> Regenerate plan</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Regenerate the plan</DialogTitle>
          <DialogDescription>Weeks 4 to 8 are rebuilt from your current Digital Twin. Completed weeks are kept. Use this after changing your target role or weekly hours.</DialogDescription>
        </DialogHeader>
        <div className="bg-raised flex items-center gap-3 rounded-md p-3 text-[12.5px]"><CalendarBlank size={16} className="text-primary" /> {learner.weeklyHours} hours a week on {learner.preferredDays.join(", ")}</div>
        <div className="mt-5 flex justify-end gap-2">
          <DialogClose asChild><Button variant="ghost" size="sm">Cancel</Button></DialogClose>
          <DialogClose asChild><Button size="sm">Regenerate</Button></DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
