"use client";

import { useState } from "react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { ArrowsClockwise, Bell, CalendarBlank, DotsSixVertical, FileText, Plus } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldHint, Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnimatedNumber, Meter } from "@/components/system/data";
import { useToast } from "@/components/system/toast";
import { PageHeader, PageShell, Rise, Section } from "@/components/shell/page-header";
import { applications as seed, resumeVariants } from "@/lib/mock/data";
import type { Application, ApplicationStage } from "@/lib/mock/types";
import { ease, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

const columns: { stage: ApplicationStage; label: string }[] = [
  { stage: "saved", label: "Saved" },
  { stage: "applied", label: "Applied" },
  { stage: "screen", label: "Screen" },
  { stage: "interview", label: "Interview" },
  { stage: "offer", label: "Offer" },
  { stage: "rejected", label: "Closed" },
  { stage: "no_response", label: "No reply" },
];
const stageLabel = Object.fromEntries(columns.map((column) => [column.stage, column.label])) as Record<ApplicationStage, string>;

export function ApplicationsView() {
  const reduce = useReducedMotion();
  const { toast } = useToast();
  const [items, setItems] = useState<Application[]>(seed);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<ApplicationStage | null>(null);

  const sent = items.filter((item) => item.appliedAt).length;
  const responded = items.filter((item) => item.recruiterResponded).length;
  const funnel = [
    { stage: "Applied", count: sent },
    { stage: "Got a reply", count: responded },
    { stage: "Interviewed", count: items.filter((item) => item.stage === "interview" || item.stage === "offer").length },
    { stage: "Offer", count: items.filter((item) => item.stage === "offer").length },
  ];

  const move = (id: string, stage: ApplicationStage) => {
    const item = items.find((entry) => entry.id === id);
    if (!item || item.stage === stage) return;
    setItems((prev) => prev.map((entry) => (entry.id === id ? { ...entry, stage } : entry)));
    toast({
      title: item.company + " moved to " + stageLabel[stage],
      action: { label: "Undo", onClick: () => setItems((prev) => prev.map((entry) => (entry.id === id ? { ...entry, stage: item.stage } : entry))) },
    });
  };

  return (
    <PageShell width="wide">
      <PageHeader
        context="Outcomes feed back into your plan"
        title="Every application, end to end"
        description="Stages, resume versions, follow-ups and what the outcomes are telling you."
        actions={
          <NewApplicationDialog
            onCreate={(application) => {
              setItems((prev) => [application, ...prev]);
              toast({ title: "Application tracked", description: application.company + ", " + application.role });
            }}
          />
        }
      />

      <Rise>
        <Card className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-4 p-5 lg:border-r lg:border-border">
            <span className="text-gray-11 text-[13px] font-medium">Conversion</span>
            <Funnel rows={funnel} />
          </div>
          <div className="flex flex-col gap-4 border-t border-border p-5 lg:border-t-0">
            <span className="text-gray-11 text-[13px] font-medium">Resume versions</span>
            {resumeVariants.map((variant, index) => (
              <div key={variant.version} className="flex flex-col gap-1.5">
                <div className="flex justify-between gap-3 text-[13px]">
                  <span className="truncate text-foreground">{variant.version}</span>
                  <span className="text-gray-11 tabular">{Math.round((variant.responses / variant.sent) * 100)}% replied</span>
                </div>
                <Meter value={variant.responses} max={variant.sent} tone={index === 1 ? "brand" : "muted"} size="sm" label={variant.version} />
                <span className="text-gray-10 text-[12px] tabular">
                  {variant.sent} sent · {variant.responses} replies · {variant.interviews} {variant.interviews === 1 ? "interview" : "interviews"}
                </span>
              </div>
            ))}
            <p className="text-gray-10 text-[12px]">Fewer than five sends each, so treat this as a hint rather than a result.</p>
          </div>
        </Card>
      </Rise>

      <Rise>
        <div className="bg-info-soft/70 border-info/20 flex gap-3 rounded-[var(--radius-surface)] border p-4">
          <ArrowsClockwise size={17} className="text-info mt-0.5 shrink-0" />
          <p className="text-[13.5px] leading-relaxed text-foreground">
            Both rejections that gave a reason cited <span className="font-medium">evaluation experience</span>. That skill is now scheduled in week 4 of your plan. Keep using resume v3, and hold Northbeam AI until RAG is demonstrated.
          </p>
        </div>
      </Rise>

      <Section title="Pipeline" description="Drag a card to another column, or change its stage from the menu on the card.">
        <LayoutGroup>
          <div className="scroll-slim -mx-4 flex gap-3 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
            {columns.map((column) => {
              const cards = items.filter((item) => item.stage === column.stage);
              const isOver = overStage === column.stage && dragId !== null;
              return (
                <div
                  key={column.stage}
                  onDragOver={(event) => {
                    event.preventDefault();
                    if (overStage !== column.stage) setOverStage(column.stage);
                  }}
                  onDragLeave={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node)) setOverStage(null);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const id = event.dataTransfer.getData("text/plain") || dragId;
                    if (id) move(id, column.stage);
                    setDragId(null);
                    setOverStage(null);
                  }}
                  className={cn(
                    "flex w-[264px] shrink-0 flex-col gap-2 rounded-[var(--radius-surface)] border p-2 transition-colors duration-150",
                    isOver ? "border-brand/50 bg-brand-soft/50" : "bg-gray-2 border-transparent",
                  )}
                >
                  <div className="flex items-center justify-between px-2 pt-1 pb-0.5">
                    <span className="text-[13px] font-medium text-foreground">{column.label}</span>
                    <span className="text-gray-10 text-[12px] tabular">{cards.length}</span>
                  </div>
                  {cards.map((item) => (
                    <motion.div
                      key={item.id}
                      layout={!reduce}
                      layoutId={reduce ? undefined : "app-" + item.id}
                      transition={spring.layout}
                      className={cn(dragId === item.id && "opacity-40")}
                    >
                      <div
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.setData("text/plain", item.id);
                          event.dataTransfer.effectAllowed = "move";
                          setDragId(item.id);
                        }}
                        onDragEnd={() => {
                          setDragId(null);
                          setOverStage(null);
                        }}
                        className="group bg-card flex cursor-grab flex-col gap-2 rounded-[10px] border border-border p-3 shadow-xs transition-[border-color,box-shadow] hover:border-border-strong hover:shadow-sm active:cursor-grabbing"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate text-[13.5px] font-medium text-foreground">{item.company}</span>
                            <span className="text-gray-10 truncate text-[12px]">{item.role}</span>
                          </div>
                          <DotsSixVertical size={15} className="text-gray-8 mt-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                        </div>
                        <span className="text-gray-10 flex items-center gap-1.5 text-[12px]">
                          <FileText size={12} /> {item.resumeVersion}
                        </span>
                        {item.nextStep && (
                          <span className={cn("flex items-center gap-1.5 text-[12px] font-medium", item.nextStep === "Follow up" ? "text-warning" : "text-foreground")}>
                            {item.nextStep === "Follow up" ? <Bell size={12} /> : <CalendarBlank size={12} />}
                            {item.nextStep}
                            {item.nextDate ? " · " + new Date(item.nextDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : ""}
                          </span>
                        )}
                        {item.feedback && <p className="text-gray-11 border-gray-6 border-l-2 pl-2 text-[12px] leading-snug">&ldquo;{item.feedback}&rdquo;</p>}
                        <Select value={item.stage} onValueChange={(value) => move(item.id, value as ApplicationStage)}>
                          <SelectTrigger aria-label={"Stage for " + item.company} className="mt-0.5 h-7 text-[12px] shadow-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {columns.map((option) => (
                              <SelectItem key={option.stage} value={option.stage}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </motion.div>
                  ))}
                  {cards.length === 0 && (
                    <div className={cn("text-gray-9 grid h-16 place-items-center rounded-[10px] border border-dashed text-[12px] transition-colors", isOver ? "border-brand/40" : "border-border-strong")}>
                      {isOver ? "Drop here" : "Nothing here"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </LayoutGroup>
      </Section>
    </PageShell>
  );
}

/** Horizontal funnel: each stage's bar relative to the first, with the step conversion between them. */
function Funnel({ rows }: { rows: { stage: string; count: number }[] }) {
  const reduce = useReducedMotion();
  const base = Math.max(1, rows[0].count);
  return (
    <ol className="flex flex-col gap-2">
      {rows.map((row, index) => {
        const previous = index > 0 ? rows[index - 1].count : null;
        const rate = previous ? Math.round((row.count / Math.max(1, previous)) * 100) : null;
        return (
          <li key={row.stage} className="grid grid-cols-[96px_minmax(0,1fr)_28px_44px] items-center gap-3">
            <span className="text-gray-11 truncate text-[13px]">{row.stage}</span>
            {/* Counts live in their own column: a 1-of-5 bar is too narrow to
                hold a label, and text inside a scaling bar gets squashed. */}
            <div className="bg-gray-3 h-6 overflow-hidden rounded-[6px]">
              {row.count > 0 && (
                <motion.div
                  className={cn("h-full origin-left rounded-[6px]", index === rows.length - 1 ? "bg-brand" : "bg-gray-12")}
                  style={{ width: (row.count / base) * 100 + "%" }}
                  initial={reduce ? false : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.7, delay: 0.15 + index * 0.1, ease: ease.out }}
                />
              )}
            </div>
            <span className="text-right text-[13px] font-medium text-foreground tabular">
              <AnimatedNumber value={row.count} />
            </span>
            <span className="text-gray-10 text-right text-[12px] tabular">{rate === null ? "" : rate + "%"}</span>
          </li>
        );
      })}
    </ol>
  );
}

function NewApplicationDialog({ onCreate }: { onCreate: (application: Application) => void }) {
  const [open, setOpen] = useState(false);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus weight="bold" /> Track application
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Track an application</DialogTitle>
          <DialogDescription>It starts in Applied with your current resume. You can move it as things progress.</DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!company.trim() || !role.trim()) return;
            onCreate({
              id: "app_" + Date.now(),
              company: company.trim(),
              role: role.trim(),
              stage: "applied",
              appliedAt: new Date().toISOString().slice(0, 10),
              resumeVersion: "Resume v3 (AI focus)",
              recruiterResponded: false,
            });
            setCompany("");
            setRole("");
            setOpen(false);
          }}
        >
          <Field>
            <Label htmlFor="app-company">Company</Label>
            <Input id="app-company" value={company} onChange={(e) => setCompany(e.target.value)} required autoComplete="organization" />
          </Field>
          <Field>
            <Label htmlFor="app-role">Role</Label>
            <Input id="app-role" value={role} onChange={(e) => setRole(e.target.value)} required />
            <FieldHint>For example, Applied AI Engineer</FieldHint>
          </Field>
          <div className="mt-1 flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={!company.trim() || !role.trim()}>Track application</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
