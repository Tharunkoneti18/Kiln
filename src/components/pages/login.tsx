"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, GithubLogo, GoogleLogo, SealCheck } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Meter, Ring } from "@/components/system/data";
import { Segmented } from "@/components/system/segmented";
import { BrandLockup } from "@/components/shell/brand";
import { ease, spring } from "@/lib/motion";

export function LoginView() {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <div className="bg-background grid min-h-[100dvh] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex flex-col justify-between gap-10 px-6 py-7 sm:px-12">
        <BrandLockup />

        <div className="mx-auto flex w-full max-w-[360px] flex-col gap-7">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
              transition={{ duration: 0.3, ease: ease.out }}
              className="flex flex-col gap-2"
            >
              <h1 className="type-title text-foreground">{mode === "signin" ? "Welcome back" : "Start with where you are"}</h1>
              <p className="text-gray-11 text-[14.5px] leading-relaxed">
                {mode === "signin" ? "Pick up where you left off." : "We map your skills against a real role, then build the shortest path to it."}
              </p>
            </motion.div>
          </AnimatePresence>

          <Segmented
            label="Account"
            value={mode}
            onChange={setMode}
            options={[
              { value: "signin", label: "Sign in" },
              { value: "signup", label: "Create account" },
            ]}
            className="w-full [&>button]:flex-1 [&>button]:justify-center"
          />

          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary"><GoogleLogo weight="bold" /> Google</Button>
            <Button variant="secondary"><GithubLogo weight="fill" /> GitHub</Button>
          </div>

          <div className="text-gray-10 flex items-center gap-3 text-[12px]">
            <span className="bg-border h-px flex-1" /> or with email <span className="bg-border h-px flex-1" />
          </div>

          <form className="flex flex-col gap-4" onSubmit={(event) => event.preventDefault()}>
            <AnimatePresence initial={false}>
              {mode === "signup" && (
                <motion.div
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.24, ease: ease.out }}
                  className="overflow-hidden"
                >
                  <Field className="pb-px">
                    <Label htmlFor="au-name">Full name</Label>
                    <Input id="au-name" autoComplete="name" />
                  </Field>
                </motion.div>
              )}
            </AnimatePresence>
            <Field>
              <Label htmlFor="au-email">Email</Label>
              <Input id="au-email" type="email" autoComplete="email" />
            </Field>
            <Field>
              <div className="flex items-baseline justify-between">
                <Label htmlFor="au-password">Password</Label>
                {mode === "signin" && (
                  <button type="button" className="text-gray-10 hover:text-foreground text-[12.5px] transition-colors">
                    Forgot password?
                  </button>
                )}
              </div>
              <Input id="au-password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} />
            </Field>
            <Button asChild size="lg" className="mt-2 w-full">
              <Link href={mode === "signin" ? "/" : "/onboarding"}>{mode === "signin" ? "Sign in" : "Create account"}</Link>
            </Button>
          </form>
        </div>

        <p className="text-gray-10 text-[12px]">Your data stays yours. Export or delete it any time from settings.</p>
      </div>

      <div className="bg-gray-2 relative hidden overflow-hidden border-l border-border lg:flex lg:flex-col lg:justify-center lg:px-14">
        <div className="bg-dots absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_60%_45%,black_15%,transparent_70%)]" aria-hidden="true" />
        <div className="relative flex max-w-[520px] flex-col gap-10">
          <div className="flex flex-col gap-3">
            <h2 className="type-display text-foreground">Turn what you know into proof.</h2>
            <p className="text-gray-11 max-w-[44ch] text-[15px] leading-relaxed">
              Learn the skills a role demands, prove them with real work, and watch your readiness move with every result.
            </p>
          </div>
          <ProductStory />
        </div>
      </div>
    </div>
  );
}

/**
 * The product loop, told with the product's own components: a task gets
 * done, the skill it proves turns green, readiness ticks up. It plays once,
 * then rests on the final frame. Static final frame under reduced motion.
 */
function ProductStory() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(reduce ? 3 : 0);

  useEffect(() => {
    if (reduce) return;
    const timers = [900, 1900, 2800].map((delay, index) => window.setTimeout(() => setStep(index + 1), delay));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [reduce]);

  const readiness = step >= 3 ? 52 : 46;

  return (
    <div className="relative flex flex-col gap-3" aria-hidden="true">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: ease.out }}
        className="bg-card flex items-center gap-3.5 rounded-[12px] border border-border p-4 shadow-md"
      >
        <span className={`grid size-[18px] place-items-center rounded-[5px] border transition-colors duration-200 ${step >= 1 ? "bg-gray-12 border-gray-12 text-gray-1" : "border-gray-8"}`}>
          <AnimatePresence>
            {step >= 1 && (
              <motion.span initial={{ scale: 0.3 }} animate={{ scale: 1 }} transition={spring.snappy}>
                <Check size={11} weight="bold" />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <div className="flex flex-1 flex-col">
          <span className={`text-[13.5px] transition-colors ${step >= 1 ? "text-gray-10" : "font-medium text-foreground"}`}>Grounded Q&amp;A with citations</span>
          <span className="text-gray-10 text-[12px]">Assignment · 90 min</span>
        </div>
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.22, ease: ease.out }}
        className="bg-card ml-10 flex flex-col gap-2.5 rounded-[12px] border border-border p-4 shadow-md"
      >
        <div className="flex items-center justify-between">
          <span className="text-[13.5px] font-medium text-foreground">RAG architecture</span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={step >= 2 ? "proven" : "gap"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[11.5px] leading-none font-medium ${step >= 2 ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}
            >
              {step >= 2 ? <><SealCheck weight="fill" size={12} /> Demonstrated</> : "Gap"}
            </motion.span>
          </AnimatePresence>
        </div>
        <motion.div animate={{ opacity: 1 }}>
          <Meter key={step >= 2 ? "b" : "a"} value={step >= 2 ? 4 : 1} max={5} tone={step >= 2 ? "success" : "danger"} size="sm" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.34, ease: ease.out }}
        className="bg-card ml-20 flex items-center gap-4 rounded-[12px] border border-border p-4 shadow-md"
      >
        <Ring key={readiness} value={readiness} size={52} stroke={5}>
          <motion.span key={readiness} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }} className="text-[13px] font-semibold tabular">
            {readiness}
          </motion.span>
        </Ring>
        <div className="flex flex-col">
          <span className="text-[13.5px] font-medium text-foreground">Applied AI Engineer</span>
          <span className="text-gray-10 text-[12px]">
            Readiness{" "}
            <AnimatePresence>
              {step >= 3 && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-success font-medium">
                  +6 this week
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </div>
      </motion.div>
    </div>
  );
}
