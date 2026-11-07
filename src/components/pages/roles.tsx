"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, MagnifyingGlass, Target, TrendDown, TrendUp, X } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Meter, Ring } from "@/components/system/data";
import { Segmented } from "@/components/system/segmented";
import { useToast } from "@/components/system/toast";
import { PageHeader, PageShell, Rise, Section } from "@/components/shell/page-header";
import { roleOptions } from "@/lib/mock/data";
import type { RoleOption } from "@/lib/mock/types";
import { ease, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

const levelOptions = [
  { value: "all", label: "All levels" },
  { value: "internship", label: "Internship" },
  { value: "entry", label: "Entry" },
  { value: "experienced", label: "Experienced" },
] as const;

const levelLabel = { internship: "Internship", entry: "Entry level", experienced: "Experienced" } as const;

export function RolesView() {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<(typeof levelOptions)[number]["value"]>("all");
  const [industry, setIndustry] = useState("All");
  const [selectedId, setSelectedId] = useState("ai-automation-engineer");
  const industries = ["All", ...new Set(roleOptions.map((role) => role.industry))];

  const visible = useMemo(
    () =>
      roleOptions
        .filter((role) => level === "all" || role.level === level)
        .filter((role) => industry === "All" || role.industry === industry)
        .filter((role) => role.title.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => b.compatibility - a.compatibility),
    [industry, level, query],
  );
  const selected = roleOptions.find((role) => role.id === selectedId) ?? roleOptions[0];
  const target = roleOptions.find((role) => role.isTarget)!;

  return (
    <PageShell>
      <PageHeader
        context="Ranked by proven skill overlap"
        title="Roles you can realistically reach"
        description="Every role is scored by how much of it your evidence already covers. Compare what transfers, what is missing, and how long the bridge takes."
      />

      <Rise className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <MagnifyingGlass size={15} className="text-gray-10 pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" />
            <label htmlFor="role-search" className="sr-only">Search roles</label>
            <Input id="role-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search roles" className="pl-9" />
          </div>
          <Segmented label="Level" value={level} onChange={setLevel} options={levelOptions} />
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Industry">
          {industries.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setIndustry(option)}
              aria-pressed={industry === option}
              className={cn(
                "h-7 rounded-full border px-3 text-[12.5px] transition-colors",
                industry === option ? "bg-gray-12 border-gray-12 text-gray-1" : "text-gray-11 border-border hover:border-border-strong hover:text-foreground",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </Rise>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-x-8 gap-y-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Rise className="min-w-0">
          <motion.ul layout={!reduce} className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((role) => {
                const isSelected = role.id === selectedId;
                return (
                  <motion.li
                    key={role.id}
                    layout={!reduce}
                    initial={reduce ? false : { opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.12 } }}
                    transition={spring.layout}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedId(role.id)}
                      aria-pressed={isSelected}
                      className={cn(
                        "bg-card relative flex h-full w-full flex-col gap-3 rounded-[var(--radius-surface)] border p-4 text-left shadow-xs transition-[border-color,box-shadow] duration-200 outline-none",
                        isSelected ? "border-gray-12 shadow-sm" : "border-border hover:border-border-strong focus-visible:border-border-strong",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <span className="text-[14.5px] leading-snug font-medium text-foreground">{role.title}</span>
                          <span className="text-gray-10 text-[12px]">
                            {levelLabel[role.level]} · {role.industry}
                          </span>
                        </div>
                        <Ring value={role.compatibility} size={42} stroke={4} tone={role.isTarget ? "brand" : "ink"}>
                          <span className="text-[11px] font-semibold tabular">{role.compatibility}</span>
                        </Ring>
                      </div>
                      <p className="text-gray-11 line-clamp-2 text-[13px] leading-relaxed">{role.summary}</p>
                      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
                        {role.isTarget && (
                          <Badge variant="brand">
                            <Target weight="fill" /> Your target
                          </Badge>
                        )}
                        <Badge variant="neutral">{role.effortWeeks} weeks to bridge</Badge>
                        <TrendBadge trend={role.demandTrend} />
                      </div>
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ul>
          {visible.length === 0 && (
            <div className="rounded-[var(--radius-surface)] border border-dashed border-border-strong px-6 py-12 text-center">
              <p className="text-[13.5px] font-medium text-foreground">No roles match these filters</p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setLevel("all");
                  setIndustry("All");
                }}
                className="mt-2 text-[13px] text-foreground underline underline-offset-4"
              >
                Clear filters
              </button>
            </div>
          )}
        </Rise>

        <Rise className="xl:sticky xl:top-[72px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={selected.id}
              initial={reduce ? false : { opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              transition={{ duration: 0.28, ease: ease.out }}
            >
              <RoleDetail role={selected} target={target} />
            </motion.div>
          </AnimatePresence>
        </Rise>
      </div>

      <Section title="Where this leads" description="Senior roles that open up once your target role's skills are proven.">
        <div className="flex flex-wrap gap-2">
          {["AI Solutions Architect", "Staff Applied AI Engineer", "AI Product Systems Engineer", "Retrieval Infrastructure Specialist"].map((title) => (
            <span key={title} className="bg-card text-gray-11 rounded-full border border-border px-3.5 py-1.5 text-[13px] shadow-xs">
              {title}
            </span>
          ))}
        </div>
      </Section>
    </PageShell>
  );
}

function TrendBadge({ trend }: { trend: RoleOption["demandTrend"] }) {
  if (trend === "rising") return <Badge variant="success"><TrendUp /> Rising demand</Badge>;
  if (trend === "cooling") return <Badge variant="neutral"><TrendDown /> Cooling</Badge>;
  return null;
}

function RoleDetail({ role, target }: { role: RoleOption; target: RoleOption }) {
  const { toast } = useToast();
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-2 p-5">
        <span className="text-gray-10 text-[12px]">
          {levelLabel[role.level]} · {role.industry}
        </span>
        <h2 className="text-[19px] leading-tight font-semibold tracking-[-0.02em] text-foreground">{role.title}</h2>
        <p className="text-gray-11 text-[13.5px] leading-relaxed">{role.summary}</p>
      </div>

      <div className="flex flex-col gap-2.5 border-t border-border p-5">
        <span className="text-gray-11 text-[12.5px] font-medium">What you would do</span>
        <ol className="flex flex-col gap-2">
          {role.responsibilities.map((item, index) => (
            <li key={item} className="flex gap-3 text-[13.5px] leading-relaxed text-foreground">
              <span className="text-gray-9 w-4 shrink-0 tabular">{index + 1}</span>
              {item}
            </li>
          ))}
        </ol>
      </div>

      <div className="grid grid-cols-2 border-t border-border">
        <div className="flex flex-col gap-2 border-r border-border p-5">
          <span className="text-gray-11 text-[12.5px] font-medium">Already transfers</span>
          {role.transferable.map((item) => (
            <span key={item} className="flex items-start gap-1.5 text-[13px] text-foreground">
              <Check size={13} weight="bold" className="text-success mt-[3px] shrink-0" /> {item}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-2 p-5">
          <span className="text-gray-11 text-[12.5px] font-medium">Still missing</span>
          {role.missing.map((item) => (
            <span key={item} className="flex items-start gap-1.5 text-[13px] text-foreground">
              <X size={13} weight="bold" className="text-danger mt-[3px] shrink-0" /> {item}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-border p-5">
        <span className="text-gray-11 text-[12.5px] font-medium">Effort compared</span>
        <Compare label={role.title} value={role.compatibility} weeks={role.effortWeeks} highlight />
        {!role.isTarget && <Compare label={target.title + " (target)"} value={target.compatibility} weeks={target.effortWeeks} />}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border px-5 py-3">
        <Button asChild size="sm">
          <Link href="/optimizer">
            Simulate the route <ArrowRight />
          </Link>
        </Button>
        {!role.isTarget && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toast({ title: "Target role updated", description: role.title + " is now your target. Your plan will recalibrate." })}
          >
            Make this my target
          </Button>
        )}
      </div>
    </Card>
  );
}

function Compare({ label, value, weeks, highlight }: { label: string; value: number; weeks: number; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between gap-3 text-[12.5px]">
        <span className={cn("truncate", highlight ? "font-medium text-foreground" : "text-gray-11")}>{label}</span>
        <span className="text-gray-10 shrink-0 tabular">
          {value}% · {weeks} wks
        </span>
      </div>
      <Meter value={value} tone={highlight ? "brand" : "muted"} label={label + " readiness"} />
    </div>
  );
}

export type { RoleOption };
