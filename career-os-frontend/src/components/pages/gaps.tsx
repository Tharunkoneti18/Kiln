"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Clock, Cube } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfidenceMeter, EvidenceBadge, EvidenceDot, evidenceMeta } from "@/components/common/evidence";
import { GrowBar, Stagger, StaggerItem } from "@/components/motion/primitives";
import { PageHeader, PageShell, SectionHeading } from "@/components/shell/page-header";
import { SkillConstellation } from "@/components/three/skill-constellation";
import { roleOptions, skillById, skills, targetRole } from "@/lib/mock/data";
import type { EvidenceState } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

const groups = [
  { key: "missing", title: "Missing", hint: "Required, no supporting evidence", match: (s: (typeof skills)[number]) => s.state === "gap" },
  { key: "weak", title: "Weak", hint: "Shown below the level the role needs", match: (s: (typeof skills)[number]) => s.demonstrated > 0 && s.demonstrated < 3 && s.state !== "gap" },
  { key: "unverified", title: "Unverified claims", hint: "You claim more than you have shown", match: (s: (typeof skills)[number]) => s.claimed > s.demonstrated },
  { key: "transferable", title: "Transferable", hint: "Adjacent evidence, named bridge", match: (s: (typeof skills)[number]) => s.state === "transferable" },
];

export function GapsView() {
  const reduce = useReducedMotion();
  const [selectedId, setSelectedId] = useState("rag");
  const [requirement, setRequirement] = useState<"all" | "mandatory" | "preferred">("all");
  const selected = skillById(selectedId)!;
  const ranked = useMemo(
    () => skills.filter((skill) => skill.state !== "demonstrated").filter((skill) => requirement === "all" || skill.requirement === requirement).sort((a, b) => b.priority - a.priority),
    [requirement],
  );
  const totalEffort = ranked.reduce((sum, skill) => sum + skill.effortHours, 0);
  const comparison = roleOptions.slice(0, 4);

  return (
    <PageShell className="flex flex-col gap-7">
      <PageHeader
        icon="gaps"
        context={"Target: " + targetRole.title + ", updated after every assessment"}
        title="Skill Gap Analysis"
        description="Exactly what stands between you and the role: missing, weak, unverified and transferable skills, with prerequisites, importance and the effort to close each one."
        actions={<Button size="sm" asChild><Link href="/plan">Turn gaps into a plan <ArrowRight size={13} weight="bold" /></Link></Button>}
      />

      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {groups.map((group) => {
          const items = skills.filter(group.match);
          return (
            <StaggerItem key={group.key}>
              <Card className="h-full"><CardContent className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between"><span className="text-[13.5px] font-bold">{group.title}</span><span className="numeric text-[24px] font-bold">{items.length}</span></div>
                <span className="text-muted-foreground text-[11.5px]">{group.hint}</span>
                <div className="flex flex-wrap gap-1">{items.map((item) => <button key={item.id} type="button" onClick={() => setSelectedId(item.id)}><Badge variant={item.state}>{item.label}</Badge></button>)}</div>
              </CardContent></Card>
            </StaggerItem>
          );
        })}
      </Stagger>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Card className="relative overflow-hidden">
          <div className="absolute top-4 left-5 z-10 flex items-center gap-2"><Cube size={14} weight="duotone" className="text-primary" /><span className="text-[12px] font-bold">Distance from the centre is distance from proven</span></div>
          <div className="absolute bottom-4 left-5 z-10 flex flex-wrap gap-x-3 gap-y-1">
            {(["demonstrated", "supported", "transferable", "gap", "unknown"] as EvidenceState[]).map((state) => (
              <span key={state} className="text-muted-foreground flex items-center gap-1.5 text-[10.5px] font-semibold"><EvidenceDot state={state} />{evidenceMeta[state].label}</span>
            ))}
          </div>
          <SkillConstellation skills={skills} selectedId={selectedId} onSelect={setSelectedId} className="h-[440px] w-full" />
        </Card>

        <AnimatePresence mode="wait">
          <motion.div key={selected.id} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
            <Card className="h-full"><CardContent className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2"><h2 className="text-[19px] font-bold tracking-tight">{selected.label}</h2><EvidenceBadge state={selected.state} /></div>
              <p className="text-muted-foreground text-[12.5px]">{evidenceMeta[selected.state].meaning}</p>
              <div className="grid grid-cols-3 gap-3">
                <Mini label="Importance" value={String(selected.importance)} />
                <Mini label="Priority" value={String(selected.priority)} accent />
                <Mini label="Effort" value={selected.effortHours + "h"} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={selected.requirement === "mandatory" ? "gap" : "neutral"}>{selected.requirement}</Badge>
                <span className="text-muted-foreground text-[12px]">Claimed {selected.claimed}/5, shown {selected.demonstrated}/5</span>
                <ConfidenceMeter confidence={selected.confidence} />
              </div>
              {selected.bridge && <div className="border-transferable/40 bg-transferable/8 rounded-md border p-3 text-[12.5px]"><b className="text-transferable">Bridge: </b>{selected.bridge}</div>}
              <div className="flex flex-col gap-1.5">
                <h3 className="text-[12.5px] font-bold">Prerequisites</h3>
                {selected.dependsOn.length ? selected.dependsOn.map((id) => {
                  const dep = skillById(id)!;
                  return <button key={id} type="button" onClick={() => setSelectedId(id)} className="hover:bg-raised flex items-center justify-between rounded-md border px-3 py-2 text-[12.5px]"><span className="font-semibold">{dep.label}</span><EvidenceBadge state={dep.state} withIcon={false} /></button>;
                }) : <span className="text-muted-foreground text-[12px]">None. This can be learned straight away.</span>}
              </div>
              <Button variant="secondary" size="sm" asChild className="mt-auto self-start"><Link href="/plan">See where it is scheduled <ArrowRight size={13} /></Link></Button>
            </CardContent></Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <section>
        <SectionHeading
          title="Prioritised gap report"
          description={"Ordered by priority. Closing everything listed is about " + totalEffort + " hours of focused work."}
          actions={
            <div className="bg-raised flex rounded-md p-1">
              {(["all", "mandatory", "preferred"] as const).map((option) => (
                <button key={option} type="button" onClick={() => setRequirement(option)} aria-pressed={requirement === option} className={cn("rounded-[6px] px-3 py-1 text-[12px] font-semibold capitalize", requirement === option ? "bg-card shadow-sm" : "text-muted-foreground")}>{option}</button>
              ))}
            </div>
          }
        />
        <Card className="overflow-hidden">
          {ranked.map((skill, index) => (
            <button key={skill.id} type="button" onClick={() => setSelectedId(skill.id)} className={cn("grid w-full grid-cols-[24px_1fr_auto] items-center gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0 sm:grid-cols-[24px_1.3fr_1fr_90px_auto]", selectedId === skill.id ? "bg-primary/6" : "hover:bg-raised")}>
              <span className="numeric text-muted-foreground text-[12px] font-bold">{index + 1}</span>
              <span className="flex flex-col"><span className="text-[13px] font-semibold">{skill.label}</span><span className="text-muted-foreground text-[11px] capitalize">{skill.requirement}, depends on {skill.dependsOn.length || "nothing"}</span></span>
              <span className="hidden sm:block"><GrowBar value={skill.priority} delay={index * 0.04} className="h-1.5" /></span>
              <span className="text-muted-foreground hidden items-center gap-1 text-[11.5px] sm:flex"><Clock size={12} /> {skill.effortHours}h</span>
              <EvidenceBadge state={skill.state} withIcon={false} />
            </button>
          ))}
        </Card>
      </section>

      <section>
        <SectionHeading title="Compare target roles" description="The same evidence measured against different roles." />
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-[12.5px]">
            <thead><tr className="border-b"><th className="p-3 text-left">Role</th><th className="p-3 text-left">Ready</th><th className="p-3 text-left">Missing</th><th className="p-3 text-left">Effort</th></tr></thead>
            <tbody>
              {comparison.map((role) => (
                <tr key={role.id} className="border-b last:border-b-0">
                  <td className="p-3 font-semibold">{role.title}{role.isTarget && <Badge variant="primary" className="ml-2">Target</Badge>}</td>
                  <td className="w-[200px] p-3"><div className="flex items-center gap-2"><GrowBar value={role.compatibility} className="h-1.5" /><span className="numeric font-bold">{role.compatibility}%</span></div></td>
                  <td className="text-muted-foreground p-3">{role.missing.join(", ")}</td>
                  <td className="numeric p-3">{role.effortWeeks} wk</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </PageShell>
  );
}

function Mini({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return <div className="flex flex-col gap-1"><span className="text-muted-foreground text-[11px] font-semibold">{label}</span><span className={cn("numeric text-[19px] font-bold", accent && "text-primary")}>{value}</span></div>;
}
