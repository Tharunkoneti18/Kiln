"use client";

import { Atom, CalendarCheck, ChartLineUp, Kanban, Robot } from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui/card";
import { Aurora } from "@/components/motion/primitives";
import { PageHeader, PageShell } from "@/components/shell/page-header";
import { AssistantConversation } from "@/components/shell/assistant-panel";
import { applications, currentWeek, skills, targetRole } from "@/lib/mock/data";

export function AssistantView() {
  const context = [
    { icon: Atom, label: "Digital Twin", value: skills.filter((s) => s.state === "demonstrated").length + " skills demonstrated" },
    { icon: CalendarCheck, label: "Learning plan", value: "Week " + currentWeek.week + ": " + currentWeek.objective },
    { icon: ChartLineUp, label: "Market", value: targetRole.postingsAnalysed + " postings for " + targetRole.title },
    { icon: Kanban, label: "Applications", value: applications.length + " tracked, 1 interview this week" },
  ];

  return (
    <PageShell className="flex flex-col gap-6">
      <PageHeader
        icon="assistant"
        context="Understands your platform data"
        title="AI Career Assistant"
        description="Ask about career paths, skill gaps, your plan, a project, an interview or a job description. It answers from your own data, and any change it suggests is a proposal you approve."
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <Card className="relative isolate overflow-hidden">
          <Aurora className="-z-10 opacity-60" />
          <AssistantConversation className="h-[560px]" />
        </Card>
        <Card><CardContent className="flex flex-col gap-4">
          <span className="flex items-center gap-2 text-[13.5px] font-bold"><Robot size={16} weight="fill" className="text-primary" /> What it can see</span>
          {context.map((item) => (
            <div key={item.label} className="flex gap-3">
              <span className="bg-primary/10 text-primary grid size-8 shrink-0 place-items-center rounded-lg"><item.icon size={15} weight="duotone" /></span>
              <span><span className="block text-[12.5px] font-semibold">{item.label}</span><span className="text-muted-foreground text-[11.5px]">{item.value}</span></span>
            </div>
          ))}
          <p className="text-muted-foreground border-t pt-3 text-[11.5px] leading-relaxed">It can modify your weekly plan, recommend resources, review projects and prepare interviews. Every change is shown before it is applied.</p>
        </CardContent></Card>
      </div>
    </PageShell>
  );
}
