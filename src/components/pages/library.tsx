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
  GridFour,
  ListBullets,
  MagnifyingGlass,
  Note,
  Plus,
  Question,
  Stack,
  Subtitles,
  UploadSimple,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Hint } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/common/states";
import { Segmented } from "@/components/system/segmented";
import { useToast } from "@/components/system/toast";
import { PageHeader, PageShell, Rise } from "@/components/shell/page-header";
import { library } from "@/lib/mock/data";
import type { LibraryKind } from "@/lib/mock/types";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

const kinds: Record<LibraryKind, { label: string; icon: typeof Note }> = {
  lecture: { label: "Lectures", icon: ChalkboardTeacher },
  notes: { label: "Notes", icon: Note },
  transcript: { label: "Transcripts", icon: Subtitles },
  snapshot: { label: "Board snapshots", icon: Camera },
  document: { label: "Documents", icon: FilePdf },
  diagram: { label: "Diagrams", icon: FlowArrow },
  bookmark: { label: "Bookmarks", icon: BookmarkSimple },
  question: { label: "Questions", icon: Question },
};

type KindFilter = LibraryKind | "all" | "revision";

export function LibraryView() {
  const reduce = useReducedMotion();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");
  const [topic, setTopic] = useState("All");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [revision, setRevision] = useState<Record<string, boolean>>(() => Object.fromEntries(library.map((item) => [item.id, item.inRevision])));
  const topics = ["All", ...new Set(library.map((item) => item.topic))];

  const visible = useMemo(
    () =>
      library
        .filter((item) => kind === "all" || (kind === "revision" ? revision[item.id] : item.kind === kind))
        .filter((item) => topic === "All" || item.topic === topic)
        .filter((item) => (item.title + item.excerpt).toLowerCase().includes(query.toLowerCase())),
    [kind, query, topic, revision],
  );

  const toggleRevision = (id: string, title: string) => {
    const next = !revision[id];
    setRevision((all) => ({ ...all, [id]: next }));
    toast({ title: next ? "Added to revision" : "Removed from revision", description: title, tone: "info" });
  };

  return (
    <PageShell width="wide">
      <PageHeader
        context={library.length + " items across " + (topics.length - 1) + " topics"}
        title="Everything you have learned"
        description="Lectures, notes, transcripts, board snapshots and documents from every session, searchable in one place."
        actions={
          <>
            <Button variant="secondary"><UploadSimple /> Upload</Button>
            <Button><Plus weight="bold" /> New note</Button>
          </>
        }
      />

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[200px_minmax(0,1fr)]">
        <Rise className="lg:sticky lg:top-[72px]">
          <nav aria-label="Vault sections" className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:gap-px lg:overflow-visible lg:px-0">
            <KindButton active={kind === "all"} onClick={() => setKind("all")} icon={Stack} label="All items" count={library.length} />
            <KindButton active={kind === "revision"} onClick={() => setKind("revision")} icon={BookmarkSimple} label="Revision deck" count={Object.values(revision).filter(Boolean).length} />
            <div className="bg-border mx-2 my-2 hidden h-px lg:block" />
            {(Object.keys(kinds) as LibraryKind[]).map((key) => (
              <KindButton key={key} active={kind === key} onClick={() => setKind(key)} icon={kinds[key].icon} label={kinds[key].label} count={library.filter((item) => item.kind === key).length} />
            ))}
          </nav>
        </Rise>

        <Rise className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <MagnifyingGlass size={15} className="text-gray-10 pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" />
              <label htmlFor="vault-search" className="sr-only">Search the vault</label>
              <Input id="vault-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles and contents" className="pl-9" />
            </div>
            <Segmented
              label="Layout"
              value={view}
              onChange={setView}
              options={[
                { value: "grid", label: <GridFour size={14} aria-label="Grid" /> },
                { value: "list", label: <ListBullets size={14} aria-label="List" /> },
              ]}
            />
          </div>

          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Topic">
            {topics.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTopic(option)}
                aria-pressed={topic === option}
                className={cn(
                  "h-7 rounded-full border px-3 text-[12.5px] transition-colors",
                  topic === option ? "bg-gray-12 border-gray-12 text-gray-1" : "text-gray-11 border-border hover:border-border-strong hover:text-foreground",
                )}
              >
                {option}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <EmptyState
              icon={MagnifyingGlass}
              title="Nothing matches"
              description="Try a different word, or clear the section and topic filters."
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setQuery("");
                    setKind("all");
                    setTopic("All");
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <motion.ul layout={!reduce} className={cn(view === "grid" ? "grid gap-3 sm:grid-cols-2 xl:grid-cols-3" : "bg-card flex flex-col divide-y divide-border rounded-[var(--radius-surface)] border border-border shadow-xs")}>
              <AnimatePresence mode="popLayout" initial={false}>
                {visible.map((item) => {
                  const meta = kinds[item.kind];
                  const saved = revision[item.id];
                  const saveButton = (
                    <Hint label={saved ? "Remove from revision" : "Add to revision"}>
                      <button
                        type="button"
                        aria-pressed={saved}
                        aria-label={(saved ? "Remove from revision: " : "Add to revision: ") + item.title}
                        onClick={() => toggleRevision(item.id, item.title)}
                        className="text-gray-10 hover:bg-gray-3 hover:text-foreground grid size-7 place-items-center rounded-md transition-colors"
                      >
                        <motion.span key={String(saved)} initial={reduce ? false : { scale: 0.5 }} animate={{ scale: 1 }} transition={spring.snappy}>
                          <BookmarkSimple size={15} weight={saved ? "fill" : "regular"} className={saved ? "text-brand" : undefined} />
                        </motion.span>
                      </button>
                    </Hint>
                  );
                  return (
                    <motion.li
                      key={item.id}
                      layout={!reduce}
                      initial={reduce ? false : { opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12 } }}
                      transition={spring.layout}
                    >
                      {view === "grid" ? (
                        <Card interactive className="flex h-full flex-col gap-3 p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-11 flex items-center gap-2 text-[12px]">
                              <span className="bg-gray-3 grid size-7 place-items-center rounded-[7px]"><meta.icon size={15} /></span>
                              {meta.label}
                            </span>
                            {saveButton}
                          </div>
                          <span className="text-[14px] leading-snug font-medium text-foreground">{item.title}</span>
                          <p className="text-gray-11 line-clamp-3 flex-1 text-[13px] leading-relaxed">{item.excerpt}</p>
                          <div className="flex items-center justify-between border-t border-border pt-3">
                            <span className="text-gray-10 text-[12px]">{item.topic} · {item.createdAt.slice(5)}</span>
                            <Button variant="ghost" size="icon-xs" aria-label={"Download " + item.title}><DownloadSimple /></Button>
                          </div>
                        </Card>
                      ) : (
                        <div className="hover:bg-gray-2 flex items-center gap-3.5 px-4 py-3 transition-colors">
                          <span className="bg-gray-3 text-gray-11 grid size-8 shrink-0 place-items-center rounded-[8px]"><meta.icon size={16} /></span>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-[13.5px] font-medium text-foreground">{item.title}</span>
                            <span className="text-gray-10 truncate text-[12px]">{item.excerpt}</span>
                          </div>
                          <span className="text-gray-10 hidden shrink-0 text-[12px] md:block">{item.topic}</span>
                          <span className="text-gray-10 hidden w-12 shrink-0 text-right text-[12px] tabular sm:block">{item.createdAt.slice(5)}</span>
                          {saveButton}
                        </div>
                      )}
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </motion.ul>
          )}
        </Rise>
      </div>
    </PageShell>
  );
}

function KindButton({ active, onClick, icon: Glyph, label, count }: { active: boolean; onClick: () => void; icon: typeof Note; label: string; count: number }) {
  const reduce = useReducedMotion();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "relative flex h-8 shrink-0 items-center gap-2.5 rounded-[7px] px-2.5 text-left text-[13px] whitespace-nowrap transition-colors",
        active ? "text-foreground font-medium" : "text-gray-11 hover:bg-gray-3 hover:text-foreground",
      )}
    >
      {active && <motion.span layoutId={reduce ? undefined : "vault-kind"} transition={spring.layout} className="bg-gray-4 absolute inset-0 rounded-[7px]" />}
      <Glyph size={15} weight={active ? "fill" : "regular"} className="relative shrink-0" />
      <span className="relative flex-1">{label}</span>
      <span className="text-gray-10 relative text-[12px] tabular">{count}</span>
    </button>
  );
}
