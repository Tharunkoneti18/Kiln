"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, DownloadSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnimatedNumber, Delta, Meter } from "@/components/system/data";
import { LineChart } from "@/components/system/line-chart";
import { Segmented } from "@/components/system/segmented";
import { useToast } from "@/components/system/toast";
import { PageHeader, PageShell, Rise, Section } from "@/components/shell/page-header";
import { milestones, readinessComponents, readinessHistory, roleOptions, targetRole } from "@/lib/mock/data";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

const nextActions = [
  { text: "Finish the grounded Q&A assignment", href: "/plan", gain: 6 },
  { text: "Retake the debugging challenge", href: "/assessments", gain: 4 },
  { text: "Mock interview on retrieval metrics", href: "/interviews", gain: 3 },
];

export function ReadinessView() {
  const reduce = useReducedMotion();
  const { toast } = useToast();
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const start = readinessHistory[0].value;
  const gain = targetRole.readiness - start;
  const weekly = readinessHistory.at(-1)!.value - readinessHistory.at(-2)!.value;

  return (
    <PageShell>
      <PageHeader
        context={"Measured against " + targetRole.title}
        title="How ready you are, and why"
        description="Every number here is computed from verified work: graded assessments, shipped projects and scored interviews. Nothing is estimated."
        actions={
          <Button variant="secondary" onClick={() => toast({ title: "Evidence report exporting", description: "Your PDF will download in a moment.", tone: "info" })}>
            <DownloadSimple /> Export report
          </Button>
        }
      />

      <Rise>
        <Card className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="flex flex-col justify-between gap-6 p-6 lg:border-r lg:border-border">
            <div className="flex flex-col gap-1">
              <span className="text-gray-11 text-[13px] font-medium">Readiness</span>
              <span className="text-[64px] leading-none font-semibold tracking-[-0.045em] text-foreground tabular">
                <AnimatedNumber value={targetRole.readiness} durationSeconds={1.4} />
                <span className="text-gray-9 text-[32px]">%</span>
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-[13px]">
                <Delta value={weekly} suffix=" pts" />
                <span className="text-gray-10">this week</span>
              </div>
              <div className="flex items-center gap-3 text-[13px]">
                <Delta value={gain} suffix=" pts" />
                <span className="text-gray-10">since you started</span>
              </div>
              <p className="text-gray-11 text-[13px] leading-relaxed">Passing the RAG architecture checkpoint is the single biggest jump available right now.</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 border-t border-border p-6 lg:border-t-0">
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-11 text-[13px] font-medium">Trend</span>
              <Segmented
                size="sm"
                label="Period"
                value={period}
                onChange={setPeriod}
                options={[
                  { value: "weekly", label: "Weekly" },
                  { value: "monthly", label: "Monthly" },
                ]}
              />
            </div>
            <LineChart
              key={period}
              values={period === "weekly" ? readinessHistory.map((point) => point.value) : [start, targetRole.readiness]}
              labels={period === "weekly" ? readinessHistory.map((point) => point.week) : ["Sep", "Oct"]}
              min={0}
              max={60}
              format={(value) => Math.round(value) + "%"}
              height={150}
            />
          </div>
        </Card>
      </Rise>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Section title="What the score is made of">
          <ul className="flex flex-col gap-5">
            {readinessComponents.map((component, index) => (
              <li key={component.label} className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13.5px] font-medium text-foreground">{component.label}</span>
                  <span className="text-[13.5px] text-foreground tabular">{component.value}%</span>
                </div>
                <Meter value={component.value} tone={component.value >= 60 ? "ink" : "brand"} delay={index * 0.08} label={component.label} />
                <span className="text-gray-10 text-[12.5px]">{component.basis}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Fastest gains" description="Points added to readiness once each is verified.">
          <Card className="divide-y divide-border overflow-hidden">
            {nextActions.map((step) => (
              <Link key={step.text} href={step.href} className="group hover:bg-gray-2 flex items-center gap-3 px-4 py-3.5 transition-colors">
                <span className="text-success w-10 text-[13.5px] font-semibold tabular">+{step.gain}</span>
                <span className="flex-1 text-[13.5px] text-foreground">{step.text}</span>
                <ArrowRight size={14} className="text-gray-9 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            ))}
          </Card>
        </Section>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-10 lg:grid-cols-2">
        <Section title="Milestones">
          <ol className="relative flex flex-col">
            {milestones.map((milestone, index) => {
              const nextUp = !milestone.done && (index === 0 || milestones[index - 1].done);
              return (
                <motion.li
                  key={milestone.label}
                  initial={reduce ? false : { opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05, duration: 0.3, ease: ease.out }}
                  className="relative flex items-center gap-3.5 py-2.5"
                >
                  {index < milestones.length - 1 && (
                    <span className={cn("absolute top-[30px] left-[9.5px] h-[calc(100%-18px)] w-px", milestone.done ? "bg-gray-12" : "bg-border")} aria-hidden="true" />
                  )}
                  <span
                    className={cn(
                      "relative grid size-5 shrink-0 place-items-center rounded-full",
                      milestone.done && "bg-gray-12 text-gray-1",
                      nextUp && "border-brand bg-brand-soft border-2",
                      !milestone.done && !nextUp && "border-border-strong bg-card border",
                    )}
                  >
                    {milestone.done && <Check size={11} weight="bold" />}
                  </span>
                  <span className={cn("flex-1 text-[13.5px]", milestone.done ? "text-foreground" : nextUp ? "font-medium text-foreground" : "text-gray-10")}>{milestone.label}</span>
                  <span className="text-gray-10 text-[12.5px] tabular">{milestone.date}</span>
                </motion.li>
              );
            })}
          </ol>
        </Section>

        <Section title="Readiness for other roles">
          <ul className="flex flex-col gap-4">
            {roleOptions.slice(0, 5).map((role, index) => (
              <li key={role.id} className="flex flex-col gap-1.5">
                <div className="flex justify-between gap-3 text-[13px]">
                  <span className={cn("truncate", role.isTarget ? "font-medium text-foreground" : "text-gray-11")}>
                    {role.title}
                    {role.isTarget && <span className="text-brand-text"> · target</span>}
                  </span>
                  <span className="text-foreground tabular">{role.compatibility}%</span>
                </div>
                <Meter value={role.compatibility} tone={role.isTarget ? "brand" : "muted"} size="sm" delay={index * 0.06} label={role.title} />
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </PageShell>
  );
}
