import { AppShell } from "@/components/shell/app-shell";

/**
 * Wraps every product screen in the persistent shell. The route group adds no
 * path segment, so the dashboard still lives at the root.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
