"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, CheckCircle, FilePdf, GithubLogo, Globe, Plus, UploadSimple, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Field, FieldHint, Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Aurora, ThinkingDots } from "@/components/motion/primitives";
import { BrandLockup } from "@/components/shell/brand";
import { onboardingOptions } from "@/lib/mock/data";
import { cn } from "@/lib/utils";

const steps = ["About you", "Resume and links", "Background", "Your skills", "Interests", "Career goals", "Availability", "Consent"] as const;

export function OnboardingView() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [stage, setStage] = useState("Early career");
  const [resume, setResume] = useState<string | null>(null);
  const [mySkills, setMySkills] = useState<string[]>(["Python", "FastAPI", "SQL"]);
  const [skillDraft, setSkillDraft] = useState("");
  const [industries, setIndustries] = useState<string[]>(["Fintech"]);
  const [roles, setRoles] = useState<string[]>(["Applied AI Engineer"]);
  const [hours, setHours] = useState(10);
  const [duration, setDuration] = useState("8 weeks");
  const [consent, setConsent] = useState({ data: false, accounts: false });
  const [building, setBuilding] = useState(false);

  const go = (next: number) => { setDirection(next > step ? 1 : -1); setStep(next); };
  const toggle = (list: string[], value: string, set: (value: string[]) => void) => set(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  const canFinish = consent.data;

  if (building) return <BuildingProfile />;

  return (
    <div className="relative isolate flex min-h-[100dvh] flex-col">
      <Aurora className="-z-10 opacity-60" />
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <BrandLockup />
        <span className="numeric text-muted-foreground text-[12px] font-semibold">Step {step + 1} of {steps.length}</span>
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 pb-10 sm:px-6">
        {/* Step rail. */}
        <div className="flex gap-1.5">
          {steps.map((label, index) => (
            <button key={label} type="button" onClick={() => go(index)} aria-label={"Go to " + label} className="bg-border relative h-1.5 flex-1 overflow-hidden rounded-full">
              <motion.span className="bg-brand absolute inset-0 origin-left" initial={false} animate={{ scaleX: index <= step ? 1 : 0 }} transition={{ duration: 0.4 }} />
            </button>
          ))}
        </div>

        <div className="bg-card relative overflow-hidden rounded-2xl border p-6 shadow-[var(--shadow-lifted)] sm:p-8">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={step} custom={direction} initial={reduce ? false : { opacity: 0, x: direction * 40 }} animate={{ opacity: 1, x: 0 }} exit={reduce ? undefined : { opacity: 0, x: direction * -40 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <span className="text-primary text-[12px] font-bold">{steps[step]}</span>
                <h1 className="text-[24px] font-bold tracking-tight">{headings[step]}</h1>
              </div>

              {step === 0 && (<>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field><Label htmlFor="ob-name">Full name</Label><Input id="ob-name" defaultValue="Rhea Dasgupta" /></Field>
                  <Field><Label htmlFor="ob-loc">Location</Label><Input id="ob-loc" defaultValue="Pune, India" /></Field>
                </div>
                <Field><Label>Current career stage</Label><Chips options={onboardingOptions.stages} selected={[stage]} onToggle={setStage} /></Field>
              </>)}

              {step === 1 && (<>
                <button type="button" onClick={() => setResume("Rhea_Dasgupta_Resume.pdf")} className={cn("flex flex-col items-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors", resume ? "border-primary bg-primary/6" : "hover:border-primary/50")}>
                  {resume ? <><FilePdf size={26} className="text-primary" /><span className="text-[13px] font-bold">{resume}</span><span className="text-primary flex items-center gap-1 text-[12px] font-semibold"><CheckCircle size={13} weight="fill" /> Ready to extract</span></> : <><UploadSimple size={26} className="text-primary" /><span className="text-[13px] font-semibold">Upload your resume or CV</span><span className="text-muted-foreground text-[11.5px]">PDF or DOCX, up to 10 MB. You review everything extracted.</span></>}
                </button>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field><Label htmlFor="ob-gh"><span className="flex items-center gap-1.5"><GithubLogo size={13} /> GitHub</span></Label><Input id="ob-gh" placeholder="github.com/username" /></Field>
                  <Field><Label htmlFor="ob-pf"><span className="flex items-center gap-1.5"><Globe size={13} /> Portfolio</span></Label><Input id="ob-pf" placeholder="yourname.dev" /></Field>
                </div>
              </>)}

              {step === 2 && (<>
                <Field><Label htmlFor="ob-edu">Education</Label><Input id="ob-edu" defaultValue="B.Tech, Computer Engineering, 2023" /></Field>
                <Field><Label htmlFor="ob-exp">Work experience</Label><FieldHint>One role per line. We fill this from your resume where we can.</FieldHint><Textarea id="ob-exp" defaultValue={"Backend Developer, Tessellate Payments, 2023 to now\nSoftware Intern, Kestrel Analytics, 2022"} /></Field>
              </>)}

              {step === 3 && (<>
                <div className="flex flex-wrap gap-1.5">
                  <AnimatePresence>
                    {mySkills.map((skill) => (
                      <motion.span key={skill} layout initial={reduce ? false : { scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} className="bg-primary/10 text-primary border-primary/30 flex items-center gap-1 rounded-full border py-1 pr-1.5 pl-3 text-[12.5px] font-semibold">
                        {skill}<button type="button" aria-label={"Remove " + skill} onClick={() => setMySkills((prev) => prev.filter((item) => item !== skill))} className="hover:bg-primary/15 rounded-full p-0.5"><X size={11} /></button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
                <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); if (skillDraft.trim() && !mySkills.includes(skillDraft.trim())) setMySkills((prev) => [...prev, skillDraft.trim()]); setSkillDraft(""); }}>
                  <label htmlFor="ob-skill" className="sr-only">Add a skill</label>
                  <Input id="ob-skill" value={skillDraft} onChange={(event) => setSkillDraft(event.target.value)} placeholder="Add a technical or non-technical skill" />
                  <Button type="submit" variant="secondary" size="icon" aria-label="Add skill"><Plus size={15} /></Button>
                </form>
                <Field><Label>Suggestions from your resume</Label><Chips options={onboardingOptions.skillSuggestions.filter((item) => !mySkills.includes(item))} selected={[]} onToggle={(value) => setMySkills((prev) => [...prev, value])} /></Field>
                <p className="text-muted-foreground text-[12px]">These start as claims. Your Digital Twin only marks a skill as demonstrated once there is evidence for it.</p>
              </>)}

              {step === 4 && <Field><Label>Industries you are interested in</Label><Chips options={onboardingOptions.industries} selected={industries} onToggle={(value) => toggle(industries, value, setIndustries)} /></Field>}

              {step === 5 && (<>
                <Field><Label>Desired roles</Label><Chips options={onboardingOptions.roles} selected={roles} onToggle={(value) => toggle(roles, value, setRoles)} /></Field>
                <Field><Label htmlFor="ob-co">Target companies</Label><Input id="ob-co" defaultValue="Lattice Labs, Northbeam AI, Quill Health" /></Field>
                <Field><Label htmlFor="ob-goal">Career transition goal</Label><Textarea id="ob-goal" defaultValue="Ship production LLM features as an Applied AI Engineer within three months." /></Field>
              </>)}

              {step === 6 && (<>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between"><Label htmlFor="ob-hours">Weekly availability</Label><span className="numeric text-primary text-[20px] font-bold">{hours}h</span></div>
                  <input id="ob-hours" type="range" min={2} max={30} value={hours} onChange={(event) => setHours(Number(event.target.value))} className="accent-primary w-full" />
                </div>
                <Field><Label>Preferred learning duration</Label><Chips options={onboardingOptions.durations} selected={[duration]} onToggle={setDuration} /></Field>
                <div className="bg-raised rounded-lg p-3 text-[12.5px]">At {hours} hours a week over {duration}, you have about <b className="numeric">{hours * (parseInt(duration) * (duration.includes("month") ? 4 : 1))} hours</b> to learn with.</div>
              </>)}

              {step === 7 && (<>
                <ConsentBox checked={consent.data} onChange={(value) => setConsent((prev) => ({ ...prev, data: value }))} title="Process my personal information" body="Career OS reads your resume and profile to build your career profile and plan. Required to continue." />
                <ConsentBox checked={consent.accounts} onChange={(value) => setConsent((prev) => ({ ...prev, accounts: value }))} title="Read my connected accounts" body="Use GitHub and portfolio links as evidence. Optional, and you can disconnect at any time." />
              </>)}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => go(Math.max(0, step - 1))} disabled={step === 0}><ArrowLeft size={14} /> Back</Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => go(step + 1)}>Continue <ArrowRight size={14} /></Button>
          ) : (
            <Button disabled={!canFinish} onClick={() => setBuilding(true)}>Build my career profile <ArrowRight size={14} /></Button>
          )}
        </div>
      </div>
    </div>
  );
}

const headings = [
  "Let us start with you",
  "Bring in your resume and work",
  "Education and experience",
  "What can you already do?",
  "Where would you like to work?",
  "Where do you want to go?",
  "How much time do you have?",
  "Your data, your choice",
];

function Chips({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <motion.button key={option} type="button" whileTap={{ scale: 0.95 }} onClick={() => onToggle(option)} aria-pressed={active}
            className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors", active ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:border-primary/40 hover:text-foreground")}>
            {active && <Check size={12} weight="bold" />}{option}
          </motion.button>
        );
      })}
    </div>
  );
}

function ConsentBox({ checked, onChange, title, body }: { checked: boolean; onChange: (value: boolean) => void; title: string; body: string }) {
  return (
    <label className={cn("flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors", checked ? "border-primary bg-primary/6" : "hover:border-primary/40")}>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="accent-primary mt-1 size-4" />
      <span><span className="block text-[13.5px] font-bold">{title}</span><span className="text-muted-foreground text-[12.5px]">{body}</span></span>
    </label>
  );
}

function BuildingProfile() {
  const reduce = useReducedMotion();
  const tasks = ["Extracting your resume", "Normalising skills", "Reading 214 job descriptions", "Creating your Digital Twin", "Calculating skill gaps", "Drafting your 8-week plan"];
  const [done, setDone] = useState(0);
  useEffect(() => {
    let count = 0;
    const timer = window.setInterval(() => {
      count += 1;
      setDone(count);
      if (count >= tasks.length) window.clearInterval(timer);
    }, reduce ? 50 : 650);
    return () => window.clearInterval(timer);
  }, [reduce, tasks.length]);

  return (
    <div className="relative isolate grid min-h-[100dvh] place-items-center px-4">
      <Aurora className="-z-10" />
      <div className="bg-card flex w-full max-w-md flex-col gap-5 rounded-2xl border p-8 shadow-[var(--shadow-lifted)]">
        <h1 className="text-[22px] font-bold tracking-tight">Building your career profile</h1>
        <ul className="flex flex-col gap-3">
          {tasks.map((task, index) => (
            <motion.li key={task} initial={reduce ? false : { opacity: 0, x: -8 }} animate={{ opacity: index <= done ? 1 : 0.4, x: 0 }} transition={{ delay: index * 0.05 }} className="flex items-center gap-3 text-[13px] font-semibold">
              {index < done ? <CheckCircle size={18} weight="fill" className="text-primary" /> : index === done ? <ThinkingDots /> : <span className="border-border size-[18px] rounded-full border-2" />}
              {task}
            </motion.li>
          ))}
        </ul>
        <Button asChild disabled={done < tasks.length} className={cn(done < tasks.length && "pointer-events-none opacity-50")}>
          <Link href="/">Open my dashboard <ArrowRight size={14} /></Link>
        </Button>
      </div>
    </div>
  );
}
