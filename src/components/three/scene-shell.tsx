"use client";

import {
  Component,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Canvas, type CanvasProps } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import { useResolvedTheme } from "@/components/shell/theme-provider";
import { scenePalette, type ScenePalette } from "./palette";
import { cn } from "@/lib/utils";

class SceneBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** Cheap feature probe. A blocked or software-blacklisted context fails here. */
function webglAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") ?? canvas.getContext("webgl")),
    );
  } catch {
    return false;
  }
}

/**
 * Wrapper for every WebGL surface in the product.
 *
 * It takes four things off each scene's hands:
 *  - reduced motion and absent WebGL both render the 2D fallback instead,
 *  - the canvas only mounts once scrolled into view, so an off-screen scene
 *    costs nothing,
 *  - a thrown error inside the scene degrades rather than blanking the page,
 *  - the resolved theme palette is handed to the children as a parameter.
 *
 * The canvas itself is always aria-hidden: the fallback carries the meaning
 * for assistive technology, and each caller supplies a text equivalent.
 */
export function SceneShell({
  children,
  fallback,
  className,
  canvasProps,
  /** Set when the scene is decorative and should be skipped under reduced motion. */
  motionCritical = true,
}: {
  children: (palette: ScenePalette, theme: "light" | "dark") => ReactNode;
  fallback: ReactNode;
  className?: string;
  canvasProps?: Omit<CanvasProps, "children">;
  motionCritical?: boolean;
}) {
  const resolved = useResolvedTheme();
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => setSupported(webglAvailable()), []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "160px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const shouldRender = supported === true && visible && !(reduceMotion && motionCritical);
  const palette = scenePalette(resolved);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {shouldRender ? (
        <SceneBoundary fallback={fallback}>
          <div aria-hidden="true" className="size-full">
            <Canvas
              dpr={[1, 1.75]}
              gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
              {...canvasProps}
            >
              {children(palette, resolved)}
            </Canvas>
          </div>
        </SceneBoundary>
      ) : (
        fallback
      )}
    </div>
  );
}
