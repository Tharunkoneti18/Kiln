"use client";

import React, { useEffect, useRef, useState } from "react";
import rough from "roughjs";
import { useSketchInk, type SketchInkName } from "./palette";

export interface SketchCircleProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  /** Semantic ink from the sketch palette; resolves per theme. */
  tone?: SketchInkName;
  /** Escape hatch for a literal colour (incl. "currentColor"). Prefer `tone`. */
  stroke?: string;
  fill?: string;
  fillStyle?: "hachure" | "solid" | "dots" | "zigzag";
  strokeWidth?: number;
  roughness?: number;
  seed?: number;
  padding?: string;
  className?: string;
}

export function SketchCircle({
  children,
  stroke,
  tone = "orange",
  fill = "transparent",
  fillStyle = "hachure",
  strokeWidth = 1.8,
  roughness = 1.4,
  seed = 49,
  padding = "px-2 py-0.5",
  className = "",
  ...props
}: SketchCircleProps) {
  const ink = useSketchInk();
  const resolvedStroke = stroke ?? ink[tone];
  const containerRef = useRef<HTMLSpanElement>(null);
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
    const cx = size.width / 2;
    const cy = size.height / 2;
    const rx = Math.max(10, size.width * 1.15);
    const ry = Math.max(10, size.height * 1.25);

    const ellipse = rc.ellipse(cx, cy, rx, ry, {
      stroke: resolvedStroke,
      fill: fill !== "transparent" ? fill : undefined,
      fillStyle,
      strokeWidth,
      roughness,
      seed,
    });
    svg.appendChild(ellipse);
  }, [size, resolvedStroke, fill, fillStyle, strokeWidth, roughness, seed]);

  return (
    <span ref={containerRef} className={`relative inline-flex items-center justify-center ${className}`} {...props}>
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="pointer-events-none absolute -inset-1.5 -z-10 h-[calc(100%+0.75rem)] w-[calc(100%+0.75rem)] overflow-visible"
        width={size.width}
        height={size.height}
      />
      <span className={padding}>{children}</span>
    </span>
  );
}

