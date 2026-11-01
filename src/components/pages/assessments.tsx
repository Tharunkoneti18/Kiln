"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowsClockwise,
  Bug,
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
import { Card, CardContent } from "@/components/ui/card";
import { RadioOption } from "@/components/ui/radio-group";
import { GrowBar, ProgressRing, Stagger, StaggerItem } from "@/components/motion/primitives";
import { PageHeader, PageShell, SectionHeading } from "@/components/shell/page-header";
import { assessments, skillById } from "@/lib/mock/data";
import type { Assessment, AssessmentKind } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

const kindMeta: Record<AssessmentKind, { label: string; icon: typeof Code }> = {
  quiz: { label: "Quiz", icon: ListChecks },
  mcq: { label: "Multiple choice", icon: ListChecks },
  descriptive: { label: "Descriptive", icon: FlowArrow },
  coding: { label: "Coding challenge", icon: Code },
  debugging: { label: "Debugging", icon: Bug },
  architecture: { label: "Architecture design", icon: TreeStructure },
  project: { label: "Project assessment", icon: SealCheck },
};

const sampleQuestion = {
  prompt: "A RAG answer cites a chunk that does not support it. Which stage should you inspect first?",
  options: ["The embedding model", "Retrieval and top-k selection", "The final answer formatting"],
  answer: 1,
};

export function AssessmentsView() {
  const reduce = useReducedMotion();
  const [openId, setOpenId] = useState("as-3");
  const [choice, setChoice] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [testsDone, setTestsDone] = useState(0);
  const open = assessments.find((item) => item.id === openId)!;
  const graded = assessments.filter((item) => item.score !== undefined);
  const average = Math.round(graded.reduce((sum, item) => sum + (item.score ?? 0), 0) / graded.length);

  const runTests = () => {
    setRunning(true);
    setTestsDone(0);
    let count = 0;
    const timer = window.setInterval(() => {
      count += 1;
      setTestsDone(count);
      if (count >= 12) { window.clearInterval(timer); setRunning(false); }
    }, 140);
  };

  return (
    <PageShell className="flex flex-col gap-7">
      <PageHeader
        icon="lab"
        context="Every pass becomes skill evidence"
        title="Assessments and Proof-of-Skill Lab"
        description="Verify that you can actually do what you learned: quizzes, coding and debugging challenges, architecture exercises and project assessments, scored against rubrics with automated tests where they apply."
      />

      <Stagger className="grid gap-4 sm:grid-cols-4">
        <StaggerItem><Card><CardContent className="flex items-center gap-4"><ProgressRing value={average} size={64} stroke={6} gradientId="avg" label={<span className="numeric text-[14px] font-bold">{average}</span>} /><span className="text-[12px] font-semibold">Average score</span></CardContent></Card></StaggerItem>
        <StaggerItem><Stat label="Passed" value={assessments.filter((a) => a.status === "passed").length} /></StaggerItem>
        <StaggerItem><Stat label="Needs retest" value={assessments.filter((a) => a.status === "needs_work").length} tone="gap" /></StaggerItem>
        <StaggerItem><Stat label="Available now" value={assessments.filter((a) => a.status === "available").length} /></StaggerItem>
      </Stagger>

      <div className="grid gap-5 xl:grid-cols-[1fr_1.15fr]">
        <div className="flex flex-col gap-2">
          {assessments.map((item) => {
            const meta = kindMeta[item.kind];
            return (
              <button key={item.id} type="button" onClick={() => item.status !== "locked" && setOpenId(item.id)} disabled={item.status === "locked"}
                className={cn("flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all", openId === item.id ? "border-primary bg-primary/6 ring-primary/20 ring-2" : "bg-card hover:border-primary/40", item.status === "locked" && "cursor-not-allowed opacity-55")}>
                <span className="bg-raised text-primary grid size-9 shrink-0 place-items-center rounded-lg"><meta.icon size={17} weight="duotone" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold">{item.title}</span>
                  <span className="text-muted-foreground text-[11px]">{meta.label}, {item.minutes} min, {item.attempts} attempt{item.attempts === 1 ? "" : "s"}</span>
                </span>
                <StatusBadge item={item} />
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={open.id} initial={reduce ? false : { opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.25 }}>
            <Card className="xl:sticky xl:top-20">
              <CardContent className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <span className="text-muted-foreground text-[11.5px] font-semibold">{kindMeta[open.kind].label} · {open.topic}</span>
                  <h2 className="text-[19px] font-bold tracking-tight">{open.title}</h2>
                  <div className="flex flex-wrap gap-1">{open.skillIds.map((id) => { const skill = skillById(id); return skill ? <Badge key={id} variant={skill.state}>{skill.label}</Badge> : null; })}</div>
                </div>

                {open.score !== undefined ? (
                  <>
                    <div className="flex items-center gap-5">
                      <ProgressRing value={open.score} size={96} gradientId={"score-" + open.id} label={<span className="numeric text-[22px] font-bold">{open.score}</span>} sublabel="of 100" />
                      <div className="flex flex-1 flex-col gap-2.5">
                        {open.rubric?.map((row, index) => (
                          <div key={row.label} className="flex flex-col gap-1">
                            <div className="flex justify-between text-[12px]"><span className="font-semibold">{row.label}</span><span className="numeric">{row.score}/{row.max}</span></div>
                            <GrowBar value={(row.score / row.max) * 100} delay={index * 0.1} className="h-1.5" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className={cn("rounded-lg border p-3.5 text-[12.5px] leading-relaxed", open.status === "needs_work" ? "border-gap/35 bg-gap/6" : "bg-raised")}>
                      <b>Feedback: </b>{open.feedback}
                    </div>
                    {open.kind === "coding" || open.kind === "debugging" ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2"><Button size="sm" variant="secondary" onClick={runTests} disabled={running}><Play size={12} weight="fill" /> Run automated tests</Button><span className="numeric text-muted-foreground text-[11.5px]">{testsDone}/12 passed</span></div>
                        <div className="flex flex-wrap gap-1">{Array.from({ length: 12 }, (_, index) => (
                          <motion.span key={index} className={cn("size-3 rounded-sm", index < testsDone ? "bg-primary" : "bg-border")} animate={index < testsDone && !reduce ? { scale: [0.6, 1.2, 1] } : undefined} />
                        ))}</div>
                      </div>
                    ) : null}
                    <div className="flex gap-2">
                      <Button size="sm"><ArrowsClockwise size={13} /> {open.status === "needs_work" ? "Retest" : "Reassess"}</Button>
                      <Button variant="ghost" size="sm">See history</Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-3">
                    <span className="text-[12.5px] font-bold">Sample question</span>
                    <p className="text-[13.5px] font-semibold">{sampleQuestion.prompt}</p>
                    <div className="flex flex-col gap-2">
                      {sampleQuestion.options.map((option, index) => (
                        <RadioOption key={option} checked={choice === index}>
                          <input type="radio" name="sample" className="accent-primary mt-0.5" checked={choice === index} onChange={() => setChoice(index)} />
                          <span className="flex-1">{option}</span>
                          {choice === index && (index === sampleQuestion.answer ? <CheckCircle size={16} weight="fill" className="text-primary" /> : <XCircle size={16} weight="fill" className="text-gap" />)}
                        </RadioOption>
                      ))}
                    </div>
                    {choice !== null && <motion.p initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} className="bg-raised rounded-md p-3 text-[12.5px]">Retrieval decides what the model can cite. If the chunk is wrong, the answer will be wrong however it is formatted.</motion.p>}
                    <Button size="sm" className="self-start"><Play size={12} weight="fill" /> Start full assessment</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <section>
        <SectionHeading title="Assessment history and skill evidence" description="Each passed assessment is sent to your Digital Twin as evidence." />
        <Card className="overflow-hidden">
          {graded.map((item) => (
            <div key={item.id} className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0">
              {item.status === "passed" ? <SealCheck size={17} weight="fill" className="text-primary" /> : <Warning size={17} weight="fill" className="text-gap" />}
              <span className="flex-1 text-[13px] font-semibold">{item.title}</span>
              <span className="numeric text-[12.5px] font-bold">{item.score}</span>
              <span className="text-muted-foreground hidden text-[11.5px] sm:inline">{item.status === "passed" ? "Evidence sent to twin" : "Revision lecture queued"}</span>
            </div>
          ))}
        </Card>
      </section>
    </PageShell>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "gap" }) {
  return <Card className="h-full"><CardContent className="flex h-full flex-col justify-center gap-1"><span className="text-muted-foreground text-[11.5px] font-semibold">{label}</span><span className={cn("numeric text-[28px] leading-none font-bold", tone === "gap" && "text-gap")}>{value}</span></CardContent></Card>;
}

function StatusBadge({ item }: { item: Assessment }) {
  if (item.status === "passed") return <Badge variant="demonstrated"><SealCheck weight="fill" /> {item.score}</Badge>;
  if (item.status === "needs_work") return <Badge variant="gap">Retest {item.score}</Badge>;
  if (item.status === "locked") return <Badge variant="unknown"><Lock /> Locked</Badge>;
  return <Badge variant="primary">Available</Badge>;
}
