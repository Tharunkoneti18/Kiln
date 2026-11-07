"use client";

import React, { useEffect, useRef, useState } from "react";
import rough from "roughjs";
import { useSketchChrome } from "./palette";

export interface SketchCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  stroke?: string;
  fill?: string;
  fillStyle?: "hachure" | "solid" | "zigzag" | "cross-hatch" | "dots" | "sunburst" | "dashed";
  roughness?: number;
  bowing?: number;
  strokeWidth?: number;
  seed?: number;
  headerTag?: string;
  tape?: boolean;
  className?: string;
}

export function SketchCard({
  children,
  stroke,
  fill,
  fillStyle = "solid",
  roughness = 1.0,
  bowing = 1.2,
  strokeWidth = 1.5,
  seed = 101,
  headerTag,
  tape = false,
  className = "",
  ...props
}: SketchCardProps) {
  const chrome = useSketchChrome();
  const resolvedStroke = stroke ?? chrome.border;
  const resolvedFill = fill ?? chrome.surface;
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
    const pad = strokeWidth + 1;
    const w = Math.max(1, size.width - pad * 2);
    const h = Math.max(1, size.height - pad * 2);

    const cardShape = rc.rectangle(pad, pad, w, h, {
      stroke: resolvedStroke,
      fill: resolvedFill !== "transparent" ? resolvedFill : undefined,
      fillStyle,
      roughness,
      bowing,
      strokeWidth,
      seed,
    });
    svg.appendChild(cardShape);
  }, [size, resolvedStroke, resolvedFill, fillStyle, roughness, bowing, strokeWidth, seed]);

  return (
    <div ref={containerRef} className={`relative isolate rounded-sm ${className}`} {...props}>
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full overflow-visible"
        width={size.width}
        height={size.height}
      />
      {tape && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-3 left-1/2 z-10 h-6 w-20 -translate-x-1/2 -rotate-2 rounded-sm bg-amber-100/80 shadow-sm backdrop-blur-[1px] border border-amber-200/60"
        />
      )}
      {headerTag && (
        <div className="absolute -top-3 left-4 z-10 inline-block px-2 py-0.5 font-handwriting text-xs font-bold text-sketch-orange bg-background border border-sketch-border rounded">
          {headerTag}
        </div>
      )}
      <div className="relative p-5 sm:p-6">{children}</div>
    </div>
  );
}

