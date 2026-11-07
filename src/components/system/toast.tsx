"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CheckCircle, Info, WarningCircle, X } from "@phosphor-icons/react";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Toasts: transient confirmation that an action landed.
 *
 * They stack from the bottom-right, newest at the bottom. Entering, they rise
 * and scale from 96%; when one leaves, the rest close the gap with a `layout`
 * spring instead of jumping. Each toast is announced through a polite live
 * region so screen readers hear the confirmation too.
 */

type Tone = "success" | "info" | "error";
interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone: Tone;
  action?: { label: string; onClick: () => void };
}

interface ToastApi {
  toast: (toast: Omit<ToastItem, "id" | "tone"> & { tone?: Tone; duration?: number }) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);
  const reduce = useReducedMotion();

  const dismiss = useCallback((id: number) => setItems((all) => all.filter((t) => t.id !== id)), []);

  const toast = useCallback<ToastApi["toast"]>(
    ({ duration = 3800, tone = "success", ...rest }) => {
      const id = ++counter.current;
      setItems((all) => [...all.slice(-2), { id, tone, ...rest }]);
      window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const api = useMemo(() => ({ toast }), [toast]);
  const icons = { success: CheckCircle, info: Info, error: WarningCircle };
  const tones = { success: "text-success", info: "text-info", error: "text-danger" };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 bottom-4 z-[70] flex w-[calc(100vw-2rem)] max-w-[360px] flex-col gap-2 sm:right-6 sm:bottom-6"
      >
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const Icon = icons[item.tone];
            return (
              <motion.div
                key={item.id}
                layout={!reduce}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                transition={spring.overlay}
                role="status"
                className="bg-popover pointer-events-auto flex items-start gap-3 rounded-[var(--radius-surface)] border border-border p-3.5 shadow-lg"
              >
                <Icon size={18} weight="fill" className={cn("mt-px shrink-0", tones[item.tone])} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-foreground">{item.title}</p>
                  {item.description && <p className="text-muted-foreground mt-0.5 text-[12.5px] leading-snug">{item.description}</p>}
                  {item.action && (
                    <button
                      type="button"
                      onClick={() => {
                        item.action!.onClick();
                        dismiss(item.id);
                      }}
                      className="mt-2 text-[12.5px] font-medium text-foreground underline underline-offset-4"
                    >
                      {item.action.label}
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  aria-label="Dismiss"
                  onClick={() => dismiss(item.id)}
                  className="text-gray-9 hover:bg-gray-3 hover:text-foreground -m-1 grid size-6 shrink-0 place-items-center rounded-md transition-colors"
                >
                  <X size={13} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

/** Falls back to a no-op outside the provider so isolated tests still mount. */
export function useToast(): ToastApi {
  return useContext(ToastContext) ?? { toast: () => {} };
}
