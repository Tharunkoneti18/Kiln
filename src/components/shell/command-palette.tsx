"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Briefcase,
  ChalkboardTeacher,
  Lightning,
  MagnifyingGlass,
  Microphone,
  Moon,
  Robot,
  Sun,
  Target,
  type Icon,
} from "@phosphor-icons/react";
import { roleOptions, skills } from "@/lib/mock/data";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { navItems } from "./nav";
import { useTheme } from "./theme-provider";

/* ---------------------------------------------------------------------------
   Command palette (Cmd/Ctrl+K).

   One input reaches every page, the common actions, every tracked skill and
   every role. Results are ranked (prefix match beats substring match) and the
   selection highlight is a shared-layout element that springs between rows,
   so moving with the arrow keys feels continuous rather than flickery.

   Semantics follow the ARIA combobox pattern: the input owns focus and points
   at the active option with aria-activedescendant.
--------------------------------------------------------------------------- */

interface Command {
  id: string;
  group: "Actions" | "Pages" | "Skills" | "Roles";
  label: string;
  hint?: string;
  keywords?: string;
  icon: Icon;
  run: () => void;
}

const PaletteContext = createContext<{ open: () => void }>({ open: () => {} });
export const useCommandPalette = () => useContext(PaletteContext);

export function CommandPaletteProvider({ children, onAskAssistant }: { children: ReactNode; onAskAssistant: () => void }) {
  const [isOpen, setOpen] = useState(false);
  const open = useCallback(() => setOpen(true), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <PaletteContext.Provider value={{ open }}>
      {children}
      <DialogPrimitive.Root open={isOpen} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="bg-overlay data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 fixed inset-0 z-[60] backdrop-blur-[3px] data-[state=closed]:duration-100" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className={cn(
              "bg-popover fixed top-[12vh] left-1/2 z-[60] w-[calc(100vw-2rem)] max-w-[620px] -translate-x-1/2 overflow-hidden rounded-[14px] border border-border shadow-lg outline-none",
              "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.97] data-[state=open]:slide-in-from-top-2 data-[state=open]:duration-200",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.98] data-[state=closed]:duration-100",
            )}
          >
            <DialogPrimitive.Title className="sr-only">Command menu</DialogPrimitive.Title>
            {isOpen && <Palette close={() => setOpen(false)} onAskAssistant={onAskAssistant} />}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </PaletteContext.Provider>
  );
}

function score(command: Command, query: string) {
  if (!query) return 1;
  const q = query.toLowerCase();
  const label = command.label.toLowerCase();
  if (label.startsWith(q)) return 3;
  if (label.split(/\s+/).some((word) => word.startsWith(q))) return 2.5;
  if (label.includes(q)) return 2;
  if ((command.hint + " " + (command.keywords ?? "")).toLowerCase().includes(q)) return 1;
  return 0;
}

function Palette({ close, onAskAssistant }: { close: () => void; onAskAssistant: () => void }) {
  const router = useRouter();
  const { resolved, setChoice } = useTheme();
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (href: string) => () => {
      router.push(href);
    },
    [router],
  );

  const commands = useMemo<Command[]>(
    () => [
      { id: "a-resume", group: "Actions", label: "Resume current lesson", hint: "RAG architecture, chapter 2", icon: ChalkboardTeacher, keywords: "tutor learn continue", run: go("/tutor") },
      { id: "a-ask", group: "Actions", label: "Ask the assistant", hint: "Questions about your plan or evidence", icon: Robot, keywords: "ai chat help", run: onAskAssistant },
      { id: "a-interview", group: "Actions", label: "Start a mock interview", hint: "Adaptive technical interviewer", icon: Microphone, keywords: "practice", run: go("/interviews") },
      { id: "a-application", group: "Actions", label: "Track an application", hint: "Add a role to your pipeline", icon: Briefcase, keywords: "job apply", run: go("/applications") },
      {
        id: "a-theme",
        group: "Actions",
        label: resolved === "dark" ? "Switch to light theme" : "Switch to dark theme",
        icon: resolved === "dark" ? Sun : Moon,
        keywords: "appearance mode colour color",
        run: () => setChoice(resolved === "dark" ? "light" : "dark"),
      },
      ...navItems.map<Command>((item) => ({ id: "p-" + item.href, group: "Pages", label: item.label, hint: item.hint, icon: item.icon, run: go(item.href) })),
      ...skills.map<Command>((skill) => ({
        id: "s-" + skill.id,
        group: "Skills",
        label: skill.label,
        hint: skill.state === "gap" ? "Gap to close" : skill.state === "demonstrated" ? "Proven" : "In progress",
        icon: Lightning,
        run: go("/gaps"),
      })),
      ...roleOptions.map<Command>((role) => ({
        id: "r-" + role.id,
        group: "Roles",
        label: role.title,
        hint: role.compatibility + "% match",
        icon: Target,
        run: go("/roles"),
      })),
    ],
    [go, onAskAssistant, resolved, setChoice],
  );

  // With no query, show actions and pages only; skills and roles appear once
  // the user starts typing, which keeps the resting state short and scannable.
  const results = useMemo(() => {
    const filtered = commands
      .filter((command) => (query ? true : command.group === "Actions" || command.group === "Pages"))
      .map((command) => ({ command, rank: score(command, query.trim()) }))
      .filter((entry) => entry.rank > 0);
    const order = ["Actions", "Pages", "Skills", "Roles"];
    return filtered
      .sort((a, b) => order.indexOf(a.command.group) - order.indexOf(b.command.group) || b.rank - a.rank)
      .map((entry) => entry.command)
      .slice(0, query ? 40 : 30);
  }, [commands, query]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const run = (command: Command | undefined) => {
    if (!command) return;
    close();
    command.run();
  };

  let lastGroup = "";

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 border-b border-border px-4">
        <MagnifyingGlass size={17} className="text-gray-10 shrink-0" />
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((index) => (index + 1) % Math.max(1, results.length));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((index) => (index - 1 + results.length) % Math.max(1, results.length));
            } else if (event.key === "Enter") {
              event.preventDefault();
              run(results[active]);
            }
          }}
          placeholder="Search pages, skills, roles, or type a command"
          role="combobox"
          aria-expanded="true"
          aria-controls="command-list"
          aria-activedescendant={results[active] ? "cmd-" + results[active].id : undefined}
          aria-autocomplete="list"
          className="h-[52px] flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-gray-9"
        />
        <kbd className="text-gray-10 hidden rounded-[5px] border border-border px-1.5 py-0.5 font-mono text-[10.5px] sm:inline">esc</kbd>
      </div>

      <div ref={listRef} id="command-list" role="listbox" aria-label="Commands" className="scroll-slim max-h-[min(420px,56vh)] overflow-y-auto p-1.5">
        {results.length === 0 && (
          <div className="flex flex-col items-center gap-1 px-6 py-10 text-center">
            <p className="text-[13.5px] font-medium text-foreground">No matches for &ldquo;{query}&rdquo;</p>
            <p className="text-muted-foreground text-[12.5px]">Try a page name, a skill like &ldquo;RAG&rdquo;, or a role.</p>
          </div>
        )}
        {results.map((command, index) => {
          const showGroup = command.group !== lastGroup;
          lastGroup = command.group;
          const isActive = index === active;
          return (
            <div key={command.id}>
              {showGroup && <div className="text-gray-10 px-2.5 pt-2.5 pb-1 text-[11.5px] font-medium">{command.group}</div>}
              <div
                id={"cmd-" + command.id}
                role="option"
                aria-selected={isActive}
                data-index={index}
                onPointerMove={() => setActive(index)}
                onClick={() => run(command)}
                className="relative flex h-10 cursor-pointer items-center gap-3 rounded-[8px] px-2.5"
              >
                {isActive && (
                  <motion.div
                    layoutId={reduce ? undefined : "command-active"}
                    transition={spring.layout}
                    className="bg-gray-3 absolute inset-0 rounded-[8px]"
                  />
                )}
                <command.icon size={16} className={cn("relative shrink-0", isActive ? "text-foreground" : "text-gray-10")} />
                <span className="relative min-w-0 flex-1 truncate text-[13.5px] text-foreground">{command.label}</span>
                {command.hint && <span className="text-gray-10 relative hidden truncate text-[12px] sm:block sm:max-w-[45%]">{command.hint}</span>}
                <ArrowRight size={13} className={cn("relative shrink-0 transition-opacity duration-150", isActive ? "text-gray-11 opacity-100" : "opacity-0")} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-gray-10 hidden items-center gap-4 border-t border-border px-4 py-2.5 text-[11.5px] sm:flex">
        <span className="flex items-center gap-1.5"><Kbd>↑</Kbd><Kbd>↓</Kbd> navigate</span>
        <span className="flex items-center gap-1.5"><Kbd>↵</Kbd> open</span>
        <span className="ml-auto flex items-center gap-1.5"><Kbd>⌘</Kbd><Kbd>K</Kbd> toggle</span>
      </div>
    </div>
  );
}

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd className={cn("bg-gray-2 text-gray-11 inline-grid h-[18px] min-w-[18px] place-items-center rounded-[4px] border border-border px-1 font-mono text-[10.5px] leading-none", className)}>
      {children}
    </kbd>
  );
}
