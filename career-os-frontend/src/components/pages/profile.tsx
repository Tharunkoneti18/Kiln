"use client";

import { useState } from "react";
import {
  Certificate,
  ClockCounterClockwise,
  FileText,
  GithubLogo,
  GraduationCap,
  PencilSimple,
  Briefcase,
  UploadSimple,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfidenceMeter, EvidenceBadge } from "@/components/common/evidence";
import { Stagger, StaggerItem } from "@/components/motion/primitives";
import { PageHeader, PageShell } from "@/components/shell/page-header";
import { learner, skills } from "@/lib/mock/data";

export function ProfileView() {
  const [editing, setEditing] = useState(false);
  const technical = skills.filter((skill) => skill.category !== "professional");
  const nonTechnical = skills.filter((skill) => skill.category === "professional");

  return (
    <PageShell className="flex flex-col gap-7">
      <PageHeader
        icon="profile"
        context={"Profile " + learner.versions[0].version + ", updated " + learner.versions[0].date}
        title="Career Profile"
        description="Your complete professional identity. Everything extracted from your resume is shown with where it came from, and every skill claim is linked to its evidence."
        actions={
          <>
            <Button variant="secondary" size="sm"><UploadSimple size={14} /> Upload new resume</Button>
            <Button size="sm" onClick={() => setEditing((value) => !value)}>
              <PencilSimple size={14} /> {editing ? "Done editing" : "Edit profile"}
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className="bg-brand text-primary-foreground grid size-16 shrink-0 place-items-center rounded-2xl text-[22px] font-bold">
            {learner.initials}
          </span>
          {editing ? (
            <div className="grid flex-1 gap-3 sm:grid-cols-2">
              <Field><Label htmlFor="pf-name">Name</Label><Input id="pf-name" defaultValue={learner.name} /></Field>
              <Field><Label htmlFor="pf-headline">Headline</Label><Input id="pf-headline" defaultValue={learner.headline} /></Field>
              <Field><Label htmlFor="pf-location">Location</Label><Input id="pf-location" defaultValue={learner.location} /></Field>
              <Field><Label htmlFor="pf-portfolio">Portfolio</Label><Input id="pf-portfolio" defaultValue={learner.portfolio} /></Field>
            </div>
          ) : (
            <div className="flex flex-1 flex-col gap-1">
              <h2 className="text-[20px] font-bold tracking-tight">{learner.name}</h2>
              <p className="text-muted-foreground text-[13px]">{learner.headline}</p>
              <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
                <span>{learner.location}</span>
                <span>{learner.stage}</span>
                <span className="flex items-center gap-1"><GithubLogo size={13} /> {learner.github}</span>
                <span>{learner.portfolio}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="experience" className="flex flex-col gap-5">
        <TabsList className="flex-wrap self-start">
          <TabsTrigger value="experience"><Briefcase /> Experience</TabsTrigger>
          <TabsTrigger value="skills"><Certificate /> Skills and evidence</TabsTrigger>
          <TabsTrigger value="projects"><GithubLogo /> Projects and GitHub</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="history"><ClockCounterClockwise /> History</TabsTrigger>
        </TabsList>

        <TabsContent value="experience">
          <Stagger className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <StaggerItem>
              <Card>
                <CardContent className="flex flex-col gap-5">
                  <h3 className="flex items-center gap-2 text-[14px] font-bold"><Briefcase size={15} className="text-primary" /> Work experience</h3>
                  {learner.experience.map((job) => (
                    <div key={job.role} className="border-primary/30 relative flex flex-col gap-1.5 border-l-2 pl-4">
                      <span className="text-[13.5px] font-bold">{job.role}, {job.company}</span>
                      <span className="text-muted-foreground text-[11.5px]">{job.years}</span>
                      <ul className="text-muted-foreground mt-1 flex list-disc flex-col gap-1 pl-4 text-[12.5px]">
                        {job.highlights.map((line) => <li key={line}>{line}</li>)}
                      </ul>
                      <span className="text-muted-foreground mt-1 flex items-center gap-1 text-[11px]"><FileText size={12} /> Extracted from resume, page 1</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem className="flex flex-col gap-5">
              <Card>
                <CardContent className="flex flex-col gap-3">
                  <h3 className="flex items-center gap-2 text-[14px] font-bold"><GraduationCap size={15} className="text-primary" /> Education</h3>
                  {learner.education.map((item) => (
                    <div key={item.degree}>
                      <p className="text-[13px] font-semibold">{item.degree}</p>
                      <p className="text-muted-foreground text-[12px]">{item.school}, {item.years}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col gap-3">
                  <h3 className="flex items-center gap-2 text-[14px] font-bold"><Certificate size={15} className="text-primary" /> Certifications and achievements</h3>
                  {learner.certifications.map((cert) => (
                    <div key={cert.name} className="flex items-center justify-between gap-2">
                      <span>
                        <span className="block text-[12.5px] font-semibold">{cert.name}</span>
                        <span className="text-muted-foreground text-[11.5px]">{cert.issuer}</span>
                      </span>
                      <Badge variant="neutral">{cert.year}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </StaggerItem>
          </Stagger>
        </TabsContent>

        <TabsContent value="skills">
          <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
            <Card>
              <CardContent className="flex flex-col gap-1">
                <h3 className="mb-2 text-[14px] font-bold">Technical skills: claim and evidence</h3>
                {technical.map((skill) => (
                  <div key={skill.id} className="flex flex-wrap items-center gap-3 border-b py-2.5 last:border-b-0">
                    <span className="min-w-[160px] flex-1 text-[13px] font-semibold">{skill.label}</span>
                    <span className="text-muted-foreground text-[11.5px]">Claimed {skill.claimed}/5</span>
                    <span className="text-[11.5px] font-semibold">Shown {skill.demonstrated}/5</span>
                    <ConfidenceMeter confidence={skill.confidence} />
                    <EvidenceBadge state={skill.state} withIcon={false} />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col gap-3">
                <h3 className="text-[14px] font-bold">Non-technical skills</h3>
                {nonTechnical.map((skill) => (
                  <div key={skill.id} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between"><span className="text-[13px] font-semibold">{skill.label}</span><EvidenceBadge state={skill.state} withIcon={false} /></div>
                    {skill.evidence.map((item) => <span key={item.id} className="text-muted-foreground text-[11.5px]">{item.excerpt}, {item.source}</span>)}
                  </div>
                ))}
                <p className="text-muted-foreground border-t pt-3 text-[11.5px] leading-relaxed">
                  A claim without evidence stays a claim. Complete an assessment or attach a project to move it to demonstrated in your Digital Twin.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-[14px] font-bold"><GithubLogo size={16} /> Connected repositories</h3>
                <Badge variant="demonstrated">Connected as {learner.github.split("/")[1]}</Badge>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {learner.repos.map((repo) => (
                  <div key={repo.name} className="flex flex-col gap-2 rounded-lg border p-4">
                    <span className="numeric text-[13px] font-bold">{repo.name}</span>
                    <span className="text-muted-foreground text-[11.5px]">{repo.language}, {repo.stars} stars, last commit {repo.lastCommit}</span>
                    <div className="flex flex-wrap gap-1">
                      {repo.skills.length ? repo.skills.map((id) => <Badge key={id} variant="primary">{id}</Badge>) : <span className="text-muted-foreground text-[11px]">No skills inferred</span>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <Pref label="Target role" value="Applied AI Engineer" />
              <Pref label="Transition goal" value={learner.transitionGoal} />
              <Pref label="Preferred industries" value={learner.industries.join(", ")} />
              <Pref label="Target companies" value={learner.targetCompanies.join(", ")} />
              <Pref label="Weekly availability" value={learner.weeklyHours + " hours on " + learner.preferredDays.join(", ")} />
              <Pref label="Learning duration" value={learner.learningDuration} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <CardContent className="flex flex-col gap-3">
                <h3 className="text-[14px] font-bold">Profile version history</h3>
                {learner.versions.map((version, index) => (
                  <div key={version.version} className="flex gap-3">
                    <span className={"numeric grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-bold " + (index === 0 ? "bg-brand text-primary-foreground" : "bg-raised")}>{version.version}</span>
                    <span>
                      <span className="block text-[12.5px] font-semibold">{version.change}</span>
                      <span className="text-muted-foreground text-[11px]">{version.date}</span>
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col gap-3">
                <h3 className="text-[14px] font-bold">Career history and transitions</h3>
                {learner.history.map((step) => (
                  <div key={step.to} className="flex items-center gap-2 text-[12.5px]">
                    <span className="font-semibold">{step.from}</span>
                    <span className="text-muted-foreground">to</span>
                    <span className="text-primary font-semibold">{step.to}</span>
                    <Badge variant="neutral" className="ml-auto">{step.year}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}

function Pref({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-[11.5px] font-semibold">{label}</span>
      <span className="text-[13px] font-semibold">{value}</span>
    </div>
  );
}
