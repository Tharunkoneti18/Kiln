"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ChatCenteredDots, List, MagnifyingGlass, Robot, X } from "@phosphor-icons/react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { learner } from "@/lib/mock/data";
import { navItems } from "./nav";
import { BrandLockup } from "./brand";
import { ActivityNav, AskPill, RoleSwitcher, SidebarNav } from "./sidebar-nav";
import { ThemeToggle } from "./theme-toggle";
import { AssistantProvider, AssistantSheet, useAssistant } from "./assistant-panel";
import { NotificationsMenu } from "./notifications-menu";

/**
 * Persistent shell in the product reference's layout: a white sidebar with a
 * role switcher, a pill action and pill navigation; a top bar with a centred
 * search pill and actions on the right; and a white content canvas.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider delayDuration={220}>
        <AssistantProvider>
          <ShellFrame>{children}</ShellFrame>
          <AssistantSheet />
        </AssistantProvider>
      </TooltipProvider>
    </MotionConfig>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="flex flex-col px-4 pb-2">
        <RoleSwitcher />
      </div>
      <div className="scroll-slim flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-2">
        <SidebarNav onNavigate={onNavigate} />
      </div>
      <div className="border-t border-border/60 px-4 pt-2.5 pb-1">
        <ActivityNav onNavigate={onNavigate} />
      </div>
    </>
  );
}

function ShellFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const reduce = useReducedMotion();
  const { setOpen } = useAssistant();

  useEffect(() => setDrawerOpen(false), [pathname]);

  return (
    <div className="flex min-h-[100dvh]" style={{ background: "var(--page-gradient)", backgroundAttachment: "fixed" }}>
      <aside className="bg-sidebar hidden w-[256px] shrink-0 flex-col border-r border-border/60 pb-4 shadow-[1px_0_0_0_oklch(0.91_0.010_245)] lg:sticky lg:top-0 lg:flex lg:h-[100dvh]">
        <Link href="/" className="px-5 pt-5 pb-4" aria-label="Career OS home">
          <BrandLockup size="lg" />
        </Link>
        <SidebarBody />
      </aside>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-[rgb(15_23_42/0.4)] lg:hidden" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawerOpen(false)} />
            <motion.aside
              role="dialog"
              aria-label="Platform areas"
              className="bg-sidebar fixed inset-y-0 left-0 z-50 flex w-[290px] flex-col border-r pb-4 lg:hidden"
              initial={reduce ? false : { x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
            >
              <div className="flex items-center justify-between px-6 pt-6 pb-5">
                <BrandLockup size="lg" />
                <Button variant="ghost" size="icon-sm" aria-label="Close navigation" onClick={() => setDrawerOpen(false)}><X size={16} /></Button>
              </div>
              <SidebarBody onNavigate={() => setDrawerOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-white/80 sticky top-0 z-30 flex h-[68px] shrink-0 items-center gap-3 border-b border-border/50 px-4 backdrop-blur-xl sm:px-8" style={{ boxShadow: "0 1px 3px rgb(14 22 50 / 0.06)" }}>
          <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Open navigation" aria-expanded={drawerOpen} onClick={() => setDrawerOpen(true)}>
            <List size={20} />
          </Button>

          <div className="flex flex-1 justify-center">
            <GlobalSearch />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button variant="soft" size="sm" onClick={() => setOpen(true)} className="hidden h-9 gap-1.5 px-4 sm:inline-flex">
              <Robot size={16} /> Ask AI
            </Button>
            <NotificationsMenu />
            <Link href="/profile" aria-label={"Profile for " + learner.name} className="ring-primary/20 ml-0.5 rounded-full ring-2 ring-offset-2 ring-offset-white">
              <Avatar className="size-9 border-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-[12px] font-bold">{learner.initials}</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

/** Centred pill search across every area of the platform. */
function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(
    () => (query.trim() ? navItems.filter((item) => (item.label + " " + item.hint).toLowerCase().includes(query.toLowerCase())).slice(0, 6) : []),
    [query],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative w-full max-w-[390px]">
      <MagnifyingGlass size={18} className="text-muted-foreground absolute top-1/2 left-4 -translate-y-1/2" />
      <label htmlFor="global-search" className="sr-only">Search Career OS</label>
      <input
        ref={inputRef}
        id="global-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => window.setTimeout(() => setFocused(false), 150)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && results[0]) {
            router.push(results[0].href);
            setQuery("");
          }
        }}
        placeholder="Search skills, roles, paths..."
        className="bg-card focus:border-primary/50 h-10 w-full rounded-full border pr-14 pl-10 text-[13.5px] shadow-[0_1px_2px_rgb(16_24_40/0.04)] transition-colors placeholder:text-muted-foreground/70 focus:outline-none"
      />
      <kbd className="text-muted-foreground/70 bg-muted/80 pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 rounded border px-1.5 py-0.5 font-mono text-[10.5px] font-semibold">⌘K</kbd>
      <AnimatePresence>
        {focused && results.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="bg-popover absolute inset-x-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border p-1.5 shadow-[var(--shadow-lifted)]"
          >
            {results.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={() => setQuery("")} className="hover:bg-raised flex items-center gap-3 rounded-xl px-3 py-2.5">
                  <item.icon size={18} className="text-primary" />
                  <span className="flex flex-col">
                    <span className="text-[13.5px] font-semibold">{item.label}</span>
                    <span className="text-muted-foreground text-[11.5px]">{item.hint}</span>
                  </span>
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
