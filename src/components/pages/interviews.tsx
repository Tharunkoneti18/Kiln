"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Brain, ChatsCircle, ClockCounterClockwise, Microphone, MicrophoneSlash, PaperPlaneTilt, Repeat, UserCircle, Waveform } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { GrowBar, ThinkingDots } from "@/components/motion/primitives";
import { PageHeader, PageShell, SectionHeading } from "@/components/shell/page-header";
import { interviewSessions, weaknessMemory } from "@/lib/mock/data";
import type { InterviewType } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

const types: { key: InterviewType; label: string }[] = [
  { key: "technical", label: "Technical" },
  { key: "system_design", label: "System design" },
  { key: "project", label: "Project deep-dive" },
  { key: "behavioral", label: "Behavioral" },
  { key: "hr", label: "HR" },
];
const personas = ["Friendly hiring manager", "Direct senior engineer", "Skeptical architect", "Recruiter screen"];
const openers: Record<InterviewType, string> = {
  technical: "Walk me through how you would evaluate a RAG system before shipping it.",
  system_design: "Design question answering over ten million internal documents.",
  project: "Tell me about docs-copilot. What was the hardest decision?",
  behavioral: "Tell me about a time you disagreed with a technical decision.",
  hr: "Why are you moving from backend engineering into AI?",
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
  const history = interviewSessions.find((session) => session.id === historyId)!;
  const conversation = [{ speaker: "interviewer" as const, text: openers[type] }, ...turns];

  const submit = () => {
    if (!answer.trim()) return;
    setTurns((prev) => [...prev, { speaker: "you", text: answer.trim() }]);
    setAnswer("");
    setThinking(true);
    window.setTimeout(() => {
      setThinking(false);
      setTurns((prev) => [...prev, { speaker: "interviewer", text: "Good. You mentioned a golden set. How many questions, and how would you stop it going stale?" }]);
    }, 1200);
  };

  const trend = [...interviewSessions].reverse().map((session) => (session.scores.technical + session.scores.communication + session.scores.problemSolving) / 3);

  return (
    <PageShell className="flex flex-col gap-7">
      <PageHeader
        icon="interview"
        context="Tuned to your target role and your weak spots"
        title="Mock Interview and Interview Intelligence"
        description="Technical, system design, project, behavioral and HR interviews with adaptive follow-ups and different interviewer personalities. Every session is scored, transcribed and remembered."
      />

      <Card><CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {types.map((item) => (
            <button key={item.key} type="button" onClick={() => { setType(item.key); setTurns([]); }} aria-pressed={type === item.key}
              className="relative rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold">
              {type === item.key && <motion.span layoutId="iv-type" className="bg-brand absolute inset-0 rounded-full" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              <span className={cn("relative", type === item.key ? "text-primary-foreground" : "text-muted-foreground")}>{item.label}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[12px]">
          <span className="text-muted-foreground font-semibold">Interviewer</span>
          {personas.map((option) => (
            <button key={option} type="button" onClick={() => setPersona(option)} aria-pressed={persona === option} className={cn("rounded-md border px-2.5 py-1 font-semibold transition-colors", persona === option ? "border-primary text-primary bg-primary/8" : "text-muted-foreground")}>{option}</button>
          ))}
          <button type="button" onClick={() => setVoice((value) => !value)} aria-pressed={voice} className={cn("ml-auto inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-semibold", voice ? "border-primary text-primary" : "text-muted-foreground")}>
            {voice ? <Microphone size={14} weight="fill" /> : <MicrophoneSlash size={14} />} Voice mode {voice ? "on" : "off"}
          </button>
        </div>
      </CardContent></Card>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card className="flex flex-col"><CardContent className="flex flex-1 flex-col gap-3">
          <div className="flex items-center gap-3">
            <motion.span className="bg-brand text-primary-foreground relative grid size-11 place-items-center rounded-full" animate={thinking && !reduce ? { scale: [1, 1.06, 1] } : undefined} transition={{ repeat: Infinity, duration: 1 }}>
              <UserCircle size={22} weight="fill" />
            </motion.span>
            <div className="flex flex-col"><span className="text-[14px] font-bold">{persona}</span><span className="text-muted-foreground text-[11.5px]">{types.find((item) => item.key === type)?.label} interview, adaptive follow-ups</span></div>
            {voice && <VoiceWave active={!thinking} />}
          </div>
          <div className="scroll-slim flex min-h-[260px] flex-1 flex-col gap-2.5 overflow-y-auto">
            <AnimatePresence initial={false}>
              {conversation.map((turn, index) => (
                <motion.div key={type + index} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={cn("max-w-[85%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed", turn.speaker === "you" ? "bg-primary text-primary-foreground self-end rounded-br-sm" : "bg-raised self-start rounded-bl-sm border")}>
                  {turn.text}
                </motion.div>
              ))}
            </AnimatePresence>
            {thinking && <span className="flex items-center gap-2 text-[12px]"><ThinkingDots /><span className="text-shimmer font-semibold">Choosing a follow-up based on your answer</span></span>}
          </div>
          <form className="flex flex-col gap-2 border-t pt-3" onSubmit={(event) => { event.preventDefault(); submit(); }}>
            <label htmlFor="iv-answer" className="sr-only">Your answer</label>
            <Textarea id="iv-answer" value={answer} onChange={(event) => setAnswer(event.target.value)} className="min-h-20" placeholder={voice ? "Speak, or type your answer" : "Type your answer"} />
            <div className="flex gap-2"><Button type="submit" size="sm" disabled={!answer.trim()}><PaperPlaneTilt size={13} weight="fill" /> Answer</Button><Button type="button" variant="ghost" size="sm" onClick={() => setTurns([])}>Restart</Button></div>
          </form>
        </CardContent></Card>

        <div className="flex flex-col gap-5">
          <Card><CardContent className="flex flex-col gap-3">
            <h3 className="flex items-center gap-2 text-[13.5px] font-bold"><Brain size={15} weight="fill" className="text-primary" /> Weakness memory</h3>
            {weaknessMemory.map((item) => (
              <div key={item.weakness} className="flex flex-col gap-1 border-b pb-2.5 last:border-b-0">
                <div className="flex items-center justify-between"><span className="text-[12.5px] font-semibold">{item.weakness}</span>{item.seen > 1 ? <Badge variant="gap"><Repeat /> Repeated {item.seen}x</Badge> : <Badge variant="neutral">Seen once</Badge>}</div>
                <span className="text-muted-foreground text-[11.5px]">Revision: {item.action}</span>
              </div>
            ))}
          </CardContent></Card>
          <Card><CardContent className="flex flex-col gap-3">
            <h3 className="text-[13.5px] font-bold">Improvement across sessions</h3>
            <TrendChart values={trend} labels={[...interviewSessions].reverse().map((session) => session.date.slice(5))} />
          </CardContent></Card>
        </div>
      </div>

      <section>
        <SectionHeading title="Interview history" description="Scores, transcript and weaknesses for every session." />
        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <div className="flex flex-col gap-2">
            {interviewSessions.map((session) => (
              <button key={session.id} type="button" onClick={() => setHistoryId(session.id)} className={cn("flex items-center gap-3 rounded-lg border p-3 text-left transition-colors", historyId === session.id ? "border-primary bg-primary/6" : "bg-card hover:bg-raised")}>
                <ClockCounterClockwise size={16} className="text-muted-foreground" />
                <span className="flex-1"><span className="block text-[12.5px] font-semibold capitalize">{session.type.replace("_", " ")}</span><span className="text-muted-foreground text-[11px]">{session.date}, {session.minutes} min</span></span>
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={history.id} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card><CardContent className="grid gap-5 md:grid-cols-[1fr_1.2fr]">
                <div className="flex flex-col gap-3">
                  {([["Technical correctness", history.scores.technical], ["Communication", history.scores.communication], ["Problem solving", history.scores.problemSolving]] as const).map(([label, value], index) => (
                    <div key={label} className="flex flex-col gap-1"><div className="flex justify-between text-[12px]"><span className="font-semibold">{label}</span><span className="numeric">{value}/5</span></div><GrowBar value={(value / 5) * 100} delay={index * 0.08} className="h-1.5" /></div>
                  ))}
                  <div className="flex flex-wrap gap-1 pt-1">{history.weaknesses.map((weakness) => <Badge key={weakness} variant="gap">{weakness}</Badge>)}</div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="flex items-center gap-1.5 text-[12.5px] font-bold"><ChatsCircle size={14} /> Transcript</span>
                  {history.transcript.map((line, index) => <p key={index} className="text-[12.5px] leading-relaxed"><b className={line.speaker === "you" ? "text-primary" : ""}>{line.speaker === "you" ? "You" : "Interviewer"}: </b>{line.text}</p>)}
                </div>
              </CardContent></Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </PageShell>
  );
}

function VoiceWave({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  return (
    <span className="ml-auto flex h-6 items-center gap-[3px]" aria-label="Voice mode active">
      <Waveform size={14} className="text-primary mr-1" />
      {Array.from({ length: 12 }, (_, index) => (
        <motion.span key={index} className="bg-brand w-[3px] rounded-full" style={{ height: 6 }}
          animate={active && !reduce ? { height: [6, 8 + ((index * 7) % 14), 6] } : { height: 6 }}
          transition={{ duration: 0.7 + (index % 4) * 0.12, repeat: Infinity, ease: "easeInOut" }} />
      ))}
    </span>
  );
}

/** Small line chart, drawn as a path that animates in. */
export function TrendChart({ values, labels, max = 5 }: { values: number[]; labels: string[]; max?: number }) {
  const reduce = useReducedMotion();
  const width = 320;
  const height = 120;
  const points = values.map((value, index) => [
    Math.round(20 + (index * (width - 40)) / Math.max(1, values.length - 1)),
    Math.round(height - 22 - (value / max) * (height - 40)),
  ] as const);
  const path = points.map(([x, y], index) => (index ? "L" : "M") + x + "," + y).join(" ");
  const area = path + " L" + points.at(-1)![0] + "," + (height - 22) + " L" + points[0][0] + "," + (height - 22) + " Z";
  return (
    <svg viewBox={"0 0 " + width + " " + height} className="w-full" role="img" aria-label={"Trend from " + values[0].toFixed(1) + " to " + values.at(-1)!.toFixed(1)}>
      <defs><linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" /><stop offset="100%" stopColor="var(--primary)" stopOpacity="0" /></linearGradient></defs>
      <motion.path d={area} fill="url(#trend-fill)" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} />
      <motion.path d={path} fill="none" stroke="var(--primary)" strokeWidth={2.5} strokeLinecap="round" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} />
      {points.map(([x, y], index) => (
        <g key={index}>
          <motion.circle cx={x} cy={y} r={4} fill="var(--card)" stroke="var(--primary)" strokeWidth={2} initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + index * 0.15 }} />
          <text x={x} y={height - 6} textAnchor="middle" fontSize="10" fill="var(--muted-foreground)">{labels[index]}</text>
        </g>
      ))}
    </svg>
  );
}
