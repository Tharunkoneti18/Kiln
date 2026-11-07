"use client";

import { useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { Check, CloudArrowDown, FileText, Sparkle, TrendDown, TrendUp, UploadSimple } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Delta } from "@/components/system/data";
import { useToast } from "@/components/system/toast";
import { PageHeader, PageShell, Rise, Section } from "@/components/shell/page-header";
import { marketTrends, postings, skillDemand, targetRole } from "@/lib/mock/data";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function MarketView() {
  const allSkills = [...new Set(postings.flatMap((posting) => [...posting.required, ...posting.preferred]))];

  return (
    <PageShell>
      <PageHeader
        context={targetRole.postingsAnalysed + " postings analysed for " + targetRole.title}
        title="What the market actually asks for"
        description="Requirements extracted from real job postings: how often each skill appears, how often it is mandatory, and how that changed over the last 90 days."
      />

      <Section
        title="Skill demand"
        description="Share of postings that mention each skill. The darker band is the share where it is mandatory."
      >
        <Card className="p-5 sm:p-6">
          <DemandChart />
        </Card>
      </Section>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <Section title="Analyse a posting">
          <IngestPanel />
        </Section>
        <Section title="Shifts this quarter">
          <Card className="divide-y divide-border">
            {marketTrends.map((trend, index) => {
              const down = index === 2;
              return (
                <div key={trend.label} className="flex gap-3.5 p-4">
                  <span className={cn("grid size-8 shrink-0 place-items-center rounded-[8px]", down ? "bg-danger-soft text-danger" : "bg-success-soft text-success")}>
                    {down ? <TrendDown size={16} /> : <TrendUp size={16} />}
                  </span>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-[13.5px] font-medium text-foreground">{trend.label}</span>
                    <span className="text-gray-11 text-[13px] leading-relaxed">{trend.detail}</span>
                  </div>
                </div>
              );
            })}
          </Card>
        </Section>
      </div>

      <Section title="Postings side by side" description="Filled marks are mandatory, outlined marks are preferred.">
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-[13px]">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="text-gray-10 p-4 text-left text-[12px] font-medium">Skill</th>
                {postings.map((posting) => (
                  <th key={posting.id} scope="col" className="p-4 text-left font-normal">
                    <span className="block font-medium text-foreground">{posting.company}</span>
                    <span className="text-gray-10 block text-[11.5px]">{posting.source}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allSkills.map((skill) => (
                <tr key={skill} className="hover:bg-gray-2 transition-colors">
                  <th scope="row" className="p-4 text-left font-normal text-foreground">{skill}</th>
                  {postings.map((posting) => (
                    <td key={posting.id} className="p-4">
                      {posting.required.includes(skill) ? (
                        <span className="bg-gray-12 text-gray-1 grid size-[18px] place-items-center rounded-full" aria-label="Mandatory">
                          <Check size={10} weight="bold" />
                        </span>
                      ) : posting.preferred.includes(skill) ? (
                        <span className="border-gray-11 block size-[18px] rounded-full border-[1.5px]" aria-label="Preferred" />
                      ) : (
                        <span className="text-gray-8" aria-label="Not mentioned">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <th scope="row" className="text-gray-11 p-4 text-left font-normal">Experience</th>
                {postings.map((posting) => <td key={posting.id} className="p-4 text-foreground tabular">{posting.experience}</td>)}
              </tr>
              <tr>
                <th scope="row" className="text-gray-11 p-4 text-left align-top font-normal">Deliverables</th>
                {postings.map((posting) => <td key={posting.id} className="text-gray-11 p-4 align-top text-[12.5px] leading-relaxed">{posting.deliverables.join(", ")}</td>)}
              </tr>
              <tr>
                <th scope="row" className="text-gray-11 p-4 text-left align-top font-normal">Stack</th>
                {postings.map((posting) => (
                  <td key={posting.id} className="p-4 align-top">
                    <div className="flex flex-wrap gap-1">
                      {posting.technologies.map((tech) => <Badge key={tech} variant="neutral">{tech}</Badge>)}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </Card>
      </Section>
    </PageShell>
  );
}

/**
 * Horizontal bar per skill. Two layers: total frequency (light) and the
 * mandatory share (ink) on top, both growing from the left in sequence so
 * the eye reads top to bottom.
 */
function DemandChart() {
  const ref = useRef<HTMLUListElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const show = reduce || inView;

  return (
    <div className="flex flex-col gap-4">
      <div className="text-gray-10 flex flex-wrap items-center gap-4 text-[12px]">
        <span className="flex items-center gap-1.5"><span className="bg-gray-12 h-2 w-3 rounded-[2px]" /> Mandatory</span>
        <span className="flex items-center gap-1.5"><span className="bg-gray-5 h-2 w-3 rounded-[2px]" /> Mentioned</span>
        <span className="ml-auto">90-day change</span>
      </div>
      <ul ref={ref} className="flex flex-col gap-3">
        {skillDemand.map((row, index) => (
          <li key={row.skill} className="grid grid-cols-[minmax(88px,140px)_minmax(0,1fr)_44px_56px] items-center gap-3 sm:gap-4">
            <span className="truncate text-[13.5px] text-foreground">{row.skill}</span>
            <div className="bg-gray-3 relative h-6 overflow-hidden rounded-[5px]" role="img" aria-label={`${row.frequency}% of postings, ${row.mandatoryShare}% mandatory`}>
              <motion.div
                className="bg-gray-5 absolute inset-y-0 left-0 origin-left"
                style={{ width: row.frequency + "%" }}
                initial={reduce ? false : { scaleX: 0 }}
                animate={{ scaleX: show ? 1 : 0 }}
                transition={{ duration: 0.8, delay: index * 0.05, ease: ease.out }}
              />
              <motion.div
                className="bg-gray-12 absolute inset-y-0 left-0 origin-left"
                style={{ width: row.mandatoryShare + "%" }}
                initial={reduce ? false : { scaleX: 0 }}
                animate={{ scaleX: show ? 1 : 0 }}
                transition={{ duration: 0.8, delay: 0.15 + index * 0.05, ease: ease.out }}
              />
            </div>
            <span className="text-right text-[13px] font-medium text-foreground tabular">{row.frequency}%</span>
            <span className="text-right"><Delta value={row.change} suffix="%" /></span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function IngestPanel() {
  const reduce = useReducedMotion();
  const { toast } = useToast();
  const [pasted, setPasted] = useState("");
  const [status, setStatus] = useState<"idle" | "analysing" | "done">("idle");

  return (
    <Card className="p-5">
      <Tabs defaultValue="paste" className="flex flex-col gap-4">
        <TabsList className="self-start">
          <TabsTrigger value="paste"><FileText /> Paste</TabsTrigger>
          <TabsTrigger value="upload"><UploadSimple /> Upload</TabsTrigger>
          <TabsTrigger value="api"><CloudArrowDown /> Feeds</TabsTrigger>
        </TabsList>

        <TabsContent value="paste" className="flex flex-col gap-3">
          <label htmlFor="jd-paste" className="text-gray-11 text-[12.5px] font-medium">Job description</label>
          <Textarea
            id="jd-paste"
            className="min-h-32"
            value={pasted}
            onChange={(event) => setPasted(event.target.value)}
            placeholder="Paste the full posting: requirements, stack, experience"
          />
          <div className="flex items-center gap-3">
            <Button
              disabled={!pasted.trim()}
              loading={status === "analysing"}
              onClick={() => {
                setStatus("analysing");
                window.setTimeout(() => setStatus("done"), 1200);
              }}
            >
              {status !== "analysing" && <Sparkle weight="fill" />}
              {status === "analysing" ? "Extracting" : "Extract requirements"}
            </Button>
            {status === "analysing" && <span className="text-shimmer text-[12.5px]">Reading requirements and stack</span>}
          </div>

          <AnimatePresence>
            {status === "done" && (
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: ease.out }}
                className="bg-gray-2 flex flex-col gap-3 rounded-[10px] border border-border p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13.5px] font-medium text-foreground">Applied AI Engineer</span>
                  <Badge variant="success"><Check weight="bold" /> Parsed</Badge>
                </div>
                <dl className="flex flex-col gap-2 text-[13px]">
                  <div className="flex gap-3"><dt className="text-gray-10 w-20 shrink-0">Mandatory</dt><dd className="text-foreground">Python, RAG architecture, vector databases, evaluation</dd></div>
                  <div className="flex gap-3"><dt className="text-gray-10 w-20 shrink-0">Preferred</dt><dd className="text-foreground">Docker, FastAPI, prompt design</dd></div>
                  <div className="flex gap-3"><dt className="text-gray-10 w-20 shrink-0">Experience</dt><dd className="text-foreground">2+ years</dd></div>
                </dl>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="upload">
          <div className="hover:border-gray-9 flex flex-col items-center gap-2 rounded-[10px] border border-dashed border-border-strong px-6 py-10 text-center transition-colors">
            <span className="bg-gray-3 text-gray-11 grid size-10 place-items-center rounded-[10px]"><UploadSimple size={18} /></span>
            <span className="text-[13.5px] font-medium text-foreground">Drop PDF or DOCX postings</span>
            <span className="text-gray-10 text-[12.5px]">Up to 10 files at once</span>
            <Button variant="secondary" size="sm" className="mt-2">Choose files</Button>
          </div>
        </TabsContent>

        <TabsContent value="api" className="flex flex-col divide-y divide-border rounded-[10px] border border-border">
          {[
            { label: "Greenhouse and Lever sync", on: true },
            { label: "Target company career pages", on: false },
            { label: "Saved keyword feeds", on: false },
          ].map((source) => (
            <div key={source.label} className="flex items-center justify-between gap-3 px-4 py-3 text-[13px]">
              <span className="text-foreground">{source.label}</span>
              {source.on ? (
                <Badge variant="success">Syncs daily</Badge>
              ) : (
                <Button variant="ghost" size="xs" onClick={() => toast({ title: "Feed connected", description: source.label })}>Connect</Button>
              )}
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
