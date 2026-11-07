"use client";

import React, { useEffect, useRef, useState } from "react";
import rough from "roughjs";
import { useSketchInk, type SketchInkName } from "./palette";

export interface SketchBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  /** Semantic ink from the sketch palette; resolves per theme. */
  tone?: SketchInkName;
  /** Escape hatch for a literal colour (incl. "currentColor"). Prefer `tone`. */
  stroke?: string;
  fill?: string;
  fillStyle?: "hachure" | "solid" | "zigzag" | "cross-hatch" | "dots" | "sunburst" | "dashed";
  roughness?: number;
  bowing?: number;
  strokeWidth?: number;
  seed?: number;
  padding?: string;
  className?: string;
}

export function SketchBox({
  children,
  stroke,
  tone = "orange",
  fill = "transparent",
  fillStyle = "hachure",
  roughness = 1.2,
  bowing = 1,
  strokeWidth = 1.5,
  seed = 42,
  padding = "p-4",
  className = "",
  ...props
}: SketchBoxProps) {
  const ink = useSketchInk();
  const resolvedStroke = stroke ?? ink[tone];
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || size.width === 0 || size.height === 0) return;
    const svg = svgRef.current;
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const rc = rough.svg(svg);
    const paddingOffset = strokeWidth;
    const w = Math.max(1, size.width - paddingOffset * 2);
    const h = Math.max(1, size.height - paddingOffset * 2);

    const shape = rc.rectangle(paddingOffset, paddingOffset, w, h, {
      stroke: resolvedStroke,
      fill: fill !== "transparent" ? fill : undefined,
      fillStyle,
      roughness,
      bowing,
      strokeWidth,
      seed,
    });
    svg.appendChild(shape);
  }, [size, resolvedStroke, fill, fillStyle, roughness, bowing, strokeWidth, seed]);

  return (
    <div ref={containerRef} className={`relative isolate ${className}`} {...props}>
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full overflow-visible"
        width={size.width}
        height={size.height}
      />
      <div className={padding}>{children}</div>
    </div>
  );
}
