"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type Variants,
} from "motion/react";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Staggered entrance for a group. Animates on mount rather than on scroll, so
 * it also works inside tabs and dialogs that start hidden.
 */
const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.04 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease } },
};

export function Stagger({ className, children }: { className?: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial={reduce ? false : "hidden"}
      animate="show"
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

/** Scroll reveal for long pages. Content below the fold eases in once. */
export function Reveal({
  className,
  children,
  delay = 0,
}: {
  className?: string;
  children: ReactNode;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Circular progress that draws itself. Used for evidence-backed values only:
 * readiness, coverage, completion.
 */
export function ProgressRing({
  value,
  size = 120,
  stroke = 10,
  label,
  sublabel,
  gradientId,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: ReactNode;
  sublabel?: string;
  gradientId: string;
}) {
  const reduce = useReducedMotion();
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(100, Math.max(0, value)) / 100);

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--brand-2)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={"url(#" + gradientId + ")"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={reduce ? false : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div className="flex flex-col items-center leading-none">
          {label}
          {sublabel && <span className="text-muted-foreground mt-1 text-[10.5px] font-semibold">{sublabel}</span>}
        </div>
      </div>
    </div>
  );
}

/** A bar that grows to its value. Transform-only, so it never triggers layout. */
export function GrowBar({
  value,
  className,
  barClassName,
  delay = 0,
}: {
  value: number;
  className?: string;
  barClassName?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <div className={cn("bg-raised h-2 w-full overflow-hidden rounded-full", className)}>
      <motion.div
        className={cn("bg-brand h-full origin-left rounded-full", barClassName)}
        style={{ width: Math.min(100, Math.max(0, value)) + "%" }}
        initial={reduce ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay, ease }}
      />
    </div>
  );
}

/**
 * Card whose border lights up under the cursor. The glow position is a motion
 * value, so moving the pointer never re-renders React.
 */
export function SpotlightCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const background = useMotionTemplate`radial-gradient(260px circle at ${x}px ${y}px, color-mix(in oklch, var(--primary) 16%, transparent), transparent 70%)`;

  return (
    <div
      className={cn(
        "group bg-card relative overflow-hidden rounded-xl border shadow-[var(--shadow-panel)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[var(--shadow-lifted)]",
        className,
      )}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        x.set(event.clientX - rect.left);
        y.set(event.clientY - rect.top);
      }}
      onPointerLeave={() => {
        x.set(-200);
        y.set(-200);
      }}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/** Subtle 3D tilt toward the pointer, spring-damped. */
export function TiltCard({ className, children }: { className?: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  const rotateX = useSpring(0, { stiffness: 180, damping: 18 });
  const rotateY = useSpring(0, { stiffness: 180, damping: 18 });

  return (
    <motion.div
      className={className}
      style={reduce ? undefined : { rotateX, rotateY, transformPerspective: 900 }}
      onPointerMove={(event) => {
        if (reduce) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        rotateY.set(px * 7);
        rotateX.set(-py * 7);
      }}
      onPointerLeave={() => {
        rotateX.set(0);
        rotateY.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/** Types a reply out character by character, the way the assistant answers. */
export function Typewriter({
  text,
  speed = 12,
  onDone,
}: {
  text: string;
  speed?: number;
  onDone?: () => void;
}) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? text.length : 0);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    if (reduce) {
      setShown(text.length);
      done.current?.();
      return;
    }
    setShown(0);
    let index = 0;
    const timer = window.setInterval(() => {
      index += 2;
      setShown(Math.min(index, text.length));
      if (index >= text.length) {
        window.clearInterval(timer);
        done.current?.();
      }
    }, speed);
    return () => window.clearInterval(timer);
  }, [reduce, speed, text]);

  return (
    <span>
      {text.slice(0, shown)}
      {shown < text.length && <span className="bg-primary ml-0.5 inline-block h-3.5 w-1.5 animate-pulse align-middle" />}
    </span>
  );
}

/** Three-dot "thinking" indicator for AI responses. */
export function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-label="Thinking">
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          className="bg-primary size-1.5 rounded-full"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.15 }}
        />
      ))}
    </span>
  );
}

/**
 * Quiet backdrop for hero panels: a neutral hairline grid that fades out
 * toward the edges. Deliberately not a colour wash, since the accent belongs
 * on interactive elements only.
 */
export function Aurora({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "bg-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_70%_30%,black_10%,transparent_70%)]",
        className,
      )}
    />
  );
}
