"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/**
 * Horizontal carousel with round white arrow buttons sitting on the edges,
 * as in the reference's Featured row. Native scroll with snap, so it also
 * works with touch, trackpads and the keyboard; the arrows only scroll by one
 * viewport and hide at either end.
 */
export function Carousel({ children, className, itemGap = 20 }: { children: ReactNode; className?: string; itemGap?: number }) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const node = track.current;
    if (!node) return;
    setEdges({ start: node.scrollLeft <= 4, end: node.scrollLeft + node.clientWidth >= node.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    update();
    const node = track.current;
    if (!node) return;
    node.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      node.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scroll = (direction: 1 | -1) => {
    const node = track.current;
    if (node) node.scrollBy({ left: direction * node.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <div className={cn("relative", className)}>
      <div
        ref={track}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ gap: itemGap }}
      >
        {children}
      </div>
      <ArrowButton side="left" hidden={edges.start} onClick={() => scroll(-1)} />
      <ArrowButton side="right" hidden={edges.end} onClick={() => scroll(1)} />
    </div>
  );
}

function ArrowButton({ side, hidden, onClick }: { side: "left" | "right"; hidden: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous" : "Next"}
      tabIndex={hidden ? -1 : 0}
      className={cn(
        "bg-card text-foreground absolute top-[38%] z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full border shadow-[0_4px_14px_rgb(16_24_40/0.12)] transition-all duration-200 hover:scale-105 sm:grid",
        side === "left" ? "-left-5" : "-right-5",
        hidden && "pointer-events-none opacity-0",
      )}
    >
      {side === "left" ? <CaretLeft size={18} weight="bold" /> : <CaretRight size={18} weight="bold" />}
    </button>
  );
}
