"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion } from "motion/react";
import { createContext, useContext, useId, useState, type ComponentProps } from "react";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Tabs with a sliding indicator.
 *
 * Radix keeps the active value internal when uncontrolled, so this wrapper
 * mirrors it into context. Each trigger renders the indicator only while
 * active, and the shared `layoutId` lets Motion glide it between triggers.
 * The id is scoped per Tabs instance so two tab sets never trade indicators.
 */
const TabsContext = createContext<{ value?: string; id: string; variant: "pill" | "underline" }>({ id: "", variant: "pill" });

export function Tabs({
  value: controlled,
  defaultValue,
  onValueChange,
  variant = "pill",
  ...props
}: ComponentProps<typeof TabsPrimitive.Root> & { variant?: "pill" | "underline" }) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const value = controlled ?? uncontrolled;
  const id = useId();
  return (
    <TabsContext.Provider value={{ value, id, variant }}>
      <TabsPrimitive.Root
        value={value}
        onValueChange={(next) => {
          if (controlled === undefined) setUncontrolled(next);
          onValueChange?.(next);
        }}
        {...props}
      />
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  const { variant } = useContext(TabsContext);
  return (
    <TabsPrimitive.List
      className={cn(
        variant === "pill"
          ? "bg-gray-3 inline-flex items-center gap-0.5 rounded-[var(--radius-control)] p-[3px]"
          : "inline-flex items-center gap-5 border-b border-border",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ className, children, value, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  const context = useContext(TabsContext);
  const active = context.value === value;
  const pill = context.variant === "pill";
  return (
    <TabsPrimitive.Trigger
      value={value}
      className={cn(
        "relative inline-flex items-center gap-1.5 text-[13px] font-medium whitespace-nowrap transition-colors duration-150 outline-none",
        "text-gray-11 hover:text-foreground data-[state=active]:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring/50",
        pill ? "h-7 rounded-[6px] px-3" : "h-9 px-0.5",
        "[&_svg]:size-3.5 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {active && (
        <motion.span
          layoutId={"tab-indicator-" + context.id}
          transition={spring.layout}
          aria-hidden="true"
          className={
            pill
              ? "bg-card absolute inset-0 rounded-[6px] shadow-[0_1px_2px_rgb(0_0_0/0.06),0_0_0_1px_var(--border)]"
              : "bg-foreground absolute inset-x-0 -bottom-px h-[2px] rounded-full"
          }
        />
      )}
      <span className="relative inline-flex items-center gap-1.5">{children}</span>
    </TabsPrimitive.Trigger>
  );
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn("outline-none", className)} {...props} />;
}
