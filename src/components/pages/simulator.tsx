"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Bug, ChatCircleText, CheckCircle, Circle, Code, GitPullRequest, Lightning, PaperPlaneTilt, Target, TreeStructure, UserCircle } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GrowBar, ProgressRing, ThinkingDots } from "@/components/motion/primitives";
import { PageHeader, PageShell } from "@/components/shell/page-header";
import { simulations } from "@/lib/mock/data";
import type { SimulationScenario } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

const taskIcon: Record<SimulationScenario["tasks"][number]["kind"], typeof Code> = {
  requirements: Target, architecture: TreeStructure, implementation: Code, debugging: Bug, review: GitPullRequest, communication: ChatCircleText,
};

export function SimulatorView() {
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = useState("sim-1");
  const [twistShown, setTwistShown] = useState(false);
  const [reply, setReply] = useState("");
  const [thread, setThread] = useState<{ from: "stakeholder" | "you"; text: string }[]>([
    { from: "stakeholder", text: "Three customers this week got refund terms we do not offer. I need to know if this is the model or our data, and what we ship today." },
    { from: "you", text: "Logs show the retriever returned the 2024 policy page. It was never re-indexed after the update." },
  ]);
  const [typing, setTyping] = useState(false);
  const active = simulations.find((scenario) => scenario.id === activeId)!;

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
    <PageShell className="flex flex-col gap-7">
      <PageHeader
        icon="shadow"
        context="Practice the job before you have it"
        title="Job Shadow Simulator"
        description="Role-specific workplace scenarios where the AI plays your manager or stakeholder. Requirements change mid-task, code gets reviewed, and you are assessed on decisions and communication as well as code."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {simulations.map((scenario) => (
          <button key={scenario.id} type="button" onClick={() => setActiveId(scenario.id)} aria-pressed={activeId === scenario.id}
            className={cn("bg-card flex flex-col gap-2 rounded-xl border p-4 text-left transition-all", activeId === scenario.id ? "border-primary ring-primary/20 ring-2" : "hover:border-primary/40 hover:-translate-y-0.5")}>
            <div className="flex items-center justify-between">
              <Badge variant={scenario.status === "completed" ? "demonstrated" : scenario.status === "in_progress" ? "primary" : "neutral"}>{scenario.status.replace("_", " ")}</Badge>
              {scenario.score !== undefined && <span className="numeric text-[13px] font-bold">{scenario.score}</span>}
            </div>
            <span className="text-[14px] leading-snug font-bold">{scenario.title}</span>
            <span className="text-muted-foreground text-[11.5px]">With {scenario.stakeholder}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={active.id} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.28 }} className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
          <Card><CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="bg-brand text-primary-foreground grid size-11 place-items-center rounded-full"><UserCircle size={22} weight="fill" /></span>
              <div className="flex flex-col"><span className="text-[14px] font-bold">{active.stakeholder}</span><span className="text-muted-foreground text-[11.5px]">AI stakeholder, you are the {active.role}</span></div>
            </div>
            <div className="bg-raised rounded-lg p-3.5 text-[13px] leading-relaxed"><b>Brief: </b>{active.brief}</div>
            <h3 className="text-[12.5px] font-bold">Your tasks</h3>
            {active.tasks.map((task) => {
              const Glyph = taskIcon[task.kind];
              return (
                <div key={task.label} className="flex items-center gap-3 rounded-lg border p-3">
                  {task.done ? <CheckCircle size={17} weight="fill" className="text-primary" /> : <Circle size={17} className="text-muted-foreground" />}
                  <span className={cn("flex-1 text-[12.5px] font-semibold", task.done && "text-muted-foreground")}>{task.label}</span>
                  <Badge variant="neutral"><Glyph /> {task.kind}</Badge>
                </div>
              );
            })}
            {active.score !== undefined && (
              <div className="flex items-center gap-4 border-t pt-4">
                <ProgressRing value={active.score} size={72} stroke={7} gradientId={"sim-" + active.id} label={<span className="numeric text-[16px] font-bold">{active.score}</span>} />
                <div className="flex flex-1 flex-col gap-2 text-[12px]">
                  {[["Requirement analysis", 82], ["Technical decisions", 74], ["Communication", 79]].map(([label, value]) => (
                    <div key={label as string} className="flex flex-col gap-1"><span className="font-semibold">{label}</span><GrowBar value={value as number} className="h-1.5" /></div>
                  ))}
                </div>
              </div>
            )}
          </CardContent></Card>

          <Card className="flex flex-col"><CardContent className="flex flex-1 flex-col gap-3">
            <h3 className="text-[13.5px] font-bold">Workplace thread</h3>
            <AnimatePresence>
              {twistShown && (
                <motion.div initial={reduce ? false : { opacity: 0, y: -10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="border-transferable/40 bg-transferable/10 flex items-start gap-2 rounded-lg border p-3 text-[12.5px]">
                  <Lightning size={16} weight="fill" className="text-transferable mt-0.5 shrink-0" />
                  <span><b>Requirement changed: </b>{active.twist}</span>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="scroll-slim flex max-h-[380px] min-h-[220px] flex-1 flex-col gap-2.5 overflow-y-auto">
              {thread.map((message, index) => (
                <motion.div key={index} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className={cn("max-w-[85%] rounded-xl px-3.5 py-2.5 text-[12.5px] leading-relaxed", message.from === "you" ? "bg-primary text-primary-foreground self-end rounded-br-sm" : "bg-raised self-start rounded-bl-sm border")}>
                  {message.text}
                </motion.div>
              ))}
              {typing && <span className="flex items-center gap-2 text-[12px]"><ThinkingDots /><span className="text-muted-foreground">{active.stakeholder.split(",")[0]} is typing</span></span>}
            </div>
            <form className="flex gap-2 border-t pt-3" onSubmit={(event) => { event.preventDefault(); send(); }}>
              <label htmlFor="sim-reply" className="sr-only">Reply to the stakeholder</label>
              <input id="sim-reply" value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Reply as you would at work" className="bg-card border-input h-9 flex-1 rounded-md border px-3 text-[12.5px]" />
              <Button type="submit" size="icon" aria-label="Send reply" disabled={!reply.trim()}><PaperPlaneTilt size={14} weight="fill" /></Button>
            </form>
          </CardContent></Card>
        </motion.div>
      </AnimatePresence>
    </PageShell>
  );
}
