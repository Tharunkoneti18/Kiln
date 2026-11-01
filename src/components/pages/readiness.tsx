"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, CheckCircle, Circle, Info } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GrowBar, ProgressRing, Stagger, StaggerItem } from "@/components/motion/primitives";
import { PageHeader, PageShell, SectionHeading } from "@/components/shell/page-header";
import { TrendChart } from "@/components/pages/interviews";
import { milestones, readinessComponents, readinessHistory, roleOptions, targetRole } from "@/lib/mock/data";
import { cn } from "@/lib/utils";

export function ReadinessView() {
  const reduce = useReducedMotion();
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");

  return (
    <PageShell className="flex flex-col gap-7">
      <PageHeader
        icon="readiness"
        context={"Target: " + targetRole.title}
        title="Career Readiness and Progress"
        description="Whether you are actually becoming more capable. Every number here is computed from evidence: assessments, projects, lectures and interviews. None of it is an estimate made up by a model."
      />

      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <Card><CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <ProgressRing value={targetRole.readiness} size={200} stroke={14} gradientId="ready-main" label={<span className="numeric text-[44px] leading-none font-bold">{targetRole.readiness}%</span>} sublabel="career ready" />
          <p className="text-muted-foreground max-w-[30ch] text-[12.5px] leading-relaxed">Up 25 points since onboarding. The next jump comes from demonstrating RAG this week.</p>
        </CardContent></Card>

        <Card><CardContent className="flex flex-col gap-4">
          <SectionHeading title="What the score is made of" description="Each component shows exactly what it is counting." />
          <Stagger className="flex flex-col gap-4">
            {readinessComponents.map((component, index) => (
              <StaggerItem key={component.label} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between"><span className="text-[13px] font-semibold">{component.label}</span><span className="numeric text-[13px] font-bold">{component.value}%</span></div>
                <GrowBar value={component.value} delay={index * 0.08} />
                <span className="text-muted-foreground flex items-center gap-1.5 text-[11.5px]"><Info size={12} /> {component.basis}</span>
              </StaggerItem>
            ))}
          </Stagger>
        </CardContent></Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card><CardContent className="flex flex-col gap-3">
          <SectionHeading title="Readiness history" actions={
            <div className="bg-raised flex rounded-md p-0.5">{(["weekly", "monthly"] as const).map((option) => <button key={option} type="button" onClick={() => setPeriod(option)} aria-pressed={period === option} className={cn("rounded-[5px] px-2.5 py-1 text-[11.5px] font-semibold capitalize", period === option ? "bg-card shadow-sm" : "text-muted-foreground")}>{option}</button>)}</div>
          } />
          <TrendChart key={period} values={period === "weekly" ? readinessHistory.map((point) => point.value) : [21, 46]} labels={period === "weekly" ? readinessHistory.map((point) => point.week) : ["Sep", "Oct"]} max={100} />
          <p className="text-muted-foreground text-[12px]">{period === "weekly" ? "Weekly report: +11 points this week from project evidence and the week 2 assessment." : "Monthly report: October moved readiness from 21 to 46."}</p>
        </CardContent></Card>

        <Card><CardContent className="flex flex-col gap-3">
          <SectionHeading title="Milestones" />
          <ol className="flex flex-col gap-2.5">
            {milestones.map((milestone, index) => (
              <motion.li key={milestone.label} initial={reduce ? false : { opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.06 }} className="flex items-center gap-3">
                {milestone.done ? <CheckCircle size={18} weight="fill" className="text-primary" /> : <Circle size={18} className="text-muted-foreground" />}
                <span className={cn("flex-1 text-[12.5px] font-semibold", !milestone.done && "text-muted-foreground")}>{milestone.label}</span>
                <span className="numeric text-muted-foreground text-[11px]">{milestone.date}</span>
              </motion.li>
            ))}
          </ol>
        </CardContent></Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <Card><CardContent className="flex flex-col gap-3">
          <SectionHeading title="Compared across target roles" />
          {roleOptions.slice(0, 5).map((role, index) => (
            <div key={role.id} className="grid grid-cols-[170px_1fr_44px] items-center gap-3">
              <span className={cn("truncate text-[12.5px] font-semibold", role.isTarget && "text-primary")}>{role.title}</span>
              <GrowBar value={role.compatibility} delay={index * 0.06} className="h-1.5" />
              <span className="numeric text-right text-[12px] font-bold">{role.compatibility}%</span>
            </div>
          ))}
        </CardContent></Card>

        <Card className="border-glow"><CardContent className="flex flex-col gap-3">
          <SectionHeading title="Recommended next steps" />
          {[
            { text: "Finish the grounded Q&A assignment", href: "/plan", gain: "+6" },
            { text: "Retake the debugging challenge", href: "/assessments", gain: "+4" },
            { text: "Mock interview on evaluation metrics", href: "/interviews", gain: "+3" },
          ].map((step) => (
            <Link key={step.text} href={step.href} className="hover:bg-raised group flex items-center gap-3 rounded-lg border p-3 transition-colors">
              <span className="flex-1 text-[12.5px] font-semibold">{step.text}</span>
              <span className="numeric text-primary text-[12px] font-bold">{step.gain}</span>
              <ArrowRight size={13} className="text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
          <span className="text-muted-foreground text-[11px]">Gains are the readiness points each step would add if passed.</span>
        </CardContent></Card>
      </div>
      <Button variant="secondary" size="sm" className="self-start">Download weekly report</Button>
    </PageShell>
  );
}
