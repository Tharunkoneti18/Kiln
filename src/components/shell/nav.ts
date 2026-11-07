import {
  Atom,
  Bell,
  Books,
  Briefcase,
  CalendarCheck,
  ChalkboardTeacher,
  ChartLineUp,
  ChartPieSlice,
  Code,
  Compass,
  Exam,
  Gear,
  House,
  Kanban,
  MagnifyingGlass,
  Microphone,
  Path,
  Robot,
  Strategy,
  Trophy,
  UserCircle,
  Users,
  type Icon,
} from "@phosphor-icons/react";

export interface NavItem {
  href: string;
  label: string;
  icon: Icon;
  hint: string;
}

export interface NavGroup {
  label: string;
  icon: Icon;
  items: NavItem[];
}

export type NavEntry = NavItem | NavGroup;

export const isGroup = (entry: NavEntry): entry is NavGroup => "items" in entry;

/**
 * Sidebar structure in the reference style: the most-used destinations are
 * flat, and each journey stage (Discover, Analyze, Prove, Achieve) is one
 * expandable entry with a chevron, so all 21 areas fit without a wall of links.
 */
export const sidebar: NavEntry[] = [
  { href: "/", label: "Home", icon: House, hint: "Where you are and what to do next" },
  { href: "/tutor", label: "AI Tutor", icon: ChalkboardTeacher, hint: "Interactive lessons with your instructor" },
  { href: "/plan", label: "Learning Planner", icon: CalendarCheck, hint: "Your week-by-week plan" },
  {
    label: "Discover",
    icon: Compass,
    items: [
      { href: "/profile", label: "Career Profile", icon: UserCircle, hint: "Your professional identity" },
      { href: "/twin", label: "Digital Twin", icon: Atom, hint: "What you can actually demonstrate" },
      { href: "/roles", label: "Opportunities", icon: Compass, hint: "Realistic roles and adjacent paths" },
    ],
  },
  {
    label: "Analyze",
    icon: ChartLineUp,
    items: [
      { href: "/market", label: "Market Intelligence", icon: ChartLineUp, hint: "What companies actually demand" },
      { href: "/gaps", label: "Skill Gaps", icon: MagnifyingGlass, hint: "What stands between you and the role" },
      { href: "/optimizer", label: "Path Optimizer", icon: Path, hint: "The shortest credible route" },
    ],
  },
  { href: "/library", label: "Knowledge Vault", icon: Books, hint: "Everything you have learned" },
  {
    label: "Prove",
    icon: Trophy,
    items: [
      { href: "/assessments", label: "Proof-of-Skill Lab", icon: Exam, hint: "Assessments and challenges" },
      { href: "/projects", label: "Projects", icon: Code, hint: "Portfolio work matched to gaps" },
      { href: "/simulator", label: "Job Shadow", icon: Users, hint: "Realistic workplace scenarios" },
      { href: "/interviews", label: "Mock Interviews", icon: Microphone, hint: "Practice with adaptive interviewers" },
    ],
  },
  {
    label: "Achieve",
    icon: Briefcase,
    items: [
      { href: "/readiness", label: "Career Readiness", icon: ChartPieSlice, hint: "Evidence-based progress" },
      { href: "/jobs", label: "Opportunity Radar", icon: Strategy, hint: "Jobs matched to proven skills" },
      { href: "/applications", label: "Applications", icon: Kanban, hint: "Stages, outcomes and patterns" },
    ],
  },
  { href: "/assistant", label: "AI Assistant", icon: Robot, hint: "Ask anything about your journey" },
];

export const activityGroup: NavGroup = {
  label: "My Activity",
  icon: Bell,
  items: [
    { href: "/notifications", label: "Notifications", icon: Bell, hint: "Reminders, alerts and summaries" },
    { href: "/settings", label: "Settings", icon: Gear, hint: "Account, preferences and integrations" },
  ],
};

export const navItems: NavItem[] = [...sidebar, activityGroup].flatMap((entry) => (isGroup(entry) ? entry.items : [entry]));

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function activeNavItem(pathname: string) {
  return navItems.filter((item) => isActive(pathname, item.href)).sort((a, b) => b.href.length - a.href.length)[0] ?? navItems[0];
}

/** The section an item lives in, for the top-bar breadcrumb. */
export function sectionOf(pathname: string): string | null {
  const item = activeNavItem(pathname);
  for (const entry of [...sidebar, activityGroup]) {
    if (isGroup(entry) && entry.items.some((child) => child.href === item.href)) return entry.label;
  }
  return null;
}
