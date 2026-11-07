"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowCounterClockwise, ArrowUp, Brain, Microphone, MicrophoneSlash } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Meter } from "@/components/system/data";
import { LineChart } from "@/components/system/line-chart";
import { Segmented } from "@/components/system/segmented";
import { PageHeader, PageShell, Rise, Section } from "@/components/shell/page-header";
import { interviewSessions, weaknessMemory } from "@/lib/mock/data";
import type { InterviewType } from "@/lib/mock/types";
import { ease, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

const types: { value: InterviewType; label: string }[] = [
  { value: "technical", label: "Technical" },
  { value: "system_design", label: "System design" },
  { value: "project", label: "Project" },
  { value: "behavioral", label: "Behavioral" },
  { value: "hr", label: "HR" },
];
const typeLabel = Object.fromEntries(types.map((item) => [item.value, item.label])) as Record<InterviewType, string>;
const personas = ["Friendly hiring manager", "Direct senior engineer", "Skeptical architect", "Recruiter screen"];
const openers: Record<InterviewType, string> = {
  technical: "Walk me through how you would evaluate a RAG system before shipping it to production.",
  system_design: "Design question answering over ten million internal documents.",
  project: "Tell me about docs-copilot. What was the hardest architectural decision?",
  behavioral: "Tell me about a time you disagreed with a senior technical decision.",
  hr: "Why are you moving from backend engineering into Applied AI?",
};

export function InterviewsView() {
  const reduce = useReducedMotion();
  const [type, setType] = useState<InterviewType>("technical");
  const [persona, setPersona] = useState(personas[1]);
  const [voice, setVoice] = useState(false);
  const [answer, setAnswer] = useState("");
  const [turns, setTurns] = useState<{ speaker: "interviewer" | "you"; text: string }[]>([]);
  const [thinking, setThinking] = useState(false);
  const [historyId, setHistoryId] = useState(interviewSessions[0].id);
  const scrollRef = useRef<HTMLDivElement>(null);
  const history = interviewSessions.find((session) => session.id === historyId)!;
  const conversation = [{ speaker: "interviewer" as const, text: openers[type] }, ...turns];
  const chronological = [...interviewSessions].reverse();

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTo({ top: node.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [turns, thinking, reduce]);

  const submit = () => {
    if (!answer.trim()) return;
    setTurns((prev) => [...prev, { speaker: "you", text: answer.trim() }]);
    setAnswer("");
    setThinking(true);
    window.setTimeout(() => {
      setThinking(false);
      setTurns((prev) => [
        ...prev,
        { speaker: "interviewer", text: "Good. You mentioned a golden evaluation set. How many ground-truth queries would you build, and how would you catch retrieval drift over time?" },
      ]);
    }, 1200);
  };

  return (
    <PageShell width="wide">
      <PageHeader
        context="Tuned to Applied AI Engineer"
        title="Practice the interview"
        description="Technical, design and behavioral rounds with adaptive follow-ups. Every session is transcribed, scored against a rubric, and remembered."
      />

      <Rise className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="no-scrollbar -mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          <Segmented
            label="Interview type"
            value={type}
            onChange={(value) => {
              setType(value);
              setTurns([]);
            }}
            options={types}
          />
        </div>
        <div className="flex items-center gap-2 lg:ml-auto">
          <label htmlFor="persona" className="text-gray-10 text-[12.5px] whitespace-nowrap">Interviewer</label>
          <Select value={persona} onValueChange={setPersona}>
            <SelectTrigger id="persona" className="h-8 w-[210px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {personas.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant={voice ? "primary" : "secondary"} size="sm" onClick={() => setVoice((value) => !value)} aria-pressed={voice}>
            {voice ? <Microphone weight="fill" /> : <MicrophoneSlash />}
            Voice
          </Button>
        </div>
      </Rise>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-x-8 gap-y-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Rise>
          <Card className="flex h-[580px] flex-col overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <span className="bg-gray-12 text-gray-1 grid size-8 place-items-center rounded-full"><Brain size={16} weight="fill" /></span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-[13.5px] font-medium text-foreground">{persona}</span>
                <span className="text-gray-10 text-[12px]">{typeLabel[type]} round · adapts to your answers</span>
              </div>
              <Button variant="ghost" size="xs" onClick={() => setTurns([])} disabled={turns.length === 0}>
                <ArrowCounterClockwise /> Restart
              </Button>
            </div>

            <div ref={scrollRef} className="scroll-slim flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-6">
              <AnimatePresence initial={false}>
                {conversation.map((turn, index) => (
                  <motion.div
                    key={type + index}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: ease.out }}
                    className={cn("flex flex-col gap-1", turn.speaker === "you" ? "items-end" : "items-start")}
                  >
                    <span className="text-gray-10 px-1 text-[11.5px]">{turn.speaker === "you" ? "You" : persona}</span>
                    {turn.speaker === "you" ? (
                      <p className="bg-gray-3 max-w-[85%] rounded-[14px] rounded-br-[6px] px-3.5 py-2.5 text-[14px] leading-relaxed text-foreground">{turn.text}</p>
                    ) : (
                      <p className="max-w-[92%] px-1 text-[15px] leading-relaxed text-foreground">{turn.text}</p>
                    )}
                  </motion.div>
                ))}
                {thinking && (
                  <motion.span key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-shimmer px-1 text-[13px]">
                    Scoring your answer against the rubric
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <form
              className="flex flex-col gap-2 border-t border-border p-3"
              onSubmit={(event) => {
                event.preventDefault();
                submit();
              }}
            >
              <AnimatePresence initial={false}>
                {voice && (
                  <motion.div
                    initial={reduce ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: ease.out }}
                    className="overflow-hidden"
                  >
                    <div className="text-gray-11 flex items-center gap-3 px-1 pb-1 text-[12.5px]">
                      <Waveform />
                      Listening. Speak your answer, or type below.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="bg-gray-2 focus-within:border-border-strong focus-within:bg-card flex items-end gap-2 rounded-[12px] border border-border p-2 pl-3 transition-colors">
                <label htmlFor="iv-answer" className="sr-only">Your answer</label>
                <textarea
                  id="iv-answer"
                  rows={2}
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                      event.preventDefault();
                      submit();
                    }
                  }}
                  placeholder="Answer as you would in the room. Cmd+Enter to send."
                  className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent py-1 text-[14px] leading-relaxed text-foreground outline-none placeholder:text-gray-9"
                />
                <Button type="submit" size="icon-sm" aria-label="Submit answer" disabled={!answer.trim()} className="rounded-[9px]">
                  <ArrowUp weight="bold" />
                </Button>
              </div>
            </form>
          </Card>
        </Rise>

        <div className="flex flex-col gap-8">
          <Section title="What they will probe" description="Weaknesses remembered from past sessions.">
            <Card className="divide-y divide-border">
              {weaknessMemory.map((item) => (
                <div key={item.weakness} className="flex flex-col gap-1 px-4 py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[13.5px] font-medium text-foreground">{item.weakness}</span>
                    <Badge variant={item.seen > 1 ? "warning" : "neutral"}>{item.seen > 1 ? `Seen ${item.seen} times` : "Seen once"}</Badge>
                  </div>
                  <span className="text-gray-10 text-[12.5px]">Fix: {item.action}</span>
                </div>
              ))}
            </Card>
          </Section>
          <Section title="Average score by session">
            <Card className="p-5">
              <LineChart
                values={chronological.map((session) => (session.scores.technical + session.scores.communication + session.scores.problemSolving) / 3)}
                labels={chronological.map((session) => session.date.slice(5))}
                max={5}
                min={0}
              />
            </Card>
          </Section>
        </div>
      </div>

      <Section title="Past sessions">
        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-x-8 gap-y-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <Card className="overflow-hidden">
            <ul className="divide-y divide-border">
              {interviewSessions.map((session) => {
                const selected = historyId === session.id;
                const avg = (session.scores.technical + session.scores.communication + session.scores.problemSolving) / 3;
                return (
                  <li key={session.id}>
                    <button
                      type="button"
                      onClick={() => setHistoryId(session.id)}
                      aria-pressed={selected}
                      className={cn("relative flex w-full items-center gap-3 px-4 py-3 text-left transition-colors", selected ? "bg-gray-2" : "hover:bg-gray-2")}
                    >
                      {selected && <motion.span layoutId={reduce ? undefined : "iv-history"} transition={spring.layout} className="bg-brand absolute inset-y-2 left-0 w-[3px] rounded-r-full" />}
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="text-[13.5px] font-medium text-foreground">{typeLabel[session.type]}</span>
                        <span className="text-gray-10 text-[12px] tabular">{session.date} · {session.minutes} min</span>
                      </span>
                      <span className="text-gray-11 text-[13px] tabular">{avg.toFixed(1)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={history.id} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.1 } }} transition={{ duration: 0.28, ease: ease.out }}>
              <Card className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-2">
                <div className="flex flex-col gap-4 p-5 md:border-r md:border-border">
                  <span className="text-gray-11 text-[12.5px] font-medium">Rubric, 1 to 5</span>
                  {[
                    { label: "Technical correctness", value: history.scores.technical },
                    { label: "Communication", value: history.scores.communication },
                    { label: "Problem solving", value: history.scores.problemSolving },
                  ].map((row, index) => (
                    <div key={row.label} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[13px]">
                        <span className="text-gray-11">{row.label}</span>
                        <span className="text-foreground tabular">{row.value}</span>
                      </div>
                      <Meter value={row.value} max={5} tone={row.value >= 3.5 ? "ink" : "brand"} delay={index * 0.08} label={row.label} />
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {history.weaknesses.map((weakness) => <Badge key={weakness} variant="warning">{weakness}</Badge>)}
                  </div>
                </div>
                <div className="flex flex-col gap-3 p-5 max-md:border-t max-md:border-border">
                  <span className="text-gray-11 text-[12.5px] font-medium">Transcript excerpt</span>
                  <div className="flex flex-col gap-3">
                    {history.transcript.slice(0, 3).map((line, index) => (
                      <p key={index} className="text-[13px] leading-relaxed">
                        <span className="text-gray-10">{line.speaker === "you" ? "You: " : "Interviewer: "}</span>
                        <span className="text-foreground">{line.text}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </Section>
    </PageShell>
  );
}

/** Live input level: bars driven by staggered loops, frozen under reduced motion. */
function Waveform() {
  const reduce = useReducedMotion();
  return (
    <span className="flex h-4 items-center gap-[3px]" aria-hidden="true">
      {[0.5, 0.9, 0.6, 1, 0.7, 0.4, 0.8].map((peak, index) => (
        <motion.span
          key={index}
          className="bg-brand w-[3px] rounded-full"
          style={{ height: "100%", originY: 0.5 }}
          initial={{ scaleY: 0.3 }}
          animate={reduce ? { scaleY: peak * 0.6 } : { scaleY: [0.25, peak, 0.35, peak * 0.7, 0.25] }}
          transition={reduce ? { duration: 0 } : { duration: 1.1, repeat: Infinity, delay: index * 0.09, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

/** @deprecated Use `LineChart` from the design system. Kept for old imports. */
export function TrendChart({ values, labels, max = 5 }: { values: number[]; labels: string[]; max?: number }) {
  return <LineChart values={values} labels={labels} max={max} />;
}
