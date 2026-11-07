import { Asterisk } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

/** Clay tile with a bold asterisk: reads at 16px and at 40px. */
export function BrandMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className={cn("bg-brand inline-grid shrink-0 place-items-center text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_1px_2px_rgb(0_0_0/0.12)]", className)}
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.28) }}
    >
      <Asterisk size={Math.round(size * 0.62)} weight="bold" />
    </span>
  );
}

export function BrandLockup({ className, size = "md" }: { className?: string; size?: "md" | "lg" }) {
  const large = size === "lg";
  return (
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <BrandMark size={large ? 30 : 26} />
      <span className={cn("font-semibold tracking-[-0.02em] text-foreground", large ? "text-[16px]" : "text-[15px]")}>
        Career OS
      </span>
    </span>
  );
}
