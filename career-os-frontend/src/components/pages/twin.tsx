"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowsClockwise, ClockCounterClockwise, Lightning, Warning } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ConfidenceMeter, EvidenceBadge, EvidenceDot, evidenceMeta } from "@/components/common/evidence";
import { ProgressRing, Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import { PageHeader, PageShell, SectionHeading } from "@/components/shell/page-header";
import { TwinOrb } from "@/components/three/twin-orb";
import { skills, targetRole, today } from "@/lib/mock/data";
import type { EvidenceState } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

const activity = [
  { date: "Oct 30", text: "Tutor lecture chapter 1 completed", effect: "RAG confidence 0.34 to 0.41" },
  { date: "Oct 27", text: "Mock technical interview", effect: "Communication demonstrated at 3" },
  { date: "Oct 19", text: "semantic-notes project evaluated", effect: "Vector databases moved to supported" },
  { date: "Oct 11", text: "Week 1 assessment passed, 84", effect: "Embeddings moved to demonstrated" },
];

function monthsSince(date: string) {
  if (date === "never") return Infinity;
  return (new Date(today).getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24 * 30);
}

export function TwinView() {
  const reduce = useReducedMotion();
  const [focus, setFocus] = useState<string>("rag");
  const selected = skills.find((skill) => skill.id === focus)!;
  const strengths = skills.filter((skill) => skill.state === "demonstrated").sort((a, b) => b.importance - a.importance);
  const weaknesses = skills.filter((skill) => skill.state === "gap" || skill.state === "unknown").sort((a, b) => b.priority - a.priority);
  const outdated = skills.filter((skill) => monthsSince(skill.lastUsed) > 3 && skill.lastUsed !== "never");
  const counts = (["demonstrated", "supported", "transferable", "gap", "unknown"] as EvidenceState[]).map((state) => ({
    state,
    count: skills.filter((skill) => skill.state === state).length,
  }));

  return (
    <PageShell className="flex flex-col gap-7">
      <PageHeader
        icon="twin"
        context="Central source of truth"
        title="Career Digital Twin"
        description="A continuously updated model of what you can actually demonstrate. It changes after every lecture, assessment, project and interview, and it never counts a claim as proof."
      />

      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <Card className="relative overflow-hidden">
          <CardContent className="p-0">
            <TwinOrb
              skills={skills}
              className="h-[420px] w-full"
              fallback={<div className="grid size-full place-items-center"><ProgressRing value={targetRole.readiness} size={200} gradientId="twin-fallback" label={<span className="numeric text-[36px] font-bold">{targetRole.readiness}%</span>} sublabel="evidence-backed" /></div>}
            />
            <div className="absolute top-4 left-5 flex flex-col gap-1.5">
              {counts.map((row) => (
                <span key={row.state} className="bg-card/80 flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold backdrop-blur">
                  <EvidenceDot state={row.state} /> {evidenceMeta[row.state].label} <span className="numeric text-muted-foreground">{row.count}</span>
                </span>
              ))}
            </div>
            <p className="text-muted-foreground absolute bottom-3 left-5 text-[11px]">Inner orbit: proven. Outer orbit: gaps. Move the pointer to tilt.</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-5">
            <div className="flex items-center gap-5">
              <ProgressRing value={targetRole.readiness} size={110} gradientId="twin-ring" label={<span className="numeric text-[24px] font-bold">{targetRole.readiness}%</span>} sublabel="ready" />
              <div className="flex flex-col gap-1">
                <span className="text-[14px] font-bold">Readiness for {targetRole.title}</span>
                <span className="text-muted-foreground text-[12px] leading-relaxed">Weighted share of required skills backed by an assessment, project or interview.</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-[12.5px] font-bold">Claimed versus demonstrated</h3>
              {skills.slice(0, 8).map((skill, index) => (
                <button key={skill.id} type="button" onClick={() => setFocus(skill.id)} className={cn("grid grid-cols-[120px_1fr] items-center gap-3 rounded-md px-2 py-1 text-left transition-colors", focus === skill.id ? "bg-primary/8" : "hover:bg-raised")}>
                  <span className="truncate text-[12px] font-semibold">{skill.label}</span>
                  <span className="relative h-3">
                    <span className="bg-border/70 absolute inset-y-0 left-0 rounded-full" style={{ width: (skill.claimed / 5) * 100 + "%" }} />
                    <motion.span
                      className="bg-brand absolute inset-y-[3px] left-0 origin-left rounded-full"
                      style={{ width: (skill.demonstrated / 5) * 100 + "%" }}
                      initial={reduce ? false : { scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.9, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </span>
                </button>
              ))}
              <span className="text-muted-foreground flex gap-4 text-[11px]">
                <span className="flex items-center gap-1.5"><span className="bg-border h-2 w-4 rounded-full" /> Claimed</span>
                <span className="flex items-center gap-1.5"><span className="bg-brand h-2 w-4 rounded-full" /> Demonstrated</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected skill detail with dependencies. */}
      <Card>
        <CardContent className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-[19px] font-bold tracking-tight">{selected.label}</h2>
              <EvidenceBadge state={selected.state} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Proficiency" value={selected.demonstrated + "/5"} />
              <Stat label="Last used" value={selected.lastUsed === "never" ? "Never" : selected.lastUsed.slice(5)} />
              <div className="flex flex-col gap-1"><span className="text-muted-foreground text-[11px] font-semibold">Confidence</span><ConfidenceMeter confidence={selected.confidence} /></div>
            </div>
            <h3 className="mt-2 text-[12.5px] font-bold">Verification</h3>
            {selected.evidence.length ? selected.evidence.map((item) => (
              <div key={item.id} className="bg-raised rounded-md p-3 text-[12.5px]">
                {item.excerpt}
                <span className="text-muted-foreground mt-1 block text-[11px]">{item.kind.replace("_", " ")} via {item.source}, {item.capturedAt}</span>
              </div>
            )) : <p className="text-muted-foreground rounded-md border border-dashed p-3 text-[12.5px]">No verification yet. This skill becomes demonstrated through an assessment or project.</p>}
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-[12.5px] font-bold">Skill dependencies</h3>
            <DependencyGraph focusId={selected.id} onSelect={setFocus} />
          </div>
        </CardContent>
      </Card>

      <Stagger className="grid gap-5 md:grid-cols-3">
        <StaggerItem>
          <Card className="h-full"><CardContent className="flex flex-col gap-3">
            <h3 className="flex items-center gap-2 text-[14px] font-bold"><Lightning size={15} weight="fill" className="text-primary" /> Strengths</h3>
            {strengths.map((skill) => <Row key={skill.id} label={skill.label} right={<Badge variant="demonstrated">{skill.demonstrated}/5</Badge>} />)}
          </CardContent></Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="h-full"><CardContent className="flex flex-col gap-3">
            <h3 className="flex items-center gap-2 text-[14px] font-bold"><Warning size={15} weight="fill" className="text-gap" /> Weaknesses</h3>
            {weaknesses.map((skill) => <Row key={skill.id} label={skill.label} right={<EvidenceBadge state={skill.state} withIcon={false} />} />)}
          </CardContent></Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="h-full"><CardContent className="flex flex-col gap-3">
            <h3 className="flex items-center gap-2 text-[14px] font-bold"><ClockCounterClockwise size={15} className="text-transferable" /> Possibly outdated</h3>
            {outdated.length ? outdated.map((skill) => <Row key={skill.id} label={skill.label} right={<span className="text-muted-foreground text-[11px]">Last used {skill.lastUsed}</span>} />) : <p className="text-muted-foreground text-[12px]">Nothing older than three months.</p>}
            <p className="text-muted-foreground text-[11.5px] leading-relaxed">Skills unused for more than three months are flagged so their confidence can be re-checked.</p>
          </CardContent></Card>
        </StaggerItem>
      </Stagger>

      <Reveal>
        <SectionHeading title="Skill development history" description="The twin updates after every learning activity." />
        <ol className="relative flex flex-col gap-4 border-l-2 border-dashed pl-6">
          {activity.map((item) => (
            <li key={item.date + item.text} className="relative">
              <span className="bg-brand absolute top-1 -left-[31px] grid size-4 place-items-center rounded-full"><ArrowsClockwise size={9} className="text-primary-foreground" /></span>
              <span className="text-muted-foreground text-[11px] font-bold">{item.date}</span>
              <p className="text-[13px] font-semibold">{item.text}</p>
              <p className="text-primary text-[12px]">{item.effect}</p>
            </li>
          ))}
        </ol>
      </Reveal>
    </PageShell>
  );
}

/** Prerequisite graph, laid out in dependency depth columns. */
function DependencyGraph({ focusId, onSelect }: { focusId: string; onSelect: (id: string) => void }) {
  const depth = (id: string, seen = new Set<string>()): number => {
    const skill = skills.find((entry) => entry.id === id);
    if (!skill || seen.has(id) || skill.dependsOn.length === 0) return 0;
    seen.add(id);
    return 1 + Math.max(...skill.dependsOn.map((dep) => depth(dep, seen)));
  };
  const nodes = skills.filter((skill) => skill.category !== "professional" && skill.id !== "sql");
  const columns = [0, 1, 2, 3].map((level) => nodes.filter((node) => depth(node.id) === level));
  const width = 520;
  const height = 240;
  const position = new Map<string, { x: number; y: number }>();
  columns.forEach((column, columnIndex) => {
    column.forEach((node, rowIndex) => {
      position.set(node.id, { x: 50 + columnIndex * ((width - 100) / 3), y: ((rowIndex + 1) * height) / (column.length + 1) });
    });
  });
  const focus = skills.find((skill) => skill.id === focusId);
  const related = new Set([focusId, ...(focus?.dependsOn ?? []), ...nodes.filter((node) => node.dependsOn.includes(focusId)).map((node) => node.id)]);

  return (
    <svg viewBox={"0 0 " + width + " " + height} className="w-full" role="img" aria-label={"Dependencies of " + focus?.label}>
      {nodes.flatMap((node) =>
        node.dependsOn.map((dep) => {
          const from = position.get(dep);
          const to = position.get(node.id);
          if (!from || !to) return null;
          const active = related.has(node.id) && related.has(dep);
          return (
            <motion.path
              key={dep + node.id}
              d={"M" + from.x + "," + from.y + " C" + (from.x + 60) + "," + from.y + " " + (to.x - 60) + "," + to.y + " " + to.x + "," + to.y}
              fill="none"
              stroke={active ? "var(--primary)" : "var(--border)"}
              strokeWidth={active ? 2 : 1}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1 }}
            />
          );
        }),
      )}
      {nodes.map((node) => {
        const point = position.get(node.id)!;
        const isFocus = node.id === focusId;
        return (
          <g key={node.id} transform={"translate(" + point.x + "," + point.y + ")"} className="cursor-pointer" onClick={() => onSelect(node.id)}>
            <circle r={isFocus ? 9 : 6} fill={"var(--state-" + node.state + ")"} opacity={related.has(node.id) ? 1 : 0.35} />
            <text y={-13} textAnchor="middle" fontSize="10.5" fontWeight={isFocus ? 700 : 500} fill="var(--foreground)" opacity={related.has(node.id) ? 1 : 0.5}>
              {node.label.split(" ")[0]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-[11px] font-semibold">{label}</span>
      <span className="numeric text-[15px] font-bold">{value}</span>
    </div>
  );
}

function Row({ label, right }: { label: string; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b pb-2 last:border-b-0">
      <span className="text-[12.5px] font-semibold">{label}</span>
      {right}
    </div>
  );
}
