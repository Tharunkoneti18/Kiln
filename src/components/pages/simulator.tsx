"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUp, Bug, ChatCircleText, Check, Code, GitPullRequest, Lightning, Target, TreeStructure } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Meter, Ring } from "@/components/system/data";
import { PageHeader, PageShell, Rise } from "@/components/shell/page-header";
import { simulations } from "@/lib/mock/data";
import type { SimulationScenario } from "@/lib/mock/types";
import { ease, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

const taskIcon: Record<SimulationScenario["tasks"][number]["kind"], typeof Code> = {
  requirements: Target,
  architecture: TreeStructure,
  implementation: Code,
  debugging: Bug,
  review: GitPullRequest,
  communication: ChatCircleText,
};

const statusLabel = { completed: "Completed", in_progress: "In progress", available: "Not started" } as const;

type Message = { from: "stakeholder" | "you"; text: string };

export function SimulatorView() {
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = useState("sim-1");
  const [twistShown, setTwistShown] = useState(false);
  const [reply, setReply] = useState("");
  const [thread, setThread] = useState<Message[]>([
    { from: "stakeholder", text: "Three customers this week got refund terms we do not offer. I need to know if this is the model or our data, and what we ship today." },
    { from: "you", text: "Logs show the retriever returned the 2024 policy page. It was never re-indexed after the update." },
  ]);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const active = simulations.find((scenario) => scenario.id === activeId)!;
  const stakeholderName = active.stakeholder.split(",")[0];
  const initials = stakeholderName.split(" ").map((part) => part[0]).join("").slice(0, 2);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTo({ top: node.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [thread, typing, twistShown, reduce]);

  const send = () => {
    if (!reply.trim()) return;
    setThread((prev) => [...prev, { from: "you", text: reply.trim() }]);
    setReply("");
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setThread((prev) => [...prev, { from: "stakeholder", text: "That works for today. What stops this happening again next quarter?" }]);
      setTwistShown(true);
    }, 1100);
  };

  return (
    <PageShell width="wide">
      <PageHeader
        context="Realistic workplace scenarios"
        title="Shadow the job before you get it"
        description="An AI plays your manager or stakeholder. Scope shifts mid-task, trade-offs need defending, and you are scored on decisions as well as code."
      />

      <Rise>
        <div role="radiogroup" aria-label="Scenario" className="grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-3">
          {simulations.map((scenario) => {
            const selected = activeId === scenario.id;
            return (
              <button
                key={scenario.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setActiveId(scenario.id)}
                className={cn(
                  "bg-card flex flex-col gap-2.5 rounded-[var(--radius-surface)] border p-4 text-left shadow-xs transition-[border-color,box-shadow] duration-200",
                  selected ? "border-gray-12 shadow-sm" : "border-border hover:border-border-strong",
                )}
              >
                <div className="flex items-center justify-between">
                  <Badge variant={scenario.status === "completed" ? "success" : scenario.status === "in_progress" ? "brand" : "neutral"}>{statusLabel[scenario.status]}</Badge>
                  {scenario.score !== undefined && <span className="text-gray-11 text-[12.5px] tabular">{scenario.score} pts</span>}
                </div>
                <span className="text-[14.5px] leading-snug font-medium text-foreground">{scenario.title}</span>
                <span className="text-gray-10 text-[12.5px]">With {scenario.stakeholder}</span>
              </button>
            );
          })}
        </div>
      </Rise>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active.id}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
          transition={{ duration: 0.3, ease: ease.out }}
          className="grid grid-cols-[minmax(0,1fr)] items-start gap-x-8 gap-y-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)]"
        >
          <Card className="overflow-hidden">
            <div className="flex flex-col gap-2 p-5">
              <span className="text-gray-10 text-[12.5px]">You are the {active.role}</span>
              <p className="text-[14px] leading-relaxed text-foreground">{active.brief}</p>
            </div>
            <div className="flex flex-col gap-1 border-t border-border p-5">
              <span className="text-gray-11 mb-2 text-[12.5px] font-medium">Deliverables</span>
              {active.tasks.map((task) => {
                const Glyph = taskIcon[task.kind];
                return (
                  <div key={task.label} className="flex items-center gap-3 py-1.5">
                    <span className={cn("grid size-[18px] shrink-0 place-items-center rounded-full", task.done ? "bg-gray-12 text-gray-1" : "border-border-strong border")}>
                      {task.done && <Check size={10} weight="bold" />}
                    </span>
                    <span className={cn("flex-1 text-[13.5px]", task.done ? "text-gray-10" : "text-foreground")}>{task.label}</span>
                    <Glyph size={15} className="text-gray-9 shrink-0" aria-label={task.kind} />
                  </div>
                );
              })}
            </div>
            {active.score !== undefined && (
              <div className="flex items-center gap-5 border-t border-border p-5">
                <Ring value={active.score} size={60} stroke={5}>
                  <span className="text-[15px] font-semibold tabular">{active.score}</span>
                </Ring>
                <div className="flex flex-1 flex-col gap-2.5">
                  {[
                    { label: "Requirement analysis", value: 82 },
                    { label: "Technical trade-offs", value: 74 },
                    { label: "Stakeholder communication", value: 79 },
                  ].map((row, index) => (
                    <div key={row.label} className="flex flex-col gap-1">
                      <div className="flex justify-between text-[12.5px]">
                        <span className="text-gray-11">{row.label}</span>
                        <span className="text-foreground tabular">{row.value}</span>
                      </div>
                      <Meter value={row.value} size="sm" tone="ink" delay={index * 0.08} label={row.label} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card className="flex h-[560px] flex-col overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <span className="bg-gray-12 text-gray-1 grid size-8 place-items-center rounded-full text-[11.5px] font-semibold">{initials}</span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-[13.5px] font-medium text-foreground">{stakeholderName}</span>
                <span className="text-gray-10 truncate text-[12px]">{active.stakeholder.split(",").slice(1).join(",").trim() || "Stakeholder"}</span>
              </div>
              <span className="text-gray-10 flex items-center gap-1.5 text-[12px]">
                <span className="bg-success size-1.5 rounded-full" aria-hidden="true" /> Live
              </span>
            </div>

            <div ref={scrollRef} className="scroll-slim flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-5">
              <AnimatePresence initial={false}>
                {thread.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, ease: ease.out }}
                    className={cn("flex max-w-[85%] flex-col gap-1", message.from === "you" ? "items-end self-end" : "items-start self-start")}
                  >
                    <span className="text-gray-10 px-1 text-[11.5px]">{message.from === "you" ? "You" : stakeholderName}</span>
                    <p
                      className={cn(
                        "rounded-[14px] px-3.5 py-2.5 text-[13.5px] leading-relaxed",
                        message.from === "you" ? "bg-gray-12 text-gray-1 rounded-br-[6px]" : "bg-gray-3 text-foreground rounded-bl-[6px]",
                      )}
                    >
                      {message.text}
                    </p>
                  </motion.div>
                ))}
                {twistShown && (
                  <motion.div
                    key="twist"
                    initial={reduce ? false : { opacity: 0, scale: 0.97, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={spring.overlay}
                    className="bg-warning-soft border-warning/30 flex gap-3 rounded-[12px] border p-3.5"
                    role="status"
                  >
                    <Lightning size={16} weight="fill" className="text-warning mt-0.5 shrink-0" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[13px] font-medium text-foreground">Requirements changed</span>
                      <span className="text-gray-11 text-[13px] leading-relaxed">{active.twist}</span>
                    </div>
                  </motion.div>
                )}
                {typing && (
                  <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-gray-3 flex w-fit items-center gap-1 rounded-[14px] rounded-bl-[6px] px-3.5 py-3" aria-label={stakeholderName + " is typing"}>
                    {[0, 1, 2].map((dot) => (
                      <motion.span
                        key={dot}
                        className="bg-gray-10 size-1.5 rounded-full"
                        animate={reduce ? undefined : { y: [0, -3, 0], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: dot * 0.14 }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <form
              className="flex items-end gap-2 border-t border-border p-3"
              onSubmit={(event) => {
                event.preventDefault();
                send();
              }}
            >
              <label htmlFor="sim-reply" className="sr-only">Reply to {stakeholderName}</label>
              <input
                id="sim-reply"
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                placeholder={"Reply to " + stakeholderName}
                className="bg-gray-2 focus:bg-card h-9 flex-1 rounded-[9px] border border-border px-3 text-[13.5px] text-foreground transition-colors outline-none placeholder:text-gray-9 focus:border-border-strong"
              />
              <Button type="submit" size="icon" aria-label="Send reply" disabled={!reply.trim()} className="rounded-[9px]">
                <ArrowUp weight="bold" />
              </Button>
            </form>
          </Card>
        </motion.div>
      </AnimatePresence>
    </PageShell>
  );
}
