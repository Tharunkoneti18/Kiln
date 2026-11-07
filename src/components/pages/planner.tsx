"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowsClockwise,
  BookOpen,
  Check,
  ClipboardText,
  Exam,
  FileText,
  Play,
  Sparkle,
  VideoCamera,
  Warning,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Meter } from "@/components/system/data";
import { useToast } from "@/components/system/toast";
import { PageHeader, PageShell, Rise, SectionHeading } from "@/components/shell/page-header";
import { learner, learningPlan, skillById, targetRole } from "@/lib/mock/data";
import type { DailyTask, WeeklyModule } from "@/lib/mock/types";
import { ease, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

const resourceIcon = { docs: FileText, article: BookOpen, video: VideoCamera, generated: Sparkle } as const;
const resourceLabel = { docs: "Docs", article: "Article", video: "Video", generated: "Generated" } as const;
const kindLabel: Record<DailyTask["kind"], string> = {
  lesson: "Tutor lecture",
  reading: "Reading",
  exercise: "Practical exercise",
  assignment: "Weekly assignment",
  revision: "Revision",
  checkpoint: "Knowledge checkpoint",
  assessment: "Weekly assessment",
};

export function PlannerView() {
  const reduce = useReducedMotion();
  const { toast } = useToast();
  const [weekNumber, setWeekNumber] = useState(3);
  const [done, setDone] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(learningPlan.flatMap((module) => module.days.map((task) => [task.id, task.done]))),
  );
  const [recoveryApplied, setRecoveryApplied] = useState(false);
  const module = learningPlan.find((item) => item.week === weekNumber)!;
  const allTasks = learningPlan.flatMap((item) => item.days);
  const completed = allTasks.filter((task) => done[task.id]).length;
  const totalHours = learningPlan.reduce((sum, item) => sum + item.hours, 0);
  const weekDone = module.days.filter((task) => done[task.id]).length;

  const toggle = (task: DailyTask) => {
    const next = !done[task.id];
    setDone((previous) => ({ ...previous, [task.id]: next }));
    if (next) toast({ title: "Task complete", description: task.title });
  };

  return (
    <PageShell>
      <PageHeader
        context={"Built for " + targetRole.title + " · " + learner.weeklyHours + "h a week"}
        title="Your learning plan"
        description="Your skill gaps, ordered by prerequisite into eight weeks. The plan adapts to assessment results, your time budget and missed sessions."
        actions={<RecalibrateDialog />}
      />

      <Rise>
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-border px-5 py-4">
            <div className="flex items-baseline gap-2">
              <span className="type-stat tabular">{Math.round((completed / allTasks.length) * 100)}%</span>
              <span className="text-gray-10 text-[13px]">of the plan complete</span>
            </div>
            <span className="text-gray-10 text-[13px] tabular">{completed} of {allTasks.length} tasks</span>
            <span className="text-gray-10 text-[13px] tabular">{totalHours} hours planned</span>
          </div>
          <Timeline weeks={learningPlan} selected={weekNumber} onSelect={setWeekNumber} />
        </Card>
      </Rise>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={module.id}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, transition: { duration: 0.12 } }}
          transition={{ duration: 0.32, ease: ease.out }}
          className="grid grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-10 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]"
        >
          <div className="flex min-w-0 flex-col gap-8">
            <div className="flex flex-col gap-3">
              <span className="text-gray-10 text-[13px]">
                Week {module.week} · about {module.hours} hours
              </span>
              <h2 className="text-[22px] leading-tight font-semibold tracking-[-0.02em] text-foreground">{module.objective}</h2>
              <div className="flex flex-wrap gap-1.5">
                {module.skillIds.map((id) => {
                  const skill = skillById(id);
                  return skill ? <Badge key={id} variant={skill.state}>{skill.label}</Badge> : null;
                })}
              </div>
            </div>

            <div>
              <SectionHeading title="Daily tasks" badge={weekDone + " of " + module.days.length} />
              <Card>
                <ul className="divide-y divide-border">
                  {module.days.map((task) => (
                    <TaskRow key={task.id} task={task} done={!!done[task.id]} onToggle={() => toggle(task)} />
                  ))}
                </ul>
              </Card>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)] gap-8 sm:grid-cols-2">
              <div>
                <SectionHeading title="Topics" />
                <ol className="flex flex-col gap-2.5">
                  {module.topics.map((topic, index) => (
                    <li key={topic} className="flex gap-3 text-[13.5px] text-foreground">
                      <span className="text-gray-9 w-7 shrink-0 tabular">{module.week}.{index + 1}</span>
                      {topic}
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <SectionHeading title="Resources" />
                <ul className="flex flex-col gap-1">
                  {module.resources.map((resource) => {
                    const Glyph = resourceIcon[resource.kind];
                    return (
                      <li key={resource.label} className="hover:bg-gray-3 -mx-2 flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13.5px] transition-colors">
                        <Glyph size={15} className="text-gray-10 shrink-0" />
                        <span className="min-w-0 flex-1 truncate text-foreground">{resource.label}</span>
                        <span className="text-gray-10 text-[12px]">{resourceLabel[resource.kind]}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            <Card>
              <div className="flex flex-col gap-1.5 p-5">
                <span className="text-gray-11 flex items-center gap-2 text-[12.5px] font-medium">
                  <ClipboardText size={15} /> Weekly assignment
                </span>
                <p className="text-[14px] leading-relaxed text-foreground">{module.assignment}</p>
              </div>
              <div className="flex flex-col gap-1.5 border-t border-border p-5">
                <span className="text-gray-11 flex items-center gap-2 text-[12.5px] font-medium">
                  <Exam size={15} /> Knowledge checkpoint
                </span>
                <p className="text-[14px] leading-relaxed text-foreground">{module.checkpoint}</p>
              </div>
              <div className="border-t border-border p-3">
                <Button asChild variant="secondary" size="sm" className="w-full">
                  <Link href="/assessments">Open in Proof Lab</Link>
                </Button>
              </div>
            </Card>

            {module.week === 3 && (
              <Card className="border-warning/30 bg-warning-soft/60 overflow-hidden">
                <div className="flex gap-3 p-5">
                  <Warning size={18} weight="fill" className="text-warning mt-0.5 shrink-0" />
                  <div className="flex flex-col gap-1">
                    <p className="text-[14px] font-medium text-foreground">You missed Saturday&rsquo;s revision</p>
                    <p className="text-gray-11 text-[13px] leading-relaxed">
                      A 20-minute catch-up fits Monday evening without moving anything else in the plan.
                    </p>
                    <AnimatePresence mode="wait" initial={false}>
                      {recoveryApplied ? (
                        <motion.div key="done" initial={reduce ? false : { opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={spring.snappy} className="mt-3">
                          <Badge variant="success">
                            <Check weight="bold" /> Moved to Monday, 20 min
                          </Badge>
                        </motion.div>
                      ) : (
                        <motion.div key="actions" exit={{ opacity: 0, transition: { duration: 0.1 } }} className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setRecoveryApplied(true);
                              toast({ title: "Revision rescheduled", description: "Monday, 20 minutes. Nothing else moved." });
                            }}
                          >
                            Reschedule to Monday
                          </Button>
                          <Button variant="ghost" size="sm">Skip it</Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </PageShell>
  );
}

/**
 * Eight-week timeline that doubles as the week selector. The track fills up
 * to the current week once on load; the selection ring glides between weeks
 * with a shared layout id.
 */
function Timeline({ weeks, selected, onSelect }: { weeks: WeeklyModule[]; selected: number; onSelect: (week: number) => void }) {
  const reduce = useReducedMotion();
  const currentIndex = weeks.findIndex((week) => week.status === "in_progress");
  const fill = currentIndex / (weeks.length - 1);

  return (
    <div className="scroll-slim overflow-x-auto">
      <div role="tablist" aria-label="Plan weeks" className="relative grid min-w-[760px] grid-cols-8 px-2 pt-6 pb-5">
        <div className="bg-gray-4 absolute top-[38px] right-[calc(6.25%+8px)] left-[calc(6.25%+8px)] h-[2px] rounded-full" aria-hidden="true">
          <motion.div
            className="bg-gray-12 h-full origin-left rounded-full"
            style={{ width: fill * 100 + "%" }}
            initial={reduce ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: ease.out }}
          />
        </div>
        {weeks.map((week, index) => {
          const isSelected = week.week === selected;
          const status = week.status;
          return (
            <button
              key={week.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelect(week.week)}
              className="group relative flex flex-col items-center gap-2.5 rounded-[10px] px-1.5 pt-1 pb-2 text-center outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            >
              {isSelected && (
                <motion.span
                  layoutId={reduce ? undefined : "plan-week"}
                  transition={spring.layout}
                  className="bg-gray-3 absolute inset-0 -z-0 rounded-[10px]"
                />
              )}
              <motion.span
                initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15 + index * 0.05, ...spring.snappy }}
                className={cn(
                  "relative grid size-7 place-items-center rounded-full text-[12px] font-semibold tabular ring-4 ring-card transition-colors",
                  status === "completed" && "bg-gray-12 text-gray-1",
                  status === "in_progress" && "bg-brand text-white",
                  status !== "completed" && status !== "in_progress" && "bg-card text-gray-10 border border-border-strong group-hover:border-gray-9",
                  isSelected && "ring-gray-3",
                )}
              >
                {status === "completed" ? <Check size={12} weight="bold" /> : week.week}
                {status === "in_progress" && !reduce && (
                  <span className="border-brand absolute inset-0 animate-ping rounded-full border opacity-40 [animation-duration:2.4s]" aria-hidden="true" />
                )}
              </motion.span>
              <span className="relative flex flex-col gap-0.5">
                <span className={cn("text-[12px] font-medium", isSelected ? "text-foreground" : "text-gray-10")}>Week {week.week}</span>
                <span className={cn("line-clamp-2 text-[11.5px] leading-snug", isSelected ? "text-gray-11" : "text-gray-9")}>{week.objective}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TaskRow({ task, done, onToggle }: { task: DailyTask; done: boolean; onToggle: () => void }) {
  const reduce = useReducedMotion();
  return (
    <li className="flex items-center gap-3.5 px-5 py-3.5">
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={(done ? "Mark not done: " : "Mark done: ") + task.title}
        onClick={onToggle}
        className={cn(
          "grid size-[18px] shrink-0 place-items-center rounded-[5px] border transition-colors duration-150",
          done ? "bg-gray-12 border-gray-12 text-gray-1" : "border-gray-8 hover:border-gray-11 bg-card",
        )}
      >
        <AnimatePresence initial={false}>
          {done && (
            <motion.span initial={reduce ? false : { scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0, transition: { duration: 0.1 } }} transition={spring.snappy}>
              <Check size={11} weight="bold" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
      <span className="text-gray-10 w-8 shrink-0 text-[12.5px] tabular">{task.day}</span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className={cn("truncate text-[13.5px] transition-colors", done ? "text-gray-10" : "font-medium text-foreground")}>{task.title}</span>
        <span className="text-gray-10 text-[12px]">
          {kindLabel[task.kind]} · {task.minutes} min
        </span>
      </div>
      {task.lessonId && (
        <Button size="xs" variant={done ? "ghost" : "secondary"} asChild>
          <Link href="/tutor">
            <Play weight="fill" /> Open in tutor
          </Link>
        </Button>
      )}
    </li>
  );
}

function RecalibrateDialog() {
  const { toast } = useToast();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <ArrowsClockwise /> Recalibrate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Recalibrate your plan</DialogTitle>
          <DialogDescription>
            Pending weeks are re-ordered using your latest assessment evidence, weekly hours and interview dates. Finished weeks are not touched.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-gray-2 flex flex-col gap-3 rounded-[10px] border border-border p-4">
          <div className="flex justify-between text-[13px]">
            <span className="text-gray-11">Weekly budget</span>
            <span className="font-medium text-foreground tabular">{learner.weeklyHours} hours</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-gray-11">Weeks affected</span>
            <span className="font-medium text-foreground tabular">4 to 8</span>
          </div>
          <Meter value={3} max={8} size="sm" label="Weeks completed" />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={() => toast({ title: "Plan recalibrated", description: "Weeks 4 to 8 now reflect your latest evidence." })}>Recalibrate plan</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
