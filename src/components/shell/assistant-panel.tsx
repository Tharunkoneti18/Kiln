"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PaperPlaneTilt, Robot, Sparkle, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ThinkingDots, Typewriter } from "@/components/motion/primitives";
import { assistantPrompts, assistantReplies } from "@/lib/mock/data";
import { cn } from "@/lib/utils";

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
      setMessages((previous) => [
        ...previous,
        { id: crypto.randomUUID(), role: "assistant", text: assistantReplies[trimmed] ?? fallbackReply },
      ]);
    }, 900);
  }, []);

  return (
    <AssistantContext.Provider value={{ open, setOpen, messages, thinking, ask }}>
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistant() {
  const context = useContext(AssistantContext);
  if (!context) throw new Error("useAssistant must be used inside AssistantProvider");
  return context;
}

/** The conversation body, shared by the slide-over and the full page. */
export function AssistantConversation({ className }: { className?: string }) {
  const { messages, thinking, ask } = useAssistant();
  const [draft, setDraft] = useState("");
  const reduce = useReducedMotion();
  const lastId = messages.at(-1)?.id;

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="scroll-slim flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={reduce ? false : { opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "max-w-[88%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed",
              message.role === "user"
                ? "bg-primary text-primary-foreground self-end rounded-br-sm"
                : "bg-raised self-start rounded-bl-sm border",
            )}
          >
            {message.role === "assistant" && message.id === lastId && message.id !== "welcome" ? (
              <Typewriter text={message.text} />
            ) : (
              message.text
            )}
          </motion.div>
        ))}
        {thinking && (
          <div className="bg-raised flex items-center gap-2 self-start rounded-xl border px-3.5 py-3">
            <ThinkingDots />
            <span className="text-shimmer text-[12px] font-semibold">Reading your plan and evidence</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t p-3">
        <div className="flex flex-wrap gap-1.5">
          {assistantPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => ask(prompt)}
              className="hover:border-primary/40 hover:text-foreground text-muted-foreground rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            ask(draft);
            setDraft("");
          }}
        >
          <label htmlFor="assistant-input" className="sr-only">
            Ask the career assistant
          </label>
          <input
            id="assistant-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask about your plan, gaps or applications"
            className="bg-card border-input focus-visible:border-primary h-10 flex-1 rounded-md border px-3 text-[13px] focus-visible:outline-none"
          />
          <Button type="submit" size="icon" aria-label="Send" disabled={!draft.trim()}>
            <PaperPlaneTilt size={15} weight="fill" />
          </Button>
        </form>
      </div>
    </div>
  );
}

/** Slide-over panel opened from the top bar on any screen. */
export function AssistantSheet() {
  const { open, setOpen } = useAssistant();
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-[hsl(var(--shadow-tint)/0.35)]"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            role="dialog"
            aria-label="AI Career Assistant"
            className="bg-card fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col border-l shadow-[var(--shadow-lifted)]"
            initial={reduce ? false : { x: 440 }}
            animate={{ x: 0 }}
            exit={{ x: 440 }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
          >
            <div className="flex items-center gap-3 border-b p-4">
              <span className="bg-brand text-primary-foreground grid size-9 place-items-center rounded-full">
                <Robot size={18} weight="fill" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-[14px] font-bold">Career Assistant</span>
                <span className="text-muted-foreground flex items-center gap-1 text-[11.5px]">
                  <Sparkle size={11} weight="fill" className="text-primary" /> Uses your plan, twin and market data
                </span>
              </div>
              <Button variant="ghost" size="icon-sm" aria-label="Close assistant" onClick={() => setOpen(false)}>
                <X size={16} />
              </Button>
            </div>
            <AssistantConversation className="flex-1" />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
