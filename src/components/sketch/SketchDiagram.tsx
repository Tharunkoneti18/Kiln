"use client";

import React from "react";
import { SketchBox } from "./SketchBox";
import { SketchArrow } from "./SketchArrow";
import { useSketchChrome, type SketchInkName } from "./palette";

export interface DiagramStep {
  id: string;
  title: string;
  description?: string;
  tag?: string;
  /** Semantic ink from the sketch palette; resolves per theme. */
  tone?: SketchInkName;
}

export interface SketchDiagramProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: DiagramStep[];
  title?: string;
  className?: string;
}

/**
 * A left-to-right process flow in notebook ink. Steps wrap on narrow screens
 * and the connecting arrows drop out below `sm`, where a wrapped row would put
 * an arrow pointing at nothing.
 */
export function SketchDiagram({ steps, title, className = "", ...props }: SketchDiagramProps) {
  const chrome = useSketchChrome();

  return (
    <div
      className={`flex flex-col gap-3 rounded-lg border border-sketch-border/60 bg-surface/80 p-5 ${className}`}
      {...props}
    >
      {title && (
        <h4 className="font-handwriting text-base font-bold text-foreground/90">{title}</h4>
      )}
      <ol className="flex list-none flex-wrap items-stretch gap-3 p-0">
        {steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            <li className="flex min-w-[140px] max-w-[220px] flex-1 list-none">
              <SketchBox
                tone={step.tone ?? "blue"}
                fill={chrome.muted}
                fillStyle="solid"
                className="w-full"
                padding="p-3"
              >
                <div className="flex flex-col gap-1">
                  {step.tag && (
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {step.tag}
                    </span>
                  )}
                  <span className="font-serif text-sm font-bold text-foreground">{step.title}</span>
                  {step.description && (
                    <span className="text-xs leading-snug text-secondary-foreground">
                      {step.description}
                    </span>
                  )}
                </div>
              </SketchBox>
            </li>
            {idx < steps.length - 1 && (
              <li aria-hidden="true" className="hidden shrink-0 list-none items-center sm:flex">
                <SketchArrow direction="right" width={32} height={16} tone="blue" />
              </li>
            )}
          </React.Fragment>
        ))}
      </ol>
    </div>
  );
}
