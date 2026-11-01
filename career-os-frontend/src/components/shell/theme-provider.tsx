"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ThemeChoice = "light" | "dark" | "system";

interface ThemeContextValue {
  /** What the user picked. */
  choice: ThemeChoice;
  /** What is actually on screen once "system" is resolved. */
  resolved: "light" | "dark";
  setChoice: (choice: ThemeChoice) => void;
}

const STORAGE_KEY = "career-os-theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Inlined into <head> so the class lands before first paint. Without this the
 * first frame renders light and then snaps to dark, which is worse than having
 * no dark mode at all.
 */
export const themeBootstrapScript = `
(function () {
  try {
    var stored = localStorage.getItem("${STORAGE_KEY}");
    var dark = stored === "dark" ||
      ((!stored || stored === "system") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  } catch (error) {}
})();
`;

function applyTheme(resolved: "light" | "dark") {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
}

function systemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [choice, setChoiceState] = useState<ThemeChoice>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");
  // Until storage has been read, `choice` still holds its "system" default.
  // Acting on that default would overwrite a stored preference, so every
  // effect below waits for this.
  const [hydrated, setHydrated] = useState(false);

  // Read the stored choice once mounted. The bootstrap script has already put
  // the right class on <html>, so this only syncs React state to reality.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeChoice | null;
    const next = stored ?? "system";
    setChoiceState(next);
    setResolved(next === "system" ? (systemPrefersDark() ? "dark" : "light") : next);
    setHydrated(true);
  }, []);

  // Follow the OS, but only while the choice really is "system".
  useEffect(() => {
    if (!hydrated || choice !== "system") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setResolved(query.matches ? "dark" : "light");
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [choice, hydrated]);

  // Applying is a consequence of `resolved`, never a side effect racing it.
  useEffect(() => {
    if (!hydrated) return;
    applyTheme(resolved);
  }, [hydrated, resolved]);

  const setChoice = useCallback((next: ThemeChoice) => {
    setChoiceState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // A blocked storage write should not stop the theme from changing.
    }
    const effective = next === "system" ? (systemPrefersDark() ? "dark" : "light") : next;
    setResolved(effective);
    applyTheme(effective);
  }, []);

  const value = useMemo(() => ({ choice, resolved, setChoice }), [choice, resolved, setChoice]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** For controls that change the theme. Requires the provider. */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}

/**
 * Read-only variant that tolerates a missing provider and falls back to light.
 * Components that only tint themselves by theme (the WebGL scenes, the lesson
 * room) use this, so they stay mountable in isolation, which is how the lesson
 * room is covered by tests.
 */
export function useResolvedTheme(): "light" | "dark" {
  return useContext(ThemeContext)?.resolved ?? "light";
}
