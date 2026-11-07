"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Briefcase,
  Certificate,
  CheckCircle,
  ClockCounterClockwise,
  GithubLogo,
  GlobeSimple,
  GraduationCap,
  MapPin,
  PencilSimple,
  Sparkle,
  Star,
  UploadSimple,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfidenceMeter, EvidenceBadge } from "@/components/common/evidence";
import { useToast } from "@/components/system/toast";
import { PageShell, Rise } from "@/components/shell/page-header";
import { learner, skills as seedSkills } from "@/lib/mock/data";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

const SAMPLE_ALEX_RESUME = `
ALEX CHEN
Senior Analytics Engineer | alex.chen@example.com

PROFESSIONAL EXPERIENCE
Data Engineer at FinTech Labs (2022 - Present)
• Built scalable batch and streaming ETL pipelines using dbt, Snowflake, and Apache Airflow, processing 15M daily events.
• Optimized complex PostgreSQL queries and warehouse schemas, cutting compute costs by 42%.
• Engineered dimensional data models using star schema and snowflake normalization principles.
• Created real-time KPI dashboards in Looker and Tableau for executive leadership.

Data Analyst at HealthMetrics (2020 - 2022)
• Analyzed healthcare patient cohorts in Python (Pandas, NumPy, Scikit-Learn) and advanced Excel spreadsheets with pivot tables.
• Automated weekly reporting cadence using Docker containers and GitHub CI/CD actions.
• Conducted rigorous A/B testing and statistical significance evaluations.

EDUCATION & CERTIFICATIONS
B.S. in Computer Science, University of California (2020)
AWS Certified Solutions Architect
`;

type UploadStatus = { tone: "success" | "error"; message: string } | null;

export function ProfileView() {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState(learner);
  const [skillsList, setSkillsList] = useState(seedSkills);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<UploadStatus>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const technical = skillsList.filter((skill) => skill.category !== "professional");
  const nonTechnical = skillsList.filter((skill) => skill.category === "professional");

  const initials = profileData.name
    ? profileData.name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()
    : "RD";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const applyParsedData = (data: any, fileName: string) => {
    if (data.candidate) {
      setProfileData((prev) => ({
        ...prev,
        name: data.candidate.name || prev.name,
        headline: data.candidate.headline || prev.headline,
        location: data.candidate.location || prev.location,
        experience: data.candidate.experience?.length ? data.candidate.experience : prev.experience,
        education: data.candidate.education?.length ? data.candidate.education : prev.education,
      }));
    }

    if (data.claims && Array.isArray(data.claims)) {
      setSkillsList((prev) => {
        const next = [...prev];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.claims.forEach((claim: any) => {
          const existingIdx = next.findIndex((s) => s.id === claim.skill_id);
          if (existingIdx >= 0) {
            next[existingIdx] = {
              ...next[existingIdx],
              claimed: 5,
              demonstrated: Math.max(next[existingIdx].demonstrated, claim.confidence >= 0.85 ? 4 : 3),
              confidence: Math.round(claim.confidence * 100),
              state: "demonstrated",
            };
          } else {
            next.push({
              id: claim.skill_id,
              label: claim.skill_id.toUpperCase(),
              category: "engineering",
              claimed: 4,
              demonstrated: 3,
              confidence: Math.round(claim.confidence * 100),
              state: "supported",
              requirement: "mandatory",
              importance: 0.85,
              priority: 78,
              effortHours: 12,
              dependsOn: [],
              evidence: [
                {
                  id: "ev-" + Date.now() + "-" + claim.skill_id,
                  kind: "profile",
                  source: "Resume import: " + fileName,
                  excerpt: claim.excerpt,
                  capturedAt: "2026-10-31",
                },
              ],
              lastUsed: "Recently",
            });
          }
        });
        return next;
      });
    }

    const count = data.claims?.length || 0;
    setStatus({ tone: "success", message: `Parsed ${fileName}. ${count} ${count === 1 ? "skill" : "skills"} found and your profile is updated.` });
    toast({ title: "Resume imported", description: count + " skills identified from " + fileName });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setStatus(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("user_id", "active_learner");
      const res = await fetch("/api/v1/profile/imports", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed with status " + res.status);
      applyParsedData(await res.json(), file.name);
    } catch (err) {
      console.error("Resume upload error:", err);
      setStatus({ tone: "error", message: "We could not read that file. Try a PDF, DOCX or plain-text resume. (" + ((err as Error)?.message || "Server error") + ")" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSampleResume = async () => {
    setUploading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/v1/profile/imports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: SAMPLE_ALEX_RESUME, user_id: "alex_chen", file_name: "Alex_Chen_Resume.pdf" }),
      });
      if (!res.ok) throw new Error("Sample import failed with status " + res.status);
      applyParsedData(await res.json(), "Alex_Chen_Resume.pdf");
    } catch (err) {
      console.error("Sample resume parse error:", err);
      setStatus({ tone: "error", message: "The sample resume could not be parsed. (" + ((err as Error)?.message || "Failed") + ")" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <PageShell>
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.docx,.txt,.md" className="hidden" data-testid="resume-file-input" />

      <Rise className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-5">
          <span className="bg-gray-12 text-gray-1 grid size-[72px] shrink-0 place-items-center rounded-full text-[24px] font-semibold tracking-tight">
            {initials}
          </span>
          <AnimatePresence mode="wait" initial={false}>
            {editing ? (
              <motion.div
                key="edit"
                initial={reduce ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: ease.out }}
                className="grid grid-cols-[minmax(0,1fr)] flex-1 gap-4 sm:grid-cols-2"
              >
                <Field>
                  <Label htmlFor="pf-name">Name</Label>
                  <Input id="pf-name" value={profileData.name} onChange={(e) => setProfileData((p) => ({ ...p, name: e.target.value }))} />
                </Field>
                <Field>
                  <Label htmlFor="pf-headline">Headline</Label>
                  <Input id="pf-headline" value={profileData.headline} onChange={(e) => setProfileData((p) => ({ ...p, headline: e.target.value }))} />
                </Field>
                <Field>
                  <Label htmlFor="pf-location">Location</Label>
                  <Input id="pf-location" value={profileData.location} onChange={(e) => setProfileData((p) => ({ ...p, location: e.target.value }))} />
                </Field>
                <Field>
                  <Label htmlFor="pf-portfolio">Portfolio</Label>
                  <Input id="pf-portfolio" value={profileData.portfolio} onChange={(e) => setProfileData((p) => ({ ...p, portfolio: e.target.value }))} />
                </Field>
              </motion.div>
            ) : (
              <motion.div
                key="view"
                initial={reduce ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: ease.out }}
                className="flex min-w-0 flex-col gap-2"
              >
                <h1 className="type-title text-foreground">{profileData.name}</h1>
                <p className="text-gray-11 text-[15px]">{profileData.headline}</p>
                <div className="text-gray-10 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px]">
                  <span className="flex items-center gap-1.5"><MapPin size={14} /> {profileData.location}</span>
                  <span className="flex items-center gap-1.5"><Briefcase size={14} /> {profileData.stage}</span>
                  <span className="flex items-center gap-1.5"><GithubLogo size={14} /> {profileData.github}</span>
                  <span className="flex items-center gap-1.5"><GlobeSimple size={14} /> {profileData.portfolio}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button variant="ghost" onClick={handleSampleResume} disabled={uploading} data-testid="load-sample-resume-btn">
            <Sparkle weight="fill" className="text-brand" /> Try sample resume
          </Button>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()} loading={uploading} data-testid="upload-resume-btn">
            {!uploading && <UploadSimple />}
            {uploading ? "Reading resume" : "Upload resume"}
          </Button>
          <Button onClick={() => setEditing((value) => !value)} data-testid="edit-profile-btn">
            {!editing && <PencilSimple />} {editing ? "Done" : "Edit profile"}
          </Button>
        </div>
      </Rise>

      <AnimatePresence>
        {status && (
          <motion.div
            key="status"
            data-testid="upload-status-banner"
            role={status.tone === "error" ? "alert" : "status"}
            initial={reduce ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: ease.out }}
            className={cn(
              "flex items-center justify-between gap-3 rounded-[var(--radius-surface)] border px-4 py-3 text-[13.5px]",
              status.tone === "success" ? "bg-success-soft border-success/25 text-foreground" : "bg-danger-soft border-danger/25 text-foreground",
            )}
          >
            <span className="flex items-center gap-2.5">
              {status.tone === "success" ? <CheckCircle weight="fill" size={17} className="text-success shrink-0" /> : <WarningCircle weight="fill" size={17} className="text-danger shrink-0" />}
              {status.message}
            </span>
            <button type="button" onClick={() => setStatus(null)} className="text-gray-10 hover:text-foreground shrink-0 transition-colors" aria-label="Dismiss">
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Rise>
        <Tabs defaultValue="experience" variant="underline" className="flex flex-col gap-8">
          <div className="scroll-slim -mx-4 overflow-x-auto px-4">
            <TabsList className="w-full min-w-max">
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="skills">Skills and evidence</TabsTrigger>
              <TabsTrigger value="projects">Repositories</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="experience" className="grid grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <section>
              <h2 className="type-heading mb-5">Work</h2>
              <ol className="relative flex flex-col gap-8">
                <span className="bg-border absolute top-2 bottom-2 left-[5px] w-px" aria-hidden="true" />
                {profileData.experience.map((job, index) => (
                  <li key={job.role + job.company} className="relative flex flex-col gap-2 pl-7">
                    <span className={cn("absolute top-[7px] left-0 size-[11px] rounded-full border-2 border-background", index === 0 ? "bg-brand" : "bg-gray-8")} aria-hidden="true" />
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <span className="text-[15px] font-medium text-foreground">{job.role}, {job.company}</span>
                      <span className="text-gray-10 text-[12.5px] tabular">{job.years}</span>
                    </div>
                    <ul className="text-gray-11 flex flex-col gap-1.5 text-[13.5px] leading-relaxed">
                      {job.highlights.map((line: string) => (
                        <li key={line} className="flex gap-2.5">
                          <span className="bg-gray-8 mt-[9px] size-1 shrink-0 rounded-full" aria-hidden="true" />
                          {line}
                        </li>
                      ))}
                    </ul>
                    <span className="text-gray-10 flex items-center gap-1.5 text-[12px]">
                      <CheckCircle size={13} className="text-success" /> Extracted from your resume
                    </span>
                  </li>
                ))}
              </ol>
            </section>
            <div className="flex flex-col gap-10">
              <section>
                <h2 className="type-heading mb-3 flex items-center gap-2"><GraduationCap size={16} className="text-gray-10" /> Education</h2>
                <ul className="flex flex-col divide-y divide-border">
                  {profileData.education.map((item: { degree: string; school: string; years: string }) => (
                    <li key={item.degree} className="py-3 first:pt-0">
                      <p className="text-[13.5px] font-medium text-foreground">{item.degree}</p>
                      <p className="text-gray-10 text-[12.5px]">{item.school} · {item.years}</p>
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h2 className="type-heading mb-3 flex items-center gap-2"><Certificate size={16} className="text-gray-10" /> Certifications</h2>
                <ul className="flex flex-col divide-y divide-border">
                  {profileData.certifications.map((cert) => (
                    <li key={cert.name} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                      <span className="min-w-0">
                        <span className="block text-[13.5px] font-medium text-foreground">{cert.name}</span>
                        <span className="text-gray-10 text-[12.5px]">{cert.issuer}</span>
                      </span>
                      <span className="text-gray-10 text-[12.5px] tabular">{cert.year}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="grid grid-cols-[minmax(0,1fr)] items-start gap-x-8 gap-y-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <Card className="overflow-hidden">
              <div className="text-gray-10 grid grid-cols-[minmax(0,1fr)_120px_auto] items-center gap-4 border-b border-border px-5 py-2.5 text-[12px] sm:grid-cols-[minmax(0,1fr)_120px_90px_110px]">
                <span>Technical skill</span>
                <span>Claimed vs proven</span>
                <span className="hidden sm:block">Confidence</span>
                <span className="text-right">Status</span>
              </div>
              <ul className="divide-y divide-border">
                {technical.map((skill) => (
                  <li key={skill.id} className="grid grid-cols-[minmax(0,1fr)_120px_auto] items-center gap-4 px-5 py-3 sm:grid-cols-[minmax(0,1fr)_120px_90px_110px]">
                    <span className="truncate text-[13.5px] text-foreground">{skill.label}</span>
                    <LevelPair claimed={skill.claimed} proven={skill.demonstrated} />
                    <span className="hidden sm:block"><ConfidenceMeter confidence={skill.confidence > 1 ? skill.confidence / 100 : skill.confidence} /></span>
                    <span className="text-right"><EvidenceBadge state={skill.state} withIcon={false} /></span>
                  </li>
                ))}
              </ul>
            </Card>

            <div className="flex flex-col gap-5">
              <Card className="overflow-hidden">
                <div className="border-b border-border px-5 py-3.5">
                  <h3 className="type-heading">Professional skills</h3>
                </div>
                <ul className="divide-y divide-border">
                  {nonTechnical.map((skill) => (
                    <li key={skill.id} className="flex flex-col gap-1.5 px-5 py-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[13.5px] font-medium text-foreground">{skill.label}</span>
                        <EvidenceBadge state={skill.state} withIcon={false} />
                      </div>
                      {skill.evidence.map((item) => (
                        <p key={item.id} className="text-gray-11 text-[12.5px] leading-relaxed">
                          &ldquo;{item.excerpt}&rdquo; <span className="text-gray-9">· {item.source}</span>
                        </p>
                      ))}
                    </li>
                  ))}
                </ul>
              </Card>
              <div className="bg-gray-2 flex gap-3 rounded-[var(--radius-surface)] border border-border p-4">
                <Star size={16} className="text-gray-10 mt-0.5 shrink-0" />
                <p className="text-gray-11 text-[13px] leading-relaxed">
                  A claim stays a claim until something proves it. Pass a challenge in the Proof Lab or link a repository to move a skill to <span className="font-medium text-foreground">demonstrated</span>.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="type-heading flex items-center gap-2"><GithubLogo size={17} /> Linked repositories</h2>
              <Badge variant="success">Connected as {learner.github.split("/")[1]}</Badge>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-3">
              {learner.repos.map((repo) => (
                <Card key={repo.name} interactive className="flex flex-col gap-3 p-4">
                  <span className="font-mono text-[13.5px] font-medium text-foreground">{repo.name}</span>
                  <span className="text-gray-10 flex items-center gap-3 text-[12.5px]">
                    <span>{repo.language}</span>
                    <span className="flex items-center gap-1 tabular"><Star size={12} /> {repo.stars}</span>
                    <span className="tabular">{repo.lastCommit}</span>
                  </span>
                  <div className="mt-auto flex flex-wrap gap-1 border-t border-border pt-3">
                    {repo.skills.length ? (
                      repo.skills.map((id) => <Badge key={id} variant="brand">{id}</Badge>)
                    ) : (
                      <span className="text-gray-10 text-[12.5px]">No skills detected yet</span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <dl className="grid grid-cols-[minmax(0,1fr)] sm:grid-cols-2">
                {[
                  { label: "Target role", value: "Applied AI Engineer" },
                  { label: "Transition goal", value: learner.transitionGoal },
                  { label: "Preferred industries", value: learner.industries.join(", ") },
                  { label: "Target companies", value: learner.targetCompanies.join(", ") },
                  { label: "Weekly commitment", value: learner.weeklyHours + " hours on " + learner.preferredDays.join(", ") },
                  { label: "Duration", value: learner.learningDuration },
                ].map((item, index) => (
                  <div key={item.label} className={cn("flex flex-col gap-1 p-5", index < 4 && "border-b border-border", index % 2 === 0 && "sm:border-r")}>
                    <dt className="text-gray-10 text-[12.5px]">{item.label}</dt>
                    <dd className="text-[14px] leading-relaxed text-foreground">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
            <Button asChild variant="ghost" size="sm" className="mt-3">
              <Link href="/settings">Change in settings <ArrowRight /></Link>
            </Button>
          </TabsContent>

          <TabsContent value="history" className="grid grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-10 lg:grid-cols-2">
            <section>
              <h2 className="type-heading mb-5 flex items-center gap-2"><ClockCounterClockwise size={16} className="text-gray-10" /> Profile versions</h2>
              <ol className="relative flex flex-col gap-5">
                <span className="bg-border absolute top-2 bottom-2 left-[13px] w-px" aria-hidden="true" />
                {learner.versions.map((version, index) => (
                  <li key={version.version} className="relative flex items-start gap-4">
                    <span className={cn("relative grid size-[27px] shrink-0 place-items-center rounded-full text-[11px] font-medium ring-4 ring-background", index === 0 ? "bg-gray-12 text-gray-1" : "bg-gray-3 text-gray-11")}>
                      {version.version}
                    </span>
                    <span className="flex flex-col pt-0.5">
                      <span className="text-[13.5px] text-foreground">{version.change}</span>
                      <span className="text-gray-10 text-[12px] tabular">{version.date}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
            <section>
              <h2 className="type-heading mb-5">Career moves</h2>
              <ul className="flex flex-col gap-2">
                {learner.history.map((step) => (
                  <li key={step.to} className="bg-card flex items-center gap-2.5 rounded-[10px] border border-border px-4 py-3 text-[13.5px] shadow-xs">
                    <span className="text-gray-11">{step.from}</span>
                    <ArrowRight size={13} className="text-gray-8 shrink-0" />
                    <span className="font-medium text-foreground">{step.to}</span>
                    <span className="text-gray-10 ml-auto text-[12px] tabular">{step.year}</span>
                  </li>
                ))}
              </ul>
            </section>
          </TabsContent>
        </Tabs>
      </Rise>
    </PageShell>
  );
}

/** Two stacked micro-bars: claimed (outline) over proven (solid), 0 to 5. */
function LevelPair({ claimed, proven }: { claimed: number; proven: number }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex flex-col gap-1" role="img" aria-label={`Claimed ${claimed} of 5, proven ${proven} of 5`}>
      {[
        { value: claimed, className: "bg-gray-6" },
        { value: proven, className: "bg-gray-12" },
      ].map((bar, index) => (
        <div key={index} className="bg-gray-3 h-1 overflow-hidden rounded-full">
          <motion.div
            className={cn("h-full origin-left rounded-full", bar.className)}
            style={{ width: (bar.value / 5) * 100 + "%" }}
            initial={reduce ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: index * 0.1, ease: ease.out }}
          />
        </div>
      ))}
    </div>
  );
}
