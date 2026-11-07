"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, CheckCircle, FilePdf, GithubLogo, Globe, Plus, Sparkle, UploadSimple, WarningCircle, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Field, FieldHint, Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLockup } from "@/components/shell/brand";
import { onboardingOptions } from "@/lib/mock/data";
import { ease, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

const SAMPLE_ONBOARDING_RESUME = `
ALEX CHEN
Senior Analytics Engineer | alex.chen@example.com

PROFESSIONAL EXPERIENCE
Data Engineer at FinTech Labs (2022 - Present)
• Built scalable batch and streaming ETL pipelines using dbt, Snowflake, and Apache Airflow.
• Optimized PostgreSQL queries and warehouse schemas.

Data Analyst at HealthMetrics (2020 - 2022)
• Analyzed healthcare patient cohorts in Python and Excel.

EDUCATION
B.S. in Computer Science, University of California (2020)
`;

const steps = [
  { label: "About you", heading: "Let's start with you" },
  { label: "Resume", heading: "Import your resume and work" },
  { label: "History", heading: "Education and experience" },
  { label: "Skills", heading: "What you can already do" },
  { label: "Industries", heading: "Where you want to work" },
  { label: "Goals", heading: "The role you are aiming for" },
  { label: "Time", heading: "How much time you have" },
  { label: "Privacy", heading: "How we use your data" },
] as const;

type Feedback = { tone: "success" | "error"; message: string } | null;

export function OnboardingView() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [visited, setVisited] = useState(0);
  const [name, setName] = useState("Rhea Dasgupta");
  const [loc, setLoc] = useState("Pune, India");
  const [edu, setEdu] = useState("B.Tech, Computer Engineering, 2023");
  const [exp, setExp] = useState("Backend Developer, Tessellate Payments, 2023 to now\nSoftware Intern, Kestrel Analytics, 2022");
  const [stage, setStage] = useState("Early career");
  const [resume, setResume] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mySkills, setMySkills] = useState<string[]>(["Python", "FastAPI", "SQL"]);
  const [skillDraft, setSkillDraft] = useState("");
  const [industries, setIndustries] = useState<string[]>(["Fintech"]);
  const [roles, setRoles] = useState<string[]>(["Applied AI Engineer"]);
  const [hours, setHours] = useState(10);
  const [duration, setDuration] = useState("8 weeks");
  const [consent, setConsent] = useState({ data: false, accounts: false });
  const [building, setBuilding] = useState(false);

  const go = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
    setVisited((value) => Math.max(value, next));
  };
  const toggle = (list: string[], value: string, set: (value: string[]) => void) => set(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  const canFinish = consent.data;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleParsedData = (data: any, fileName: string) => {
    setResume(fileName);
    if (data.candidate) {
      if (data.candidate.name && data.candidate.name !== "Candidate") setName(data.candidate.name);
      if (data.candidate.experience?.length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setExp(data.candidate.experience.map((e: any) => `${e.role}, ${e.company}, ${e.years}`).join("\n"));
      }
      if (data.candidate.education?.length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setEdu(data.candidate.education.map((e: any) => `${e.degree}, ${e.school}, ${e.years}`).join("\n"));
      }
    }
    if (data.claims?.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const canonicalSkills = data.claims.map((c: any) => c.skill_id.toUpperCase());
      setMySkills((prev) => Array.from(new Set([...prev, ...canonicalSkills])));
      setFeedback({ tone: "success", message: `Read ${fileName}. ${data.claims.length} skills added to step 4 for you to review.` });
    } else {
      setFeedback({ tone: "success", message: `Read ${fileName}.` });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setParsing(true);
    setFeedback(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("user_id", "onboarding_user");
      const res = await fetch("/api/v1/profile/imports", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload returned status " + res.status);
      handleParsedData(await res.json(), file.name);
    } catch (err) {
      console.error("Upload error:", err);
      setFeedback({ tone: "error", message: "We could not read that file. Try a PDF, DOCX or plain-text resume. (" + (err as Error)?.message + ")" });
    } finally {
      setParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSampleResume = async () => {
    setParsing(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/v1/profile/imports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: SAMPLE_ONBOARDING_RESUME, user_id: "alex_chen", file_name: "Alex_Chen_Resume.pdf" }),
      });
      if (!res.ok) throw new Error("Sample returned status " + res.status);
      handleParsedData(await res.json(), "Alex_Chen_Resume.pdf");
    } catch (err) {
      console.error("Sample error:", err);
      setFeedback({ tone: "error", message: "The sample resume could not be read. (" + (err as Error)?.message + ")" });
    } finally {
      setParsing(false);
    }
  };

  if (building) return <BuildingProfile />;

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: reduce ? 0 : dir * 24 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: reduce ? 0 : dir * -24 }),
  };

  return (
    <div className="bg-background flex min-h-[100dvh] flex-col">
      <header className="flex h-[56px] shrink-0 items-center justify-between border-b border-border px-5 sm:px-8">
        <BrandLockup />
        <span className="text-gray-10 text-[13px] tabular">
          Step {step + 1} of {steps.length}
        </span>
      </header>

      <div className="mx-auto grid w-full max-w-[1040px] flex-1 gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:py-14">
        {/* Stepper rail: progress and navigation in one. Collapses to a bar on mobile. */}
        <nav aria-label="Setup steps" className="flex flex-col gap-4">
          <div className="bg-gray-4 h-1 overflow-hidden rounded-full lg:hidden">
            <motion.div className="bg-gray-12 h-full origin-left rounded-full" animate={{ scaleX: (step + 1) / steps.length }} transition={spring.layout} />
          </div>
          <ol className="hidden flex-col lg:flex">
            {steps.map((item, index) => {
              const done = index < step;
              const current = index === step;
              const reachable = index <= visited;
              return (
                <li key={item.label} className="relative">
                  {index < steps.length - 1 && (
                    <span className={cn("absolute top-[30px] left-[10.5px] h-[calc(100%-20px)] w-px transition-colors duration-300", done ? "bg-gray-12" : "bg-border")} aria-hidden="true" />
                  )}
                  <button
                    type="button"
                    onClick={() => reachable && go(index)}
                    disabled={!reachable}
                    aria-current={current ? "step" : undefined}
                    className="group relative flex w-full items-center gap-3 rounded-md py-2 text-left disabled:cursor-default"
                  >
                    <span
                      className={cn(
                        "relative grid size-[22px] shrink-0 place-items-center rounded-full text-[11px] font-semibold tabular transition-colors duration-200",
                        done && "bg-gray-12 text-gray-1",
                        current && "bg-brand text-white",
                        !done && !current && "border-border-strong bg-background text-gray-10 border",
                      )}
                    >
                      {done ? <Check size={11} weight="bold" /> : index + 1}
                    </span>
                    <span className={cn("text-[13.5px] transition-colors", current ? "font-medium text-foreground" : done ? "text-gray-11 group-hover:text-foreground" : "text-gray-10")}>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="flex min-w-0 flex-col gap-8">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: ease.out }}
              className="flex flex-col gap-7"
            >
              <div className="flex flex-col gap-1.5">
                <span className="text-brand-text text-[13px] font-medium">{steps[step].label}</span>
                <h1 className="type-title text-foreground">{steps[step].heading}</h1>
              </div>

              {step === 0 && (
                <>
                  <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">
                    <Field>
                      <Label htmlFor="ob-name">Full name</Label>
                      <Input id="ob-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                    </Field>
                    <Field>
                      <Label htmlFor="ob-loc">Location</Label>
                      <Input id="ob-loc" value={loc} onChange={(e) => setLoc(e.target.value)} autoComplete="address-level2" />
                    </Field>
                  </div>
                  <Field>
                    <Label>Career stage</Label>
                    <Chips options={onboardingOptions.stages} selected={[stage]} onToggle={setStage} />
                  </Field>
                </>
              )}

              {step === 1 && (
                <>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.docx,.txt,.md" className="hidden" data-testid="onboarding-file-input" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={parsing}
                    data-testid="onboarding-upload-dropzone"
                    className={cn(
                      "flex flex-col items-center gap-2.5 rounded-[var(--radius-surface)] border border-dashed px-6 py-10 text-center transition-colors",
                      resume ? "border-success/40 bg-success-soft/50" : "border-border-strong hover:border-gray-9 hover:bg-gray-2",
                    )}
                  >
                    <span className={cn("grid size-11 place-items-center rounded-[11px]", resume ? "bg-success-soft text-success" : "bg-gray-3 text-gray-11")}>
                      {parsing ? <span className="border-gray-11 size-5 animate-spin rounded-full border-2 border-t-transparent" /> : resume ? <FilePdf size={20} /> : <UploadSimple size={20} />}
                    </span>
                    <span className="text-[14.5px] font-medium text-foreground">{parsing ? "Reading your resume" : resume ?? "Upload your resume"}</span>
                    <span className="text-gray-10 text-[13px]">
                      {parsing ? "Finding skills, roles and dates" : resume ? "Click to replace" : "PDF, DOCX or text. You review everything we find."}
                    </span>
                  </button>

                  <Button type="button" variant="ghost" onClick={handleSampleResume} disabled={parsing} data-testid="onboarding-sample-btn" className="self-start">
                    <Sparkle weight="fill" className="text-brand" /> Try a sample resume
                  </Button>

                  <AnimatePresence>
                    {feedback && (
                      <motion.div
                        initial={reduce ? false : { opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        role={feedback.tone === "error" ? "alert" : "status"}
                        className={cn(
                          "flex items-start gap-2.5 rounded-[10px] border px-3.5 py-3 text-[13px]",
                          feedback.tone === "success" ? "bg-success-soft border-success/25" : "bg-danger-soft border-danger/25",
                        )}
                      >
                        {feedback.tone === "success" ? <CheckCircle weight="fill" size={16} className="text-success mt-px shrink-0" /> : <WarningCircle weight="fill" size={16} className="text-danger mt-px shrink-0" />}
                        <span className="text-foreground">{feedback.message}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">
                    <Field>
                      <Label htmlFor="ob-gh"><span className="flex items-center gap-1.5"><GithubLogo size={14} /> GitHub</span></Label>
                      <Input id="ob-gh" placeholder="github.com/username" />
                    </Field>
                    <Field>
                      <Label htmlFor="ob-pf"><span className="flex items-center gap-1.5"><Globe size={14} /> Portfolio</span></Label>
                      <Input id="ob-pf" placeholder="yourname.dev" />
                    </Field>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <Field>
                    <Label htmlFor="ob-edu">Education</Label>
                    <Input id="ob-edu" value={edu} onChange={(e) => setEdu(e.target.value)} />
                  </Field>
                  <Field>
                    <Label htmlFor="ob-exp">Work experience</Label>
                    <FieldHint>One role per line. Filled from your resume where we could.</FieldHint>
                    <Textarea id="ob-exp" value={exp} onChange={(e) => setExp(e.target.value)} className="min-h-28" />
                  </Field>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="flex min-h-9 flex-wrap gap-1.5">
                    <AnimatePresence initial={false}>
                      {mySkills.map((skill) => (
                        <motion.span
                          key={skill}
                          layout={!reduce}
                          initial={reduce ? false : { scale: 0.7, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.7, opacity: 0, transition: { duration: 0.12 } }}
                          transition={spring.snappy}
                          className="bg-gray-12 text-gray-1 flex items-center gap-1 rounded-full py-1 pr-1 pl-3 text-[13px]"
                        >
                          {skill}
                          <button type="button" aria-label={"Remove " + skill} onClick={() => setMySkills((prev) => prev.filter((item) => item !== skill))} className="hover:bg-gray-10/40 grid size-5 place-items-center rounded-full transition-colors">
                            <X size={11} />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>
                  <form
                    className="flex gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (skillDraft.trim() && !mySkills.includes(skillDraft.trim())) setMySkills((prev) => [...prev, skillDraft.trim()]);
                      setSkillDraft("");
                    }}
                  >
                    <label htmlFor="ob-skill" className="sr-only">Add a skill</label>
                    <Input id="ob-skill" value={skillDraft} onChange={(event) => setSkillDraft(event.target.value)} placeholder="Add a skill, for example Docker" />
                    <Button type="submit" variant="secondary" size="icon" aria-label="Add skill"><Plus /></Button>
                  </form>
                  <Field>
                    <Label>Suggested from your resume</Label>
                    <Chips options={onboardingOptions.skillSuggestions.filter((item) => !mySkills.includes(item))} selected={[]} onToggle={(value) => setMySkills((prev) => [...prev, value])} add />
                  </Field>
                  <p className="text-gray-10 text-[13px] leading-relaxed">
                    These start as claims. A skill becomes demonstrated once a challenge, project or linked repository proves it.
                  </p>
                </>
              )}

              {step === 4 && (
                <Field>
                  <Label>Industries you are interested in</Label>
                  <Chips options={onboardingOptions.industries} selected={industries} onToggle={(value) => toggle(industries, value, setIndustries)} />
                </Field>
              )}

              {step === 5 && (
                <>
                  <Field>
                    <Label>Roles</Label>
                    <Chips options={onboardingOptions.roles} selected={roles} onToggle={(value) => toggle(roles, value, setRoles)} />
                  </Field>
                  <Field>
                    <Label htmlFor="ob-co">Companies you would love to join</Label>
                    <Input id="ob-co" defaultValue="Lattice Labs, Northbeam AI, Quill Health" />
                  </Field>
                  <Field>
                    <Label htmlFor="ob-goal">Your goal, in a sentence</Label>
                    <Textarea id="ob-goal" defaultValue="Ship production LLM systems as an Applied AI Engineer within 8 weeks." />
                  </Field>
                </>
              )}

              {step === 6 && (
                <>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-baseline justify-between">
                      <Label htmlFor="ob-hours">Hours per week</Label>
                      <span className="text-[22px] font-semibold tracking-tight text-foreground tabular">{hours}h</span>
                    </div>
                    <input id="ob-hours" type="range" min={2} max={30} value={hours} onChange={(event) => setHours(Number(event.target.value))} className="w-full cursor-pointer accent-[var(--brand)]" />
                  </div>
                  <Field>
                    <Label>Timeline</Label>
                    <Chips options={onboardingOptions.durations} selected={[duration]} onToggle={setDuration} />
                  </Field>
                  <div className="bg-gray-2 rounded-[10px] border border-border p-4 text-[14px] text-foreground">
                    {hours} hours a week for {duration} is about{" "}
                    <span className="font-semibold tabular">{hours * (parseInt(duration) * (duration.includes("month") ? 4 : 1))} hours</span> of focused, hands-on learning.
                  </div>
                </>
              )}

              {step === 7 && (
                <div className="flex flex-col gap-3">
                  <ConsentBox
                    checked={consent.data}
                    onChange={(value) => setConsent((prev) => ({ ...prev, data: value }))}
                    title="Read my resume and skill claims"
                    body="Used to build your starting skill model and learning plan. Required to continue."
                  />
                  <ConsentBox
                    checked={consent.accounts}
                    onChange={(value) => setConsent((prev) => ({ ...prev, accounts: value }))}
                    title="Read code in repositories I link"
                    body="Lets finished work count as evidence automatically. Optional, and you choose which repositories."
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between border-t border-border pt-5">
            <Button variant="ghost" onClick={() => go(Math.max(0, step - 1))} disabled={step === 0}>
              <ArrowLeft /> Back
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={() => go(step + 1)}>
                Continue <ArrowRight />
              </Button>
            ) : (
              <Button variant="brand" disabled={!canFinish} onClick={() => setBuilding(true)}>
                Build my plan <ArrowRight />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Chips({ options, selected, onToggle, add }: { options: string[]; selected: string[]; onToggle: (value: string) => void; add?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <motion.button
            key={option}
            type="button"
            whileTap={reduce ? undefined : { scale: 0.96 }}
            onClick={() => onToggle(option)}
            aria-pressed={add ? undefined : active}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-full border px-3.5 text-[13px] transition-colors",
              active ? "bg-gray-12 border-gray-12 text-gray-1" : "text-gray-11 border-border bg-card hover:border-border-strong hover:text-foreground",
            )}
          >
            {active && <Check size={12} weight="bold" />}
            {add && <Plus size={12} />}
            {option}
          </motion.button>
        );
      })}
    </div>
  );
}

function ConsentBox({ checked, onChange, title, body }: { checked: boolean; onChange: (value: boolean) => void; title: string; body: string }) {
  return (
    <label className={cn("flex cursor-pointer gap-3.5 rounded-[var(--radius-surface)] border p-4 transition-colors", checked ? "border-gray-12 bg-card" : "border-border bg-card hover:border-border-strong")}>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
      <span
        className={cn(
          "mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-[5px] border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring/60",
          checked ? "bg-gray-12 border-gray-12 text-gray-1" : "border-gray-8",
        )}
        aria-hidden="true"
      >
        {checked && <Check size={11} weight="bold" />}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-[14px] font-medium text-foreground">{title}</span>
        <span className="text-gray-11 text-[13px] leading-relaxed">{body}</span>
      </span>
    </label>
  );
}

function BuildingProfile() {
  const reduce = useReducedMotion();
  const tasks = [
    "Reading your resume",
    "Matching skills to a standard taxonomy",
    "Comparing against 214 job postings",
    "Building your digital twin",
    "Finding your skill gaps",
    "Writing your 8-week plan",
  ];
  const [done, setDone] = useState(0);

  useEffect(() => {
    let count = 0;
    const timer = window.setInterval(() => {
      count += 1;
      setDone(count);
      if (count >= tasks.length) window.clearInterval(timer);
    }, reduce ? 50 : 520);
    return () => window.clearInterval(timer);
  }, [reduce, tasks.length]);

  const finished = done >= tasks.length;

  return (
    <div className="bg-background grid min-h-[100dvh] place-items-center px-4">
      <div className="flex w-full max-w-[420px] flex-col gap-8">
        <div className="flex flex-col gap-2">
          <AnimatePresence mode="wait" initial={false}>
            <motion.h1
              key={finished ? "done" : "working"}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3, ease: ease.out }}
              className="type-title text-foreground"
            >
              {finished ? "Your plan is ready" : "Building your plan"}
            </motion.h1>
          </AnimatePresence>
          <div className="bg-gray-4 h-1 overflow-hidden rounded-full">
            <motion.div className="bg-gray-12 h-full origin-left rounded-full" animate={{ scaleX: done / tasks.length }} transition={spring.layout} />
          </div>
        </div>

        <ul className="flex flex-col gap-3.5">
          {tasks.map((task, index) => {
            const complete = index < done;
            const current = index === done;
            return (
              <motion.li
                key={task}
                initial={reduce ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: complete || current ? 1 : 0.4, y: 0 }}
                transition={{ delay: reduce ? 0 : index * 0.04, duration: 0.3 }}
                className="flex items-center gap-3 text-[14px]"
              >
                <span className="grid size-5 shrink-0 place-items-center">
                  {complete ? (
                    <motion.span initial={reduce ? false : { scale: 0.3 }} animate={{ scale: 1 }} transition={spring.snappy} className="bg-gray-12 text-gray-1 grid size-5 place-items-center rounded-full">
                      <Check size={11} weight="bold" />
                    </motion.span>
                  ) : current ? (
                    <span className="border-gray-12 size-4 animate-spin rounded-full border-2 border-t-transparent" />
                  ) : (
                    <span className="border-border-strong size-4 rounded-full border" />
                  )}
                </span>
                <span className={complete ? "text-gray-11" : "text-foreground"}>{task}</span>
              </motion.li>
            );
          })}
        </ul>

        <AnimatePresence>
          {finished && (
            <motion.div initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring.overlay}>
              <Button asChild size="lg" variant="brand" className="w-full">
                <Link href="/">Open my dashboard <ArrowRight /></Link>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
