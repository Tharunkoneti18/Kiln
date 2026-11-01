"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { GithubLogo, GoogleLogo } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Aurora, Stagger, StaggerItem } from "@/components/motion/primitives";
import { BrandLockup } from "@/components/shell/brand";
import { TwinOrb } from "@/components/three/twin-orb";
import { skills } from "@/lib/mock/data";
import { cn } from "@/lib/utils";

export function LoginView() {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col justify-between gap-10 px-6 py-8 sm:px-12">
        <BrandLockup />
        <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
          <div className="bg-raised relative flex rounded-md p-1">
            {(["signin", "signup"] as const).map((option) => (
              <button key={option} type="button" onClick={() => setMode(option)} aria-pressed={mode === option} className="relative flex-1 rounded-[6px] py-2 text-[13px] font-semibold">
                {mode === option && <motion.span layoutId="auth-mode" className="bg-card absolute inset-0 rounded-[6px] shadow-sm" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <span className={cn("relative", mode !== option && "text-muted-foreground")}>{option === "signin" ? "Sign in" : "Create account"}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <h1 className="text-[26px] font-bold tracking-tight">{mode === "signin" ? "Welcome back" : "Start your journey"}</h1>
                <p className="text-muted-foreground text-[13.5px]">{mode === "signin" ? "Pick up exactly where you left off." : "Tell us where you are. We will map the way to where you want to be."}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary"><GoogleLogo size={16} weight="bold" /> Google</Button>
                <Button variant="secondary"><GithubLogo size={16} weight="fill" /> GitHub</Button>
              </div>
              <div className="text-muted-foreground flex items-center gap-3 text-[11.5px]"><span className="bg-border h-px flex-1" /> or with email <span className="bg-border h-px flex-1" /></div>
              <form className="flex flex-col gap-4" onSubmit={(event) => event.preventDefault()}>
                {mode === "signup" && <Field><Label htmlFor="au-name">Full name</Label><Input id="au-name" autoComplete="name" /></Field>}
                <Field><Label htmlFor="au-email">Email</Label><Input id="au-email" type="email" autoComplete="email" /></Field>
                <Field><Label htmlFor="au-password">Password</Label><Input id="au-password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} /></Field>
                <Button asChild size="lg"><Link href={mode === "signin" ? "/" : "/onboarding"}>{mode === "signin" ? "Sign in" : "Continue"}</Link></Button>
              </form>
              {mode === "signin" && <button type="button" className="text-primary self-center text-[12.5px] font-semibold">Forgot password?</button>}
            </motion.div>
          </AnimatePresence>
        </div>
        <p className="text-muted-foreground text-[11.5px]">Your data stays yours. Export or delete it at any time.</p>
      </div>

      <div className="bg-card relative isolate hidden overflow-hidden border-l lg:flex lg:flex-col lg:justify-end">
        <Aurora className="-z-10" />
        <div className="bg-grid absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        <TwinOrb skills={skills} className="absolute inset-0" fallback={null} />
        <Stagger className="relative flex flex-col gap-3 p-12">
          <StaggerItem><h2 className="text-[40px] leading-[1.05] font-bold tracking-tight">From potential to<br /><span className="text-brand">proven capability.</span></h2></StaggerItem>
          <StaggerItem><p className="text-muted-foreground max-w-[44ch] text-[14px]">Understand your abilities, close the gaps with a personal AI tutor, prove what you can do, and reach the roles you want.</p></StaggerItem>
          <StaggerItem>
            <div className="flex flex-wrap gap-2 pt-2">{["Discover", "Analyze", "Plan", "Learn", "Prove", "Achieve"].map((stage) => <span key={stage} className="bg-card/70 rounded-full border px-3 py-1 text-[12px] font-semibold backdrop-blur">{stage}</span>)}</div>
          </StaggerItem>
        </Stagger>
      </div>
    </div>
  );
}
