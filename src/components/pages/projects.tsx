"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CheckCircle, Circle, FileText, GithubLogo, PresentationChart, RocketLaunch, Sparkle, TreeStructure } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GrowBar, ProgressRing, SpotlightCard, Stagger, StaggerItem, ThinkingDots } from "@/components/motion/primitives";
import { PageHeader, PageShell, SectionHeading } from "@/components/shell/page-header";
import { projects, skillById, skills } from "@/lib/mock/data";
import type { Project } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

export function ProjectsView() {
  const reduce = useReducedMotion();
  const [openId, setOpenId] = useState("pj-2");
  const [readme, setReadme] = useState<"idle" | "writing" | "done">("idle");
  const open = projects.find((project) => project.id === openId)!;
  const evidenceSkills = skills.filter((skill) => projects.some((project) => project.status !== "recommended" && project.skillIds.includes(skill.id)));

  return (
    <PageShell className="flex flex-col gap-7">
      <PageHeader
        icon="projects"
        context="Learning turned into demonstrable work"
        title="Project and Portfolio Builder"
        description="Projects matched to your skill gaps, broken into milestones with an architecture and guidance, connected to GitHub and evaluated so each one becomes evidence."
        actions={<Button size="sm"><Sparkle size={13} weight="fill" /> Suggest a project</Button>}
      />

      <Tabs defaultValue="portfolio" className="flex flex-col gap-5">
        <TabsList className="self-start">
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="recommended">Recommended for your gaps</TabsTrigger>
          <TabsTrigger value="evidence">Skill evidence map</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio">
          <div className="grid gap-5 xl:grid-cols-[1fr_1.3fr]">
            <Stagger className="flex flex-col gap-3">
              {projects.filter((project) => project.status !== "recommended").map((project) => (
                <StaggerItem key={project.id}>
                  <ProjectRow project={project} active={openId === project.id} onClick={() => setOpenId(project.id)} />
                </StaggerItem>
              ))}
            </Stagger>

            <AnimatePresence mode="wait">
              <motion.div key={open.id} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <Card><CardContent className="flex flex-col gap-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <h2 className="numeric text-[19px] font-bold">{open.title}</h2>
                      {open.repo && <span className="text-muted-foreground flex items-center gap-1.5 text-[12px]"><GithubLogo size={13} /> {open.repo}</span>}
                    </div>
                    {open.evaluation !== undefined ? <ProgressRing value={open.evaluation} size={64} stroke={6} gradientId={"ev-" + open.id} label={<span className="numeric text-[14px] font-bold">{open.evaluation}</span>} /> : <Badge variant="primary">In progress</Badge>}
                  </div>
                  <p className="text-muted-foreground text-[13px]">{open.summary}</p>

                  <div className="flex flex-col gap-2">
                    <h3 className="text-[12.5px] font-bold">Milestones and task breakdown</h3>
                    <ol className="relative flex flex-col gap-2.5 border-l pl-5">
                      {open.milestones.map((milestone, index) => (
                        <motion.li key={milestone.label} initial={reduce ? false : { opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.06 }} className="relative text-[12.5px]">
                          <span className="bg-card absolute top-0.5 -left-[27px]">{milestone.done ? <CheckCircle size={15} weight="fill" className="text-primary" /> : <Circle size={15} className="text-muted-foreground" />}</span>
                          <span className={cn(milestone.done && "text-muted-foreground line-through")}>{milestone.label}</span>
                        </motion.li>
                      ))}
                    </ol>
                  </div>

                  <div className="flex flex-col gap-2">
                    <h3 className="flex items-center gap-1.5 text-[12.5px] font-bold"><TreeStructure size={14} className="text-primary" /> Suggested architecture</h3>
                    <div className="flex flex-wrap items-center gap-1.5">{open.architecture.map((part, index) => <span key={part} className="flex items-center gap-1.5"><span className="bg-raised rounded-md border px-2.5 py-1 text-[12px] font-semibold">{part}</span>{index < open.architecture.length - 1 && <span className="text-muted-foreground">to</span>}</span>)}</div>
                  </div>

                  <div className="flex flex-wrap gap-2 border-t pt-4">
                    <Button size="sm" variant="secondary" onClick={() => { setReadme("writing"); window.setTimeout(() => setReadme("done"), 1500); }}><FileText size={13} /> Generate README</Button>
                    <Button size="sm" variant="secondary"><RocketLaunch size={13} /> Deployment guide</Button>
                    <Button size="sm" variant="secondary"><PresentationChart size={13} /> Presentation prep</Button>
                  </div>
                  {readme === "writing" && <span className="flex items-center gap-2 text-[12px]"><ThinkingDots /><span className="text-shimmer font-semibold">Reading the repository</span></span>}
                  {readme === "done" && <motion.pre initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="bg-raised numeric overflow-x-auto rounded-lg p-3 text-[11.5px] leading-relaxed">{"# " + open.title + "\n\n" + open.summary + "\n\n## Stack\n" + open.architecture.map((part) => "- " + part).join("\n")}</motion.pre>}
                </CardContent></Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="recommended">
          <div className="grid gap-4 md:grid-cols-2">
            {projects.filter((project) => project.status === "recommended").map((project) => (
              <SpotlightCard key={project.id}>
                <div className="flex flex-col gap-3 p-5">
                  <Badge variant="supported" className="self-start"><Sparkle weight="fill" /> Matched to {project.skillIds.length} gaps</Badge>
                  <span className="text-[15px] font-bold">{project.title}</span>
                  <p className="text-muted-foreground text-[12.5px] leading-relaxed">{project.summary}</p>
                  <div className="flex flex-wrap gap-1">{project.skillIds.map((id) => { const skill = skillById(id); return skill ? <Badge key={id} variant={skill.state}>{skill.label}</Badge> : null; })}</div>
                  <span className="text-muted-foreground text-[11.5px]">{project.milestones.length} milestones · {project.architecture.join(", ")}</span>
                  <div className="flex gap-2"><Button size="sm">Start project</Button><Button size="sm" variant="ghost">Not now</Button></div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="evidence">
          <Card><CardContent className="flex flex-col gap-3">
            <SectionHeading title="Skill-to-project evidence" description="Which projects back which skills." />
            {evidenceSkills.map((skill) => (
              <div key={skill.id} className="grid grid-cols-[160px_1fr] items-center gap-3">
                <span className="text-[12.5px] font-semibold">{skill.label}</span>
                <div className="flex flex-wrap gap-1.5">{projects.filter((project) => project.status !== "recommended" && project.skillIds.includes(skill.id)).map((project) => <Badge key={project.id} variant={project.status === "completed" ? "demonstrated" : "primary"}>{project.title}</Badge>)}</div>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}

function ProjectRow({ project, active, onClick }: { project: Project; active: boolean; onClick: () => void }) {
  const done = project.milestones.filter((milestone) => milestone.done).length;
  return (
    <button type="button" onClick={onClick} className={cn("bg-card flex w-full flex-col gap-2.5 rounded-xl border p-4 text-left transition-all", active ? "border-primary ring-primary/20 ring-2" : "hover:border-primary/40")}>
      <div className="flex items-center justify-between"><span className="numeric text-[14px] font-bold">{project.title}</span><Badge variant={project.status === "completed" ? "demonstrated" : "primary"}>{project.status === "completed" ? "Shipped" : "In progress"}</Badge></div>
      <GrowBar value={(done / project.milestones.length) * 100} className="h-1.5" />
      <span className="text-muted-foreground text-[11.5px]">{done} of {project.milestones.length} milestones</span>
    </button>
  );
}
