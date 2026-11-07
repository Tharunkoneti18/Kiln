"use client";

import React, { useEffect, useRef, useState } from "react";
import rough from "roughjs";
import { useSketchInk } from "./palette";

export interface SketchHighlightProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  color?: string;
  roughness?: number;
  bowing?: number;
  seed?: number;
  className?: string;
}

export function SketchHighlight({
  children,
  color,
  roughness = 1.6,
  bowing = 1.5,
  seed = 33,
  className = "",
  ...props
}: SketchHighlightProps) {
  // Anthropic yellow marker, dimmed for dark paper.
  const ink = useSketchInk();
  const resolvedColor = color ?? ink.yellow;
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
    // Draw a semi-transparent rough highlighter fill
    const h = size.height * 0.75;
    const y = size.height * 0.35;
    const shape = rc.rectangle(0, y, size.width, h, {
      fill: resolvedColor,
      fillStyle: "solid",
      stroke: "transparent",
      roughness,
      bowing,
      seed,
    });
    svg.appendChild(shape);
  }, [size, resolvedColor, roughness, bowing, seed]);

  return (
    <span ref={containerRef} className={`relative isolate inline-block ${className}`} {...props}>
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-65 overflow-visible"
        width={size.width}
        height={size.height}
      />
      <span className="relative z-0 font-medium">{children}</span>
    </span>
  );
}

