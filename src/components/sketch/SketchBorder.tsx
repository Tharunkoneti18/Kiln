"use client";

import React, { useEffect, useRef, useState } from "react";
import rough from "roughjs";
import { useSketchChrome } from "./palette";

export interface SketchBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  stroke?: string;
  strokeWidth?: number;
  roughness?: number;
  className?: string;
}

export function SketchBorder({
  orientation = "horizontal",
  stroke,
  strokeWidth = 1.5,
  roughness = 1.2,
  className = "",
  ...props
}: SketchBorderProps) {
  const chrome = useSketchChrome();
  const resolvedStroke = stroke ?? chrome.border;
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [length, setLength] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setLength(orientation === "horizontal" ? entry.contentRect.width : entry.contentRect.height);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [orientation]);

  useEffect(() => {
    if (!svgRef.current || length === 0) return;
    const svg = svgRef.current;
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const rc = rough.svg(svg);
    if (orientation === "horizontal") {
      const line = rc.line(0, 4, length, 4, {
        stroke: resolvedStroke,
        strokeWidth,
        roughness,
        seed: 66,
      });
      svg.appendChild(line);
    } else {
      const line = rc.line(4, 0, 4, length, {
        stroke: resolvedStroke,
        strokeWidth,
        roughness,
        seed: 66,
      });
      svg.appendChild(line);
    }
  }, [length, orientation, resolvedStroke, strokeWidth, roughness]);

  return (
    <div
      ref={containerRef}
      className={`relative ${orientation === "horizontal" ? "h-2 w-full" : "h-full w-2"} ${className}`}
      {...props}
    >
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-visible"
        width={orientation === "horizontal" ? length : 8}
        height={orientation === "horizontal" ? 8 : length}
      />
    </div>
  );
}

