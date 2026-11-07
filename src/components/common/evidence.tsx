import { CheckCircle, Circle, Question, SealCheck, Warning } from "@phosphor-icons/react";
import type { EvidenceState } from "@/lib/mock/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * The five evidence states, with one fixed meaning and one fixed colour
 * across the whole product. The copy matters as much as the colour: the
 * difference between "we have no proof" and "we have no information" is the
 * distinction the product is built on, so the labels never collapse them.
 */
export const evidenceMeta: Record<
  EvidenceState,
  { label: string; icon: typeof Circle; meaning: string }
> = {
  demonstrated: {
    label: "Demonstrated",
    icon: SealCheck,
    meaning: "A work sample or assessment backs this capability.",
  },
  supported: {
    label: "Supported",
    icon: CheckCircle,
    meaning: "Your profile suggests it, but there is no direct proof yet.",
  },
  transferable: {
    label: "Transferable",
    icon: Warning,
    meaning: "Adjacent evidence may carry over once a named bridge is closed.",
  },
  gap: {
    label: "Gap",
    icon: Circle,
    meaning: "The role asks for it and your evidence does not support it.",
  },
  unknown: {
    label: "Unknown",
    icon: Question,
    meaning: "There is not enough information yet. This is not the same as missing.",
  },
};

export function EvidenceBadge({
  state,
  className,
  withIcon = true,
}: {
  state: EvidenceState;
  className?: string;
  withIcon?: boolean;
}) {
  const meta = evidenceMeta[state];
  return (
    <Badge variant={state} className={className}>
      {withIcon && <meta.icon weight="fill" />}
      {meta.label}
    </Badge>
  );
}

/** A small square swatch for legends and dense table rows. */
export function EvidenceDot({ state, className }: { state: EvidenceState; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("size-2 shrink-0 rounded-[2px]", className)}
      style={{ background: "var(--state-" + state + ")" }}
    />
  );
}

/**
 * Confidence as four discrete segments rather than a continuous bar. A bar
 * invites reading a precise value off something that is an estimate.
 */
export function ConfidenceMeter({
  confidence,
  className,
}: {
  confidence: number;
  className?: string;
}) {
  const filled = Math.max(1, Math.min(4, Math.ceil(confidence * 4)));
  return (
    <span
      className={cn("inline-flex items-center gap-2", className)}
      title={"Confidence " + Math.round(confidence * 100) + " percent"}
    >
      <span aria-hidden="true" className="flex items-center gap-[3px]">
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className={cn(
              "h-2.5 w-[3px] rounded-full",
              step <= filled ? "bg-gray-11" : "bg-gray-5",
            )}
          />
        ))}
      </span>
      <span className="text-gray-10 tabular text-[12px]">
        {Math.round(confidence * 100)}%
      </span>
    </span>
  );
}
