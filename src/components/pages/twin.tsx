"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ClockCounterClockwise, Lightning, Warning } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { ConfidenceMeter, EvidenceBadge, evidenceMeta } from "@/components/common/evidence";
import { AnimatedNumber, Meter, Ring } from "@/components/system/data";
import { PageHeader, PageShell, Rise, Section } from "@/components/shell/page-header";
import { skills, targetRole, today } from "@/lib/mock/data";
import type { EvidenceState, Skill } from "@/lib/mock/types";
import { ease, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

const activity = [
  { date: "Oct 30", text: "Tutor lecture, chapter 1 completed", effect: "RAG confidence 0.34 to 0.41" },
  { date: "Oct 27", text: "Mock technical interview", effect: "Communication demonstrated at level 3" },
  { date: "Oct 19", text: "semantic-notes project evaluated", effect: "Vector databases moved to supported" },
  { date: "Oct 11", text: "Week 1 assessment passed with 84", effect: "Embeddings moved to demonstrated" },
];

const stateOrder: EvidenceState[] = ["demonstrated", "supported", "transferable", "gap", "unknown"];
const stateFill: Record<EvidenceState, string> = {
  demonstrated: "bg-success",
  supported: "bg-info",
  transferable: "bg-warning",
  gap: "bg-danger",
  unknown: "bg-gray-6",
};

function monthsSince(date: string) {
  if (date === "never") return Infinity;
  return (new Date(today).getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24 * 30);
}

export function TwinView() {
  const [focus, setFocus] = useState<string>("rag");
  const selected = skills.find((skill) => skill.id === focus)!;
  const strengths = skills.filter((skill) => skill.state === "demonstrated").sort((a, b) => b.importance - a.importance);
  const weaknesses = skills.filter((skill) => skill.state === "gap" || skill.state === "unknown").sort((a, b) => b.priority - a.priority);
  const outdated = skills.filter((skill) => monthsSince(skill.lastUsed) > 3 && skill.lastUsed !== "never");

  return (
    <PageShell>
      <PageHeader
        context="Updated after every lesson, assessment and interview"
        title="What you can actually demonstrate"
        description="Your digital twin is the model of your skills that the rest of the product reads from. A claim never counts as proof here: only evidence moves a skill."
      />

      <Rise>
        <Card className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex items-center gap-4 sm:border-r sm:border-border sm:pr-8">
            <Ring value={targetRole.readiness} size={72} stroke={6}>
              <span className="text-[17px] font-semibold tracking-tight tabular">
                <AnimatedNumber value={targetRole.readiness} />
              </span>
            </Ring>
            <div className="flex flex-col">
              <span className="text-[14px] font-medium text-foreground">Role readiness</span>
              <span className="text-gray-10 text-[12.5px]">Share of {targetRole.title} requirements backed by evidence</span>
            </div>
          </div>
          <EvidenceComposition />
        </Card>
      </Rise>

      {/* Graph gets the full width so labels render at true size; the
          inspector sits directly beneath it so selection and detail read as
          one unit. */}
      <Section title="How your skills depend on each other" description="Select a skill to see what it builds on and what it unlocks.">
        <Card className="overflow-hidden">
          <DependencyGraph focusId={selected.id} onSelect={setFocus} />
          <SkillInspector skill={selected} />
        </Card>
      </Section>

      <Rise>
        <Card className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-3">
          <SkillColumn
            icon={<Lightning size={15} weight="fill" className="text-success" />}
            title="Strongest proof"
            items={strengths}
            right={(skill) => <span className="text-gray-11 text-[12.5px] tabular">{skill.demonstrated} of 5</span>}
            onSelect={setFocus}
          />
          <SkillColumn
            icon={<Warning size={15} weight="fill" className="text-danger" />}
            title="Biggest gaps"
            items={weaknesses}
            right={(skill) => <EvidenceBadge state={skill.state} withIcon={false} />}
            onSelect={setFocus}
            className="border-border max-md:border-t md:border-x"
          />
          <SkillColumn
            icon={<ClockCounterClockwise size={15} className="text-warning" />}
            title="Going stale"
            items={outdated}
            right={(skill) => <span className="text-gray-10 text-[12.5px] tabular">{skill.lastUsed}</span>}
            onSelect={setFocus}
            empty="Every proven skill has been used in the last 90 days."
            footer="Unused skills get a short refresher added to your plan."
            className="max-md:border-t max-md:border-border"
          />
        </Card>
      </Rise>

      <Section title="What changed the model" description="Every adjustment, dated and tied to the evidence that caused it.">
        <ol className="relative flex flex-col gap-6">
          <span className="bg-border absolute top-2 bottom-2 left-[5px] w-px" aria-hidden="true" />
          {activity.map((item, index) => (
            <li key={item.date + item.text} className="relative grid gap-1 pl-7 sm:grid-cols-[72px_minmax(0,1fr)] sm:gap-4">
              <span className={cn("absolute top-[6px] left-0 size-[11px] rounded-full border-2 border-background", index === 0 ? "bg-brand" : "bg-gray-8")} aria-hidden="true" />
              <span className="text-gray-10 text-[12.5px] tabular sm:pt-px">{item.date}</span>
              <div className="flex flex-col gap-0.5">
                <span className="text-[14px] text-foreground">{item.text}</span>
                <span className="text-gray-11 text-[12.5px]">{item.effect}</span>
              </div>
            </li>
          ))}
        </ol>
      </Section>
    </PageShell>
  );
}

/** 100% bar of the five evidence states, segments growing in sequence. */
function EvidenceComposition() {
  const reduce = useReducedMotion();
  const counts = stateOrder.map((state) => ({ state, count: skills.filter((skill) => skill.state === state).length })).filter((entry) => entry.count > 0);
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      <div className="flex h-3 gap-[3px] overflow-hidden rounded-full" role="img" aria-label={counts.map((entry) => `${entry.count} ${evidenceMeta[entry.state].label}`).join(", ")}>
        {counts.map((entry, index) => (
          <motion.span
            key={entry.state}
            className={cn("h-full origin-left first:rounded-l-full last:rounded-r-full", stateFill[entry.state])}
            style={{ flexGrow: entry.count, flexBasis: 0 }}
            initial={reduce ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.2 + index * 0.1, duration: 0.6, ease: ease.out }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1.5">
        {counts.map((entry) => (
          <span key={entry.state} className="flex items-center gap-2 text-[12.5px]">
            <span className={cn("size-2 rounded-[2px]", stateFill[entry.state])} />
            <span className="text-gray-11">{evidenceMeta[entry.state].label}</span>
            <span className="font-medium text-foreground tabular">{entry.count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function SkillInspector({ skill }: { skill: Skill }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={skill.id}
        initial={reduce ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, transition: { duration: 0.1 } }}
        transition={{ duration: 0.28, ease: ease.out }}
        className="grid grid-cols-[minmax(0,1fr)] border-t border-border md:grid-cols-3"
      >
          <div className="flex flex-col gap-2 p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-[18px] leading-tight font-semibold tracking-[-0.02em] text-foreground">{skill.label}</h2>
              <EvidenceBadge state={skill.state} />
            </div>
            <p className="text-gray-11 text-[13px] leading-relaxed">{evidenceMeta[skill.state].meaning}</p>
          </div>
          <div className="flex flex-col gap-4 border-border p-5 max-md:border-t md:border-x">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[12.5px]">
                <span className="text-gray-11">Proven level</span>
                <span className="text-foreground tabular">{skill.demonstrated} of 5</span>
              </div>
              <Meter value={skill.demonstrated} max={5} tone="ink" label="Proven level" />
            </div>
            <div className="flex items-center justify-between text-[12.5px]">
              <span className="text-gray-11">Confidence</span>
              <ConfidenceMeter confidence={skill.confidence} />
            </div>
            <div className="flex items-center justify-between text-[12.5px]">
              <span className="text-gray-11">Last used</span>
              <span className="text-foreground tabular">{skill.lastUsed === "never" ? "Never" : skill.lastUsed}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2.5 border-border p-5 max-md:border-t">
            <span className="text-gray-11 text-[12.5px] font-medium">Evidence</span>
            {skill.evidence.length ? (
              skill.evidence.map((item) => (
                <figure key={item.id} className="border-gray-6 flex flex-col gap-1 border-l-2 pl-3">
                  <blockquote className="text-[13px] leading-relaxed text-foreground">&ldquo;{item.excerpt}&rdquo;</blockquote>
                  <figcaption className="text-gray-10 text-[12px]">
                    {item.source} · {item.capturedAt}
                  </figcaption>
                </figure>
              ))
            ) : (
              <p className="text-gray-10 text-[13px] leading-relaxed">
                Nothing captured yet. Passing a challenge or linking a repository moves this skill forward.
              </p>
            )}
          </div>
      </motion.div>
    </AnimatePresence>
  );
}

function SkillColumn({
  icon,
  title,
  items,
  right,
  onSelect,
  empty,
  footer,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  items: Skill[];
  right: (skill: Skill) => React.ReactNode;
  onSelect: (id: string) => void;
  empty?: string;
  footer?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col p-5", className)}>
      <h3 className="mb-2 flex items-center gap-2 text-[13.5px] font-medium text-foreground">
        {icon} {title}
      </h3>
      {items.length ? (
        <ul className="-mx-2 flex flex-col">
          {items.map((skill) => (
            <li key={skill.id}>
              <button type="button" onClick={() => onSelect(skill.id)} className="hover:bg-gray-3 flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-left transition-colors">
                <span className="truncate text-[13px] text-foreground">{skill.label}</span>
                {right(skill)}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-10 py-2 text-[13px]">{empty}</p>
      )}
      {footer && <p className="text-gray-10 mt-auto pt-3 text-[12px]">{footer}</p>}
    </div>
  );
}

/**
 * Prerequisite graph, laid out in dependency-depth columns (left builds the
 * right). Selecting a node lights up its direct prerequisites and dependents;
 * everything else recedes. Edge and node colour changes are CSS transitions,
 * so re-focusing feels continuous.
 */
function DependencyGraph({ focusId, onSelect }: { focusId: string; onSelect: (id: string) => void }) {
  const reduce = useReducedMotion();
  const layout = useMemo(() => {
    const depth = (id: string, seen = new Set<string>()): number => {
      const skill = skills.find((entry) => entry.id === id);
      if (!skill || seen.has(id) || skill.dependsOn.length === 0) return 0;
      seen.add(id);
      return 1 + Math.max(...skill.dependsOn.map((dep) => depth(dep, new Set(seen))));
    };
    const nodes = skills.filter((skill) => skill.category !== "professional");
    const maxDepth = Math.max(...nodes.map((node) => depth(node.id)));
    const columns = Array.from({ length: maxDepth + 1 }, (_, level) => nodes.filter((node) => depth(node.id) === level));
    // Geometry is in px of the rendered card (~1120 wide), so 12px labels
    // render at 12px. Columns gap 44px leaves room for the curved edges.
    const rowGap = 58;
    const height = Math.max(...columns.map((column) => column.length)) * rowGap + 36;
    const width = 1120;
    const colGap = 44;
    const colWidth = (width - 40 - colGap * (columns.length - 1)) / columns.length;
    const charWidth = 6.05;
    const position = new Map<string, { x: number; y: number; w: number; text: string }>();
    columns.forEach((column, columnIndex) => {
      column.forEach((node, rowIndex) => {
        const w = Math.min(colWidth, node.label.length * charWidth + 34);
        const maxChars = Math.floor((w - 34) / charWidth);
        const text = node.label.length > maxChars ? node.label.slice(0, maxChars - 1) + "…" : node.label;
        position.set(node.id, {
          x: 20 + columnIndex * (colWidth + colGap),
          y: Math.round(((rowIndex + 0.5) / column.length) * (height - 36)) + 18,
          w,
          text,
        });
      });
    });
    return { nodes, position, width, height };
  }, []);

  const { nodes, position, width, height } = layout;
  const focus = skills.find((skill) => skill.id === focusId);
  const related = new Set([focusId, ...(focus?.dependsOn ?? []), ...nodes.filter((node) => node.dependsOn.includes(focusId)).map((node) => node.id)]);
  const dot: Record<EvidenceState, string> = {
    demonstrated: "var(--success)",
    supported: "var(--info)",
    transferable: "var(--warning)",
    gap: "var(--danger)",
    unknown: "var(--gray-8)",
  };

  return (
    <div className="scroll-slim overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="block w-full min-w-[880px]" role="group" aria-label={"Skill dependencies, focused on " + focus?.label}>
        {nodes.flatMap((node) =>
          node.dependsOn.map((dep) => {
            const from = position.get(dep);
            const to = position.get(node.id);
            if (!from || !to) return null;
            const active = node.id === focusId || dep === focusId;
            const x1 = from.x + from.w;
            const x2 = to.x;
            const mid = (x1 + x2) / 2;
            return (
              <motion.path
                key={dep + node.id}
                d={`M${x1},${from.y} C${mid},${from.y} ${mid},${to.y} ${x2},${to.y}`}
                fill="none"
                style={{ transition: "stroke 200ms, stroke-width 200ms, opacity 200ms" }}
                stroke={active ? "var(--brand)" : "var(--gray-6)"}
                strokeWidth={active ? 2 : 1.25}
                opacity={active ? 1 : related.size > 1 ? 0.55 : 1}
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.9, ease: ease.out, delay: 0.2 }}
              />
            );
          }),
        )}
        {nodes.map((node, index) => {
          const point = position.get(node.id)!;
          const isFocus = node.id === focusId;
          const isRelated = related.has(node.id);
          return (
            <motion.g
              key={node.id}
              role="button"
              tabIndex={0}
              aria-pressed={isFocus}
              aria-label={node.label + ", " + evidenceMeta[node.state].label}
              onClick={() => onSelect(node.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(node.id);
                }
              }}
              className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-[var(--ring)]"
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: isRelated || related.size <= 1 ? 1 : 0.45, y: 0 }}
              transition={{ opacity: { duration: 0.2 }, y: { delay: index * 0.025, ...spring.gentle } }}
              whileHover={reduce ? undefined : { scale: 1.03 }}
              style={{ transformOrigin: `${point.x + point.w / 2}px ${point.y}px` }}
            >
              <rect
                x={point.x}
                y={point.y - 15}
                width={point.w}
                height={30}
                rx={8}
                fill={isFocus ? "var(--gray-12)" : "var(--card)"}
                stroke={isFocus ? "var(--gray-12)" : "var(--border-strong)"}
                strokeWidth={1}
                style={{ transition: "fill 200ms, stroke 200ms" }}
              />
              <circle cx={point.x + 13} cy={point.y} r={3.5} fill={dot[node.state]} />
              <text
                x={point.x + 23}
                y={point.y + 4}
                fontSize="12"
                fontFamily="var(--font-sans)"
                fontWeight={isFocus ? 600 : 450}
                fill={isFocus ? "var(--gray-1)" : "var(--foreground)"}
                style={{ transition: "fill 200ms" }}
              >
                {point.text}
              </text>
              <title>{node.label}</title>
            </motion.g>
          );
        })}
      </svg>
      <div className="text-gray-10 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border px-4 py-2.5 text-[12px]">
        <span>Left builds the right</span>
        <span className="ml-auto flex items-center gap-1.5"><span className="bg-brand h-0.5 w-4 rounded-full" /> Direct link to selected skill</span>
      </div>
    </div>
  );
}

