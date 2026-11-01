"use client";

import { motion, useReducedMotion } from "motion/react";
import type { BoardEvent, BoardState } from "../../lib/tutor/types";

/**
 * The lesson board.
 *
 * Events are replayed deterministically from the manifest into SVG, which is
 * what lets the board be rebuilt exactly at any cursor position. Each event
 * also carries an accessible description, collected into a live region below,
 * so the board is followable without seeing it.
 */

function renderEvent(event: BoardEvent) {
  const p = event.payload as Record<string, string | number>;
  const x = Number(p.x ?? 0) * 1000;
  const y = Number(p.y ?? 0) * 600;
  const width = Number(p.width ?? 0) * 1000;
  const height = Number(p.height ?? 0) * 600;
  const key = event.id;

  switch (event.kind) {
    case "text":
      return (
        <text key={key} x={x} y={y + 26} className="board-text">
          {String(p.text ?? "")}
        </text>
      );
    case "rectangle":
      return <rect key={key} x={x} y={y} width={width} height={height} rx="8" className="board-shape" />;
    case "highlight":
      return <rect key={key} x={x} y={y} width={width} height={height} rx="4" className="board-highlight" />;
    case "circle":
      return <circle key={key} cx={x} cy={y} r={Math.max(width, height) / 2} className="board-shape" />;
    case "line":
      return (
        <line
          key={key}
          x1={x}
          y1={y}
          x2={Number(p.to_x ?? p.x) * 1000}
          y2={Number(p.to_y ?? p.y) * 600}
          className="board-shape"
        />
      );
    case "arrow":
      return (
        <line
          key={key}
          x1={x}
          y1={y}
          x2={Number(p.to_x ?? p.x) * 1000}
          y2={Number(p.to_y ?? p.y) * 600}
          markerEnd="url(#arrowhead)"
          className="board-arrow"
        />
      );
    case "grid":
      return (
        <g key={key} className="board-grid">
          {Array.from({ length: 9 }, (_, i) => (
            <line
              key={"v" + i}
              x1={x + (i * width) / 8}
              y1={y}
              x2={x + (i * width) / 8}
              y2={y + height}
            />
          ))}
          {Array.from({ length: 5 }, (_, i) => (
            <line
              key={"h" + i}
              x1={x}
              y1={y + (i * height) / 4}
              x2={x + width}
              y2={y + (i * height) / 4}
            />
          ))}
        </g>
      );
    case "image":
      return (
        <image
          key={key}
          href={String(p.src)}
          x={x}
          y={y}
          width={width}
          height={height}
          preserveAspectRatio="xMidYMid meet"
          aria-label={event.accessible_text}
        />
      );
    default:
      return null;
  }
}

export function Whiteboard({ board, title }: { board: BoardState; title: string }) {
  const descriptions = board.events.map((event) => event.accessible_text);
  const reduceMotion = useReducedMotion();

  return (
    <div className="bg-card relative overflow-hidden rounded-xl border">
      {/* Faint ruling, so the surface reads as a board rather than a blank div. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 85%)",
        }}
      />
      <svg
        className="relative block aspect-[5/3] w-full"
        viewBox="0 0 1000 600"
        role="img"
        aria-label={"Teaching whiteboard: " + title}
      >
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="currentColor" />
          </marker>
        </defs>
        {board.events.map((event) => (
          <motion.g
            key={event.id}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            {renderEvent(event)}
          </motion.g>
        ))}
      </svg>

      {/* Text equivalent of whatever is currently drawn. */}
      <div className="sr-only" aria-live="polite" aria-label="Whiteboard description">
        {descriptions.length
          ? descriptions.join(" ")
          : "The whiteboard is clear at this point in the lesson."}
      </div>
    </div>
  );
}
