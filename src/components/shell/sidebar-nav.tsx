"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CaretDown, CaretRight, Check, Plus, UserCircle } from "@phosphor-icons/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { roleOptions } from "@/lib/mock/data";
import { activityGroup, isActive, isGroup, sidebar, type NavGroup, type NavItem } from "./nav";
import { useAssistant } from "./assistant-panel";
import { cn } from "@/lib/utils";

/** "You're learning as" switcher, in the place of the reference's role card. */
export function RoleSwitcher() {
  const [roleId, setRoleId] = useState(roleOptions.find((role) => role.isTarget)!.id);
  const current = roleOptions.find((role) => role.id === roleId)!;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground block px-1 text-[11.5px] font-medium">Learning as</span>
      <DropdownMenu>
        <DropdownMenuTrigger className="bg-accent/60 hover:bg-accent border-tile-border flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors">
          <UserCircle size={17} weight="fill" className="text-primary shrink-0" />
          <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold">{current.title}</span>
          <CaretDown size={12} className="text-muted-foreground shrink-0" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[230px]">
          <DropdownMenuLabel className="text-muted-foreground">Target role</DropdownMenuLabel>
          {roleOptions.slice(0, 5).map((role) => (
            <DropdownMenuItem key={role.id} onSelect={() => setRoleId(role.id)}>
              <span className="flex-1">{role.title}</span>
              {role.id === roleId && <Check size={13} weight="bold" className="text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/** Filled pill action — primary gradient CTA. */
export function AskPill() {
  const { setOpen } = useAssistant();
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="bg-primary hover:bg-brand-2 text-primary-foreground flex h-10 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-semibold shadow-[0_2px_8px_rgb(60_80_220/0.22)] transition-all hover:shadow-[0_4px_14px_rgb(60_80_220/0.32)]"
    >
      <Plus size={16} weight="bold" /> Ask AI
    </button>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Platform areas" className="flex flex-col gap-0.5">
      {sidebar.map((entry) =>
        isGroup(entry) ? (
          <Group key={entry.label} group={entry} pathname={pathname} onNavigate={onNavigate} />
        ) : (
          <NavLink key={entry.href} item={entry} active={isActive(pathname, entry.href)} onNavigate={onNavigate} />
        ),
      )}
    </nav>
  );
}

export function ActivityNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return <Group group={activityGroup} pathname={pathname} onNavigate={onNavigate} openUp />;
}

function Group({ group, pathname, onNavigate, openUp }: { group: NavGroup; pathname: string; onNavigate?: () => void; openUp?: boolean }) {
  const reduce = useReducedMotion();
  const containsActive = group.items.some((item) => isActive(pathname, item.href));
  const [open, setOpen] = useState(containsActive);

  const children = (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={reduce ? false : { height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div className="border-border ml-[25px] flex flex-col gap-0.5 border-l py-1 pl-2.5">
            {group.items.map((item) => (
              <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} onNavigate={onNavigate} compact />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="flex flex-col">
      {openUp && children}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={cn(
          "hover:bg-nav-active flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] transition-colors",
          containsActive && !open ? "bg-nav-active font-semibold" : "text-foreground/85",
        )}
      >
        <group.icon size={21} className="shrink-0" />
        <span className="flex-1">{group.label}</span>
        <motion.span animate={{ rotate: open ? (openUp ? -90 : 90) : 0 }} transition={{ duration: 0.2 }}>
          <CaretRight size={14} className="text-muted-foreground" />
        </motion.span>
      </button>
      {!openUp && children}
    </div>
  );
}

function NavLink({ item, active, onNavigate, compact }: { item: NavItem; active: boolean; onNavigate?: () => void; compact?: boolean }) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-xl px-3 transition-colors",
        compact ? "py-1.5 text-[13.5px]" : "py-2 text-[14.5px]",
        active ? "bg-nav-active text-foreground font-semibold" : "text-foreground/75 hover:bg-nav-active/60 hover:text-foreground",
      )}
    >
      <item.icon size={compact ? 17 : 19} className={cn("shrink-0", active ? "text-primary" : "text-foreground/55")} />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}
