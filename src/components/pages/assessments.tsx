"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowsClockwise,
  Bug,
  Check,
  CheckCircle,
  Code,
  FlowArrow,
  ListChecks,
  Lock,
  Play,
  SealCheck,
  TreeStructure,
  Warning,
  XCircle,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnimatedNumber, Meter, Ring } from "@/components/system/data";
import { useToast } from "@/components/system/toast";
import { PageHeader, PageShell, Rise } from "@/components/shell/page-header";
import { assessments, skillById } from "@/lib/mock/data";
import type { Assessment, AssessmentKind } from "@/lib/mock/types";
import { ease, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

const kindMeta: Record<AssessmentKind, { label: string; icon: typeof Code }> = {
  quiz: { label: "Quiz", icon: ListChecks },
  mcq: { label: "Multiple choice", icon: ListChecks },
  descriptive: { label: "Written", icon: FlowArrow },
  coding: { label: "Coding", icon: Code },
  debugging: { label: "Debugging", icon: Bug },
  architecture: { label: "Architecture", icon: TreeStructure },
  project: { label: "Project", icon: SealCheck },
};

const sampleQuestion = {
  prompt: "A RAG answer cites a chunk that does not support it. Which stage should you inspect first?",
  options: ["The embedding model", "Retrieval and top-k selection", "The final answer formatting"],
  answer: 1,
};

const TEST_COUNT = 12;

export function AssessmentsView() {
  const reduce = useReducedMotion();
  const { toast } = useToast();
  const [openId, setOpenId] = useState("as-3");
  const [choice, setChoice] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [testsDone, setTestsDone] = useState(0);
  const timer = useRef<number | null>(null);
  const open = assessments.find((item) => item.id === openId)!;
  const graded = assessments.filter((item) => item.score !== undefined);
  const average = Math.round(graded.reduce((sum, item) => sum + (item.score ?? 0), 0) / graded.length);

  // Never leave a ticking interval behind when the page unmounts.
  useEffect(() => () => {
    if (timer.current) window.clearInterval(timer.current);
  }, []);

  const runTests = () => {
    if (timer.current) window.clearInterval(timer.current);
    setRunning(true);
    setTestsDone(0);
    let count = 0;
    timer.current = window.setInterval(() => {
      count += 1;
      setTestsDone(count);
      if (count >= TEST_COUNT) {
        window.clearInterval(timer.current!);
        timer.current = null;
        setRunning(false);
        toast({ title: "All " + TEST_COUNT + " tests passed", description: open.title + " evidence sent to your digital twin." });
      }
    }, reduce ? 20 : 140);
  };

  return (
    <PageShell>
      <PageHeader
        context="Passed tests become verified evidence"
        title="Prove it, then it counts"
        highlight="it counts"
        description="Quizzes, coding challenges and debugging exercises. Every result flows straight into your digital twin."
      />

      <Rise>
        <Card className="grid grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-4 border-b border-r border-border p-5 lg:border-b-0">
            <Ring value={average} size={52} stroke={5}>
              <span className="text-[14px] font-semibold tabular"><AnimatedNumber value={average} /></span>
            </Ring>
            <div className="flex flex-col">
              <span className="text-gray-11 text-[12.5px] font-medium">Average score</span>
              <span className="text-gray-10 text-[12px]">{graded.length} graded</span>
            </div>
          </div>
          <Stat label="Passed" value={assessments.filter((a) => a.status === "passed").length} className="border-b border-border lg:border-r lg:border-b-0" />
          <Stat label="Need a retest" value={assessments.filter((a) => a.status === "needs_work").length} className="border-r border-border" tone="danger" />
          <Stat label="Ready to take" value={assessments.filter((a) => a.status === "available").length} />
        </Card>
      </Rise>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-x-8 gap-y-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <Rise>
          <h2 className="type-heading mb-3">Challenges</h2>
          <Card className="overflow-hidden">
            <ul className="divide-y divide-border">
              {assessments.map((item) => {
                const meta = kindMeta[item.kind];
                const locked = item.status === "locked";
                const active = openId === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => !locked && setOpenId(item.id)}
                      disabled={locked}
                      aria-pressed={active}
                      className={cn(
                        "relative flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors",
                        active ? "bg-gray-2" : "hover:bg-gray-2",
                        locked && "cursor-not-allowed opacity-50 hover:bg-transparent",
                      )}
                    >
                      {active && <motion.span layoutId={reduce ? undefined : "assessment-row"} transition={spring.layout} className="bg-brand absolute inset-y-2 left-0 w-[3px] rounded-r-full" />}
                      <span className="bg-gray-3 text-gray-11 grid size-8 shrink-0 place-items-center rounded-[8px]">
                        {locked ? <Lock size={15} /> : <meta.icon size={16} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-medium text-foreground">{item.title}</span>
                        <span className="text-gray-10 text-[12px]">
                          {meta.label} · {item.minutes} min · {item.attempts} {item.attempts === 1 ? "attempt" : "attempts"}
                        </span>
                      </span>
                      <StatusBadge item={item} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        </Rise>

        <Rise className="xl:sticky xl:top-[72px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={open.id}
              initial={reduce ? false : { opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              transition={{ duration: 0.28, ease: ease.out }}
            >
              <Card className="overflow-hidden">
                <div className="flex flex-col gap-2.5 p-5">
                  <span className="text-gray-10 text-[12.5px]">
                    {kindMeta[open.kind].label} · {open.topic}
                  </span>
                  <h2 className="text-[19px] leading-tight font-semibold tracking-[-0.02em] text-foreground">{open.title}</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {open.skillIds.map((id) => {
                      const skill = skillById(id);
                      return skill ? <Badge key={id} variant={skill.state}>{skill.label}</Badge> : null;
                    })}
                  </div>
                </div>

                {open.score !== undefined ? (
                  <div className="flex flex-col gap-5 border-t border-border p-5">
                    <div className="flex items-center gap-5">
                      <Ring value={open.score} size={76} stroke={6} tone={open.status === "passed" ? "success" : "brand"}>
                        <span className="flex flex-col items-center leading-none">
                          <span className="text-[20px] font-semibold tracking-tight tabular">{open.score}</span>
                          <span className="text-gray-10 mt-0.5 text-[10px]">of 100</span>
                        </span>
                      </Ring>
                      <div className="flex flex-1 flex-col gap-3">
                        {open.rubric?.map((row, index) => (
                          <div key={row.label} className="flex flex-col gap-1.5">
                            <div className="flex justify-between text-[12.5px]">
                              <span className="text-gray-11">{row.label}</span>
                              <span className="text-foreground tabular">{row.score} / {row.max}</span>
                            </div>
                            <Meter value={row.score} max={row.max} tone={row.score / row.max >= 0.7 ? "ink" : "brand"} size="sm" delay={index * 0.08} label={row.label} />
                          </div>
                        ))}
                      </div>
                    </div>
                    {open.feedback && (
                      <div className="bg-warning-soft/70 flex gap-3 rounded-[10px] border border-warning/25 p-3.5">
                        <Warning size={16} weight="fill" className="text-warning mt-0.5 shrink-0" />
                        <p className="text-[13px] leading-relaxed text-foreground">{open.feedback}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 border-t border-border p-5">
                    <p className="text-[14.5px] leading-relaxed text-foreground">{sampleQuestion.prompt}</p>
                    <div role="radiogroup" aria-label="Answer" className="flex flex-col gap-2">
                      {sampleQuestion.options.map((option, index) => {
                        const selected = choice === index;
                        const correct = index === sampleQuestion.answer;
                        const reveal = choice !== null;
                        return (
                          <button
                            key={option}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => setChoice(index)}
                            className={cn(
                              "flex items-center gap-3 rounded-[10px] border px-3.5 py-3 text-left text-[13.5px] transition-colors",
                              reveal && correct && "border-success/40 bg-success-soft",
                              reveal && selected && !correct && "border-danger/40 bg-danger-soft",
                              !(reveal && (correct || selected)) && "hover:border-border-strong border-border bg-card",
                            )}
                          >
                            <span className={cn("grid size-[18px] shrink-0 place-items-center rounded-full border transition-colors", selected ? "border-gray-12 bg-gray-12" : "border-border-strong")}>
                              {selected && <span className="bg-gray-1 size-1.5 rounded-full" />}
                            </span>
                            <span className="flex-1 text-foreground">{option}</span>
                            <AnimatePresence>
                              {reveal && correct && (
                                <motion.span initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} transition={spring.snappy}>
                                  <CheckCircle size={17} weight="fill" className="text-success" />
                                </motion.span>
                              )}
                              {reveal && selected && !correct && (
                                <motion.span initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} transition={spring.snappy}>
                                  <XCircle size={17} weight="fill" className="text-danger" />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </button>
                        );
                      })}
                    </div>
                    <AnimatePresence>
                      {choice !== null && (
                        <motion.p
                          initial={reduce ? false : { opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-gray-11 text-[13px] leading-relaxed"
                        >
                          {choice === sampleQuestion.answer
                            ? "Right. Retrieval is where an unsupported chunk enters, so inspect top-k and the similarity cutoff first."
                            : "Not quite. An unsupported citation almost always enters at retrieval: check top-k ranking and the similarity cutoff first."}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <AnimatePresence initial={false}>
                  {(running || testsDone > 0) && (
                    <motion.div
                      initial={reduce ? false : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: ease.out }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-2.5 border-t border-border px-5 py-4">
                        <div className="flex justify-between text-[12.5px]">
                          <span className="text-gray-11">{running ? "Running tests" : "Test run complete"}</span>
                          <span className="text-foreground tabular">{testsDone} / {TEST_COUNT} passed</span>
                        </div>
                        <div className="grid grid-cols-12 gap-1" aria-hidden="true">
                          {Array.from({ length: TEST_COUNT }, (_, index) => {
                            const passed = index < testsDone;
                            return (
                              <motion.span
                                key={index}
                                className={cn("grid h-5 place-items-center rounded-[4px] transition-colors duration-150", passed ? "bg-success text-white" : "bg-gray-3")}
                                animate={passed && !reduce ? { scale: [0.8, 1.08, 1] } : { scale: 1 }}
                                transition={{ duration: 0.25 }}
                              >
                                {passed && <Check size={10} weight="bold" />}
                              </motion.span>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-wrap gap-2 border-t border-border px-5 py-3">
                  <Button onClick={runTests} loading={running} size="sm">
                    {!running && (open.score !== undefined ? <ArrowsClockwise /> : <Play weight="fill" />)}
                    {open.score !== undefined ? "Retest" : "Run tests"}
                  </Button>
                  {open.score !== undefined && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/tutor">Review the lesson first</Link>
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </Rise>
      </div>
    </PageShell>
  );
}

function Stat({ label, value, tone, className }: { label: string; value: number; tone?: "danger"; className?: string }) {
  return (
    <div className={cn("flex flex-col justify-center gap-1 p-5", className)}>
      <span className="text-gray-11 text-[12.5px] font-medium">{label}</span>
      <span className={cn("type-stat", tone === "danger" && value > 0 ? "text-danger" : "text-foreground")}>
        <AnimatedNumber value={value} />
      </span>
    </div>
  );
}

function StatusBadge({ item }: { item: Assessment }) {
  if (item.status === "passed") return <Badge variant="success" className="tabular">{item.score}</Badge>;
  if (item.status === "needs_work") return <Badge variant="danger" className="tabular">{item.score}</Badge>;
  if (item.status === "available") return <Badge variant="brand">Start</Badge>;
  return <Badge variant="neutral">Locked</Badge>;
}
