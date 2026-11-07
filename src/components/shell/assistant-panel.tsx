"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUp, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Typewriter } from "@/components/motion/primitives";
import { assistantPrompts, assistantReplies } from "@/lib/mock/data";
import { ease, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { BrandMark } from "./brand";

/**
 * The AI Career Assistant, available on every screen.
 *
 * It answers from platform data (the plan, the twin, the market analysis),
 * not as an isolated chatbot. Here replies are prepared fixtures; the shape of
 * the conversation is what the real service will fill.
 */

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const fallbackReply =
  "I can see your plan, skill evidence, market analysis and applications. Try asking about a skill gap, your schedule, or whether you are ready for a specific role.";

interface AssistantContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  messages: ChatMessage[];
  thinking: boolean;
  ask: (text: string) => void;
}

const AssistantContext = createContext<AssistantContextValue | null>(null);

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi Rhea. You are in week 3 of 8, working on RAG architecture. What would you like to look at?",
    },
  ]);

  const ask = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((previous) => [...previous, { id: crypto.randomUUID(), role: "user", text: trimmed }]);
    setThinking(true);
    window.setTimeout(() => {
      setThinking(false);
      setMessages((previous) => [...previous, { id: crypto.randomUUID(), role: "assistant", text: assistantReplies[trimmed] ?? fallbackReply }]);
    }, 900);
  }, []);

  return <AssistantContext.Provider value={{ open, setOpen, messages, thinking, ask }}>{children}</AssistantContext.Provider>;
}

export function useAssistant() {
  const context = useContext(AssistantContext);
  if (!context) throw new Error("useAssistant must be used inside AssistantProvider");
  return context;
}

/** The conversation body, shared by the slide-over and the full page. */
export function AssistantConversation({ className, autoFocus }: { className?: string; autoFocus?: boolean }) {
  const { messages, thinking, ask } = useAssistant();
  const [draft, setDraft] = useState("");
  const reduce = useReducedMotion();
  const lastId = messages.at(-1)?.id;
  const scrollRef = useRef<HTMLDivElement>(null);
  const fresh = messages.length === 1;

  // Keep the newest message in view as replies stream in.
  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTo({ top: node.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [messages, thinking, reduce]);

  const submit = () => {
    ask(draft);
    setDraft("");
  };

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div ref={scrollRef} className="scroll-slim flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 py-6">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: ease.out }}
              className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
            >
              {message.role === "assistant" ? (
                <>
                  <BrandMark size={22} className="mt-0.5" />
                  <p className="max-w-[92%] text-[14px] leading-[1.65] text-foreground">
                    {message.id === lastId && message.id !== "welcome" ? <Typewriter text={message.text} /> : message.text}
                  </p>
                </>
              ) : (
                <p className="bg-gray-3 max-w-[85%] rounded-[14px] rounded-br-[6px] px-3.5 py-2.5 text-[14px] leading-relaxed text-foreground">
                  {message.text}
                </p>
              )}
            </motion.div>
          ))}
          {thinking && (
            <motion.div key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
              <BrandMark size={22} className={reduce ? "" : "animate-pulse-soft"} />
              <span className="text-shimmer text-[13.5px]">Reading your plan and evidence</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-3 px-4 pt-2 pb-4">
        <AnimatePresence>
          {fresh && (
            <motion.div
              initial={false}
              exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
              className="flex flex-wrap gap-1.5 overflow-hidden"
            >
              {assistantPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => ask(prompt)}
                  className="text-gray-11 hover:border-border-strong hover:text-foreground rounded-full border border-border bg-card px-3 py-1.5 text-[12.5px] transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          className={cn(
            "bg-card flex items-end gap-2 rounded-[14px] border border-border p-2 pl-3.5 shadow-xs transition-[border-color,box-shadow] duration-150",
            "focus-within:border-border-strong focus-within:shadow-sm",
          )}
        >
          <label htmlFor="assistant-input" className="sr-only">Ask the career assistant</label>
          <textarea
            id="assistant-input"
            rows={1}
            autoFocus={autoFocus}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            placeholder="Ask about your plan, a skill gap, or a role"
            className="max-h-32 min-h-[28px] flex-1 resize-none bg-transparent py-1 text-[14px] leading-relaxed text-foreground outline-none placeholder:text-gray-9"
          />
          <Button type="submit" size="icon-sm" aria-label="Send" disabled={!draft.trim()} className="rounded-[9px]">
            <ArrowUp weight="bold" />
          </Button>
        </form>
      </div>
    </div>
  );
}

/** Slide-over panel opened from the top bar or the command palette. */
export function AssistantSheet() {
  const { open, setOpen } = useAssistant();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="bg-overlay fixed inset-0 z-40"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Career assistant"
            className="bg-background fixed inset-y-2 right-2 z-50 flex w-[calc(100vw-1rem)] max-w-[440px] flex-col overflow-hidden rounded-[14px] border border-border shadow-lg"
            initial={reduce ? { opacity: 0 } : { x: "calc(100% + 16px)" }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: "calc(100% + 16px)" }}
            transition={spring.overlay}
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-[14px] font-semibold text-foreground">Assistant</span>
                <span className="text-gray-10 text-[12px]">Answers from your plan, evidence and market data</span>
              </div>
              <Button variant="ghost" size="icon-sm" aria-label="Close assistant" onClick={() => setOpen(false)}>
                <X />
              </Button>
            </div>
            <AssistantConversation className="flex-1" autoFocus />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
