import { cn } from "@/lib/utils";

/**
 * Career OS mark: a blue disc with three ascending bars. Wordmark is set in a
 * heavy weight with the blue accent, the way the reference treats its logo,
 * without borrowing the reference's own mark.
 */
export function BrandMark({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className={cn("bg-primary flex items-end justify-center gap-[2.5px] rounded-full", className)}
      style={{ width: size, height: size, padding: size * 0.24 }}
    >
      <i className="bg-primary-foreground block w-[3px] rounded-full" style={{ height: "38%" }} />
      <i className="bg-primary-foreground block w-[3px] rounded-full" style={{ height: "66%" }} />
      <i className="bg-primary-foreground block w-[3px] rounded-full" style={{ height: "100%" }} />
    </span>
  );
}

export function BrandLockup({ className, size = "md" }: { className?: string; size?: "md" | "lg" }) {
  const large = size === "lg";
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <BrandMark size={large ? 36 : 28} />
      <span className={cn("text-primary leading-none font-extrabold tracking-tight", large ? "text-[26px]" : "text-[19px]")}>
        career<span className="text-foreground">os</span>
      </span>
    </span>
  );
}
