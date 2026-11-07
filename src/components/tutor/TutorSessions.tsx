"use client";

import { ArrowCounterClockwise, CheckCircle, Play, Question } from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui/card";
import { GrowBar } from "@/components/motion/primitives";
import { SectionHeading } from "@/components/shell/page-header";
import { tutorSessions, unansweredQuestions } from "@/lib/mock/data";

/** Session continuity: revisit previous lectures and saved questions. */
export function TutorSessions() {
  return (
    <section className="mx-auto w-full max-w-[1500px] px-4 pt-2 pb-10 sm:px-6">
      <SectionHeading title="Your sessions" description="Resume any lecture from the exact position. Completed chapters and board state are remembered." />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Card><CardContent className="flex flex-col gap-2 p-3">
          {tutorSessions.map((session) => (
            <div key={session.id} className="hover:bg-raised flex items-center gap-3 rounded-lg p-3 transition-colors">
              {session.progress === 100 ? <CheckCircle size={18} weight="fill" className="text-brand-text shrink-0" /> : <Play size={18} weight="fill" className="text-brand-text shrink-0" />}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold">{session.title}</span>
                <span className="text-muted-foreground text-[11.5px]">{session.progress === 100 ? "Completed" : "Paused at " + session.chapter}, opened {session.lastOpened}</span>
              </span>
              <GrowBar value={session.progress} className="hidden h-1.5 w-28 sm:block" />
              <ArrowCounterClockwise size={15} className="text-muted-foreground" aria-label="Revisit" />
            </div>
          ))}
        </CardContent></Card>
        <Card><CardContent className="flex flex-col gap-3">
          <span className="flex items-center gap-2 text-[13.5px] font-bold"><Question size={15} className="text-brand-text" /> Questions you have not had answered</span>
          {unansweredQuestions.map((question) => <p key={question} className="bg-raised rounded-md p-3 text-[12.5px]">{question}</p>)}
          <span className="text-muted-foreground text-[11.5px]">The instructor raises these at the start of your next session.</span>
        </CardContent></Card>
      </div>
    </section>
  );
}
