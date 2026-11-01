"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  BookmarkSimple,
  Camera,
  ChalkboardTeacher,
  DownloadSimple,
  FilePdf,
  FlowArrow,
  MagnifyingGlass,
  Note,
  Question,
  Stack,
  Subtitles,
  UploadSimple,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/common/states";
import { SpotlightCard } from "@/components/motion/primitives";
import { PageHeader, PageShell } from "@/components/shell/page-header";
import { library } from "@/lib/mock/data";
import type { LibraryKind } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

const kinds: Record<LibraryKind, { label: string; icon: typeof Note }> = {
  lecture: { label: "Saved lectures", icon: ChalkboardTeacher },
  notes: { label: "Study notes", icon: Note },
  transcript: { label: "Transcripts", icon: Subtitles },
  snapshot: { label: "Board snapshots", icon: Camera },
  document: { label: "Uploaded documents", icon: FilePdf },
  diagram: { label: "Diagrams", icon: FlowArrow },
  bookmark: { label: "Bookmarks", icon: BookmarkSimple },
  question: { label: "Saved questions", icon: Question },
};

export function LibraryView() {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<LibraryKind | "all" | "revision">("all");
  const [topic, setTopic] = useState("All topics");
  const topics = ["All topics", ...new Set(library.map((item) => item.topic))];

  const visible = useMemo(() => library
    .filter((item) => kind === "all" || (kind === "revision" ? item.inRevision : item.kind === kind))
    .filter((item) => topic === "All topics" || item.topic === topic)
    .filter((item) => (item.title + item.excerpt).toLowerCase().includes(query.toLowerCase())), [kind, query, topic]);

  return (
    <PageShell className="flex flex-col gap-6">
      <PageHeader
        icon="library"
        context={library.length + " items across " + (topics.length - 1) + " topics"}
        title="Knowledge Vault"
        description="Everything you have learned in one place: lectures, notes, transcripts, board snapshots, diagrams, uploads and the questions you asked, searchable and organised by topic."
        actions={<><Button variant="secondary" size="sm"><UploadSimple size={14} /> Upload document</Button><Button size="sm"><Note size={14} /> New note</Button></>}
      />

      <div className="relative">
        <MagnifyingGlass size={16} className="text-muted-foreground absolute top-1/2 left-3.5 -translate-y-1/2" />
        <label htmlFor="vault-search" className="sr-only">Search the vault</label>
        <Input id="vault-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search across all learning materials" className="h-11 pl-10 text-[14px]" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Vault sections" className="flex flex-row flex-wrap gap-1 lg:flex-col">
          <KindButton active={kind === "all"} onClick={() => setKind("all")} icon={Stack} label="Everything" count={library.length} />
          <KindButton active={kind === "revision"} onClick={() => setKind("revision")} icon={BookmarkSimple} label="Revision collection" count={library.filter((item) => item.inRevision).length} />
          <div className="bg-border my-1 hidden h-px lg:block" />
          {(Object.keys(kinds) as LibraryKind[]).map((key) => (
            <KindButton key={key} active={kind === key} onClick={() => setKind(key)} icon={kinds[key].icon} label={kinds[key].label} count={library.filter((item) => item.kind === key).length} />
          ))}
        </nav>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-1.5">
            {topics.map((option) => (
              <button key={option} type="button" onClick={() => setTopic(option)} aria-pressed={topic === option}
                className={cn("rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors", topic === option ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}>{option}</button>
            ))}
          </div>
          {visible.length === 0 ? (
            <EmptyState icon={MagnifyingGlass} title="Nothing matches" description="Try a different search or topic. Everything you save in the Tutor appears here automatically." />
          ) : (
            <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {visible.map((item) => {
                  const meta = kinds[item.kind];
                  return (
                    <motion.div key={item.id} layout initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.25 }}>
                      <SpotlightCard className="h-full">
                        <div className="flex h-full flex-col gap-3 p-4">
                          <div className="flex items-center justify-between">
                            <span className="bg-primary/10 text-primary grid size-8 place-items-center rounded-lg"><meta.icon size={16} weight="duotone" /></span>
                            {item.inRevision && <Badge variant="supported">In revision</Badge>}
                          </div>
                          <span className="text-[13.5px] leading-snug font-bold">{item.title}</span>
                          <p className="text-muted-foreground flex-1 text-[12px] leading-relaxed">{item.excerpt}</p>
                          <div className="flex items-center justify-between border-t pt-2.5">
                            <span className="text-muted-foreground text-[11px]">{item.topic}, {item.createdAt.slice(5)}</span>
                            <Button variant="ghost" size="icon-sm" aria-label={"Download " + item.title}><DownloadSimple size={14} /></Button>
                          </div>
                        </div>
                      </SpotlightCard>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function KindButton({ active, onClick, icon: Glyph, label, count }: { active: boolean; onClick: () => void; icon: typeof Note; label: string; count: number }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={cn("flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-[12.5px] font-semibold transition-colors", active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-raised hover:text-foreground")}>
      <Glyph size={15} weight={active ? "fill" : "regular"} /> <span className="flex-1">{label}</span><span className="numeric text-[11px]">{count}</span>
    </button>
  );
}
