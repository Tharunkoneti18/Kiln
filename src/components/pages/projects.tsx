"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Check,
  Copy,
  FileText,
  GithubLogo,
  PresentationChart,
  RocketLaunch,
  Sparkle,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Meter, Ring } from "@/components/system/data";
import { useToast } from "@/components/system/toast";
import { PageHeader, PageShell, Rise } from "@/components/shell/page-header";
import { projects, skillById, skills } from "@/lib/mock/data";
import type { Project } from "@/lib/mock/types";
import { ease, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function ProjectsView() {
  const reduce = useReducedMotion();
  const { toast } = useToast();
  const [openId, setOpenId] = useState("pj-2");
  const [dismissed, setDismissed] = useState<string[]>([]);
  const active = projects.filter((project) => project.status !== "recommended");
  const recommended = projects.filter((project) => project.status === "recommended" && !dismissed.includes(project.id));
  const open = projects.find((project) => project.id === openId)!;
  const evidenceSkills = skills.filter((skill) => active.some((project) => project.skillIds.includes(skill.id)));

  return (
    <PageShell>
      <PageHeader
        context="Portfolio work matched to your gaps"
        title="Build the proof"
        description="Projects chosen to close specific gaps, broken into milestones, and linked to GitHub so finished work becomes evidence."
        actions={
          <Button variant="secondary" onClick={() => toast({ title: "Generating suggestions", description: "New projects will appear under Recommended.", tone: "info" })}>
            <Sparkle weight="fill" className="text-brand" /> Suggest a project
          </Button>
        }
      />

      <Rise>
        <Tabs defaultValue="portfolio" variant="underline" className="flex flex-col gap-8">
          <TabsList>
            <TabsTrigger value="portfolio">In progress <span className="text-gray-10 tabular">{active.length}</span></TabsTrigger>
            <TabsTrigger value="recommended">Recommended <span className="text-gray-10 tabular">{recommended.length}</span></TabsTrigger>
            <TabsTrigger value="evidence">Evidence map</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="grid grid-cols-[minmax(0,1fr)] items-start gap-x-8 gap-y-8 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.3fr)]">
            <div className="flex flex-col gap-3">
              {active.map((project) => (
                <ProjectRow key={project.id} project={project} active={openId === project.id} onClick={() => setOpenId(project.id)} />
              ))}
              <p className="text-gray-10 mt-2 text-[12.5px] leading-relaxed">
                Linked repositories are checked when you mark a milestone done. Passing evaluation moves the project&rsquo;s skills from claimed to demonstrated.
              </p>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={open.id}
                initial={reduce ? false : { opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                transition={{ duration: 0.28, ease: ease.out }}
                className="xl:sticky xl:top-[72px]"
              >
                <ProjectDetail project={open} />
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="recommended">
            {recommended.length === 0 ? (
              <div className="rounded-[var(--radius-surface)] border border-dashed border-border-strong px-6 py-14 text-center">
                <p className="text-[14px] font-medium text-foreground">No recommendations left</p>
                <p className="text-gray-10 mt-1 text-[13px]">Ask for a suggestion and new projects matched to your gaps will appear here.</p>
              </div>
            ) : (
              <motion.ul layout={!reduce} className="grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-2">
                <AnimatePresence mode="popLayout" initial={false}>
                  {recommended.map((project) => (
                    <motion.li
                      key={project.id}
                      layout={!reduce}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, transition: { duration: 0.16 } }}
                      transition={spring.layout}
                    >
                      <Card className="flex h-full flex-col gap-3.5 p-5">
                        <div className="flex items-center justify-between gap-3">
                          <Badge variant="brand"><Sparkle weight="fill" /> Closes {project.skillIds.length} gaps</Badge>
                          <span className="text-gray-10 text-[12px] tabular">{project.milestones.length} milestones</span>
                        </div>
                        <h3 className="text-[16px] leading-snug font-medium text-foreground">{project.title}</h3>
                        <p className="text-gray-11 text-[13.5px] leading-relaxed">{project.summary}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {project.skillIds.map((id) => {
                            const skill = skillById(id);
                            return skill ? <Badge key={id} variant={skill.state}>{skill.label}</Badge> : null;
                          })}
                        </div>
                        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3.5">
                          <span className="text-gray-10 truncate text-[12px]">{project.architecture.join(" → ")}</span>
                          <div className="flex shrink-0 gap-1.5">
                            <Button size="sm" variant="ghost" onClick={() => setDismissed((all) => [...all, project.id])}>Dismiss</Button>
                            <Button size="sm" onClick={() => toast({ title: "Project started", description: project.title + " added to your portfolio." })}>Start</Button>
                          </div>
                        </div>
                      </Card>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            )}
          </TabsContent>

          <TabsContent value="evidence">
            <Card className="overflow-hidden">
              <div className="text-gray-10 grid grid-cols-[minmax(140px,220px)_minmax(0,1fr)] gap-4 border-b border-border px-5 py-2.5 text-[12px]">
                <span>Skill</span>
                <span>Proven by</span>
              </div>
              <ul className="divide-y divide-border">
                {evidenceSkills.map((skill) => (
                  <li key={skill.id} className="grid grid-cols-[minmax(140px,220px)_minmax(0,1fr)] items-center gap-4 px-5 py-3.5">
                    <span className="text-[13.5px] text-foreground">{skill.label}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {active.filter((project) => project.skillIds.includes(skill.id)).map((project) => (
                        <Badge key={project.id} variant={project.status === "completed" ? "success" : "neutral"}>
                          {project.status === "completed" && <Check weight="bold" />}
                          {project.title}
                        </Badge>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </TabsContent>
        </Tabs>
      </Rise>
    </PageShell>
  );
}

function ProjectDetail({ project }: { project: Project }) {
  const reduce = useReducedMotion();
  const { toast } = useToast();
  const [readme, setReadme] = useState<"idle" | "writing" | "done">("idle");
  const done = project.milestones.filter((milestone) => milestone.done).length;
  const markdown = "# " + project.title + "\n\n" + project.summary + "\n\n## Architecture\n" + project.architecture.map((part) => "- " + part).join("\n");

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={project.status === "completed" ? "success" : "brand"}>{project.status === "completed" ? "Shipped" : "In progress"}</Badge>
            {project.repo && (
              <span className="text-gray-10 flex items-center gap-1.5 font-mono text-[12px]">
                <GithubLogo size={13} /> {project.repo}
              </span>
            )}
          </div>
          <h2 className="text-[19px] leading-tight font-semibold tracking-[-0.02em] text-foreground">{project.title}</h2>
          <p className="text-gray-11 text-[13.5px] leading-relaxed">{project.summary}</p>
        </div>
        {project.evaluation !== undefined && (
          <div className="flex shrink-0 flex-col items-center gap-1">
            <Ring value={project.evaluation} size={54} stroke={5} tone="success">
              <span className="text-[13px] font-semibold tabular">{project.evaluation}</span>
            </Ring>
            <span className="text-gray-10 text-[11px]">Evaluation</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-border p-5">
        <div className="flex items-center justify-between">
          <span className="text-gray-11 text-[12.5px] font-medium">Milestones</span>
          <span className="text-gray-10 text-[12.5px] tabular">{done} of {project.milestones.length}</span>
        </div>
        <ol className="flex flex-col">
          {project.milestones.map((milestone, index) => (
            <motion.li
              key={milestone.label}
              initial={reduce ? false : { opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3, ease: ease.out }}
              className="relative flex items-center gap-3 py-2"
            >
              {index < project.milestones.length - 1 && (
                <span className={cn("absolute top-[26px] left-[8.5px] h-[calc(100%-14px)] w-px", milestone.done ? "bg-gray-12" : "bg-border")} aria-hidden="true" />
              )}
              <span className={cn("relative grid size-[18px] shrink-0 place-items-center rounded-full", milestone.done ? "bg-gray-12 text-gray-1" : "border-border-strong bg-card border")}>
                {milestone.done && <Check size={10} weight="bold" />}
              </span>
              <span className={cn("text-[13.5px]", milestone.done ? "text-gray-10" : "text-foreground")}>{milestone.label}</span>
            </motion.li>
          ))}
        </ol>
      </div>

      <div className="flex flex-col gap-3 border-t border-border p-5">
        <span className="text-gray-11 text-[12.5px] font-medium">Architecture</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {project.architecture.map((part, index) => (
            <motion.span
              key={part}
              className="flex items-center gap-1.5"
              initial={reduce ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.06, duration: 0.3, ease: ease.out }}
            >
              <span className="bg-gray-2 rounded-[7px] border border-border px-2.5 py-1 font-mono text-[12px] text-foreground">{part}</span>
              {index < project.architecture.length - 1 && <ArrowRight size={12} className="text-gray-8" />}
            </motion.span>
          ))}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {readme !== "idle" && (
          <motion.div
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: ease.out }}
            className="overflow-hidden"
          >
            <div className="border-t border-border p-5">
              <div className="bg-gray-2 overflow-hidden rounded-[10px] border border-border">
                <div className="flex items-center justify-between border-b border-border px-3.5 py-2">
                  <span className="text-gray-10 font-mono text-[12px]">README.md</span>
                  {readme === "done" ? (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => {
                        navigator.clipboard?.writeText(markdown).catch(() => {});
                        toast({ title: "README copied" });
                      }}
                    >
                      <Copy /> Copy
                    </Button>
                  ) : (
                    <span className="text-shimmer text-[12px]">Writing</span>
                  )}
                </div>
                <pre className="overflow-x-auto p-3.5 font-mono text-[12px] leading-relaxed text-foreground">
                  {readme === "done" ? markdown : "# " + project.title}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center gap-2 border-t border-border px-5 py-3">
        <Button
          size="sm"
          variant="secondary"
          loading={readme === "writing"}
          onClick={() => {
            setReadme("writing");
            window.setTimeout(() => setReadme("done"), 1100);
          }}
        >
          {readme !== "writing" && <FileText />} Generate README
        </Button>
        <Button size="sm" variant="ghost"><RocketLaunch /> Deploy guide</Button>
        <Button size="sm" variant="ghost"><PresentationChart /> Prepare to present</Button>
      </div>
    </Card>
  );
}

function ProjectRow({ project, active, onClick }: { project: Project; active: boolean; onClick: () => void }) {
  const done = project.milestones.filter((milestone) => milestone.done).length;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "bg-card flex w-full flex-col gap-3 rounded-[var(--radius-surface)] border p-4 text-left shadow-xs transition-[border-color,box-shadow] duration-200",
        active ? "border-gray-12 shadow-sm" : "border-border hover:border-border-strong",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-[14px] font-medium text-foreground">{project.title}</span>
        <Badge variant={project.status === "completed" ? "success" : "brand"}>{project.status === "completed" ? "Shipped" : "In progress"}</Badge>
      </div>
      <Meter value={done} max={project.milestones.length} size="sm" tone={project.status === "completed" ? "success" : "brand"} label="Milestones done" />
      <span className="text-gray-10 text-[12px] tabular">
        {done} of {project.milestones.length} milestones
      </span>
    </button>
  );
}
