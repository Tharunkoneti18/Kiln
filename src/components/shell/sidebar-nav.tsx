"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CaretDown, CaretUpDown, Check } from "@phosphor-icons/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Hint } from "@/components/ui/tooltip";
import { Ring } from "@/components/system/data";
import { learner, notifications, roleOptions, targetRole } from "@/lib/mock/data";
import { ease, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { activityGroup, isActive, isGroup, sidebar, type NavGroup, type NavItem } from "./nav";
import { ThemeToggle } from "./theme-toggle";

/* ---------------------------------------------------------------------------
   Sidebar navigation.

   The active item is marked by a single raised pill that is shared across
   every link (one `layoutId`), so changing page makes it glide from the old
   item to the new one instead of blinking. Groups expand with a height
   animation and remember their state per browser.

   `collapsed` renders the icon rail: labels drop, groups flatten into icon
   stacks separated by hairlines, and every icon gets a tooltip.
--------------------------------------------------------------------------- */

const GROUPS_KEY = "career-os-nav-groups";

function useGroupState(group: NavGroup, pathname: string) {
  const containsActive = group.items.some((item) => isActive(pathname, item.href));
  const [open, setOpen] = useState(true);

  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(GROUPS_KEY) ?? "{}") as Record<string, boolean>;
      if (group.label in stored) setOpen(stored[group.label]);
    } catch {
      // Unreadable storage just means defaults: every group open.
    }
  }, [group.label]);

  const toggle = () =>
    setOpen((previous) => {
      const next = !previous;
      try {
        const stored = JSON.parse(window.localStorage.getItem(GROUPS_KEY) ?? "{}");
        window.localStorage.setItem(GROUPS_KEY, JSON.stringify({ ...stored, [group.label]: next }));
      } catch {
        // Ignore: the toggle still works for this session.
      }
      return next;
    });

  // A group holding the current page is always shown, whatever was stored.
  return { open: open || containsActive, toggle, containsActive };
}

/** Target-role switcher with live readiness. The ring is the at-a-glance KPI. */
export function RoleSwitcher({ collapsed }: { collapsed?: boolean }) {
  const [roleId, setRoleId] = useState(roleOptions.find((role) => role.isTarget)!.id);
  const current = roleOptions.find((role) => role.id === roleId)!;
  const readiness = current.isTarget ? targetRole.readiness : current.compatibility;

  const trigger = (
    <DropdownMenuTrigger
      className={cn(
        "group flex w-full items-center rounded-[10px] text-left transition-colors outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring/60",
        collapsed ? "justify-center p-1" : "bg-card gap-2.5 border border-border p-2 shadow-xs hover:border-border-strong",
      )}
      aria-label={"Target role: " + current.title + ", " + readiness + "% ready"}
    >
      <Ring value={readiness} size={30} stroke={3.5}>
        <span className="text-[9px] font-semibold tabular text-foreground">{readiness}</span>
      </Ring>
      {!collapsed && (
        <>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-gray-10 text-[11px] leading-tight">Targeting</span>
            <span className="truncate text-[13px] leading-tight font-medium text-foreground">{current.title}</span>
          </span>
          <CaretUpDown size={14} className="text-gray-9 group-hover:text-gray-11 shrink-0 transition-colors" />
        </>
      )}
    </DropdownMenuTrigger>
  );

  return (
    <DropdownMenu>
      {collapsed ? <Hint label={current.title + " · " + readiness + "% ready"} side="right">{trigger}</Hint> : trigger}
      <DropdownMenuContent align="start" side={collapsed ? "right" : "bottom"} className="w-[260px]">
        <DropdownMenuLabel>Switch target role</DropdownMenuLabel>
        {roleOptions.slice(0, 5).map((role) => (
          <DropdownMenuItem key={role.id} onSelect={() => setRoleId(role.id)}>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate">{role.title}</span>
              <span className="text-gray-10 text-[11.5px]">{role.compatibility}% of skills proven</span>
            </span>
            {role.id === roleId && <Check size={14} weight="bold" className="text-brand" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/roles" className="text-gray-11">Compare all roles</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SidebarNav({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Platform areas" className="flex flex-col gap-px">
      {sidebar.map((entry) =>
        isGroup(entry) ? (
          <Group key={entry.label} group={entry} pathname={pathname} collapsed={collapsed} onNavigate={onNavigate} />
        ) : (
          <NavLink key={entry.href} item={entry} active={isActive(pathname, entry.href)} collapsed={collapsed} onNavigate={onNavigate} />
        ),
      )}
    </nav>
  );
}

function Group({ group, pathname, collapsed, onNavigate }: { group: NavGroup; pathname: string; collapsed?: boolean; onNavigate?: () => void }) {
  const reduce = useReducedMotion();
  const { open, toggle } = useGroupState(group, pathname);

  if (collapsed) {
    return (
      <div className="flex flex-col gap-px">
        <div className="bg-border mx-auto my-2 h-px w-5" aria-hidden="true" />
        {group.items.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} collapsed onNavigate={onNavigate} />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-col first:mt-0">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="group text-gray-10 hover:text-gray-11 flex h-7 items-center gap-1 rounded-md px-2 text-left text-[11.5px] font-medium transition-colors"
      >
        <span>{group.label}</span>
        <motion.span animate={{ rotate: open ? 0 : -90 }} transition={spring.snappy} className="opacity-0 transition-opacity group-hover:opacity-100">
          <CaretDown size={10} weight="bold" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: ease.out }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-px">
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} onNavigate={onNavigate} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavLink({
  item,
  active,
  collapsed,
  onNavigate,
  badge,
}: {
  item: NavItem;
  active: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
  badge?: number;
}) {
  const reduce = useReducedMotion();
  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex h-8 items-center gap-2.5 rounded-[7px] text-[13px] transition-colors duration-150 outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring/60",
        collapsed ? "mx-auto w-9 justify-center" : "px-2",
        active ? "text-foreground font-medium" : "text-gray-11 hover:bg-gray-4/70 hover:text-foreground",
      )}
    >
      {active && (
        <motion.span
          layoutId={reduce ? undefined : "nav-active-pill"}
          transition={spring.layout}
          aria-hidden="true"
          className="bg-card absolute inset-0 rounded-[7px] shadow-[0_1px_2px_rgb(0_0_0/0.06),0_0_0_1px_var(--border)] dark:bg-gray-4 dark:shadow-none"
        />
      )}
      <item.icon
        size={16}
        weight={active ? "fill" : "regular"}
        className={cn("relative shrink-0 transition-colors", active ? "text-brand" : "text-gray-10 group-hover:text-gray-11")}
      />
      {!collapsed && <span className="relative truncate">{item.label}</span>}
      {badge ? (
        collapsed ? (
          <span className="bg-brand absolute top-1.5 right-1.5 size-1.5 rounded-full" aria-hidden="true" />
        ) : (
          <span className="bg-brand-soft text-brand-text relative ml-auto rounded-full px-1.5 text-[11px] font-medium tabular">{badge}</span>
        )
      ) : null}
    </Link>
  );
  return collapsed ? <Hint label={item.label} side="right">{link}</Hint> : link;
}

/** Notifications, settings, theme, and the signed-in learner. */
export function SidebarFooter({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const unread = notifications.filter((item) => !item.read).length;
  const [notificationsItem, settingsItem] = activityGroup.items;

  return (
    <div className="flex flex-col gap-px">
      <NavLink item={notificationsItem} active={isActive(pathname, notificationsItem.href)} collapsed={collapsed} onNavigate={onNavigate} badge={unread} />
      <NavLink item={settingsItem} active={isActive(pathname, settingsItem.href)} collapsed={collapsed} onNavigate={onNavigate} />
      <div className={cn("mt-2 flex items-center border-t border-border pt-3", collapsed ? "flex-col gap-2" : "gap-2.5 px-1")}>
        <Link
          href="/profile"
          onClick={onNavigate}
          className={cn("flex min-w-0 items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/60", !collapsed && "flex-1")}
          aria-label={"Profile for " + learner.name}
        >
          <span className="bg-gray-12 text-gray-1 grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold">{learner.initials}</span>
          {!collapsed && (
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-[13px] font-medium text-foreground">{learner.name}</span>
              <span className="text-gray-10 truncate text-[11.5px]">Week 3 of 8</span>
            </span>
          )}
        </Link>
        {!collapsed && <ThemeToggle />}
      </div>
    </div>
  );
}
