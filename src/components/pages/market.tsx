"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check, CloudArrowDown, FileText, Minus, Sparkle, TrendDown, TrendUp, UploadSimple } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThinkingDots } from "@/components/motion/primitives";
import { PageHeader, PageShell, SectionHeading } from "@/components/shell/page-header";
import { marketTrends, postings, skillDemand, targetRole } from "@/lib/mock/data";
import { cn } from "@/lib/utils";

export function MarketView() {
  const reduce = useReducedMotion();
  const [pasted, setPasted] = useState("");
  const [analysing, setAnalysing] = useState(false);
  const [analysed, setAnalysed] = useState(false);
  const allSkills = [...new Set(postings.flatMap((posting) => [...posting.required, ...posting.preferred]))];

  return (
    <PageShell className="flex flex-col gap-7">
      <PageHeader
        icon="market"
        context={targetRole.postingsAnalysed + " postings analysed for " + targetRole.title}
        title="Job Market Intelligence"
        description="What companies actually ask for, extracted from real job descriptions: required and preferred skills, experience, technologies and deliverables, with how demand is moving."
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
        <Card>
          <CardContent className="flex flex-col gap-4">
            <h2 className="text-[15px] font-bold">Add a job description</h2>
            <Tabs defaultValue="paste" className="flex flex-col gap-3">
              <TabsList className="self-start">
                <TabsTrigger value="paste"><FileText /> Paste</TabsTrigger>
                <TabsTrigger value="upload"><UploadSimple /> Upload</TabsTrigger>
                <TabsTrigger value="api"><CloudArrowDown /> Job sources</TabsTrigger>
              </TabsList>
              <TabsContent value="paste" className="flex flex-col gap-3">
                <label htmlFor="jd-paste" className="sr-only">Job description text</label>
                <Textarea id="jd-paste" className="min-h-36" value={pasted} onChange={(event) => setPasted(event.target.value)} placeholder="Paste the full job description here" />
                <Button size="sm" className="self-start" disabled={!pasted.trim() || analysing}
                  onClick={() => { setAnalysing(true); setAnalysed(false); window.setTimeout(() => { setAnalysing(false); setAnalysed(true); }, 1400); }}>
                  <Sparkle size={13} weight="fill" /> Extract requirements
                </Button>
                {analysing && <span className="flex items-center gap-2 text-[12px]"><ThinkingDots /><span className="text-shimmer font-semibold">Extracting role, skills and experience</span></span>}
                {analysed && (
                  <motion.div initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="bg-raised flex flex-col gap-2 rounded-lg border p-3 text-[12.5px]">
                    <span className="font-bold">Extracted: Applied AI Engineer</span>
                    <span>Required: Python, RAG, Evaluation, Vector databases</span>
                    <span>Preferred: Docker, FastAPI</span>
                    <span className="text-muted-foreground">Experience: 2+ years. Added to the market skill graph.</span>
                  </motion.div>
                )}
              </TabsContent>
              <TabsContent value="upload">
                <div className="hover:border-primary/50 flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors">
                  <UploadSimple size={22} className="text-primary" />
                  <span className="text-[13px] font-semibold">Drop PDF or DOCX job descriptions</span>
                  <span className="text-muted-foreground text-[11.5px]">Extraction runs on each file. Up to 10 at a time.</span>
                  <Button variant="secondary" size="sm">Choose files</Button>
                </div>
              </TabsContent>
              <TabsContent value="api" className="flex flex-col gap-2">
                {["Permitted job board API", "Company careers pages you follow", "Saved searches"].map((source, index) => (
                  <div key={source} className="flex items-center justify-between rounded-lg border p-3 text-[12.5px]">
                    <span className="font-semibold">{source}</span>
                    <Badge variant={index === 0 ? "demonstrated" : "neutral"}>{index === 0 ? "Syncing daily" : "Off"}</Badge>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4">
            <SectionHeading title="Skill demand frequency" description="Share of postings that mention each skill, with the change against the previous 90 days." />
            <ul className="flex flex-col gap-2.5">
              {skillDemand.map((row, index) => (
                <li key={row.skill} className="grid grid-cols-[130px_1fr_70px] items-center gap-3">
                  <span className="truncate text-[12.5px] font-semibold">{row.skill}</span>
                  <div className="bg-raised relative h-5 overflow-hidden rounded-md">
                    <motion.div className="bg-brand absolute inset-y-0 left-0 origin-left rounded-md" style={{ width: row.frequency + "%" }}
                      initial={reduce ? false : { scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.9, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }} />
                    <div className="absolute inset-y-0 left-0 bg-[color-mix(in_oklch,var(--foreground)_18%,transparent)]" style={{ width: row.mandatoryShare + "%" }} title="Share where it is mandatory" />
                    <span className="numeric text-primary-foreground absolute inset-y-0 left-2 flex items-center text-[10.5px] font-bold">{row.frequency}%</span>
                  </div>
                  <span className={cn("numeric flex items-center gap-1 text-[11.5px] font-bold", row.change > 0 ? "text-primary" : row.change < 0 ? "text-gap" : "text-muted-foreground")}>
                    {row.change > 0 ? <TrendUp size={12} /> : row.change < 0 ? <TrendDown size={12} /> : <Minus size={12} />}
                    {row.change > 0 ? "+" : ""}{row.change}
                  </span>
                </li>
              ))}
            </ul>
            <span className="text-muted-foreground text-[11px]">Darker inner band: share of postings where the skill is mandatory.</span>
          </CardContent>
        </Card>
      </div>

      <section>
        <SectionHeading title="Market skill graph" description="Skills that appear together in postings. Bubble size is demand; links are co-occurrence." />
        <Card><CardContent><MarketGraph /></CardContent></Card>
      </section>

      <section>
        <SectionHeading title="Emerging trends" />
        <div className="grid gap-4 md:grid-cols-3">
          {marketTrends.map((trend, index) => (
            <motion.div key={trend.label} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.08 }}>
              <Card className="h-full"><CardContent className="flex flex-col gap-2">
                <TrendUp size={18} className={index === 2 ? "text-gap rotate-90" : "text-primary"} />
                <span className="text-[13.5px] font-bold">{trend.label}</span>
                <span className="text-muted-foreground text-[12px] leading-relaxed">{trend.detail}</span>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading title="Compare job descriptions" description="Side by side, every extracted requirement. Filled marks are required, outlined are preferred." />
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-[12.5px]">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left font-bold">Skill</th>
                {postings.map((posting) => (
                  <th key={posting.id} className="p-3 text-left font-semibold">
                    <span className="block">{posting.company}</span>
                    <span className="text-muted-foreground block text-[11px] font-normal">{posting.source}, {posting.ingestedAt.slice(5)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allSkills.map((skill) => (
                <tr key={skill} className="hover:bg-raised border-b last:border-b-0">
                  <td className="p-3 font-semibold">{skill}</td>
                  {postings.map((posting) => (
                    <td key={posting.id} className="p-3">
                      {posting.required.includes(skill) ? <span className="bg-primary text-primary-foreground grid size-5 place-items-center rounded-full"><Check size={11} weight="bold" /></span>
                        : posting.preferred.includes(skill) ? <span className="border-primary grid size-5 rounded-full border-2" /> : <span className="text-muted-foreground">-</span>}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-raised/60">
                <td className="p-3 font-semibold">Experience</td>
                {postings.map((posting) => <td key={posting.id} className="p-3">{posting.experience}</td>)}
              </tr>
              <tr className="bg-raised/60">
                <td className="p-3 font-semibold">Deliverables</td>
                {postings.map((posting) => <td key={posting.id} className="text-muted-foreground p-3">{posting.deliverables.join(", ")}</td>)}
              </tr>
              <tr className="bg-raised/60">
                <td className="p-3 font-semibold">Technologies</td>
                {postings.map((posting) => <td key={posting.id} className="p-3"><div className="flex flex-wrap gap-1">{posting.technologies.map((tech) => <Badge key={tech} variant="neutral">{tech}</Badge>)}</div></td>)}
              </tr>
            </tbody>
          </table>
        </Card>
      </section>
    </PageShell>
  );
}

/** Animated bubble graph of co-occurring skills. */
function MarketGraph() {
  const reduce = useReducedMotion();
  const width = 900;
  const height = 300;
  const nodes = skillDemand.map((row, index) => {
    const angle = (index / skillDemand.length) * Math.PI * 2;
    const ring = index === 0 ? 0 : index < 5 ? 105 : 150;
    return {
      ...row,
      x: Math.round(width / 2 + Math.cos(angle) * ring * 2.1),
      y: Math.round(height / 2 + Math.sin(angle) * ring * 0.85),
      r: Math.round(14 + row.frequency / 3.2),
    };
  });
  const links: [number, number][] = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 7], [0, 6], [5, 6], [3, 4], [2, 4], [0, 5]];

  return (
    <svg viewBox={"0 0 " + width + " " + height} className="w-full" role="img" aria-label="Market skill graph: Python at the centre, linked to RAG, LLM APIs, vector databases and evaluation.">
      <defs>
        <radialGradient id="bubble" cx="35%" cy="30%">
          <stop offset="0%" stopColor="var(--brand-2)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.9" />
        </radialGradient>
      </defs>
      {links.map(([a, b], index) => (
        <motion.line key={a + "-" + b} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke="var(--border)" strokeWidth={1.5}
          initial={reduce ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 + index * 0.05 }} />
      ))}
      {nodes.map((node, index) => (
        <motion.g key={node.skill} initial={reduce ? false : { scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 16, delay: index * 0.06 }} style={{ originX: node.x + "px", originY: node.y + "px" }}>
          <motion.g animate={reduce ? undefined : { y: [0, -4, 0] }} transition={{ duration: 4 + index * 0.3, repeat: Infinity, ease: "easeInOut" }}>
            <circle cx={node.x} cy={node.y} r={node.r} fill="url(#bubble)" opacity={0.25 + node.frequency / 140} />
            <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--foreground)">{node.skill}</text>
          </motion.g>
        </motion.g>
      ))}
    </svg>
  );
}
