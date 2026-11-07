"use client";

import React, { useEffect, useRef } from "react";
import rough from "roughjs";
import { useSketchInk, type SketchInkName } from "./palette";

export interface SketchConnectorProps extends Omit<React.SVGAttributes<SVGSVGElement>, "from" | "to"> {
  fromPoint?: { x: number; y: number };
  toPoint?: { x: number; y: number };
  /** Semantic ink from the sketch palette; resolves per theme. */
  tone?: SketchInkName;
  /** Escape hatch for a literal colour (incl. "currentColor"). Prefer `tone`. */
  stroke?: string;
  strokeWidth?: number;
  roughness?: number;
  hasArrowhead?: boolean;
  dotted?: boolean;
  label?: string;
  className?: string;
}

export function SketchConnector({
  fromPoint = { x: 0, y: 15 },
  toPoint = { x: 80, y: 15 },
  stroke,
  tone = "blue",
  strokeWidth = 1.5,
  roughness = 1.2,
  hasArrowhead = true,
  dotted = false,
  label,
  className = "",
  ...props
}: SketchConnectorProps) {
  const ink = useSketchInk();
  const resolvedStroke = stroke ?? ink[tone];
  const svgRef = useRef<SVGSVGElement>(null);
  const width = Math.max(10, Math.abs(toPoint.x - fromPoint.x) + 30);
  const height = Math.max(10, Math.abs(toPoint.y - fromPoint.y) + 30);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const rc = rough.svg(svg);
    const opts = {
      stroke: resolvedStroke,
      strokeWidth,
      roughness,
      strokeLineDash: dotted ? [5, 5] : undefined,
      seed: 81,
    };

    const line = rc.line(fromPoint.x, fromPoint.y, toPoint.x, toPoint.y, opts);
    svg.appendChild(line);

    if (hasArrowhead) {
      const angle = Math.atan2(toPoint.y - fromPoint.y, toPoint.x - fromPoint.x);
      const headLen = 8;
      const x1 = toPoint.x - headLen * Math.cos(angle - Math.PI / 6);
      const y1 = toPoint.y - headLen * Math.sin(angle - Math.PI / 6);
      const x2 = toPoint.x - headLen * Math.cos(angle + Math.PI / 6);
      const y2 = toPoint.y - headLen * Math.sin(angle + Math.PI / 6);

      const head = rc.linearPath(
        [
          [x1, y1],
          [toPoint.x, toPoint.y],
          [x2, y2],
        ],
        { stroke: resolvedStroke, strokeWidth, roughness, seed: 82 }
      );
      svg.appendChild(head);
    }
  }, [fromPoint, toPoint, resolvedStroke, strokeWidth, roughness, hasArrowhead, dotted]);

  return (
    <div className={`relative inline-flex flex-col items-center justify-center ${className}`}>
      {label && (
        <span className="mb-0.5 font-handwriting text-[11px] text-muted-foreground">{label}</span>
      )}
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="overflow-visible"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        {...props}
      />
    </div>
  );
}
