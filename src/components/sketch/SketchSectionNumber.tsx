"use client";

import React, { useEffect, useRef } from "react";
import rough from "roughjs";
import { useSketchInk, type SketchInkName } from "./palette";

export interface SketchSectionNumberProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  number: number | string;
  size?: number;
  /** Semantic ink from the sketch palette; resolves per theme. */
  tone?: SketchInkName;
  /** Escape hatch for a literal colour. Prefer `tone`. */
  stroke?: string;
  fill?: string;
  className?: string;
}

export function SketchSectionNumber({
  number,
  size = 32,
  tone = "orange",
  stroke,
  fill = "transparent",
  className = "",
  ...props
}: SketchSectionNumberProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const ink = useSketchInk();
  const resolvedStroke = stroke ?? ink[tone];

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const rc = rough.svg(svg);
    const circle = rc.circle(size / 2, size / 2, size - 4, {
      stroke: resolvedStroke,
      fill: fill !== "transparent" ? fill : undefined,
      fillStyle: "solid",
      strokeWidth: 1.8,
      roughness: 1.5,
      // Seeded off the number so a list of circles varies but never reflows
      // into a different shape between renders.
      seed: typeof number === "number" ? number * 17 : 42,
    });
    svg.appendChild(circle);
  }, [number, size, resolvedStroke, fill]);

  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center select-none ${className}`}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-visible"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      />
      <span
        className="relative z-10 font-handwriting font-bold leading-none"
        style={{ fontSize: Math.max(10, Math.round(size * 0.46)), color: resolvedStroke }}
      >
        {number}
      </span>
    </span>
  );
}
