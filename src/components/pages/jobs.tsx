"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BookmarkSimple, CalendarBlank, Check, Globe, MagnifyingGlass, MapPin, Sparkle, X } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Meter, Ring } from "@/components/system/data";
import { Segmented } from "@/components/system/segmented";
import { useToast } from "@/components/system/toast";
import { PageHeader, PageShell, Rise, Section } from "@/components/shell/page-header";
import { jobs, roleOptions, today } from "@/lib/mock/data";
import type { JobOpportunity } from "@/lib/mock/types";
import { ease, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

const typeLabels = { all: "All", job: "Jobs", entry: "Entry level", internship: "Internships" } as const;

function daysLeft(date: string) {
  return Math.round((new Date(date).getTime() - new Date(today).getTime()) / 86400000);
}

export function JobsView() {
  const reduce = useReducedMotion();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<keyof typeof typeLabels>("all");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [saved, setSaved] = useState<Record<string, boolean>>(() => Object.fromEntries(jobs.map((job) => [job.id, job.bookmarked])));
  const [openId, setOpenId] = useState("jb-1");

  const visible = useMemo(
    () =>
      jobs
        .filter((job) => type === "all" || job.type === type)
        .filter((job) => !remoteOnly || job.remote)
        .filter((job) => (job.title + job.company + job.location).toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => b.match - a.match),
    [query, remoteOnly, type],
  );
  const open = jobs.find((job) => job.id === openId) ?? jobs[0];
  const closing = visible.filter((job) => daysLeft(job.deadline) <= 10).length;

  const toggleSaved = (job: JobOpportunity) => {
    const next = !saved[job.id];
    setSaved((prev) => ({ ...prev, [job.id]: next }));
    toast({ title: next ? "Saved" : "Removed from saved", description: job.title + ", " + job.company, tone: "info" });
  };

  return (
    <PageShell width="wide">
      <PageHeader
        context="Matched against your demonstrated skills"
        title="Roles worth applying to now"
        description="Jobs, internships and entry-level roles ranked by how much of each your evidence already covers, with eligibility and a plain explanation of every match."
      />

      <Rise className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <MagnifyingGlass size={15} className="text-gray-10 pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" />
          <label htmlFor="job-search" className="sr-only">Search jobs</label>
          <Input id="job-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search roles, companies or locations" className="pl-9" />
        </div>
        <Segmented
          label="Opportunity type"
          value={type}
          onChange={setType}
          options={(Object.keys(typeLabels) as (keyof typeof typeLabels)[]).map((key) => ({ value: key, label: typeLabels[key] }))}
        />
        <label className="text-gray-11 flex items-center gap-2 text-[13px] whitespace-nowrap">
          <Globe size={15} /> Remote only <Switch checked={remoteOnly} onCheckedChange={setRemoteOnly} />
        </label>
      </Rise>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-x-8 gap-y-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <Rise className="flex min-w-0 flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <span className="text-[13.5px] font-medium text-foreground tabular">
              {visible.length} {visible.length === 1 ? "match" : "matches"}
            </span>
            {closing > 0 && <span className="text-warning text-[12.5px]">{closing} closing within 10 days</span>}
          </div>

          <motion.ul layout={!reduce} className="flex flex-col gap-2">
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((job) => {
                const days = daysLeft(job.deadline);
                const isOpen = openId === job.id;
                return (
                  <motion.li
                    key={job.id}
                    layout={!reduce}
                    initial={reduce ? false : { opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12 } }}
                    transition={spring.layout}
                    className={cn(
                      "bg-card flex items-center gap-3 rounded-[var(--radius-surface)] border p-3.5 shadow-xs transition-[border-color,box-shadow] duration-200",
                      isOpen ? "border-gray-12 shadow-sm" : "border-border hover:border-border-strong",
                    )}
                  >
                    {/* Selecting and bookmarking are sibling controls: nesting
                        an interactive element inside a button is invalid. */}
                    <button type="button" onClick={() => setOpenId(job.id)} aria-current={isOpen} className="flex min-w-0 flex-1 items-center gap-3.5 text-left outline-none">
                      <Ring value={job.match} size={44} stroke={4} tone={job.match >= 75 ? "brand" : "ink"}>
                        <span className="text-[11.5px] font-semibold tabular">{job.match}</span>
                      </Ring>
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="truncate text-[14px] font-medium text-foreground">{job.title}</span>
                        <span className="text-gray-10 flex items-center gap-1 truncate text-[12.5px]">
                          <MapPin size={12} className="shrink-0" /> {job.company} · {job.location}
                        </span>
                        <span className="flex flex-wrap gap-1">
                          <Badge variant="neutral">{typeLabels[job.type]}</Badge>
                          {!job.eligible && <Badge variant="danger">Not eligible</Badge>}
                          <Badge variant={days <= 10 ? "warning" : "neutral"}><CalendarBlank /> {days} days left</Badge>
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-pressed={Boolean(saved[job.id])}
                      aria-label={(saved[job.id] ? "Remove bookmark for " : "Bookmark ") + job.title}
                      onClick={() => toggleSaved(job)}
                      className="text-gray-10 hover:bg-gray-3 hover:text-foreground grid size-8 shrink-0 place-items-center rounded-md transition-colors"
                    >
                      <motion.span key={String(saved[job.id])} initial={reduce ? false : { scale: 0.5 }} animate={{ scale: 1 }} transition={spring.snappy}>
                        <BookmarkSimple size={17} weight={saved[job.id] ? "fill" : "regular"} className={saved[job.id] ? "text-brand" : undefined} />
                      </motion.span>
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ul>

          {visible.length === 0 && (
            <div className="rounded-[var(--radius-surface)] border border-dashed border-border-strong px-6 py-12 text-center">
              <p className="text-[13.5px] font-medium text-foreground">No matches for these filters</p>
              <p className="text-gray-10 mt-1 text-[12.5px]">Widen the type, or turn off remote only.</p>
            </div>
          )}
        </Rise>

        <Rise className="xl:sticky xl:top-[72px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={open.id}
              initial={reduce ? false : { opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              transition={{ duration: 0.28, ease: ease.out }}
            >
              <JobDetail job={open} />
            </motion.div>
          </AnimatePresence>
        </Rise>
      </div>

      <Section title="Adjacent roles worth watching" description="Where your proven skills already cover more of the requirements.">
        <div className="flex flex-wrap gap-2">
          {roleOptions.filter((role) => !role.isTarget).slice(0, 4).map((role) => (
            <span key={role.id} className="bg-card flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-[13px] text-foreground shadow-xs">
              {role.title}
              <span className="text-gray-10 tabular">{role.compatibility}%</span>
            </span>
          ))}
        </div>
      </Section>
    </PageShell>
  );
}

function JobDetail({ job }: { job: JobOpportunity }) {
  const { toast } = useToast();
  const total = job.matchedSkills.length + job.missingSkills.length;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-1.5 p-5">
        <span className="text-gray-10 text-[12.5px]">{job.company} · {job.location}{job.remote ? ", remote" : ""}</span>
        <h2 className="text-[20px] leading-tight font-semibold tracking-[-0.02em] text-foreground">{job.title}</h2>
      </div>

      <div className="bg-gray-2 flex gap-3 border-y border-border p-5">
        <Sparkle size={16} weight="fill" className="text-brand mt-0.5 shrink-0" />
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-medium text-foreground">Why this matches you</span>
          <p className="text-gray-11 text-[13.5px] leading-relaxed">{job.why}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-5">
        <div className="flex justify-between text-[12.5px]">
          <span className="text-gray-11">Skills covered</span>
          <span className="text-foreground tabular">{job.matchedSkills.length} of {total}</span>
        </div>
        <Meter value={job.matchedSkills.length} max={total} label="Skills covered" />
      </div>

      <div className="grid grid-cols-2 border-t border-border">
        <div className="flex flex-col gap-2 border-r border-border p-5">
          <span className="text-gray-11 text-[12.5px] font-medium">You have</span>
          {job.matchedSkills.map((skill) => (
            <span key={skill} className="flex items-center gap-1.5 text-[13px] text-foreground">
              <Check size={13} weight="bold" className="text-success shrink-0" /> {skill}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-2 p-5">
          <span className="text-gray-11 text-[12.5px] font-medium">Missing</span>
          {job.missingSkills.length ? (
            job.missingSkills.map((skill) => (
              <span key={skill} className="flex items-center gap-1.5 text-[13px] text-foreground">
                <X size={13} weight="bold" className="text-danger shrink-0" /> {skill}
              </span>
            ))
          ) : (
            <span className="text-gray-10 text-[13px]">Nothing. Full coverage.</span>
          )}
        </div>
      </div>

      <div className={cn("flex items-center gap-2.5 border-t border-border px-5 py-3.5 text-[13px]", job.eligible ? "text-foreground" : "bg-danger-soft/60 text-foreground")}>
        {job.eligible ? <Check size={15} weight="bold" className="text-success" /> : <X size={15} weight="bold" className="text-danger" />}
        {job.eligible ? "You meet the stated requirements." : "You do not meet a hard requirement for this posting."}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border px-5 py-3">
        <Button size="sm" disabled={!job.eligible} onClick={() => toast({ title: "Added to your pipeline", description: job.company + ", " + job.title })}>
          Track application
        </Button>
        <Button variant="ghost" size="sm">Analyse full posting</Button>
      </div>
    </Card>
  );
}
