"use client";

import { CheckCircle, Hourglass } from "@phosphor-icons/react";
import { Progress } from "@/components/ui/progress";
import type { LessonManifest } from "../../lib/tutor/types";
import { cn } from "@/lib/utils";

/**
 * Segment list for the lesson. Each entry is a real seek target, so the
 * outline doubles as the keyboard route through the lesson.
 */
export function LessonOutline({
  lesson,
  currentSegment,
  progressPercent,
  onSelect,
  reason = "This lesson closes a gap your target role asks for, in the order your plan set.",
}: {
  reason?: string;
  lesson: LessonManifest;
  currentSegment: string;
  progressPercent: number;
  onSelect: (segmentId: string) => void;
}) {
  const currentIndex = lesson.segments.findIndex(
    (segment) => segment.segment_id === currentSegment,
  );

  return (
    <nav aria-label="Lesson outline" className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-[12.5px] font-bold tracking-wide">Lesson map</h2>
          <span className="numeric text-muted-foreground text-[11.5px]">{progressPercent}%</span>
        </div>
        <Progress
          value={progressPercent}
          aria-label="Lesson progress"
          // Radix exposes the value; the visible number above repeats it.
        />
      </div>

      <ol className="flex flex-col gap-1">
        {lesson.segments.map((segment, index) => {
          const isCurrent = segment.segment_id === currentSegment;
          const isDone = index < currentIndex;
          return (
            <li key={segment.segment_id}>
              <button
                type="button"
                onClick={() => onSelect(segment.segment_id)}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors",
                  isCurrent
                    ? "bg-primary/10 text-primary ring-primary/20 ring-1"
                    : "text-muted-foreground hover:bg-raised hover:text-foreground",
                )}
              >
                <span className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle size={15} weight="fill" className="text-primary" />
                  ) : (
                    <span
                      className={cn(
                        "numeric grid size-[15px] place-items-center rounded-full text-[9px] font-bold",
                        isCurrent
                          ? "bg-primary text-primary-foreground"
                          : "border-border border",
                      )}
                    >
                      {index + 1}
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] leading-snug font-semibold">
                    {segment.title}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 text-[11px] opacity-80">
                    <Hourglass size={11} />
                    <span className="numeric">{Math.round(segment.duration_ms / 60000)}</span> min
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="border-primary/25 bg-primary/[0.05] mt-1 rounded-md border p-3">
        <h3 className="text-primary mb-1 text-[11px] font-bold tracking-wide">Why this lesson</h3>
        <p className="text-[12px] leading-relaxed">{reason}</p>
      </div>
    </nav>
  );
}
