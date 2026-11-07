"use client";

import React, { useEffect, useRef, useState } from "react";
import rough from "roughjs";
import { useCalloutSurface, type CalloutVariant } from "./palette";

export interface SketchCalloutProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  title?: string;
  variant?: CalloutVariant;
  className?: string;
}

export function SketchCallout({
  children,
  icon,
  title,
  variant = "note",
  className = "",
  ...props
}: SketchCalloutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  // Resolved per theme: Rough.js bakes colours into SVG attributes, so the
  // fill cannot come from a CSS custom property.
  const surface = useCalloutSurface(variant);

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
      stroke: surface.stroke,
      fill: surface.fill,
      fillStyle: "solid",
      strokeWidth: 1.5,
      roughness: 1.1,
      bowing: 1,
      seed: 52,
    });
    svg.appendChild(shape);
  }, [size, surface]);

  return (
    <div ref={containerRef} className={`relative isolate p-4 ${className}`} {...props}>
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full overflow-visible"
        width={size.width}
        height={size.height}
      />
      <div className="flex items-start gap-3">
        {icon && (
          <span className="mt-0.5 shrink-0 text-lg" style={{ color: surface.accent }}>
            {icon}
          </span>
        )}
        <div className="flex-1 space-y-1">
          {title && (
            <h4
              className="font-serif text-sm font-bold tracking-tight"
              style={{ color: surface.titleInk }}
            >
              {title}
            </h4>
          )}
          {/* Ink travels with the paper so a tinted surface never inherits
              --foreground and end up light-on-light in dark mode. */}
          <div className="text-[13px] leading-relaxed" style={{ color: surface.ink }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
