"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowsClockwise, Bell, CalendarBlank, ChatCircleText, FileText, Lightbulb, Plus } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GrowBar } from "@/components/motion/primitives";
import { PageHeader, PageShell, SectionHeading } from "@/components/shell/page-header";
import { ApplicationFunnel3D } from "@/components/three/application-funnel";
import { applications as seed, resumeVariants } from "@/lib/mock/data";
import type { Application, ApplicationStage } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

const columns: { stage: ApplicationStage; label: string }[] = [
  { stage: "saved", label: "Saved" },
  { stage: "applied", label: "Applied" },
  { stage: "screen", label: "Recruiter screen" },
  { stage: "interview", label: "Interview" },
  { stage: "offer", label: "Offer" },
  { stage: "rejected", label: "Rejected" },
  { stage: "no_response", label: "No response" },
];

export function ApplicationsView() {
  const reduce = useReducedMotion();
  const [items, setItems] = useState<Application[]>(seed);
  const sent = items.filter((item) => item.appliedAt).length;
  const responded = items.filter((item) => item.recruiterResponded).length;
  const funnel = [
    { stage: "Applied", count: sent },
    { stage: "Response", count: responded },
    { stage: "Interview", count: items.filter((item) => item.stage === "interview" || item.stage === "offer").length },
    { stage: "Offer", count: items.filter((item) => item.stage === "offer").length },
  ];

  const move = (id: string, stage: ApplicationStage) => setItems((prev) => prev.map((item) => (item.id === id ? { ...item, stage } : item)));

  return (
    <PageShell className="flex flex-col gap-7">
      <PageHeader
        icon="applications"
        context="Outcomes feed back into your twin and plan"
        title="Application Tracker and Outcome Intelligence"
        description="Every application, its resume version, stage, interviews and follow-ups, plus what your outcomes say about your strategy."
        actions={<NewApplicationDialog onCreate={(application) => setItems((prev) => [application, ...prev])} />}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
        <Card className="overflow-hidden"><CardContent className="p-0">
          <div className="p-5 pb-0"><h2 className="text-[14.5px] font-bold">Conversion funnel</h2></div>
          <ApplicationFunnel3D stages={funnel} className="h-[220px] w-full" fallback={<div className="flex size-full flex-col justify-center gap-2 px-8">{funnel.map((row) => <GrowBar key={row.stage} value={(row.count / Math.max(1, sent)) * 100} />)}</div>} />
          <div className="grid grid-cols-4 border-t">{funnel.map((row) => <div key={row.stage} className="flex flex-col items-center border-r py-3 last:border-r-0"><span className="numeric text-[18px] font-bold">{row.count}</span><span className="text-muted-foreground text-[10.5px] font-semibold">{row.stage}</span></div>)}</div>
        </CardContent></Card>

        <div className="grid gap-5 sm:grid-cols-2">
          <Card><CardContent className="flex flex-col gap-3">
            <h3 className="flex items-center gap-2 text-[13.5px] font-bold"><FileText size={15} className="text-primary" /> Resume variant performance</h3>
            {resumeVariants.map((variant) => (
              <div key={variant.version} className="flex flex-col gap-1">
                <span className="text-[12.5px] font-semibold">{variant.version}</span>
                <GrowBar value={(variant.responses / variant.sent) * 100} className="h-1.5" />
                <span className="text-muted-foreground text-[11px]">{variant.sent} sent, {variant.responses} replies, {variant.interviews} interviews</span>
              </div>
            ))}
            <span className="text-muted-foreground text-[11px]">Three each is too few to call a winner.</span>
          </CardContent></Card>
          <Card><CardContent className="flex flex-col gap-3">
            <h3 className="flex items-center gap-2 text-[13.5px] font-bold"><ChatCircleText size={15} className="text-primary" /> Skill-related outcomes</h3>
            <p className="text-[12.5px] leading-relaxed">Both rejections with a reason cited <b>evaluation experience</b>. That skill is week 4 of your plan, and the signal has been sent to your Digital Twin.</p>
            <Badge variant="supported" className="self-start"><ArrowsClockwise /> Fed back into planner</Badge>
          </CardContent></Card>
          <Card className="border-glow sm:col-span-2"><CardContent className="flex items-start gap-3">
            <Lightbulb size={18} weight="fill" className="text-primary mt-0.5 shrink-0" />
            <div className="flex flex-col gap-1 text-[12.5px]"><b>Application strategy</b><span className="leading-relaxed">AI-focused resume v3 earned the only interview. Use it for every AI role, and hold Northbeam until RAG is demonstrated.</span></div>
          </CardContent></Card>
        </div>
      </div>

      <section>
        <SectionHeading title="Pipeline" description="Change a stage from the menu on any card." />
        <div className="scroll-slim -mx-4 flex gap-3 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6">
          {columns.map((column) => {
            const cards = items.filter((item) => item.stage === column.stage);
            return (
              <div key={column.stage} className="bg-raised/60 flex w-[250px] shrink-0 flex-col gap-2 rounded-xl border p-2.5">
                <div className="flex items-center justify-between px-1.5 py-1"><span className="text-[12px] font-bold">{column.label}</span><span className="numeric text-muted-foreground text-[11px]">{cards.length}</span></div>
                {cards.map((item) => (
                  <motion.div layout layoutId={item.id} key={item.id} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 350, damping: 30 }}
                    className="bg-card flex flex-col gap-2 rounded-lg border p-3 shadow-[var(--shadow-panel)]">
                    <span className="text-[13px] font-bold">{item.company}</span>
                    <span className="text-muted-foreground text-[11.5px]">{item.role}</span>
                    <Badge variant="neutral" className="self-start"><FileText /> {item.resumeVersion}</Badge>
                    {item.nextStep && <span className={cn("flex items-center gap-1.5 text-[11.5px] font-semibold", item.nextStep === "Follow up" ? "text-transferable" : "text-primary")}>{item.nextStep === "Follow up" ? <Bell size={12} /> : <CalendarBlank size={12} />}{item.nextStep}{item.nextDate ? ", " + item.nextDate.slice(5) : ""}</span>}
                    {item.feedback && <span className="bg-raised rounded-md p-2 text-[11.5px] italic">&ldquo;{item.feedback}&rdquo;</span>}
                    <Select value={item.stage} onValueChange={(value) => move(item.id, value as ApplicationStage)}>
                      <SelectTrigger aria-label={"Stage for " + item.company} className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                      <SelectContent>{columns.map((option) => <SelectItem key={option.stage} value={option.stage}>{option.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </motion.div>
                ))}
                {cards.length === 0 && <span className="text-muted-foreground rounded-lg border border-dashed p-4 text-center text-[11.5px]">Empty</span>}
              </div>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}

function NewApplicationDialog({ onCreate }: { onCreate: (application: Application) => void }) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  return (
    <Dialog>
      <DialogTrigger asChild><Button size="sm"><Plus size={13} weight="bold" /> New application</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Track an application</DialogTitle><DialogDescription>Entered by you. Career OS never applies on your behalf.</DialogDescription></DialogHeader>
        <div className="flex flex-col gap-3">
          <Field><Label htmlFor="na-company">Company</Label><Input id="na-company" value={company} onChange={(event) => setCompany(event.target.value)} /></Field>
          <Field><Label htmlFor="na-role">Role</Label><Input id="na-role" value={role} onChange={(event) => setRole(event.target.value)} /></Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <DialogClose asChild><Button variant="ghost" size="sm">Cancel</Button></DialogClose>
          <DialogClose asChild>
            <Button size="sm" disabled={!company.trim() || !role.trim()} onClick={() => { onCreate({ id: crypto.randomUUID(), company, role, stage: "saved", appliedAt: null, resumeVersion: "Resume v3 (AI focus)", recruiterResponded: false }); setCompany(""); setRole(""); }}>Add</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
