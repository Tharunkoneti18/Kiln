"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BookmarkSimple, CalendarBlank, Check, Globe, MagnifyingGlass, MapPin, Sparkle, X } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { GrowBar, ProgressRing } from "@/components/motion/primitives";
import { PageHeader, PageShell, SectionHeading } from "@/components/shell/page-header";
import { jobs, roleOptions, today } from "@/lib/mock/data";
import type { JobOpportunity } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

const typeLabels = { all: "All", job: "Jobs", entry: "Entry level", internship: "Internships" } as const;

function daysLeft(date: string) {
  return Math.round((new Date(date).getTime() - new Date(today).getTime()) / 86400000);
}

export function JobsView() {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<keyof typeof typeLabels>("all");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [saved, setSaved] = useState<Record<string, boolean>>(() => Object.fromEntries(jobs.map((job) => [job.id, job.bookmarked])));
  const [openId, setOpenId] = useState("jb-1");

  const visible = useMemo(() => jobs
    .filter((job) => type === "all" || job.type === type)
    .filter((job) => !remoteOnly || job.remote)
    .filter((job) => (job.title + job.company + job.location).toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => b.match - a.match), [query, remoteOnly, type]);
  const open = jobs.find((job) => job.id === openId) ?? jobs[0];

  return (
    <PageShell className="flex flex-col gap-6">
      <PageHeader
        icon="jobs"
        context="Matched against demonstrated skills"
        title="Job Discovery and Opportunity Radar"
        description="Jobs, internships and entry-level roles matched to what you have proven, with the skill comparison, eligibility and a plain explanation behind every match."
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <MagnifyingGlass size={15} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
          <label htmlFor="job-search" className="sr-only">Search jobs</label>
          <Input id="job-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search roles, companies or locations" className="h-10 pl-9" />
        </div>
        <div className="bg-raised flex rounded-md p-1">
          {(Object.keys(typeLabels) as (keyof typeof typeLabels)[]).map((key) => (
            <button key={key} type="button" onClick={() => setType(key)} aria-pressed={type === key} className="relative rounded-[6px] px-3 py-1.5 text-[12px] font-semibold">
              {type === key && <motion.span layoutId="job-type" className="bg-card absolute inset-0 rounded-[6px] shadow-sm" />}
              <span className={cn("relative", type === key ? "text-foreground" : "text-muted-foreground")}>{typeLabels[key]}</span>
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-[12.5px] font-semibold"><Globe size={14} /> Remote only <Switch checked={remoteOnly} onCheckedChange={setRemoteOnly} /></label>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1.1fr]">
        <motion.div layout className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {visible.map((job) => (
              <motion.button layout key={job.id} type="button" onClick={() => setOpenId(job.id)}
                initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
                className={cn("bg-card flex items-center gap-4 rounded-xl border p-4 text-left transition-all", openId === job.id ? "border-primary ring-primary/20 ring-2" : "hover:border-primary/40")}>
                <ProgressRing value={job.match} size={52} stroke={5} gradientId={"jm-" + job.id} label={<span className="numeric text-[12px] font-bold">{job.match}</span>} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-bold">{job.title}</span>
                  <span className="text-muted-foreground flex items-center gap-1 text-[11.5px]"><MapPin size={11} /> {job.company}, {job.location}{job.remote ? ", remote" : ""}</span>
                  <span className="mt-1 flex flex-wrap gap-1">
                    <Badge variant="neutral">{typeLabels[job.type]}</Badge>
                    {!job.eligible && <Badge variant="gap">Not eligible</Badge>}
                    <Badge variant={daysLeft(job.deadline) <= 10 ? "transferable" : "neutral"}><CalendarBlank /> {daysLeft(job.deadline)} days</Badge>
                  </span>
                </span>
                <span role="button" tabIndex={0} aria-label={(saved[job.id] ? "Remove bookmark for " : "Bookmark ") + job.title}
                  onClick={(event) => { event.stopPropagation(); setSaved((prev) => ({ ...prev, [job.id]: !prev[job.id] })); }}
                  onKeyDown={(event) => { if (event.key === "Enter") { event.stopPropagation(); setSaved((prev) => ({ ...prev, [job.id]: !prev[job.id] })); } }}
                  className="hover:bg-raised grid size-8 place-items-center rounded-md">
                  <motion.span key={String(saved[job.id])} initial={reduce ? false : { scale: 0.4 }} animate={{ scale: 1 }}><BookmarkSimple size={17} weight={saved[job.id] ? "fill" : "regular"} className={saved[job.id] ? "text-primary" : "text-muted-foreground"} /></motion.span>
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
          {visible.length === 0 && <p className="text-muted-foreground rounded-xl border border-dashed p-8 text-center text-[13px]">No opportunities match these filters.</p>}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div key={open.id} initial={reduce ? false : { opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <JobDetail job={open} />
          </motion.div>
        </AnimatePresence>
      </div>

      <section>
        <SectionHeading title="Adjacent roles worth watching" description="Roles where your proven skills already cover more of the requirements." />
        <div className="flex flex-wrap gap-2">
          {roleOptions.filter((role) => !role.isTarget).slice(0, 4).map((role) => (
            <span key={role.id} className="bg-card flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-semibold">{role.title}<span className="numeric text-primary">{role.compatibility}%</span></span>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

function JobDetail({ job }: { job: JobOpportunity }) {
  const total = job.matchedSkills.length + job.missingSkills.length;
  return (
    <Card className="xl:sticky xl:top-20"><CardContent className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <span className="text-muted-foreground text-[12px] font-semibold">{job.company}</span>
        <h2 className="text-[20px] font-bold tracking-tight">{job.title}</h2>
      </div>
      <div className="border-glow bg-card rounded-lg p-3.5">
        <span className="flex items-center gap-1.5 text-[12px] font-bold"><Sparkle size={13} weight="fill" className="text-primary" /> Why this matches you</span>
        <p className="mt-1 text-[12.5px] leading-relaxed">{job.why}</p>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-[12.5px]"><span className="font-bold">Resume-to-job alignment</span><span className="numeric font-bold">{job.matchedSkills.length}/{total} skills</span></div>
        <GrowBar value={(job.matchedSkills.length / total) * 100} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5"><span className="text-[12px] font-bold">You have</span>{job.matchedSkills.map((skill) => <span key={skill} className="text-primary flex items-center gap-1.5 text-[12px]"><Check size={12} weight="bold" /> {skill}</span>)}</div>
        <div className="flex flex-col gap-1.5"><span className="text-[12px] font-bold">Missing</span>{job.missingSkills.length ? job.missingSkills.map((skill) => <span key={skill} className="text-gap flex items-center gap-1.5 text-[12px]"><X size={12} weight="bold" /> {skill}</span>) : <span className="text-muted-foreground text-[12px]">Nothing</span>}</div>
      </div>
      <div className={cn("rounded-md p-3 text-[12.5px]", job.eligible ? "bg-primary/8" : "bg-gap/8")}>
        <b>Eligibility: </b>{job.eligible ? "You meet the stated requirements." : "You do not meet a hard requirement for this posting."}
      </div>
      <div className="flex flex-wrap gap-2"><Button size="sm" disabled={!job.eligible}>Track application</Button><Button variant="secondary" size="sm">Analyse full description</Button></div>
    </CardContent></Card>
  );
}
