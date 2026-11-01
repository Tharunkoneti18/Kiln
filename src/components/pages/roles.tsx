"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, MagnifyingGlass, Target, TrendUp, X } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GrowBar, ProgressRing, TiltCard } from "@/components/motion/primitives";
import { PageHeader, PageShell, SectionHeading } from "@/components/shell/page-header";
import { roleOptions } from "@/lib/mock/data";
import type { RoleOption } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

const levels = ["all", "internship", "entry", "experienced"] as const;

export function RolesView() {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<(typeof levels)[number]>("all");
  const [industry, setIndustry] = useState("All industries");
  const [selectedId, setSelectedId] = useState("ai-automation-engineer");
  const industries = ["All industries", ...new Set(roleOptions.map((role) => role.industry))];

  const visible = useMemo(
    () =>
      roleOptions
        .filter((role) => level === "all" || role.level === level)
        .filter((role) => industry === "All industries" || role.industry === industry)
        .filter((role) => role.title.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => b.compatibility - a.compatibility),
    [industry, level, query],
  );
  const selected = roleOptions.find((role) => role.id === selectedId) ?? roleOptions[0];
  const target = roleOptions.find((role) => role.isTarget)!;

  return (
    <PageShell className="flex flex-col gap-7">
      <PageHeader
        icon="roles"
        context="Based on your Digital Twin"
        title="Career Opportunities"
        description="Realistic roles ranked by how much of each you can already demonstrate, with the transferable skills and the remaining effort for every path."
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <MagnifyingGlass size={15} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
          <label htmlFor="role-search" className="sr-only">Search roles</label>
          <Input id="role-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search job roles, for example AI Engineer" className="h-10 pl-9" />
        </div>
        <div className="bg-raised flex rounded-md p-1">
          {levels.map((option) => (
            <button key={option} type="button" onClick={() => setLevel(option)} aria-pressed={level === option}
              className={cn("relative rounded-[6px] px-3 py-1.5 text-[12px] font-semibold capitalize transition-colors", level === option ? "text-foreground" : "text-muted-foreground")}>
              {level === option && <motion.span layoutId="level-pill" className="bg-card absolute inset-0 rounded-[6px] shadow-sm" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="relative">{option}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {industries.map((option) => (
            <button key={option} type="button" onClick={() => setIndustry(option)} aria-pressed={industry === option}
              className={cn("rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition-colors", industry === option ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}>
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <motion.div layout className="grid content-start gap-4 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {visible.map((role) => (
              <motion.div key={role.id} layout initial={reduce ? false : { opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
                <TiltCard>
                  <button type="button" onClick={() => setSelectedId(role.id)}
                    className={cn("bg-card flex h-full w-full flex-col gap-3 rounded-xl border p-5 text-left shadow-[var(--shadow-panel)] transition-colors",
                      selectedId === role.id ? "border-primary ring-primary/25 ring-2" : "hover:border-primary/40")}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[14.5px] leading-snug font-bold">{role.title}</span>
                        <span className="text-muted-foreground text-[11.5px] capitalize">{role.level} · {role.industry}</span>
                      </div>
                      <ProgressRing value={role.compatibility} size={52} stroke={5} gradientId={"rc-" + role.id} label={<span className="numeric text-[12px] font-bold">{role.compatibility}</span>} />
                    </div>
                    <p className="text-muted-foreground text-[12px] leading-relaxed">{role.summary}</p>
                    <div className="mt-auto flex flex-wrap items-center gap-1.5">
                      {role.isTarget && <Badge variant="primary"><Target weight="fill" /> Your target</Badge>}
                      <Badge variant="neutral">{role.effortWeeks} weeks</Badge>
                      {role.demandTrend === "rising" && <Badge variant="supported"><TrendUp /> Rising demand</Badge>}
                    </div>
                  </button>
                </TiltCard>
              </motion.div>
            ))}
          </AnimatePresence>
          {visible.length === 0 && <p className="text-muted-foreground col-span-full rounded-xl border border-dashed p-8 text-center text-[13px]">No roles match. Clear the search or filters.</p>}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div key={selected.id} initial={reduce ? false : { opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
            <Card className="xl:sticky xl:top-20">
              <CardContent className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-[11.5px] font-semibold">Role compatibility analysis</span>
                  <h2 className="text-[20px] font-bold tracking-tight">{selected.title}</h2>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-[12.5px] font-bold">Responsibilities</h3>
                  <ul className="text-muted-foreground list-disc pl-4 text-[12.5px]">{selected.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-[12px] font-bold">Transferable</h3>
                    {selected.transferable.map((item) => <span key={item} className="text-primary flex items-center gap-1.5 text-[12px]"><Check size={12} weight="bold" /> {item}</span>)}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-[12px] font-bold">Still required</h3>
                    {selected.missing.map((item) => <span key={item} className="text-gap flex items-center gap-1.5 text-[12px]"><X size={12} weight="bold" /> {item}</span>)}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-[12.5px] font-bold">Compared with your target</h3>
                  <Compare label={selected.title} value={selected.compatibility} weeks={selected.effortWeeks} />
                  {!selected.isTarget && <Compare label={target.title} value={target.compatibility} weeks={target.effortWeeks} muted />}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" asChild><Link href="/optimizer">Compare pathways <ArrowRight size={13} weight="bold" /></Link></Button>
                  {!selected.isTarget && <Button variant="secondary" size="sm">Set as target</Button>}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <section>
        <SectionHeading title="Future exploration" description="Roles you could grow into after the target, given the skills this path builds." />
        <div className="flex flex-wrap gap-2">
          {["AI Solutions Architect", "Staff Applied AI Engineer", "AI Product Engineer", "Retrieval Specialist"].map((title) => (
            <span key={title} className="bg-raised rounded-full border px-3 py-1.5 text-[12px] font-semibold">{title}</span>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

function Compare({ label, value, weeks, muted }: { label: string; value: number; weeks: number; muted?: boolean }) {
  return (
    <div className={cn("flex flex-col gap-1.5", muted && "opacity-70")}>
      <div className="flex justify-between text-[12px]"><span className="font-semibold">{label}</span><span className="numeric">{value}% ready, {weeks} weeks</span></div>
      <GrowBar value={value} className="h-1.5" />
    </div>
  );
}

export type { RoleOption };
