"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Briefcase, CheckCircle, Circle, Lightning, MapPin } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel } from "@/components/common/carousel";
import { EvidenceBadge } from "@/components/common/evidence";
import { Icon3D } from "@/components/common/icon-3d";
import { CountUp } from "@/components/common/metric";
import { CategoryTile, HeartToggle, PosterCard, TagPill } from "@/components/common/tiles";
import { JourneyFlow } from "@/components/motion/journey-flow";
import { GrowBar, ProgressRing, Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import { PageShell, SectionHeading } from "@/components/shell/page-header";
import { applications, currentWeek, jobs, learner, skills, targetRole } from "@/lib/mock/data";
import { cn } from "@/lib/utils";

const categories = [
  { href: "/tutor", label: "AI Tutor", icon: "tutor" },
  { href: "/plan", label: "Learning Plan", icon: "plan" },
  { href: "/gaps", label: "Skill Gaps", icon: "gaps" },
  { href: "/assessments", label: "Proof Lab", icon: "lab" },
  { href: "/interviews", label: "Mock Interviews", icon: "interview" },
  { href: "/projects", label: "Projects", icon: "projects" },
  { href: "/simulator", label: "Job Shadow", icon: "shadow" },
  { href: "/jobs", label: "Jobs", icon: "jobs" },
  { href: "/twin", label: "Digital Twin", icon: "twin" },
  { href: "/library", label: "Knowledge Vault", icon: "library" },
  { href: "/market", label: "Market Trends", icon: "market" },
] as const;

export function DashboardView() {
  const reduce = useReducedMotion();
  const nextTask = currentWeek.days.find((task) => !task.done);
  const doneTasks = currentWeek.days.filter((task) => task.done).length;
  const gaps = skills.filter((skill) => skill.state === "gap" || skill.state === "transferable").sort((a, b) => b.priority - a.priority);

  return (
    <PageShell className="flex flex-col gap-0 !p-0 overflow-hidden">
      {/* Gradient hero banner — sky-blue sweep like the Unstop reference. */}
      <section className="hero-gradient flex flex-col gap-5 px-6 pt-8 pb-7 sm:px-10 sm:pt-10 sm:pb-8 rounded-t-2xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="text-[34px] leading-[1.08] font-extrabold tracking-tight sm:text-[46px]"
          >
            Unlock Your <span className="text-primary">Career!</span>
          </motion.h1>
          <span className="bg-white/70 border border-white/80 text-foreground/70 inline-flex w-fit items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium shadow-[0_1px_3px_rgb(14_22_50/0.08)]">
            <Lightning size={13} weight="fill" className="text-primary" /> Week {currentWeek.week} of 8 · {targetRole.readiness}% ready for {targetRole.title}
          </span>
        </div>

        <div className="relative">
          <div className="flex snap-x gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((category, index) => (
              <motion.div key={category.href} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 + index * 0.035, duration: 0.38 }}>
                <CategoryTile href={category.href} label={category.label} icon={category.icon} />
              </motion.div>
            ))}
          </div>
          <div aria-hidden="true" className="from-[oklch(0.930_0.048_232)] pointer-events-none absolute top-0 right-0 bottom-1 w-12 bg-gradient-to-l to-transparent" />
        </div>
      </section>

      {/* Content below the hero — white area. */}
      <div className="flex flex-col gap-8 bg-white/95 px-6 pt-8 pb-9 sm:px-10">


      {/* Next action strip. */}
      <Card className="border-tile-border bg-tile/50">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <Icon3D name="laptop" size={60} />
          <div className="min-w-0 flex-1">
            <span className="text-primary text-[12px] font-bold tracking-wide uppercase">Your next action</span>
            <p className="text-[18px] leading-snug font-bold">{nextTask?.title ?? "Week complete"}</p>
            <p className="text-muted-foreground text-[13px]">
              {currentWeek.objective} · {nextTask?.minutes ?? 0} min · {doneTasks} of {currentWeek.days.length} tasks done this week
            </p>
          </div>
          <Button asChild size="lg"><Link href="/plan">Continue <ArrowRight size={16} weight="bold" /></Link></Button>
        </CardContent>
      </Card>

      {/* Featured: continue learning. */}
      <section>
        <SectionHeading title="Continue learning" />
        <Carousel>
          <PosterCard href="/tutor" theme="navy" kicker="AI Tutor · Week 3" headline="RAG architecture: retrieve, then generate" icon="tutor" cta="Resume lesson" footnote="Paused at chapter 2 of 3" tags={["Lecture", "13 min"]} title="RAG Architecture Lecture" />
          <PosterCard href="/plan" theme="paper" kicker="Weekly assignment" headline="Grounded Q&A with citations" icon="notes" cta="Start now" footnote="Due Thursday" tags={["Assignment", "90 min"]} title="Week 3 Assignment" />
          <PosterCard href="/assessments" theme="blue" kicker="Proof-of-Skill Lab" headline="Fix a retriever returning stale chunks" icon="lab" cta="Retest" footnote="Last score 48 · needs work" tags={["Debugging", "40 min"]} title="Debugging Challenge Retest" />
          <PosterCard href="/interviews" theme="lavender" kicker="Mock interview" headline="Technical round for Corvid Systems" icon="interview" cta="Practice now" footnote="Real interview on Nov 4" tags={["Technical", "30 min"]} title="Focused Interview Practice" />
          <PosterCard href="/projects" theme="ink" kicker="Project" headline="docs-copilot: cited answers milestone" icon="projects" cta="Open project" footnote="2 of 5 milestones" tags={["Portfolio", "In progress"]} title="docs-copilot Project" />
          <PosterCard href="/simulator" theme="paper" kicker="Job shadow" headline="The support bot is making things up" icon="shadow" cta="Continue" footnote="With Priya, Engineering Manager" tags={["Simulation", "45 min"]} title="Workplace Simulation" />
        </Carousel>
      </section>

      {/* Progress overview. */}
      <section>
        <SectionHeading title="Your progress" actions={<Button variant="ghost" size="sm" asChild><Link href="/readiness">View report <ArrowRight size={14} /></Link></Button>} />
        <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
          <Card>
            <CardContent className="flex items-center gap-6 p-6">
              <ProgressRing value={targetRole.readiness} size={136} stroke={12} gradientId="dash-ready" label={<span className="numeric text-[30px] font-bold">{targetRole.readiness}%</span>} sublabel="career ready" />
              <div className="flex flex-col gap-3">
                <span className="text-[15px] font-bold">{targetRole.title}</span>
                <span className="text-muted-foreground text-[13px] leading-relaxed">Counted from assessments, projects and interviews only.</span>
                <div className="flex gap-5">
                  <Stat value={skills.filter((s) => s.state === "demonstrated").length} label="Skills proven" />
                  <Stat value={applications.filter((a) => ["applied", "screen", "interview"].includes(a.stage)).length} label="Applications live" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col gap-4 p-6">
              <span className="text-[15px] font-bold">Your journey</span>
              <JourneyFlow current={3} />
              <div className="grid gap-3 pt-2 sm:grid-cols-2">
                {gaps.slice(0, 4).map((skill, index) => (
                  <div key={skill.id} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2"><span className="text-[13px] font-semibold">{skill.label}</span><EvidenceBadge state={skill.state} withIcon={false} /></div>
                    <GrowBar value={skill.priority} delay={index * 0.08} className="h-1.5" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* This week, as a checklist in the reference's flat card style. */}
      <Reveal>
        <SectionHeading title={"This week: " + currentWeek.objective} />
        <Stagger className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {currentWeek.days.map((task) => (
            <StaggerItem key={task.id}>
              <div className={cn("bg-card flex h-full flex-col gap-3 rounded-2xl border p-4 transition-colors", task === nextTask && "border-primary/50 bg-accent/60")}>
                <div className="flex items-center justify-between">
                  <TagPill tone={task === nextTask ? "blue" : "neutral"}>{task.day}</TagPill>
                  {task.done ? <CheckCircle size={20} weight="fill" className="text-primary" /> : <Circle size={20} className="text-muted-foreground" />}
                </div>
                <span className={cn("text-[14px] font-semibold", task.done && "text-muted-foreground line-through")}>{task.title}</span>
                <span className="text-muted-foreground mt-auto text-[12px]">{task.minutes} minutes</span>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Reveal>

      {/* Recommended jobs, styled like the featured cards. */}
      <Reveal>
        <SectionHeading title="Recommended for you" actions={<Button variant="ghost" size="sm" asChild><Link href="/jobs">View all <ArrowRight size={14} /></Link></Button>} />
        <Carousel itemGap={16}>
          {jobs.filter((job) => job.eligible).map((job) => (
            <article key={job.id} className="bg-card flex w-[290px] shrink-0 snap-start flex-col gap-3 rounded-2xl border p-5 shadow-[var(--shadow-panel)] transition-shadow hover:shadow-[var(--shadow-lifted)]">
              <div className="flex items-start justify-between">
                <span className="bg-tile grid size-12 place-items-center rounded-xl"><Icon3D name="company" size={34} /></span>
                <HeartToggle label={job.title} defaultOn={job.bookmarked} />
              </div>
              <div>
                <h3 className="text-[16px] leading-snug font-bold">{job.title}</h3>
                <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-[13px]"><Briefcase size={13} /> {job.company}</p>
                <p className="text-muted-foreground flex items-center gap-1 text-[13px]"><MapPin size={13} /> {job.location}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {job.remote && <TagPill>Remote</TagPill>}
                <TagPill>{job.type === "job" ? "Full time" : job.type === "entry" ? "Entry level" : "Internship"}</TagPill>
                <TagPill tone="blue">{job.match}% match</TagPill>
              </div>
            </article>
          ))}
        </Carousel>
      </Reveal>

      {/* Application status. */}
      <Reveal>
        <SectionHeading title="Applications" actions={<Button variant="ghost" size="sm" asChild><Link href="/applications">Open tracker <ArrowRight size={14} /></Link></Button>} />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {applications.slice(0, 4).map((application) => (
            <div key={application.id} className="bg-card flex items-center gap-3 rounded-2xl border p-4">
              <span className="bg-tile grid size-10 shrink-0 place-items-center rounded-xl"><Icon3D name="applications" size={26} /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold">{application.company}</span>
                <span className="text-muted-foreground block truncate text-[12px]">{application.role}</span>
              </span>
              <StageBadge stage={application.stage} />
            </div>
          ))}
        </div>
        <p className="text-muted-foreground mt-4 text-[12.5px]">Signed in as {learner.name}. Everything here updates as you learn, prove and apply.</p>
      </Reveal>
      </div>
    </PageShell>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col">
      <CountUp value={value} className="text-[24px] font-bold" />
      <span className="text-muted-foreground text-[12px]">{label}</span>
    </div>
  );
}

export function StageBadge({ stage }: { stage: string }) {
  const map: Record<string, { label: string; variant: "primary" | "supported" | "gap" | "neutral" | "demonstrated" | "unknown" }> = {
    saved: { label: "Saved", variant: "neutral" },
    applied: { label: "Applied", variant: "neutral" },
    screen: { label: "Screen", variant: "supported" },
    interview: { label: "Interview", variant: "primary" },
    offer: { label: "Offer", variant: "demonstrated" },
    rejected: { label: "Rejected", variant: "gap" },
    no_response: { label: "No reply", variant: "unknown" },
  };
  const entry = map[stage] ?? map.saved;
  return <Badge variant={entry.variant}>{entry.label}</Badge>;
}
