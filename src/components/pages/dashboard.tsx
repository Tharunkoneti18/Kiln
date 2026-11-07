"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock,
  Lightning,
  Microphone,
  Play,
  Sparkle,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnimatedNumber, Delta, Meter, Sparkline } from "@/components/system/data";
import { useToast } from "@/components/system/toast";
import { PageShell, Rise, Section } from "@/components/shell/page-header";
import { useAssistant } from "@/components/shell/assistant-panel";
import {
  applications,
  currentWeek,
  interviewSessions,
  learner,
  readinessComponents,
  readinessHistory,
  skills,
  targetRole,
  tutorSessions,
  weaknessMemory,
} from "@/lib/mock/data";
import type { ApplicationStage, DailyTask } from "@/lib/mock/types";
import { ease, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
   Home.

   Reading order is the priority order:
     1. Who and when (greeting, week)
     2. The one thing to do now (resume lesson)
     3. How it is going (KPI strip)
     4. This week's work, and why readiness is what it is
     5. What to focus on next (gaps, interviews, pipeline)
--------------------------------------------------------------------------- */

export function DashboardView() {
  const firstName = learner.name.split(" ")[0];
  const session = tutorSessions[0];
  const proven = skills.filter((skill) => skill.state === "demonstrated").length;
  const delta = readinessHistory.at(-1)!.value - readinessHistory.at(-2)!.value;
  const loggedHours = 6.5;
  const nextInterview = applications.find((app) => app.stage === "interview");

  return (
    <PageShell>
      <Rise className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <span className="text-gray-10 text-[13px]">Saturday, 31 October · Week {currentWeek.week} of 8</span>
          <h1 className="type-display text-foreground">Good morning, {firstName}</h1>
          <p className="text-muted-foreground max-w-[56ch] text-[14.5px] leading-relaxed">
            You are halfway through week {currentWeek.week}: {currentWeek.objective}. One assignment and a checkpoint left.
          </p>
        </div>
        <AskButton />
      </Rise>

      <Rise>
        <ContinueCard
          title="RAG architecture: retrieve, then generate"
          chapter={session.chapter}
          progress={session.progress}
          minutesLeft={13}
        />
      </Rise>

      <Rise>
        <Card className="grid grid-cols-2 divide-border lg:grid-cols-4 lg:divide-x [&>*]:border-border max-lg:[&>*:nth-child(-n+2)]:border-b max-lg:[&>*:nth-child(odd)]:border-r">
          <Kpi label="Role readiness" href="/readiness">
            <div className="flex items-end justify-between gap-3">
              <div className="flex items-baseline gap-2">
                <span className="type-stat"><AnimatedNumber value={targetRole.readiness} suffix="%" /></span>
                <Delta value={delta} />
              </div>
              <Sparkline points={readinessHistory.map((point) => point.value)} width={84} height={30} className="hidden sm:block" />
            </div>
            <span className="text-gray-10 text-[12px]">Up from {readinessHistory[0].value}% four weeks ago</span>
          </Kpi>
          <Kpi label="Hours this week" href="/plan">
            <span className="type-stat">
              <AnimatedNumber value={loggedHours} decimals={1} />
              <span className="text-gray-9 text-[16px] font-medium"> / {learner.weeklyHours}h</span>
            </span>
            <Meter value={loggedHours} max={learner.weeklyHours} size="sm" label="Weekly hours" className="mt-1" />
          </Kpi>
          <Kpi label="Skills proven" href="/twin">
            <span className="type-stat">
              <AnimatedNumber value={proven} />
              <span className="text-gray-9 text-[16px] font-medium"> of {skills.length}</span>
            </span>
            <SkillDots />
          </Kpi>
          <Kpi label="Next interview" href="/interviews">
            <span className="type-stat">Nov 4</span>
            <span className="text-gray-10 truncate text-[12px]">{nextInterview?.company}, technical round</span>
          </Kpi>
        </Card>
      </Rise>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <WeekTasks />
        <ReadinessBreakdown />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-10 lg:grid-cols-3">
        <FocusSkills />
        <InterviewPrep />
        <Pipeline />
      </div>
    </PageShell>
  );
}

/* ---------------------------------------------------------------------------
   Pieces
--------------------------------------------------------------------------- */

function AskButton() {
  const { setOpen } = useAssistant();
  return (
    <Button variant="secondary" onClick={() => setOpen(true)} className="self-start md:self-auto">
      <Sparkle weight="fill" className="text-brand" />
      Ask about your week
    </Button>
  );
}

/**
 * The single focal element of Home. Left: what you were doing and how far you
 * got. Right: a live sketch of the pipeline the lesson teaches, so the card
 * previews the content instead of decorating it.
 */
function ContinueCard({ title, chapter, progress, minutesLeft }: { title: string; chapter: string; progress: number; minutesLeft: number }) {
  return (
    <Card className="group relative overflow-hidden">
      <div className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div className="flex flex-col gap-5 p-6 sm:p-7">
          <div className="flex items-center gap-2">
            <Badge variant="brand">
              <Play weight="fill" /> Continue learning
            </Badge>
            <span className="text-gray-10 flex items-center gap-1 text-[12.5px]">
              <Clock size={13} /> {minutesLeft} min left
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-[20px] leading-tight font-semibold tracking-[-0.02em] text-foreground sm:text-[22px]">{title}</h2>
            <p className="text-muted-foreground text-[13.5px]">Chapter 2 of 3 · {chapter}</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-gray-10 flex justify-between text-[12px]">
              <span>Lesson progress</span>
              <span className="tabular">{progress}%</span>
            </div>
            <Meter value={progress} label="Lesson progress" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="brand" size="lg">
              <Link href="/tutor">
                Resume lesson <ArrowRight weight="bold" className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <span className="text-gray-10 text-[12.5px]">Closes your top-priority gap</span>
          </div>
        </div>
        <PipelinePreview />
      </div>
    </Card>
  );
}

const pipelineSteps = [
  { label: "Query", note: "user question" },
  { label: "Retrieve", note: "top-k chunks" },
  { label: "Generate", note: "grounded answer" },
];

/**
 * Query → Retrieve → Generate, with a token travelling along the path. The
 * loop is motivated: it shows data flowing through the system the lesson is
 * about. It stops entirely under reduced motion.
 */
function PipelinePreview() {
  const reduce = useReducedMotion();
  return (
    <div className="bg-gray-2 relative hidden min-h-[220px] items-center justify-center overflow-hidden border-l border-border md:flex">
      <div className="bg-dots absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" aria-hidden="true" />
      <div className="relative flex w-full max-w-[340px] items-center justify-between px-6" aria-hidden="true">
        <div className="bg-border absolute top-[19px] right-12 left-12 h-px" />
        {!reduce && (
          <motion.span
            className="bg-brand absolute top-[16px] left-12 size-[7px] rounded-full shadow-[0_0_0_4px_color-mix(in_oklab,var(--brand)_18%,transparent)]"
            animate={{ x: [0, 228], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: ease.inOut, times: [0, 0.1, 0.9, 1], repeatDelay: 0.6 }}
          />
        )}
        {pipelineSteps.map((step, index) => (
          <motion.div
            key={step.label}
            className="relative flex flex-col items-center gap-2"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + index * 0.12, duration: 0.5, ease: ease.out }}
          >
            <span
              className={cn(
                "grid size-10 place-items-center rounded-[10px] border text-[12px] font-semibold shadow-xs",
                index === 1 ? "bg-brand border-brand text-white" : "bg-card border-border text-gray-11",
              )}
            >
              {index + 1}
            </span>
            <span className="text-[12.5px] font-medium text-foreground">{step.label}</span>
            <span className="text-gray-10 -mt-1.5 text-[11px]">{step.note}</span>
          </motion.div>
        ))}
      </div>
      <span className="text-gray-10 absolute bottom-3 left-1/2 -translate-x-1/2 text-[11.5px]">You are here: retrieval</span>
    </div>
  );
}

function Kpi({ label, href, children }: { label: string; href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group hover:bg-gray-2 relative flex min-w-0 flex-col gap-2 p-5 transition-colors first:rounded-tl-[var(--radius-surface)]">
      <span className="text-gray-11 flex items-center justify-between text-[12.5px] font-medium">
        {label}
        <ArrowUpRight size={13} className="text-gray-9 opacity-0 transition-all duration-200 group-hover:-translate-y-px group-hover:translate-x-px group-hover:opacity-100" />
      </span>
      {children}
    </Link>
  );
}

/** One dot per tracked skill, coloured by evidence state, filling in sequence. */
function SkillDots() {
  const reduce = useReducedMotion();
  const tone = { demonstrated: "bg-success", supported: "bg-info", transferable: "bg-warning", gap: "bg-danger", unknown: "bg-gray-6" } as const;
  const ordered = [...skills].sort((a, b) => ["demonstrated", "supported", "transferable", "gap", "unknown"].indexOf(a.state) - ["demonstrated", "supported", "transferable", "gap", "unknown"].indexOf(b.state));
  return (
    <div className="mt-1 flex gap-[3px]" aria-hidden="true">
      {ordered.map((skill, index) => (
        <motion.span
          key={skill.id}
          title={skill.label}
          className={cn("h-1.5 flex-1 rounded-full", tone[skill.state])}
          initial={reduce ? false : { scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ delay: 0.3 + index * 0.035, ...spring.snappy }}
        />
      ))}
    </div>
  );
}

const kindLabel: Record<DailyTask["kind"], string> = {
  lesson: "Lesson",
  reading: "Reading",
  exercise: "Exercise",
  assignment: "Assignment",
  revision: "Revision",
  checkpoint: "Checkpoint",
  assessment: "Assessment",
};

/** This week's tasks. Checking one off is local state with immediate feedback. */
function WeekTasks() {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const [tasks, setTasks] = useState(currentWeek.days);
  const done = tasks.filter((task) => task.done).length;
  const nextId = tasks.find((task) => !task.done)?.id;

  const toggle = (id: string) => {
    const task = tasks.find((item) => item.id === id)!;
    setTasks((all) => all.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
    if (!task.done) {
      toast({
        title: "Task complete",
        description: task.title,
        action: { label: "Undo", onClick: () => setTasks((all) => all.map((item) => (item.id === id ? { ...item, done: false } : item))) },
      });
    }
  };

  return (
    <Section
      title="This week"
      description={currentWeek.objective}
      actions={
        <Button asChild variant="ghost" size="sm">
          <Link href="/plan">
            Planner <ArrowRight />
          </Link>
        </Button>
      }
    >
      <Card>
        <div className="flex items-center gap-4 border-b border-border px-5 py-3.5">
          <span className="text-[13px] font-medium text-foreground tabular">
            {done} of {tasks.length} done
          </span>
          <Meter value={done} max={tasks.length} size="sm" className="flex-1" label="Tasks done" />
        </div>
        <ul className="divide-y divide-border">
          {tasks.map((task) => {
            const isNext = task.id === nextId;
            return (
              <li key={task.id} className={cn("relative flex items-center gap-3.5 px-5 py-3.5 transition-colors", isNext && "bg-brand-soft/40")}>
                {isNext && <span className="bg-brand absolute inset-y-2 left-0 w-[3px] rounded-r-full" aria-hidden="true" />}
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={task.done}
                  aria-label={(task.done ? "Mark not done: " : "Mark done: ") + task.title}
                  onClick={() => toggle(task.id)}
                  className={cn(
                    "grid size-[18px] shrink-0 place-items-center rounded-[5px] border transition-colors duration-150",
                    task.done ? "bg-gray-12 border-gray-12 text-gray-1" : "border-gray-8 hover:border-gray-11 bg-card",
                  )}
                >
                  <AnimatePresence initial={false}>
                    {task.done && (
                      <motion.span
                        initial={reduce ? false : { scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.4, opacity: 0, transition: { duration: 0.1 } }}
                        transition={spring.snappy}
                      >
                        <Check size={11} weight="bold" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className={cn("truncate text-[13.5px] transition-colors", task.done ? "text-gray-10" : "font-medium text-foreground")}>{task.title}</span>
                  <span className="text-gray-10 text-[12px]">
                    {kindLabel[task.kind]} · {task.minutes} min
                  </span>
                </div>
                {isNext && <Badge variant="brand" className="hidden sm:inline-flex">Up next</Badge>}
                <span className="text-gray-10 w-8 shrink-0 text-right text-[12.5px] tabular">{task.day}</span>
              </li>
            );
          })}
        </ul>
      </Card>
    </Section>
  );
}

/** Why readiness is 46%: each input as a meter with its plain-language basis. */
function ReadinessBreakdown() {
  return (
    <Section
      title="What readiness is made of"
      actions={
        <Button asChild variant="ghost" size="sm">
          <Link href="/readiness">
            Details <ArrowRight />
          </Link>
        </Button>
      }
    >
      <ul className="flex flex-col gap-5">
        {readinessComponents.map((component, index) => (
          <li key={component.label} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[13.5px] font-medium text-foreground">{component.label}</span>
              <span className="text-[13px] font-medium text-foreground tabular">{component.value}</span>
            </div>
            <Meter value={component.value} tone={component.value >= 60 ? "ink" : "brand"} delay={index * 0.08} label={component.label} />
            <span className="text-gray-10 text-[12px] leading-snug">{component.basis}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** The three highest-priority gaps, with the effort each will take. */
function FocusSkills() {
  const focus = useMemo(
    () => skills.filter((skill) => skill.state !== "demonstrated").sort((a, b) => b.priority - a.priority).slice(0, 3),
    [],
  );
  return (
    <Section
      title="Focus next"
      actions={
        <Button asChild variant="ghost" size="sm">
          <Link href="/gaps">All gaps <ArrowRight /></Link>
        </Button>
      }
    >
      <Card className="divide-y divide-border">
        {focus.map((skill, index) => (
          <Link key={skill.id} href="/gaps" className="group hover:bg-gray-2 flex items-center gap-3.5 px-4 py-3.5 transition-colors first:rounded-t-[var(--radius-surface)] last:rounded-b-[var(--radius-surface)]">
            <span className="text-gray-9 w-4 text-[13px] font-medium tabular">{index + 1}</span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate text-[13.5px] font-medium text-foreground">{skill.label}</span>
              <span className="text-gray-10 text-[12px]">
                {skill.requirement === "mandatory" ? "Required" : "Preferred"} · about {skill.effortHours}h
              </span>
            </div>
            <Badge variant={skill.state}>{skill.state === "gap" ? "Gap" : skill.state === "transferable" ? "Bridge" : skill.state === "supported" ? "Partial" : "Unknown"}</Badge>
          </Link>
        ))}
      </Card>
    </Section>
  );
}

/** Next interview plus the weaknesses the interviewer will probe. */
function InterviewPrep() {
  const last = interviewSessions[0];
  const average = ((last.scores.technical + last.scores.communication + last.scores.problemSolving) / 3).toFixed(1);
  return (
    <Section title="Interview prep">
      <Card className="flex flex-col">
        <div className="flex items-start gap-3 p-4">
          <span className="bg-gray-3 text-gray-11 grid size-9 shrink-0 place-items-center rounded-[9px]">
            <Microphone size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-medium text-foreground">Corvid Systems, Nov 4</p>
            <p className="text-gray-10 text-[12px]">Technical round · last mock scored {average} of 5</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-border px-4 py-3.5">
          <span className="text-gray-10 text-[12px]">Expect questions on</span>
          <div className="flex flex-wrap gap-1.5">
            {weaknessMemory.map((item) => (
              <Badge key={item.weakness} variant={item.seen > 1 ? "warning" : "neutral"}>
                {item.weakness}
              </Badge>
            ))}
          </div>
        </div>
        <div className="mt-auto border-t border-border p-3">
          <Button asChild variant="secondary" size="sm" className="w-full">
            <Link href="/interviews">
              <Lightning weight="fill" className="text-brand" /> Run a focused mock
            </Link>
          </Button>
        </div>
      </Card>
    </Section>
  );
}

const stageOrder: ApplicationStage[] = ["saved", "applied", "screen", "interview", "offer"];
const stageLabel: Record<ApplicationStage, string> = {
  saved: "Saved",
  applied: "Applied",
  screen: "Screen",
  interview: "Interview",
  offer: "Offer",
  rejected: "Closed",
  no_response: "No reply",
};

/** Application pipeline as a stage bar plus the next dated step. */
function Pipeline() {
  const reduce = useReducedMotion();
  const active = applications.filter((app) => stageOrder.includes(app.stage));
  const counts = stageOrder.map((stage) => ({ stage, count: applications.filter((app) => app.stage === stage).length }));
  const upcoming = applications.filter((app) => app.nextDate).sort((a, b) => a.nextDate!.localeCompare(b.nextDate!)).slice(0, 2);

  return (
    <Section
      title="Applications"
      actions={
        <Button asChild variant="ghost" size="sm">
          <Link href="/applications">Tracker <ArrowRight /></Link>
        </Button>
      }
    >
      <Card className="flex flex-col">
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-baseline gap-2">
            <span className="type-stat"><AnimatedNumber value={active.length} /></span>
            <span className="text-gray-10 text-[12.5px]">active of {applications.length}</span>
          </div>
          <div className="flex h-2 gap-[3px] overflow-hidden rounded-full" aria-hidden="true">
            {counts.filter((entry) => entry.count > 0).map((entry, index) => (
              <motion.span
                key={entry.stage}
                className={cn("h-full origin-left rounded-full", ["bg-gray-6", "bg-gray-8", "bg-gray-10", "bg-brand", "bg-success"][stageOrder.indexOf(entry.stage)])}
                style={{ flexGrow: entry.count }}
                initial={reduce ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.3 + index * 0.08, duration: 0.6, ease: ease.out }}
              />
            ))}
          </div>
          <div className="text-gray-10 flex flex-wrap gap-x-3 gap-y-1 text-[11.5px]">
            {counts.filter((entry) => entry.count > 0).map((entry) => (
              <span key={entry.stage} className="tabular">
                {stageLabel[entry.stage]} {entry.count}
              </span>
            ))}
          </div>
        </div>
        <ul className="divide-y divide-border border-t border-border">
          {upcoming.map((app) => (
            <li key={app.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-foreground">{app.nextStep}</p>
                <p className="text-gray-10 truncate text-[12px]">{app.company}</p>
              </div>
              <span className="text-gray-11 shrink-0 text-[12px] tabular">
                {new Date(app.nextDate!).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </Section>
  );
}
