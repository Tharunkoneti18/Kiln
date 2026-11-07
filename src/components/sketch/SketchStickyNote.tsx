"use client";

import React, { useEffect, useRef, useState } from "react";
import rough from "roughjs";
import { useStickySurface, type StickyColor } from "./palette";

export interface SketchStickyNoteProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  color?: StickyColor;
  tilt?: "left" | "right" | "none";
  tape?: boolean;
  pin?: boolean;
  headerTag?: string;
  className?: string;
}

export function SketchStickyNote({
  children,
  color = "yellow",
  tilt = "right",
  tape = true,
  pin = false,
  headerTag,
  className = "",
  ...props
}: SketchStickyNoteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const surface = useStickySurface(color);
  const rotationClass = tilt === "left" ? "-rotate-1" : tilt === "right" ? "rotate-1" : "";

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
    const pad = 2;
    const shape = rc.rectangle(pad, pad, size.width - pad * 2, size.height - pad * 2, {
      fill: surface.fill,
      fillStyle: "solid",
      stroke: surface.stroke,
      strokeWidth: 1.5,
      roughness: 1.2,
      bowing: 1.5,
      seed: 95,
    });
    svg.appendChild(shape);
  }, [size, surface]);

  return (
    <div
      ref={containerRef}
      className={`relative isolate transition-transform hover:rotate-0 hover:scale-[1.01] motion-reduce:transition-none ${rotationClass} ${className}`}
      {...props}
    >
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full overflow-visible drop-shadow-sm"
        width={size.width}
        height={size.height}
      />
      {tape && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-2.5 left-1/2 z-10 h-5 w-16 -translate-x-1/2 -rotate-2 rounded-xs border opacity-85 shadow-2xs backdrop-blur-[1px]"
          style={{ backgroundColor: surface.accent, borderColor: surface.stroke }}
        />
      )}
      {pin && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-1.5 left-1/2 z-10 size-3 -translate-x-1/2 rounded-full border border-red-800 bg-red-600 shadow-sm"
        />
      )}
      {headerTag && (
        <div className="absolute -top-3 left-4 z-10 inline-block px-2 py-0.5 font-handwriting text-[11px] font-bold text-sketch-orange bg-card border border-sketch-border rounded shadow-2xs">
          {headerTag}
        </div>
      )}
      {/* Ink is pinned to the paper colour, so the note stays legible whichever
          theme is active. */}
      <div className="p-4 text-[13px] leading-relaxed font-sans" style={{ color: surface.ink }}>
        {children}
      </div>
    </div>
  );
}
