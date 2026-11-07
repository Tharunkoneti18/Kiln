"use client";

import React, { useEffect, useRef } from "react";
import rough from "roughjs";
import { useSketchInk, type SketchInkName } from "./palette";

export interface SketchArrowProps extends React.SVGAttributes<SVGSVGElement> {
  direction?: "right" | "left" | "down" | "up" | "curved-right";
  /** Semantic ink from the sketch palette; resolves per theme. */
  tone?: SketchInkName;
  /** Escape hatch for a literal colour (incl. "currentColor"). Prefer `tone`. */
  stroke?: string;
  strokeWidth?: number;
  roughness?: number;
  width?: number;
  height?: number;
  seed?: number;
  className?: string;
}

export function SketchArrow({
  direction = "right",
  stroke,
  tone = "orange",
  strokeWidth = 2,
  roughness = 1.3,
  width = 50,
  height = 24,
  seed = 77,
  className = "",
  ...props
}: SketchArrowProps) {
  const ink = useSketchInk();
  const resolvedStroke = stroke ?? ink[tone];
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const rc = rough.svg(svg);
    const opts = { stroke: resolvedStroke, strokeWidth, roughness, seed };

    if (direction === "right") {
      // Main shaft
      const shaft = rc.line(4, height / 2, width - 8, height / 2, opts);
      // Arrowhead
      const headTop = rc.line(width - 14, height / 2 - 6, width - 6, height / 2, opts);
      const headBottom = rc.line(width - 14, height / 2 + 6, width - 6, height / 2, opts);
      svg.appendChild(shaft);
      svg.appendChild(headTop);
      svg.appendChild(headBottom);
    } else if (direction === "left") {
      const shaft = rc.line(8, height / 2, width - 4, height / 2, opts);
      const headTop = rc.line(14, height / 2 - 6, 6, height / 2, opts);
      const headBottom = rc.line(14, height / 2 + 6, 6, height / 2, opts);
      svg.appendChild(shaft);
      svg.appendChild(headTop);
      svg.appendChild(headBottom);
    } else if (direction === "down") {
      const shaft = rc.line(width / 2, 4, width / 2, height - 8, opts);
      const headLeft = rc.line(width / 2 - 6, height - 14, width / 2, height - 6, opts);
      const headRight = rc.line(width / 2 + 6, height - 14, width / 2, height - 6, opts);
      svg.appendChild(shaft);
      svg.appendChild(headLeft);
      svg.appendChild(headRight);
    } else if (direction === "curved-right") {
      const curve = rc.curve(
        [
          [4, height - 4],
          [width * 0.4, height * 0.7],
          [width * 0.7, 8],
          [width - 8, 8],
        ],
        opts
      );
      const headTop = rc.line(width - 14, 3, width - 6, 8, opts);
      const headBottom = rc.line(width - 14, 13, width - 6, 8, opts);
      svg.appendChild(curve);
      svg.appendChild(headTop);
      svg.appendChild(headBottom);
    }
  }, [direction, resolvedStroke, strokeWidth, roughness, width, height, seed]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`inline-block overflow-visible ${className}`}
      {...props}
    />
  );
}

