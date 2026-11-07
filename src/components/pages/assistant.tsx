"use client";

import { Atom, CalendarCheck, ChartLineUp, Kanban } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { PageHeader, PageShell, Rise } from "@/components/shell/page-header";
import { AssistantConversation } from "@/components/shell/assistant-panel";
import { applications, currentWeek, skills, targetRole } from "@/lib/mock/data";

export function AssistantView() {
  const context = [
    { icon: Atom, label: "Digital twin", value: skills.filter((s) => s.state === "demonstrated").length + " skills demonstrated" },
    { icon: CalendarCheck, label: "Learning plan", value: "Week " + currentWeek.week + ", " + currentWeek.objective },
    { icon: ChartLineUp, label: "Market data", value: targetRole.postingsAnalysed + " postings for " + targetRole.title },
    { icon: Kanban, label: "Applications", value: applications.length + " tracked, 1 interview upcoming" },
  ];

  return (
    <PageShell width="wide">
      <PageHeader
        context="Answers from your own data"
        title="Ask about your career"
        description="Requirements for a role, why a gap matters, moving a task, whether you are ready to apply. The assistant reads your plan, evidence and market data."
      />
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Rise>
          <Card className="bg-background overflow-hidden">
            <AssistantConversation className="h-[min(640px,calc(100dvh-280px))] min-h-[460px]" />
          </Card>
        </Rise>

        <Rise className="flex flex-col gap-4 lg:sticky lg:top-[72px]">
          <span className="text-gray-11 text-[12.5px] font-medium">Context it can see</span>
          <ul className="flex flex-col gap-3.5">
            {context.map((item) => (
              <li key={item.label} className="flex items-start gap-3">
                <span className="bg-gray-3 text-gray-11 grid size-7 shrink-0 place-items-center rounded-[7px]">
                  <item.icon size={15} />
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="text-[13px] font-medium text-foreground">{item.label}</span>
                  <span className="text-gray-10 text-[12.5px] leading-snug">{item.value}</span>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-gray-10 border-t border-border pt-4 text-[12.5px] leading-relaxed">
            The assistant can read everything above and propose changes. Nothing in your plan changes until you confirm it.
          </p>
        </Rise>
      </div>
    </PageShell>
  );
}
