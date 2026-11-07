"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import { CaretRight, List, MagnifyingGlass, SidebarSimple, Sparkle, X } from "@phosphor-icons/react";
import { Hint, TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ToastProvider } from "@/components/system/toast";
import { ease, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { activeNavItem, sectionOf } from "./nav";
import { BrandLockup, BrandMark } from "./brand";
import { RoleSwitcher, SidebarFooter, SidebarNav } from "./sidebar-nav";
import { AssistantProvider, AssistantSheet, useAssistant } from "./assistant-panel";
import { NotificationsMenu } from "./notifications-menu";
import { CommandPaletteProvider, Kbd, useCommandPalette } from "./command-palette";

/* ---------------------------------------------------------------------------
   Application shell.

   Layout:  [ sidebar 248px | rail 60px ] [ top bar 52px / page ]

   The sidebar collapses to an icon rail with `[` or the toggle button; the
   choice persists per browser. The top bar carries only orientation (where am
   I) and global actions (search, assistant, notifications), so pages own their
   titles and nothing is said twice.
--------------------------------------------------------------------------- */

const COLLAPSE_KEY = "career-os-sidebar-collapsed";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider delayDuration={350} skipDelayDuration={120}>
        <ToastProvider>
          <AssistantProvider>
            <PaletteBridge>
              <ShellFrame>{children}</ShellFrame>
            </PaletteBridge>
            <AssistantSheet />
          </AssistantProvider>
        </ToastProvider>
      </TooltipProvider>
    </MotionConfig>
  );
}

/** The palette needs the assistant, which lives one provider up. */
function PaletteBridge({ children }: { children: ReactNode }) {
  const { setOpen } = useAssistant();
  return <CommandPaletteProvider onAskAssistant={() => setOpen(true)}>{children}</CommandPaletteProvider>;
}

function useCollapsed() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      // Default to expanded.
    }
  }, []);

  const set = (next: boolean) => {
    setCollapsed(next);
    try {
      window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
    } catch {
      // The toggle still works for this session.
    }
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const typing = target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if (event.key === "[" && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        setCollapsed((value) => {
          try {
            window.localStorage.setItem(COLLAPSE_KEY, value ? "0" : "1");
          } catch {}
          return !value;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return [collapsed, set] as const;
}

function ShellFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useCollapsed();

  useEffect(() => setDrawerOpen(false), [pathname]);

  return (
    <div className="bg-background flex min-h-[100dvh] text-foreground">
      <a
        href="#main"
        className="bg-primary text-primary-foreground sr-only z-[80] rounded-md px-3 py-2 text-[13px] focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      {/* Desktop sidebar / rail */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 60 : 248 }}
        transition={reduce ? { duration: 0 } : { duration: 0.26, ease: ease.out }}
        className="bg-sidebar sticky top-0 hidden h-[100dvh] shrink-0 flex-col overflow-hidden border-r border-border lg:flex"
      >
        <div className={cn("flex h-[52px] shrink-0 items-center", collapsed ? "justify-center" : "justify-between pr-2 pl-4")}>
          <Link href="/" aria-label="Career OS home" className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/60">
            {collapsed ? <BrandMark size={26} /> : <BrandLockup />}
          </Link>
          {!collapsed && (
            <Hint label={<span className="flex items-center gap-1.5">Collapse sidebar <Kbd className="border-gray-10 bg-transparent text-gray-4">[</Kbd></span>} side="right">
              <Button variant="ghost" size="icon-xs" aria-label="Collapse sidebar" onClick={() => setCollapsed(true)}>
                <SidebarSimple />
              </Button>
            </Hint>
          )}
        </div>

        <div className={cn("shrink-0 pb-3", collapsed ? "px-2" : "px-3")}>
          <RoleSwitcher collapsed={collapsed} />
        </div>

        <div className={cn("scroll-slim min-h-0 flex-1 overflow-y-auto pb-3", collapsed ? "px-2" : "px-3")}>
          <SidebarNav collapsed={collapsed} />
        </div>

        <div className={cn("shrink-0 pt-2 pb-3", collapsed ? "px-2" : "px-3")}>
          {collapsed && (
            <Hint label="Expand sidebar" side="right">
              <Button variant="ghost" size="icon-sm" aria-label="Expand sidebar" onClick={() => setCollapsed(false)} className="mx-auto mb-1 flex">
                <SidebarSimple />
              </Button>
            </Hint>
          )}
          <SidebarFooter collapsed={collapsed} />
        </div>
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="bg-overlay fixed inset-0 z-40 lg:hidden"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              className="bg-sidebar fixed inset-y-0 left-0 z-50 flex w-[284px] flex-col border-r border-border shadow-lg lg:hidden"
              initial={reduce ? { opacity: 0 } : { x: "-100%" }}
              animate={reduce ? { opacity: 1 } : { x: 0 }}
              exit={reduce ? { opacity: 0 } : { x: "-100%" }}
              transition={spring.overlay}
            >
              <div className="flex h-[52px] shrink-0 items-center justify-between pr-2 pl-4">
                <BrandLockup />
                <Button variant="ghost" size="icon-sm" aria-label="Close navigation" onClick={() => setDrawerOpen(false)}>
                  <X />
                </Button>
              </div>
              <div className="px-3 pb-3">
                <RoleSwitcher />
              </div>
              <div className="scroll-slim min-h-0 flex-1 overflow-y-auto px-3 pb-3">
                <SidebarNav onNavigate={() => setDrawerOpen(false)} />
              </div>
              <div className="px-3 pt-2 pb-4">
                <SidebarFooter onNavigate={() => setDrawerOpen(false)} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onOpenDrawer={() => setDrawerOpen(true)} drawerOpen={drawerOpen} />
        <main id="main" className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

function TopBar({ onOpenDrawer, drawerOpen }: { onOpenDrawer: () => void; drawerOpen: boolean }) {
  const pathname = usePathname();
  const { open: openPalette } = useCommandPalette();
  const { setOpen: setAssistantOpen } = useAssistant();
  const page = activeNavItem(pathname);
  const section = sectionOf(pathname);

  return (
    <header className="bg-background/80 sticky top-0 z-30 flex h-[52px] shrink-0 items-center gap-2 border-b border-border px-3 backdrop-blur-xl backdrop-saturate-150 sm:px-5">
      <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Open navigation" aria-expanded={drawerOpen} onClick={onOpenDrawer}>
        <List />
      </Button>

      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[13px]">
        {section && (
          <>
            <span className="text-gray-10 hidden truncate sm:inline">{section}</span>
            <CaretRight size={11} className="text-gray-8 hidden shrink-0 sm:inline" />
          </>
        )}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={page.href}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: ease.out }}
            className="truncate font-medium text-foreground"
            aria-current="page"
          >
            {page.label}
          </motion.span>
        </AnimatePresence>
      </nav>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={openPalette}
          aria-label="Search and commands"
          className={cn(
            "text-gray-10 hover:text-gray-11 flex h-8 items-center gap-2 rounded-[var(--radius-control)] transition-colors",
            "w-8 justify-center hover:bg-gray-3 md:w-60 md:justify-start md:border md:border-border md:bg-card md:px-2.5 md:shadow-xs md:hover:border-border-strong md:hover:bg-card",
          )}
        >
          <MagnifyingGlass size={15} className="shrink-0" />
          <span className="hidden flex-1 text-left text-[13px] md:inline">Search or jump to</span>
          <span className="hidden items-center gap-0.5 md:flex">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>
        <Button variant="ghost" size="sm" onClick={() => setAssistantOpen(true)} className="text-gray-11 hidden gap-1.5 sm:inline-flex">
          <Sparkle weight="fill" className="text-brand" />
          Ask
        </Button>
        <NotificationsMenu />
      </div>
    </header>
  );
}
