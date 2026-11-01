"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  BookmarkSimple,
  Camera,
  ChatCircleDots,
  Code,
  FlowArrow,
  HandPalm,
  Lightbulb,
  NotePencil,
  PaperPlaneTilt,
  Question,
  Sparkle,
  TextAa,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ThinkingDots, Typewriter } from "@/components/motion/primitives";
import type { BoardEvent } from "../../lib/tutor/types";
import { cn } from "@/lib/utils";

/**
 * Interactive teaching layer for the lesson room.
 *
 * Asking anything interrupts the lecture first (playback pauses and the
 * checkpoint saves), then the instructor answers in context of the current
 * chapter and board. Replies here are prepared; the structure is what the
 * teaching engine will fill.
 */

type Depth = "Simple" | "Standard" | "Deep";
type Mode = "Theory" | "Practical";

interface Exchange {
  id: string;
  question: string;
  answer: string;
  kind: "text" | "code" | "diagram";
}

const quickAsks = [
  { label: "Explain it more simply", icon: TextAa },
  { label: "Give a real-world example", icon: Lightbulb },
  { label: "Draw another diagram", icon: FlowArrow },
  { label: "Show a coding demo", icon: Code },
] as const;

function prepareAnswer(question: string, chapter: string, depth: Depth, mode: Mode): Omit<Exchange, "id" | "question"> {
  if (question.startsWith("Show a coding demo")) {
    return {
      kind: "code",
      answer: [
        "def answer(question: str) -> str:",
        "    query_vec = embed(question)",
        "    chunks = store.search(query_vec, k=4)",
        '    context = "\\n".join(c.text for c in chunks)',
        '    return llm(f"Use only this context:\\n{context}\\n\\nQ: {question}")',
      ].join("\n"),
    };
  }
  if (question.startsWith("Draw another diagram")) {
    return { kind: "diagram", answer: "Here is the same idea as a loop rather than a line: your documents feed the index once, and every question reads from it." };
  }
  if (question.startsWith("Explain it more simply")) {
    return { kind: "text", answer: "Think of an open-book exam. The model is the student, and retrieval hands it the right pages before it writes the answer." };
  }
  if (question.startsWith("Give a real-world example")) {
    return { kind: "text", answer: "A support bot answering refund questions: it fetches the current refund policy page and quotes it, instead of guessing from training data." };
  }
  if (question.startsWith("Explain the board element")) {
    return { kind: "text", answer: "That box is where retrieved chunks join the question. It is the only point where your data reaches the model, which is why grounding happens there." };
  }
  const tone = depth === "Simple" ? "In short: " : depth === "Deep" ? "In more depth: " : "";
  const angle = mode === "Practical" ? " In your assignment, you will see this when you print the prompt before sending it." : "";
  return { kind: "text", answer: tone + "Within \"" + chapter + "\", the key point is that the model can only use what reaches its prompt. Retrieval decides what that is." + angle };
}

export function TutorCompanion({
  chapter,
  boardEvents,
  onInterrupt,
  isPlaying,
}: {
  chapter: string;
  boardEvents: BoardEvent[];
  onInterrupt: () => void;
  isPlaying: boolean;
}) {
  const reduce = useReducedMotion();
  const [tab, setTab] = useState<"ask" | "notes">("ask");
  const [depth, setDepth] = useState<Depth>("Standard");
  const [mode, setMode] = useState<Mode>("Theory");
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [notes, setNotes] = useState<string[]>(["Top-k decides what context the model sees."]);
  const [noteDraft, setNoteDraft] = useState("");
  const [saved, setSaved] = useState<string[]>(["When should I re-rank instead of raising k?"]);
  const [snapshots, setSnapshots] = useState(1);
  const pickable = boardEvents.filter((event) => event.kind === "text").slice(-4);

  const ask = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;
    // Interrupt first: the lecture never talks over a question.
    onInterrupt();
    setThinking(true);
    setDraft("");
    window.setTimeout(() => {
      setThinking(false);
      setExchanges((previous) => [...previous, { id: crypto.randomUUID(), question: trimmed, ...prepareAnswer(trimmed, chapter, depth, mode) }]);
    }, 850);
  };

  return (
    <div className="bg-card overflow-hidden rounded-xl border shadow-[var(--shadow-panel)]">
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
        <span className="bg-brand text-primary-foreground grid size-7 place-items-center rounded-full"><ChatCircleDots size={14} weight="fill" /></span>
        <span className="text-[13.5px] font-bold">Ask your instructor</span>
        {isPlaying && (
          <button type="button" onClick={onInterrupt} className="border-primary/40 text-primary hover:bg-primary/10 ml-1 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-colors">
            <HandPalm size={12} weight="fill" /> Interrupt
          </button>
        )}
        <div className="bg-raised ml-auto flex rounded-md p-0.5">
          {(["ask", "notes"] as const).map((option) => (
            <button key={option} type="button" onClick={() => setTab(option)} aria-pressed={tab === option} className={cn("rounded-[6px] px-2.5 py-1 text-[11.5px] font-semibold capitalize", tab === option ? "bg-card shadow-sm" : "text-muted-foreground")}>
              {option === "ask" ? "Questions" : "Notes"}
            </button>
          ))}
        </div>
      </div>

      {tab === "ask" ? (
        <div className="flex flex-col gap-3 p-4">
          <div className="flex flex-wrap items-center gap-3 text-[11.5px]">
            <Segment label="Depth" options={["Simple", "Standard", "Deep"] as const} value={depth} onChange={setDepth} />
            <Segment label="Style" options={["Theory", "Practical"] as const} value={mode} onChange={setMode} />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {quickAsks.map((item) => (
              <button key={item.label} type="button" onClick={() => ask(item.label)} className="hover:border-primary/40 hover:text-foreground text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition-colors">
                <item.icon size={12} /> {item.label}
              </button>
            ))}
          </div>

          {pickable.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-muted-foreground text-[11px] font-semibold">Explain a board element:</span>
              {pickable.map((event) => (
                <button key={event.id} type="button" onClick={() => ask("Explain the board element: " + String(event.payload.text))} className="bg-raised hover:bg-accent rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors">
                  {String(event.payload.text)}
                </button>
              ))}
            </div>
          )}

          <div className="scroll-slim flex max-h-[320px] flex-col gap-3 overflow-y-auto">
            <AnimatePresence initial={false}>
              {exchanges.map((exchange, index) => (
                <motion.div key={exchange.id} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
                  <span className="bg-primary text-primary-foreground self-end rounded-xl rounded-br-sm px-3 py-2 text-[12.5px]">{exchange.question}</span>
                  <div className="bg-raised self-start rounded-xl rounded-bl-sm border px-3 py-2.5 text-[12.5px] leading-relaxed">
                    {exchange.kind === "code" ? (
                      <pre className="numeric overflow-x-auto text-[11.5px] leading-relaxed whitespace-pre">{exchange.answer}</pre>
                    ) : exchange.kind === "diagram" ? (
                      <div className="flex flex-col gap-2"><span>{exchange.answer}</span><LoopDiagram /></div>
                    ) : index === exchanges.length - 1 ? <Typewriter text={exchange.answer} /> : exchange.answer}
                    <div className="mt-2 flex gap-1">
                      <button type="button" onClick={() => setSaved((prev) => [...prev, exchange.question])} className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-[11px] font-semibold"><BookmarkSimple size={12} /> Save to vault</button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {thinking && <span className="flex items-center gap-2 text-[12px]"><ThinkingDots /><span className="text-shimmer font-semibold">Preparing an explanation</span></span>}
          </div>

          <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); ask(draft); }}>
            <label htmlFor="tutor-ask" className="sr-only">Ask the instructor a question</label>
            <input id="tutor-ask" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask anything about this chapter" className="bg-card border-input focus-visible:border-primary h-9 flex-1 rounded-md border px-3 text-[12.5px] focus-visible:outline-none" />
            <Button type="submit" size="icon" aria-label="Ask" disabled={!draft.trim()}><PaperPlaneTilt size={14} weight="fill" /></Button>
          </form>

          {saved.length > 0 && (
            <div className="flex flex-col gap-1.5 border-t pt-3">
              <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-bold"><Question size={12} /> Unanswered and saved questions</span>
              {saved.map((question, index) => <span key={question + index} className="text-[12px]">{question}</span>)}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3 p-4">
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setSnapshots((count) => count + 1)}><Camera size={13} /> Save board snapshot</Button>
            <span className="text-muted-foreground self-center text-[11.5px]">{snapshots} saved this lecture</span>
          </div>
          <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); if (noteDraft.trim()) { setNotes((prev) => [...prev, noteDraft.trim()]); setNoteDraft(""); } }}>
            <label htmlFor="tutor-note" className="sr-only">Add a lecture note</label>
            <input id="tutor-note" value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} placeholder={"Note for \"" + chapter + "\""} className="bg-card border-input h-9 flex-1 rounded-md border px-3 text-[12.5px]" />
            <Button type="submit" size="icon" aria-label="Add note"><NotePencil size={14} /></Button>
          </form>
          <ul className="flex flex-col gap-2">
            {notes.map((note, index) => (
              <motion.li key={note + index} initial={reduce ? false : { opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="bg-raised flex gap-2 rounded-md p-2.5 text-[12.5px]">
                <Sparkle size={12} className="text-primary mt-0.5 shrink-0" weight="fill" /> {note}
              </motion.li>
            ))}
          </ul>
          <span className="text-muted-foreground text-[11px]">Notes and snapshots are saved with the session and appear in your Knowledge Vault.</span>
        </div>
      )}
    </div>
  );
}

function Segment<T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T; onChange: (value: T) => void }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-muted-foreground font-semibold">{label}</span>
      <span className="bg-raised flex rounded-md p-0.5">
        {options.map((option) => (
          <button key={option} type="button" onClick={() => onChange(option)} aria-pressed={value === option} className={cn("rounded-[5px] px-2 py-0.5 font-semibold", value === option ? "bg-card text-primary shadow-sm" : "text-muted-foreground")}>{option}</button>
        ))}
      </span>
    </span>
  );
}

function LoopDiagram() {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 260 90" className="w-full max-w-[280px]" role="img" aria-label="Documents feed the index once; questions read from it on every request.">
      {[["docs", 30], ["index", 130], ["answer", 230]].map(([label, x]) => (
        <g key={label as string}>
          <rect x={(x as number) - 26} y={30} width={52} height={28} rx={7} fill="none" stroke="var(--primary)" strokeWidth={1.5} />
          <text x={x as number} y={48} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--foreground)">{label}</text>
        </g>
      ))}
      <motion.path d="M56,44 L104,44 M156,44 L204,44" stroke="var(--brand-2)" strokeWidth={2} fill="none" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }} />
      <motion.path d="M230,30 C230,6 130,6 130,30" stroke="var(--primary)" strokeDasharray="4 4" strokeWidth={1.5} fill="none" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.5 }} />
    </svg>
  );
}
