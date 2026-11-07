"use client";

import React, { useEffect, useRef, useState } from "react";
import rough from "roughjs";
import { useSketchInk, type SketchInkName } from "./palette";

export interface SketchUnderlineProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  /** Semantic ink from the sketch palette; resolves per theme. */
  tone?: SketchInkName;
  /** Escape hatch for a literal colour (incl. "currentColor"). Prefer `tone`. */
  stroke?: string;
  strokeWidth?: number;
  roughness?: number;
  wavy?: boolean;
  seed?: number;
  className?: string;
}

export function SketchUnderline({
  children,
  stroke,
  tone = "orange",
  strokeWidth = 2,
  roughness = 1.2,
  wavy = false,
  seed = 88,
  className = "",
  ...props
}: SketchUnderlineProps) {
  const ink = useSketchInk();
  const resolvedStroke = stroke ?? ink[tone];
  const containerRef = useRef<HTMLSpanElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || width === 0) return;
    const svg = svgRef.current;
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const rc = rough.svg(svg);
    const y = 6;
    const opts = { stroke: resolvedStroke, strokeWidth, roughness, seed };

    if (!wavy) {
      // Double sketchy underline
      const l1 = rc.line(0, y, width, y, opts);
      const l2 = rc.line(width * 0.1, y + 2, width * 0.95, y + 2.5, { ...opts, roughness: roughness * 1.3, strokeWidth: strokeWidth * 0.8 });
      svg.appendChild(l1);
      svg.appendChild(l2);
    } else {
      // Wavy curve
      const points: [number, number][] = [
        [0, y],
        [width * 0.25, y - 2],
        [width * 0.5, y + 2],
        [width * 0.75, y - 2],
        [width, y + 1],
      ];
      const curve = rc.curve(points, opts);
      svg.appendChild(curve);
    }
  }, [width, resolvedStroke, strokeWidth, roughness, wavy, seed]);

  return (
    <span ref={containerRef} className={`relative inline-block ${className}`} {...props}>
      {children}
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-2 left-0 h-3 w-full overflow-visible"
        width={width}
        height={12}
      />
    </span>
  );
}

