import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Shaped loaders, not spinners: a skeleton occupies the same box the real
 * content will, so nothing shifts when data arrives.
 */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return <div aria-hidden="true" className={cn("skeleton", className)} {...props} />;
}
